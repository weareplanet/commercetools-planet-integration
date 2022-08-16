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
    // to TEST ONLY THE INTERACTION WITH IT from the higher level
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
        const event = {
          'payload': 'something'
        } as unknown;

        const response = await allOperationsApiGatewayHandler(event);

        expect(fakeAllOpsAgnosticHandler).toHaveBeenCalledWith(
          expect.objectContaining({
            headers: {},
            body: { 'payload': 'something' }
          })
        );

        expect(response).toMatchObject({
          responseType: 'UpdateRequest',
          ...(fakeAbstractResponse200.body as Record<string, unknown>)
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

        const event = { 'payload': 'something' };

        const response = await allOperationsApiGatewayHandler(event);

        expect(fakeAllOpsAgnosticHandler).toHaveBeenCalledWith(
          expect.objectContaining({
            headers: {},
            body: { 'payload': 'something' }
          })
        );

        expect(response).toMatchObject({
          ...(fakeAbstractResponse400.body as Record<string, unknown>)
        });
      });
    });
  });
});
