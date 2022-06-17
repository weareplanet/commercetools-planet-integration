import { APIGatewayProxyEvent, Context } from 'aws-lambda';
import { allOperationsHandler as allOperationsApiGatewayHandler } from './index';

describe('allOperationsHandler as an AWS Lambda function behind AWS API Gateway', () => {

  const context: Context = {
    functionName: 'allOperationsHandler'
  } as Context;

  describe('cuccess cases', () => {

    describe('when the request body is a correct and acceptable JSON', () => {
      it('responds with 200 and Hello World in the body', async () => {
        const event: APIGatewayProxyEvent = {
          httpMethod: 'POST',
          headers: {},
          body: JSON.stringify({
            'n': 123,
            's': 'some string value'
          })
        } as APIGatewayProxyEvent;

        const response = await allOperationsApiGatewayHandler(event, context);

        expect(response.statusCode).toEqual(200);

        expect(JSON.parse(response.body)).toMatchObject({
          message: 'Hello World from create-payment handler!'
        });
      });
    });

  });

  describe('error cases', () => {

    describe('when the request body is not parsable to JSON', () => {
      it('responds with status 400', async () => {
        const event: APIGatewayProxyEvent = {
          httpMethod: 'POST',
          headers: {},
          body: 'unexpected payload'
        } as APIGatewayProxyEvent;

        const response = await allOperationsApiGatewayHandler(event, context);

        expect(response.statusCode).toEqual(400);
      });
    });

    describe('when the request body is parsable to JSON, but not acceptable', () => {
      it('responds with status 400', async () => {
        const event: APIGatewayProxyEvent = {
          httpMethod: 'POST',
          headers: {},
          body: JSON.stringify({ x: 123 })
        } as APIGatewayProxyEvent;

        const response = await allOperationsApiGatewayHandler(event, context);

        expect(response.statusCode).toEqual(400);
      });
    });

  });

});
