import { HttpStatusCode } from 'http-status-code-const-enum';
import { APIGatewayEvent } from 'aws-lambda';
import {
  IAbstractToEnvHandlerAdapter,
  IAbstractRequest,
  IAbstractResponse,
  IAbstractRequestHandler,
  IAWSAPIGatewayProxyResult,
  ICommerceToolsError
} from '@app/interfaces';
import { isDataTransError } from '@app/domain/services/errors-service';

function bodyParsingError(e: Error): boolean {
  return e.message.includes('Unexpected token');
}

export class AwsApiGatewayAdapter implements IAbstractToEnvHandlerAdapter<APIGatewayEvent, IAWSAPIGatewayProxyResult> {
  createEnvSpecificHandler(handler: IAbstractRequestHandler) {
    return async (event: APIGatewayEvent): Promise<IAWSAPIGatewayProxyResult> => {
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
      // TODO: move the JSON parsing (and the corresponding error handling)
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
  ): IAWSAPIGatewayProxyResult {
    const body = (payload && typeof payload === 'object') ? payload : { payload }; // NOTE: maybe we need change this logic
    const response: IAWSAPIGatewayProxyResult = {
      statusCode,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (payload) {
      response.body = JSON.stringify(body);
    }

    return response;
  }

  private errorHandling(err: Error | ICommerceToolsError) {
    if (bodyParsingError(err as Error)) {
      return this.abstractResponseToCloud({
        statusCode: HttpStatusCode.BAD_REQUEST,
        body: {
          message: `Error of body parsing: ${err.message}`,
          code: 'InvalidInput',
          errors: [err]
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
