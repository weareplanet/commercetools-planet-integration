import {
  abstractRequestFactory,
  PaymentFactory
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
    dtHttpClientMock.post.mockResolvedValue({
      data: {
        transactionId: 'dt-Refund-transactionId--just-received-from-Datatrans'
      }
    });
  });

  afterEach(() => {
    dtHttpClientMock.post.mockReset();
  });

  describe('When a request matches Refund operation criteria', () => {

    it('should go through Refund flow', async () => {
      const mockPayment = PaymentFactory({
        transactions: [
          {
            type: 'Authorization',
            id: 'ct-Authorization-transaction-id',
            state: 'Success',
            interactionId: 'dt-Authorization-transactionId',
            amount: {
              centAmount: 12345,
              currencyCode: 'EUR'
            }
          },
          {
            type: 'Refund',
            id: 'ct-Refund-transaction-id',
            state: 'Initial',
            amount: {
              currencyCode: 'EUR',
              centAmount: 500
            }
          }
        ]
      });

      const req = abstractRequestFactory({
        body: {
          action: 'Update',
          resource: {
            obj: mockPayment
          }
        }
      });

      const result = await handler(req);

      expect(dtHttpClientMock.post).toBeCalledWith(
        DatatransURL.TEST + '/transactions/dt-Authorization-transactionId/credit',
        {
          amount: 500,
          currency: 'EUR',
          refno: mockPayment.key
        },
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

      expect(result).toMatchObject({
        statusCode: 200,
        body: {
          actions: [
            {
              action: 'addInterfaceInteraction',
              fields: {
                interactionType: 'refundRequest',
                message: '{"body":{"refno":"12345318909876543216","amount":500,"currency":"EUR"}}',
                timeStamp: expect.any(String)
              },
              type: {
                key: 'pp-datatrans-interface-interaction-type',
                typeId: 'type'
              },
            },
            {
              action: 'addInterfaceInteraction',
              fields: {
                interactionType: 'refundResponse',
                message: '{"body":{"transactionId":"dt-Refund-transactionId--just-received-from-Datatrans"}}',
                timeStamp: expect.any(String)
              },
              type: {
                key: 'pp-datatrans-interface-interaction-type',
                typeId: 'type'
              },
            },
            {
              action: 'changeTransactionState',
              state: 'Success',
              transactionId: 'ct-Refund-transaction-id'
            },
            {
              action: 'changeTransactionInteractionId',
              transactionId: 'ct-Refund-transaction-id',
              interactionId: 'dt-Refund-transactionId--just-received-from-Datatrans'
            }
          ]
        }
      });
    });
  });

});
