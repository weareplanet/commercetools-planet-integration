import {
  abstractRequestFactory,
  RedirectAndLightboxPaymentInitRequestBodyFactory,
  RedirectAndLightboxPaymentInitResponseFactory,
  CreateInitializeTransactionRequestFactory,
  CreateInitializeTransactionResponseFactory,
  setEnvLogLevel,
  repairEnvLogLevel,
  loadLogServiceForTesting
} from '../../../../../test/test-utils';

const dtHttpClientMock = {
  post: jest.fn()
};
jest.mock('axios', () => {
  return {
    create: () => dtHttpClientMock
  };
});

import handler from '..';
import { DatatransURL } from '../../../../interfaces';

describe('All-operations handler', () => {
  beforeEach(/* Prevent real requests to datatrans, use the stubbed result */() => {
    dtHttpClientMock.post.mockResolvedValue(CreateInitializeTransactionResponseFactory());
  });

  afterEach(() => {
    dtHttpClientMock.post.mockReset();
  });

  describe('When a request matches Redirect&Lightbox Init operation criteria', () => {

    it('should go through the R&L Payment Initialization flow', async () => {
      const req = abstractRequestFactory({
        body: RedirectAndLightboxPaymentInitRequestBodyFactory()
      });

      const result = await handler(req);

      expect(dtHttpClientMock.post).toBeCalledWith(
        DatatransURL.TEST + '/transactions',
        CreateInitializeTransactionRequestFactory(),
        {
          auth: {
            password: 'Test_merchant_password',
            username: 'Test_merchant_id'
          },
          headers: {
            'Content-Type': 'application/json; charset=UTF-8'
          }
        }
      );

      //See: https://planet.atlassian.net/browse/INC-150
      expect(result).toMatchObject(RedirectAndLightboxPaymentInitResponseFactory());
    });

    describe('performs context-aware logging', () => {
      beforeAll(() => {
        setEnvLogLevel('trace');
        jest.resetModules(); // need to reload LogService to use the new log level
      });

      afterAll(() => {
        repairEnvLogLevel();
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let logStream: any;
      beforeEach(/* Spy on the low-level log stream */ async () => {
        logStream = loadLogServiceForTesting().logStream;
      });

      it('should log with trace context', async () => {
        const fakeTraceContext = {
          correlationId: 'Test Correlation Id',
          paymentKey: 'Test Payment Key'
        };

        const req = {
          ...abstractRequestFactory({
            body: RedirectAndLightboxPaymentInitRequestBodyFactory()
          }),
          traceContext: fakeTraceContext
        };

        const theHandler = (await import('..')).default; // need to reload the handler after jest.resetModules()
        await theHandler(req);

        expect(logStream.write).toHaveBeenCalledWith(
          expect.stringMatching(/.*"traceContext":{.*"correlationId":"Test Correlation Id","paymentKey":"Test Payment Key".*}.*Connector is running.*/)
        );

        expect(logStream.write).toHaveBeenCalledWith(
          expect.stringMatching(/.*"traceContext":{.*"correlationId":"Test Correlation Id","paymentKey":"Test Payment Key".*}.*Operation to be performed: Redirect And Lightbox Init.*/)
        );

        expect(logStream.write).toHaveBeenCalledWith(
          expect.stringMatching(/.*"traceContext":{.*"correlationId":"Test Correlation Id","paymentKey":"Test Payment Key".*}.*DataTrans initRequest.*/)
        );

        expect(logStream.write).toHaveBeenCalledWith(
          expect.stringMatching(/.*"traceContext":{.*"correlationId":"Test Correlation Id","paymentKey":"Test Payment Key".*}.*DataTrans initResponse.*/)
        );
      });
    });
  });
});
