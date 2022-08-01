import pino from 'pino';
import { HttpStatusCode } from 'http-status-code-const-enum';
import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';
import {
  IAbstractToEnvHandlerAdapter,
  IAbstractRequest,
  IAbstractResponse,
  IAbstractRequestHandler,
  ITracingRequestContext,
} from '../../interfaces';
import { RequestContextService } from '../../domain/services/request-context-service';
import { ErrorsService } from '../../domain/services/errors-service';
import { LogService } from '../../domain/services/log-service';

function bodyParsingError(e: Error): boolean {
  return e.message.includes('Unexpected token');
}

export class AwsApiGatewayAdapter implements IAbstractToEnvHandlerAdapter<APIGatewayEvent, APIGatewayProxyResult> {
  private logger: pino.Logger;

  constructor() {
    this.setupLogger(); // So far setup a context-unaware logger
  }

  createEnvSpecificHandler(handler: IAbstractRequestHandler) {
    return async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
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

  private cloudRequestToAbstract(event: APIGatewayEvent): IAbstractRequest {
    const abstractRequestDraft = {
      headers: event.headers,
      rawBody: event.body,
      // Maybe a better place for body parsing is app/domain/environment-agnostic-handlers/per-operation-handlers/any-handler-wrapper.ts
      // (because it is not something cloud-specific),
      // but we need to deal with body parts earlier (see RequestContextService, OperationDetector).
      body: JSON.parse(event.body)
    };

    // Amend the request with the tracing context ASAP
    const abstractRequest = new RequestContextService().amendRequestWithTracingContext(abstractRequestDraft);

    // Now the request context is known - make this.logger aware of it
    this.setupLogger(abstractRequest.tracingContext);

    return abstractRequest;
  }

  private abstractResponseToCloud(abstractResponse: IAbstractResponse) {
    return this.createApiGatewayResponse(abstractResponse.statusCode, abstractResponse.body);
  }

  private setupLogger(requestContext?: ITracingRequestContext) {
    this.logger = LogService.getLogger(requestContext);
  }

  private createApiGatewayResponse(
    statusCode: number,
    payload: string | Record<string, unknown>
  ): APIGatewayProxyResult {
    let body = '';
    if (payload) {
      if (typeof payload === 'object') {
        body = JSON.stringify(payload);
      } else if (typeof payload === 'string') {
        body = payload;
      }
    }

    const response: APIGatewayProxyResult = {
      statusCode,
      headers: {
        'Content-Type': 'application/json'
      },
      body
    };

    return response;
  }

  private handleError(request: IAbstractRequest, err: Error) {
    if (bodyParsingError(err)) {
      return this.abstractResponseToCloud({
        statusCode: HttpStatusCode.BAD_REQUEST,
        body: {
          message: `Error of body parsing: ${err.message}`,
          code: 'InvalidInput',
          errors: [err]
        }
      });
    }

    const errorsService = new ErrorsService({ logger: this.logger });

    if (request) {
      return this.abstractResponseToCloud(
        errorsService.handleError(request, err)
      );
    }

    // For some reason (not processed above) we have no request
    return this.abstractResponseToCloud(
      errorsService.makeGeneralErrorResponse()
    );
  }
}
