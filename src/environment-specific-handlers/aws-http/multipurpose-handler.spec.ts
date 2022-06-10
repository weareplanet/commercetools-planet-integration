import { APIGatewayProxyEvent, Context } from 'aws-lambda';
import { multipurposeHandler as muptipurposeApiGatewayHandler } from './index';

describe('multipurposeHandler as an AWS Lambda function behind AWS API Gateway', () => {
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
