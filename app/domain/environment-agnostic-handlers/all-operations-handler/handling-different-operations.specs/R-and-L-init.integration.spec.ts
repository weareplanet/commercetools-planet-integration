import {
  RedirectAndLightboxPaymentInitRequestBodyFactory,
  RedirectAndLightboxPaymentInitResponseFactory,
  CreateInitializeTransactionRequestFactory,
  CreateInitializeTransactionResponseFactory
} from '../../../../../test/shared-test-entities/redirect-and-lightbox-payment-init';

import { abstractRequestFactory } from '../../../../../test/shared-test-entities/abstract-request-factories';

const dtHttpClientMock = {
  post: jest.fn()
};
jest.mock('axios', () => {
  return {
    create: () => dtHttpClientMock
  };
});

import handler from '..';

describe('All-operations handler', () => {

  afterEach(() => {
    dtHttpClientMock.post.mockReset();
  });

  describe('When a request matches Redirect&Lightbox Init operation criteria', () => {
    it('should go through the R&L Payment Initialization flow', async () => {
      // TODO: Move this test (as it is implemented now) into app/domain/environment-agnostic-handlers/per-operation-handlers/create-payment.
      // Here, instead, just test that exactly create-payment handler is called.

      dtHttpClientMock.post.mockResolvedValue(CreateInitializeTransactionResponseFactory());

      const req = abstractRequestFactory(RedirectAndLightboxPaymentInitRequestBodyFactory());
      const result = await handler(req);

      expect(dtHttpClientMock.post).toBeCalledWith(
        'https://apiUrl.test.fake/transactions',
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

      // TODO: Currently from reading this test it is not clear why the expected result
      // should match RedirectAndLightboxPaymentInitResponseFactory().
      // To understand that you must look into RedirectAndLightboxPaymentInitResponseFactory
      // and realize that the values hardcoded in it
      // IMPLICITLY correlate with internals of CreateInitializeTransactionResponseFactory and RedirectAndLightboxPaymentInitRequestBodyFactory.
      // Instead of such indirections - MAKE THE CORRELATION OBVIOUS IN THE CODE OF THIS TEST!
      expect(result).toMatchObject(RedirectAndLightboxPaymentInitResponseFactory());
    });
  });
});
