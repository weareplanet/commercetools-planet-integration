import { APIGatewayProxyEvent, Context } from 'aws-lambda';

// Mimic 'AWS_LAMBDA_BEHIND_API_GATEWAY' target environment before the SUT is loaded
// (It's too late to do this in beforeAll/Each - the SUT implementation is such)
process.env.TARGET_ENVIRONMENT = 'AWS_LAMBDA_BEHIND_API_GATEWAY';
import { muptipurposeHandler as muptipurposeApiGatewayHandler } from '../index';

describe('muptipurposeHandler handler as AWS Lambda behind AWS API Gateway', () => {
  afterAll(() => {
    delete process.env.TARGET_ENVIRONMENT;
  });

  const context: Context = {
    functionName: 'muptipurposeApiGatewayHandler'
  } as Context;

  describe('when some body is provided', () => {
    it('responds with 200 and Hello World in the body', async () => {
      const event: APIGatewayProxyEvent = {
        httpMethod: 'POST',
        headers: {},
        body: JSON.stringify({ 'test': true })
      } as APIGatewayProxyEvent;

      const response = await muptipurposeApiGatewayHandler(event, context);

      expect(response.statusCode).toEqual(200);

      expect(JSON.parse(response.body)).toMatchObject({
        message: 'Hello World from create-payment handler!'
      });
    });
  });

  describe('when no body is provided', () => {
    it('responds with status 400', async () => {
      const event: APIGatewayProxyEvent = {
        httpMethod: 'POST',
        headers: {},
        body: 'unexpected payload'
      } as APIGatewayProxyEvent;

      const response = await muptipurposeApiGatewayHandler(event, context);

      expect(response.statusCode).toEqual(400);
    });
  });
});
