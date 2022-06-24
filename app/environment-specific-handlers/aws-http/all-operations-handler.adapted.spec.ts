import { APIGatewayProxyEvent } from 'aws-lambda';
import { allOperationsHandler as allOperationsApiGatewayHandler } from './index';

describe('allOperationsHandler as an AWS Lambda function behind AWS API Gateway', () => {
  // TODO: All schema-related tests are on the lowest level (in app/domain/environment-agnostic-handlers/per-operation-handlers).
  // On a higher level (here) - test only what is implemented here (mocking a lower-level handler)
  // + a few integration tests (not covering everything)
  // ---
  // An example of a unit test:
  // 1. Mock app/domain/environment-agnostic-handlers/index.ts.allOperationsHandler's implementation
  // to return some correct AbstractResponse
  // 2. Import and call the wrapped app/environment-specific-handlers/aws-http/index.ts.allOperationsHandler hadler
  // with some correct APIGatewayProxyEvent and make sure that:
  // - the underlying handler was called with the expected AbstractRequest
  // - the underlying handler's mocked return is translated to the expected APIGatewayProxyResults

  describe('error cases', () => {

    describe('when the request body is not parsable to JSON', () => {
      it('responds with status 400', async () => {
        const event: APIGatewayProxyEvent = {
          httpMethod: 'POST',
          headers: {},
          body: 'unexpected payload'
        } as APIGatewayProxyEvent;

        const response = await allOperationsApiGatewayHandler(event);

        expect(response.statusCode).toEqual(400);
      });
    });

  });

});
