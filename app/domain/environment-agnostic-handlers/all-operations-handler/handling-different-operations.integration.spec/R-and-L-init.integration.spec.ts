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

      expect(result).toMatchObject(RedirectAndLightboxPaymentInitResponseFactory());
    });
  });
});
