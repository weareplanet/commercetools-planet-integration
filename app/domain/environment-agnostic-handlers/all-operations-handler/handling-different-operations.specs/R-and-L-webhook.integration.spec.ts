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
import { HttpStatusCode } from 'http-status-code-const-enum';

const disableDatatransSignatureValidation = () => {
  /* eslint-disable @typescript-eslint/no-empty-function */
  const noop = () => {};
  jest.spyOn(DatatransService, 'validateIncomingRequestSignature').mockImplementation(noop);
};

describe('Main handler', () => {

  describe('When a request matches Redirect&Lightbox Webhook operation criteria', () => {
    // TODO: Move this test (as it is implemented now) into app/domain/environment-agnostic-handlers/per-operation-handlers/webhook-notification.
    // Here, instead, just test that exactly webhook-notification handler is called.

    describe('And Datatrans Signature validation passes', () => {

      beforeEach(() => {
        disableDatatransSignatureValidation();
      });

      // An attempt to make an END-to-END test (i.e. to mock 'node-fetch' and check its call with the expected actions) appeared TOO MESSY -
      // I couln'd find a way to stub the CT response to /oauth/token (which is tricky hidden inside Commercetools sdk).
      // So a simpler, "narrower" test is implemented here - it ends
      // on the checking of what CommerceToolsService.updatePayment was called with (that covers the majority of our logic).

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
      beforeEach(() => { // Stub CommerceToolsService.getPayment
        jest.spyOn(CommerceToolsService, 'getPayment').mockResolvedValue(paymentFetchedFromCT as Payment);
      });

      beforeEach(() => { // Mock CommerceToolsService.updatePayment
        jest.spyOn(CommerceToolsService, 'updatePayment').mockResolvedValue();
      });

      const fakeCurrentDate = '2022-07-15T18:10:00Z';
      beforeEach(() => {
        jest.spyOn(Date.prototype, 'toISOString').mockReturnValue(fakeCurrentDate);
      });

      it('should go through the Webhook handling flow and respond with 200', async () => {
        const req = RedirectAndLightboxWebhookRequestFactory();
        const result = await handler(req);

        const dateFromDtHistoryAuthorizeTransaction = (req.body as IDatatransWebhookRequestBody).history?.[1].date;

        const expectedActions = [
          { action: 'setStatusInterfaceCode', interfaceCode: 'authorized' },
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
        ];

        expect(CommerceToolsService.updatePayment).toBeCalledWith(paymentFetchedFromCT, expectedActions);

        expect(result).toEqual(
          {
            statusCode: 200,
            body: ''
          }
        );
      });
    });

    describe('but Datatrans Signature validation fails', () => {
      beforeEach(() => { // Stub CommerceToolsService.getPayment
        jest.spyOn(CommerceToolsService, 'getPayment').mockResolvedValue({} as Payment);
      });

      beforeEach(() => { // Mock CommerceToolsService.updatePayment
        jest.spyOn(CommerceToolsService, 'updatePayment').mockResolvedValue();
      });

      it('should go through the Webhook handling flow and respond with 400', async () => {
        const req = RedirectAndLightboxWebhookRequestFactory();
        const result = await handler(req);

        expect(CommerceToolsService.getPayment).not.toBeCalled();
        expect(CommerceToolsService.updatePayment).not.toBeCalled();

        expect(result).toEqual(
          {
            statusCode: 400,
            body: {
              error: {
                code: HttpStatusCode.INTERNAL_SERVER_ERROR,
                message: 'Datatrans Signature validation failed'
              }
            }
          }
        );
      });
    });
  });
});
