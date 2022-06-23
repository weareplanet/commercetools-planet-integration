import { HttpStatusCode } from 'http-status-code-const-enum';
import { APIGatewayEvent, Context, APIGatewayProxyResult } from 'aws-lambda';
import { AbstractAdapter, AbstractRequest, AbstractResponse, AbstractRequestHandler } from '../../interfaces';

function bodyParcingError(e: Error): boolean {
  return e.message.includes('Unexpected token');
}

class AwsApiGatewayAdapter implements AbstractAdapter<APIGatewayEvent, APIGatewayProxyResult> {
  cloudRequestToAbstract(event: APIGatewayEvent) {
    return {
      // TODO: move the JSON parcing (and the corresponding error handling)
      // into app/domain/environment-agnostic-handlers
      body: JSON.parse(event.body)
    };
  }

  abstractResponseToCloud(agnosticResponse: AbstractResponse) {
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

export const createApiGatewayHandler = (handler: AbstractRequestHandler) => {
  return async (event: APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> => {
    // const apiGatewayAdapter = new AwsApiGatewayAdapter();
    // const abstractRequest: AbstractRequest = apiGatewayAdapter.cloudRequestToAbstract(event);
    // const abstractResponse = await handler(abstractRequest);
    // return apiGatewayAdapter.abstractResponseToCloud(abstractResponse);

    const apiGatewayAdapter = new AwsApiGatewayAdapter();
    try {
      const agnosticRequest: AbstractRequest = apiGatewayAdapter.cloudRequestToAbstract(event);
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
};
