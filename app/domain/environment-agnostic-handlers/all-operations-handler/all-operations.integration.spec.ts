import { HttpStatusCode } from 'http-status-code-const-enum';

import {
  IAbstractRequest,
  IAbstractResponse,
} from '../../../interfaces';
import {
  getRedirectAndLightboxPaymentInitRequestBody,
  getRedirectAndLightboxPaymentInitResponseBody,
  getCreateInitializeTransactionRequest,
  getCreateInitializeTransactionMockResponse
} from '../../../../test/shared-test-entities/redirect-and-lightbox-payment-init';

describe('Main handler', () => {
  let handler: (req: IAbstractRequest) => Promise<IAbstractResponse>;
  const clientMock = {
    post: jest.fn()
  };
  const axiosMockFactory = () => ({
    create: () => clientMock
  });

  beforeAll(async () => {
    jest.mock('axios', axiosMockFactory);

    handler = (await import('./handler')).default;
  });

  afterAll(() => {
    jest.unmock('axios');
  });

  describe('When CommerceTools send request with body which match Redirect&Lightbox Payment Init operation criteria', () => {
    it('should go through Redirect&Lightbox Payment Init operation', async () => {
      clientMock.post.mockResolvedValue(getCreateInitializeTransactionMockResponse());

      const result = await handler({ body: getRedirectAndLightboxPaymentInitRequestBody() });

      expect(clientMock.post).toBeCalledWith(
        'https://apiUrl.test.fake/transactions',
        getCreateInitializeTransactionRequest(),
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
      expect(result).toMatchObject(getRedirectAndLightboxPaymentInitResponseBody());
    });
  });

  describe('When CommerceTools send request with body which doesn\'t match any operations criteria', () => {
    it('should return response success for not supported operation', async () => {
      const noOperationRequestBody = {
        body: {
          resource: {
            obj: {}
          }
        }
      };

      const result = await handler(noOperationRequestBody);

      expect(result).toEqual(
        {
          statusCode: HttpStatusCode.OK,
          body: ''
        }
      );
    });
  });
});
