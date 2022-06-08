import { HttpStatusCode } from 'http-status-code-const-enum';
import { APIGatewayEvent, Context, APIGatewayProxyResult } from 'aws-lambda';
import { EnvironmentAgnosticRequest, EnvironmentAgnosticResponse, EnvironmentAgnosticHandler } from '../../../interfaces';

class AwsAdapter {
  cloudRequestToAgnostic(event: APIGatewayEvent): EnvironmentAgnosticRequest {
    return {
      body: event.body
    };
  }

  agnosticResponseToCloud(agnosticResponse: EnvironmentAgnosticResponse): APIGatewayProxyResult {
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
  };
}


export const createApiGatewayHandler = (handler: EnvironmentAgnosticHandler) => {
  return async (event: APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> => {
    const awsAdapter = new AwsAdapter();
    try {
      const agnosticRequest: EnvironmentAgnosticRequest = awsAdapter.cloudRequestToAgnostic(event);
      const agnosticResponse = await handler(agnosticRequest);
      return awsAdapter.agnosticResponseToCloud(agnosticResponse);
    } catch {
      return awsAdapter.agnosticResponseToCloud({
        statusCode: HttpStatusCode.INTERNAL_SERVER_ERROR,
        body: ''
      });
    }
  }
}
