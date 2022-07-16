import { HttpStatusCode } from 'http-status-code-const-enum';

import {
  RedirectAndLightboxPaymentInitRequestBodyFactory,
  RedirectAndLightboxPaymentInitResponseBodyFactory,
  CreateInitializeTransactionRequestFactory,
  CreateInitializeTransactionMockResponseFactory
} from '../../../../test/shared-test-entities/redirect-and-lightbox-payment-init';

import { abstractRequestFactory } from '../../../../test/shared-test-entities/abstract-request-factories';

const clientMock = {
  post: jest.fn()
};
jest.mock('axios', () => {
  return {
    create: () => clientMock
  };
});

import handler from '.';


describe('Main handler', () => {

  afterEach(() => {
    clientMock.post.mockReset();
  });

  describe('When CommerceTools sends a request with body which matches Redirect&Lightbox Payment Init operation criteria', () => {
    it('should go through Redirect&Lightbox Payment Init operation', async () => {
      clientMock.post.mockResolvedValue(CreateInitializeTransactionMockResponseFactory());

      const req = abstractRequestFactory(RedirectAndLightboxPaymentInitRequestBodyFactory());
      const result = await handler(req);

      expect(clientMock.post).toBeCalledWith(
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
      expect(result).toMatchObject(RedirectAndLightboxPaymentInitResponseBodyFactory());
    });
  });

  describe('When CommerceTools sends a request with body which doesn\'t match any usecase criteria', () => {
    it('should return 200 response with empty body', async () => {
      const notSupportedUseCaseRequest = {
        body: {
          resource: {
            obj: {}
          }
        }
      };

      const req = abstractRequestFactory(notSupportedUseCaseRequest);
      const result = await handler(req);

      expect(result).toEqual(
        {
          statusCode: HttpStatusCode.OK,
          body: ''
        }
      );
    });
  });
});
