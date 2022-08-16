import { APIGatewayProxyEvent } from 'aws-lambda';
import { IAbstractResponse, IAbstractRequestHandler } from '../../interfaces';

let fakeAllOpsAgnosticHandler: IAbstractRequestHandler;
const fakeAbstractResponse200: IAbstractResponse = {
  statusCode: 200,
  body: {
    test: 'OK'
  }
};
jest.mock('../../domain/environment-agnostic-handlers', () => {
  fakeAllOpsAgnosticHandler = jest.fn().mockResolvedValue(fakeAbstractResponse200);
  return {
    // Stub the behavior of a lower-level env-agnostic handler
    // to TEST ONLY THE INTERACTION WITH IT from the higher lvel
    allOperationHandler: fakeAllOpsAgnosticHandler
  };
});

import { allOperationsHandler as allOperationsApiGatewayHandler } from './index';

describe('allOperationsHandler as an AWS Lambda function behind AWS API Gateway', () => {

  afterEach(() => {
    (fakeAllOpsAgnosticHandler as jest.Mock).mockReset();
  });

  describe('when the request body is parsable to JSON - leverages the lower-level environment-agnostic handler', () => {
    describe('Transmitting the response from the lower-level handler', () => {
      it('when the lower-level handler responds 200', async () => {
        const event: APIGatewayProxyEvent = {
          httpMethod: 'POST',
          headers: { 'header1': 'header-1-value' },
          body: '{ "payload": "something" }' // serialized JSON
        } as unknown as APIGatewayProxyEvent;

        const response = await allOperationsApiGatewayHandler(event);

        expect(fakeAllOpsAgnosticHandler).toHaveBeenCalledWith(
          expect.objectContaining({
            headers: { 'header1': 'header-1-value' },
            body: { 'payload': 'something' } // JSON parsed into object
          })
        );

        expect(response).toMatchObject({
          statusCode: 200,
          body: JSON.stringify(fakeAbstractResponse200.body)
        });
      });

      it('and the lower-level handler responds 400', async () => {
        const fakeAbstractResponse400: IAbstractResponse = {
          statusCode: 400,
          body: {
            message: 'Something is wrong in the request'
          }
        };
        (fakeAllOpsAgnosticHandler as jest.Mock).mockImplementation(async (): Promise<IAbstractResponse> => fakeAbstractResponse400);

        const event: APIGatewayProxyEvent = {
          httpMethod: 'POST',
          headers: {},
          body: '{ "payload": "something" }' // serialized JSON
        } as APIGatewayProxyEvent;

        const response = await allOperationsApiGatewayHandler(event);

        expect(fakeAllOpsAgnosticHandler).toHaveBeenCalledWith(
          expect.objectContaining({
            body: { 'payload': 'something' } // JSON parsed into object
          })
        );

        expect(response).toMatchObject({
          statusCode: 400,
          body: JSON.stringify(fakeAbstractResponse400.body)
        });
      });
    });
  });


  describe('when the request body is not parsable to JSON - rejects on the adapter level', () => {
    it('responds with status 400', async () => {
      const event: APIGatewayProxyEvent = {
        httpMethod: 'POST',
        headers: {},
        body: 'unexpected payload'
      } as APIGatewayProxyEvent;

      const response = await allOperationsApiGatewayHandler(event);

      expect(fakeAllOpsAgnosticHandler).not.toHaveBeenCalled();

      expect(response.statusCode).toEqual(400);
    });
  });

});
