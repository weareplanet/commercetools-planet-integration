import {
  IAbstractToEnvHandlerAdapter,
  IAbstractRequest,
  IAbstractResponse,
  IAbstractRequestHandler,
  ITraceContext,
  IAbstractBody,
} from '../../interfaces';
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
        abstractRequest = this.cloudRequestToAbstract(event);
        const abstractResponse = await handler(abstractRequest);
        return this.abstractResponseToCloud(abstractResponse);
      } catch (err) {
        return this.handleError(abstractRequest, err);
      }
    };
  }

  private cloudRequestToAbstract(event: unknown): IAbstractRequest {
    const abstractRequestDraft = {
      headers: {},
      rawBody: JSON.stringify(event),
      body: event as IAbstractBody
    };
    const abstractRequest = new RequestContextService().addTraceContextToRequest(abstractRequestDraft);

    this.setupLogger(abstractRequest.traceContext);

    return abstractRequest;
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
      statusCode,
      headers: {
        'Content-Type': 'application/json'
      },
      body
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
