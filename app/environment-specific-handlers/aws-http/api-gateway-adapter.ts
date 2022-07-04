import { HttpStatusCode } from 'http-status-code-const-enum';
import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';
import {
  IAbstractToEnvHandlerAdapter,
  IAbstractRequest,
  IAbstractResponse,
  IAbstractRequestHandler,
  ICommerceToolsError
} from '@app/interfaces';
import { isDataTransError } from '@app/domain/services/errors-service';

function bodyParcingError(e: Error): boolean {
  return e.message.includes('Unexpected token');
}

export class AwsApiGatewayAdapter implements IAbstractToEnvHandlerAdapter<APIGatewayEvent, APIGatewayProxyResult> {
  createEnvSpecificHandler(handler: IAbstractRequestHandler) {
    return async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
      try {
        const agnosticRequest: IAbstractRequest = this.cloudRequestToAbstract(event);
        const agnosticResponse = await handler(agnosticRequest);
        return this.abstractResponseToCloud(agnosticResponse);
      } catch (err) {
        return this.errorHandling(err);
      }
    };
  }

  private cloudRequestToAbstract(event: APIGatewayEvent) {
    return {
      // TODO: move the JSON parcing (and the corresponding error handling)
      // into app/domain/environment-agnostic-handlers
      body: JSON.parse(event.body)
    };
  }

  private abstractResponseToCloud(agnosticResponse: IAbstractResponse) {
    return this.createApiGatewayResponse(agnosticResponse.statusCode, agnosticResponse.body);
  }

  private createApiGatewayResponse(
    statusCode: number,
    payload: string|Record<string, unknown>
  ): APIGatewayProxyResult {
    const body = (payload && typeof payload === 'object') ? payload : { payload };
    return {
      statusCode,
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json'
      }
    };
  }

  private errorHandling(err: Error | ICommerceToolsError) {
    if (bodyParcingError(err as Error)) {
      return this.abstractResponseToCloud({
        statusCode: HttpStatusCode.BAD_REQUEST,
        body: {
          message: `Error of body parsing: ${err.message}`,
        }
      });
    }

    if (isDataTransError(err as ICommerceToolsError)) {
      return this.abstractResponseToCloud({
        statusCode: HttpStatusCode.BAD_REQUEST,
        body: {
          message: err.message,
          errors: [err]
        }
      });
    }

    return this.abstractResponseToCloud({
      statusCode: HttpStatusCode.INTERNAL_SERVER_ERROR,
      body: {}
    });
  }
}
