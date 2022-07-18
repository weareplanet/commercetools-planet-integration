import { HttpStatusCode } from 'http-status-code-const-enum';
import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';
import {
  IAbstractToEnvHandlerAdapter,
  IAbstractRequest,
  IAbstractResponse,
  IAbstractRequestHandler,
} from '../../interfaces';

function bodyParsingError(e: Error): boolean {
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
        return this.handleError(err);
      }
    };
  }

  private cloudRequestToAbstract(event: APIGatewayEvent) {
    return {
      headers: event.headers,
      rawBody: event.body,
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
  ): APIGatewayProxyResult {
    let body = '';
    if (payload) {
      if (typeof payload === 'object') {
        body = JSON.stringify(payload);
      } else if (typeof payload === 'string') {
        body = payload;
      }
    }
    console.log('createApiGatewayResponse: ', statusCode, body);

    const response: APIGatewayProxyResult = {
      statusCode,
      headers: {
        'Content-Type': 'application/json'
      },
      body
    };

    return response;
  }

  private handleError(err: Error) {
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

    return this.abstractResponseToCloud({
      statusCode: HttpStatusCode.INTERNAL_SERVER_ERROR,
      body: ''
    });
  }
}
