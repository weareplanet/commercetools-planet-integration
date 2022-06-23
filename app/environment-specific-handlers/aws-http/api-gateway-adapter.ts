import { HttpStatusCode } from 'http-status-code-const-enum';
import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';
import { IAbstractToEnvHandlerAdapter, IAbstractRequest, IAbstractResponse, IAbstractRequestHandler } from '../../interfaces';

function bodyParcingError(e: Error): boolean {
  return e.message.includes('Unexpected token');
}

export class AwsApiGatewayAdapter implements IAbstractToEnvHandlerAdapter<APIGatewayEvent, APIGatewayProxyResult> {
  createEnvSpecificHandler(handler: IAbstractRequestHandler) {
    return async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
      const apiGatewayAdapter = new AwsApiGatewayAdapter();
      try {
        const agnosticRequest: IAbstractRequest = apiGatewayAdapter.cloudRequestToAbstract(event);
        const agnosticResponse = await handler(agnosticRequest);
        return apiGatewayAdapter.abstractResponseToCloud(agnosticResponse);
      } catch (err) {
        // TODO: Handle err more accurately to distinguish 4xx from 5xx etc.

        if (bodyParcingError(err)) {
          return apiGatewayAdapter.abstractResponseToCloud({
            statusCode: HttpStatusCode.BAD_REQUEST,
            body: { message: `Error of body parsing: ${err.message}` }
          });
        }

        return apiGatewayAdapter.abstractResponseToCloud({
          statusCode: HttpStatusCode.INTERNAL_SERVER_ERROR,
          body: {}
        });
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
}
