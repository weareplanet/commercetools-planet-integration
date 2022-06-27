import { APIGatewayProxyEvent } from 'aws-lambda';
let fakeAllOpsAgnosticHandler: IAbstractRequestHandler; // exactly here, otherwise jest swears
import { IAbstractResponse, IAbstractRequestHandler } from '../../interfaces';
import { allOperationsHandler as allOperationsApiGatewayHandler } from './index';

const fakeAbstractResponse200: IAbstractResponse = {
  statusCode: 200,
  body: {
    test: 'OK'
  }
};

jest.mock('../../domain/environment-agnostic-handlers', () => {
  fakeAllOpsAgnosticHandler = jest.fn().mockImplementation(async (): Promise<IAbstractResponse> => fakeAbstractResponse200);
  return {
    // Stub the behavior of a lower-level env-sagnostic handler
    // to TEST ONLY THE INTERACTION WITH IT from the higher lvel
    allOperationHandler: fakeAllOpsAgnosticHandler
  };
});


describe('allOperationsHandler as an AWS Lambda function behind AWS API Gateway', () => {

  afterEach(() => {
    (fakeAllOpsAgnosticHandler as jest.Mock).mockReset();
  });

  describe('leverageing the lower-level environment-agnostic handler', () => {

    describe('when the request body is parsable to JSON', () => {
      it('and the lower-level handler responds 200', async () => {
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
          statusCode: 200,
          body: JSON.stringify(fakeAbstractResponse200.body)
        });
      });
    });

    describe('when the request body is parsable to JSON', () => {
      const fakeAbstractResponse400: IAbstractResponse = {
        statusCode: 400,
        body: {
          message: 'Something is wrong in the request'
        }
      };

      beforeEach(() => {
        (fakeAllOpsAgnosticHandler as jest.Mock).mockImplementation(async (): Promise<IAbstractResponse> => fakeAbstractResponse400);
      });

      it('and the lower-level handler responds 400', async () => {
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


  describe('rejecting on the adapter level (not even leveraging the lower-level environment-agnostic handler)', () => {

    describe('when the request body is not parsable to JSON', () => {
      it('responds with status 400 from ', async () => {
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

});
