import { APIGatewayProxyEvent } from 'aws-lambda';
import { IAbstractResponse, IAbstractRequestHandler } from '../../interfaces';
import { RequestContextService } from '../../domain/services/request-context-service';

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

  describe('when calling the lower-level environment-agnostic handler', () => {
    it('Passes IAbstractRequest with `rawBody`', async () => {
      const originalBody = '{ "payload": "something" }'; // serialized JSON

      const event: APIGatewayProxyEvent = {
        httpMethod: 'POST',
        headers: {},
        body: originalBody
      } as unknown as APIGatewayProxyEvent;

      await allOperationsApiGatewayHandler(event);

      expect(fakeAllOpsAgnosticHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: {},
          body: { payload: 'something' }, // parsed JSON
          rawBody: originalBody
        })
      );
    });

    it('Passes IAbstractRequest with `traceContext`', async () => {
      const fakeTraceContext = {
        correlationId: 'Test Correlation Id',
        paymentKey: 'Test Payment Key'
      };

      // Assume RequestContextService adds fakeTraceContext to the passed in request
      jest.spyOn(RequestContextService.prototype, 'addTraceContextToRequest')
        .mockImplementation((req) => {
          return {
            ...req,
            traceContext: fakeTraceContext
          };
        });

      const event: APIGatewayProxyEvent = {
        httpMethod: 'POST',
        headers: {},
        body: '{}' // at least parseable serialized JSON
      } as unknown as APIGatewayProxyEvent;

      await allOperationsApiGatewayHandler(event);

      expect(fakeAllOpsAgnosticHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: {},
          body: {},
          traceContext: fakeTraceContext
        })
      );
    });
  });

});
