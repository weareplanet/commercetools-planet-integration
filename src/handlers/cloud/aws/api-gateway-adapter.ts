import { HttpStatusCode } from 'http-status-code-const-enum';
import { APIGatewayEvent, Context, APIGatewayProxyResult } from 'aws-lambda';
import { AbstractRequest, AbstractResponse, AbstractRequestHandler } from '../../../interfaces';

class AwsAdapter {
  cloudRequestToAgnostic(event: APIGatewayEvent): AbstractRequest {
    return {
      body: JSON.parse(event.body)
    };
  }

  agnosticResponseToCloud(agnosticResponse: AbstractResponse): APIGatewayProxyResult {
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

function bodyParcingError(e: Error): boolean {
  return e.message.includes('Unexpected token');
}

export const createApiGatewayHandler = (handler: AbstractRequestHandler) => {
  return async (event: APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> => {
    const awsAdapter = new AwsAdapter();
    try {
      const agnosticRequest: AbstractRequest = awsAdapter.cloudRequestToAgnostic(event);
      const agnosticResponse = await handler(agnosticRequest);
      return awsAdapter.agnosticResponseToCloud(agnosticResponse);
    } catch (err) {
      // TODO: Process err accurately to distinguish 4xx from 5xx etc.

      if (bodyParcingError(err)) {
        return awsAdapter.agnosticResponseToCloud({
          statusCode: HttpStatusCode.BAD_REQUEST,
          body: { message: `Error of body parsing: ${err.message}` }
        });
      }

      return awsAdapter.agnosticResponseToCloud({
        statusCode: HttpStatusCode.INTERNAL_SERVER_ERROR,
        body: {}
      });
    }
  };
};
