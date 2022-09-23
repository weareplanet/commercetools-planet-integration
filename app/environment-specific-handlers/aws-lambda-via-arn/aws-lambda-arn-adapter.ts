import {
  IAbstractToEnvHandlerAdapter,
  IAbstractRequest,
  IAbstractResponse,
  IAbstractRequestHandler,
  ITraceContext,
  IAbstractBody,
} from '../../interfaces';
import { APIGatewayEvent } from 'aws-lambda';
import { OperationDetector } from '../../domain/services/request-context-service/operation-detector';
import { RequestContextService } from '../../domain/services/request-context-service';
import { ErrorsService } from '../../domain/services/errors-service';
import { LogService } from '../../domain/services/log-service';

export class AwsArnGatewayAdapter implements IAbstractToEnvHandlerAdapter<unknown, unknown> {
  private logger: LogService;

  constructor() {
    this.setupLogger();
  }

  createEnvSpecificHandler(handler: IAbstractRequestHandler) {
    return async (event: unknown) => {
      let abstractRequest;
      try {
        const gatewayEvent = event as APIGatewayEvent;
        if (gatewayEvent.body) {
          abstractRequest = this.cloudRequestToAbstractHTTP(gatewayEvent);
          if (!OperationDetector.isDatatransRequest(abstractRequest)) {
            throw new Error('Insecure URL invocation not allowed.');
          }
        } else {
          abstractRequest = this.cloudRequestToAbstractARN(event);
        }
        this.setupLogger(abstractRequest.traceContext);
        const abstractResponse = await handler(abstractRequest);
        return this.abstractResponseToCloud(abstractResponse);
      } catch (err) {
        return this.handleError(abstractRequest, err);
      }
    };
  }

  private cloudRequestToAbstractARN(event: unknown): IAbstractRequest {
    const abstractRequestDraft = {
      headers: {},
      rawBody: JSON.stringify(event),
      body: event as IAbstractBody
    };
    return new RequestContextService().addTraceContextToRequest(abstractRequestDraft);
  }

  private cloudRequestToAbstractHTTP(event: APIGatewayEvent): IAbstractRequest {
    const abstractRequestDraft = {
      headers: event.headers,
      rawBody: event.body,
      body: JSON.parse(event.body)
    };
    return new RequestContextService().addTraceContextToRequest(abstractRequestDraft);
  }

  private abstractResponseToCloud(abstractResponse: IAbstractResponse) {
    return this.createApiArnResponse(abstractResponse.statusCode, abstractResponse.body);
  }

  private setupLogger(traceContext?: ITraceContext) {
    this.logger = new LogService(traceContext);
  }

  private createApiArnResponse(
    statusCode: number,
    body: IAbstractBody
  ) {
    const response = {
      responseType: 'UpdateRequest',
      ...body as Record<string, unknown>
    };
    return response;
  }

  private handleError(request: IAbstractRequest, err: Error) {

    const errorsService = new ErrorsService({ logger: this.logger });

    if (request) {
      return this.abstractResponseToCloud(
        errorsService.handleError(request, err)
      );
    }

    return this.abstractResponseToCloud(
      errorsService.makeGeneralErrorResponse()
    );
  }
}
