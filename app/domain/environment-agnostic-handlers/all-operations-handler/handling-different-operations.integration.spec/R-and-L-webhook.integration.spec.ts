import { IDatatransWebhookRequestBody } from '../../../../interfaces';
import { DatatransService } from '../../../services/datatrans-service';
import {
  type Payment,
} from '@commercetools/platform-sdk';

import {
  RedirectAndLightboxWebhookRequestFactory
} from '../../../../../test/shared-test-entities/redirect-and-lightbox-webhook';

import { CommerceToolsService } from '../../../services/commercetools-service';

import handler from '..';


describe('Main handler', () => {

  // An attempt to make an END-to-END test (i.e. to mock 'node-fetch' and check what it was called with)
  // appeared TOO MESSY - at least due to necessity to stub the Authentication request to CT (hidden inside Commercetools sdk).
  // So a simpler, "narrower" test is implemented here - it ends one step earlier -
  // on the checking what CommerceToolsService.updatePayment was called with (what covers the majority of the logic).
  describe('When a request matches Redirect&Lightbox Webhook operation criteria', () => {
    beforeEach(() => { // Stub Signature validation
      /* eslint-disable @typescript-eslint/no-empty-function */
      const noop = () => {};
      jest.spyOn(DatatransService, 'validateIncomingRequestSignature').mockImplementation(noop);
    });

    const paymentFetchedFromCT: Partial<Payment> = {
      key: '12345123451234512361',
      version: 2,
      amountPlanned: {
        type: 'centPrecision',
        centAmount: 12345,
        currencyCode: 'EUR',
        fractionDigits: 2
      }
    };
    beforeEach(() => {
      jest.spyOn(CommerceToolsService, 'getPayment').mockResolvedValue(paymentFetchedFromCT as Payment);
      jest.spyOn(CommerceToolsService, 'updatePayment').mockResolvedValue();
    });

    const fakeCurrentDate = '2022-07-15T18:10:00Z';
    beforeEach(() => {
      jest.spyOn(Date.prototype, 'toISOString').mockReturnValue(fakeCurrentDate);
    });

    it('should go through the Webhook handling flow', async () => {
      const req = RedirectAndLightboxWebhookRequestFactory();
      await handler(req);

      const dateFromDtHistoryAuthorizeTransaction = (req.body as IDatatransWebhookRequestBody).history?.[1].date;

      expect(CommerceToolsService.updatePayment).toBeCalledWith(paymentFetchedFromCT, [{
        action: 'setStatusInterfaceCode', interfaceCode: 'authorized' },
      {
        action: 'addInterfaceInteraction',
        type: { typeId: 'type', key: 'pp-datatrans-interface-interaction-type' },
        fields: {
          message: req.rawBody,
          timeStamp: fakeCurrentDate,
          interactionType: 'webhook'
        }
      },
      {
        action: 'addTransaction',
        transaction: {
          type: 'Authorization',
          state: 'Success',
          interactionId: 'Test transactionId',
          timestamp: dateFromDtHistoryAuthorizeTransaction,
          amount: {
            centAmount: 12345,
            currencyCode: 'EUR',
          },
          custom: {
            fields: {
              info: '',
              paymentMethod: 'VIS',
            },
            type: {
              key: 'pp-datatrans-usedmethod-type',
              typeId: 'type',
            }
          }
        }
      }
      ]);

      // expect(result).toMatchObject();
    });
  });
});
