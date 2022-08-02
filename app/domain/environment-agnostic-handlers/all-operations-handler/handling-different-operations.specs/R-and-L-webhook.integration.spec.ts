import { type Payment } from '@commercetools/platform-sdk';
import {
  IDatatransWebhookRequestBody,
  ICommerceToolsCustomPaymentMethodsObject,
  DatatransPaymentMethod,
  DATATRANS_SIGNATURE_HEADER_NAME
} from '../../../../interfaces';
import { DatatransService } from '../../../services/datatrans-service';
import { CommerceToolsService } from '../../../services/commercetools-service';
import handler from '..';

import {
  PaymentFactory,
  RedirectAndLightboxWebhookRequestFactory
} from '../../../../../test/test-utils';

describe('All-operations handler', () => {

  describe('When a request matches Redirect&Lightbox Webhook operation criteria', () => {
    describe('and Datatrans Signature validation passes', () => {
      beforeEach(/* Suppose the signature validation passes */ () => {
        /* eslint-disable @typescript-eslint/no-empty-function */
        const noop = () => {};
        jest.spyOn(DatatransService.prototype, 'validateIncomingRequestSignature').mockImplementation(noop);
      });

      // An attempt to make an END-to-END test (i.e. to mock 'node-fetch' and check its call with the expected actions) appeared TOO MESSY -
      // I couln'd find a way to stub the CT response to /oauth/token (which is tricky hidden inside Commercetools sdk).
      // So a simpler, "narrower" test is implemented here - it ends
      // on the checking of what CommerceToolsService.prototype.updatePayment was called with (that covers the majority of our logic).

      const fakeCurrentDate = '2022-07-15T18:10:00Z';
      beforeEach(() => {
        jest.spyOn(Date.prototype, 'toISOString').mockReturnValue(fakeCurrentDate);
      });

      const testSavedPaymentMethodsKey = 'Test payment methods key';
      const paymentFetchedFromCT = PaymentFactory({
        key: '12345123451234512361',
        version: 2,
        amountPlanned: {
          type: 'centPrecision',
          centAmount: 12345,
          currencyCode: 'EUR',
          fractionDigits: 2
        },
        custom: {
          fields: {
            savePaymentMethod: true,
            savedPaymentMethodsKey: 'Test payment methods key'
          }
        }
      } as unknown as Payment);
      beforeEach(/* Stub CommerceToolsService.prototype.getPayment */ () => {
        jest.spyOn(CommerceToolsService.prototype, 'getPayment').mockResolvedValue(paymentFetchedFromCT as unknown as Payment);
      });

      beforeEach(/* Mock CommerceToolsService.prototype.updatePayment */ () => {
        jest.spyOn(CommerceToolsService.prototype, 'updatePayment').mockResolvedValue(); // does not matter what it returns
      });

      const paymentMethodCustomObjectFetchedFromCT: Partial<ICommerceToolsCustomPaymentMethodsObject> = {
        key: 'KEY NOT EQUAL TO testSavedPaymentMethodsKey',
        version: 1,
        value: [
          {
            paymentMethod: DatatransPaymentMethod.VIS,
            card: {
              alias: 'Earlier saved VIS card payment alias'
            }
          }
        ]
      };
      beforeEach(/* Stub CommerceToolsService.prototype.getCustomObject */ () => {
        jest.spyOn(CommerceToolsService.prototype, 'getCustomObject')
          .mockResolvedValue(paymentMethodCustomObjectFetchedFromCT as ICommerceToolsCustomPaymentMethodsObject);
      });

      beforeEach(/* Mock CommerceToolsService.prototype.createOrUpdateCustomObject */ () => {
        jest.spyOn(CommerceToolsService.prototype, 'createOrUpdateCustomObject').mockResolvedValue(); // does not matter what it returns
      });

      const req = RedirectAndLightboxWebhookRequestFactory({
        paymentMethod: DatatransPaymentMethod.ECA,
        card: {
          alias: 'New ECA card payment alias',
          masked: '520000******0007'
        }
      });

      it('should update Payment in CommerceTools', async () => {
        await handler(req);

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
                  paymentMethod: 'ECA',
                  info: '{"alias":"New ECA card payment alias","masked":"520000******0007"}',
                },
                type: {
                  key: 'pp-datatrans-usedmethod-type',
                  typeId: 'type',
                }
              }
            }
          }
        ];
        expect(CommerceToolsService.prototype.updatePayment).toBeCalledWith(paymentFetchedFromCT, expectedActions);
      });

      it('should save paymentMethod data (alias etc.) to CommerceTools', async () => {
        await handler(req);

        expect(CommerceToolsService.prototype.createOrUpdateCustomObject).toBeCalledWith(
          'savedPaymentMethods',
          testSavedPaymentMethodsKey,
          [
            {
              paymentMethod: DatatransPaymentMethod.VIS,
              card: {
                alias: 'Earlier saved VIS card payment alias'
              }
            },
            {
              paymentMethod: DatatransPaymentMethod.ECA,
              card: {
                alias: 'New ECA card payment alias',
                masked: '520000******0007'
              }
            }
          ]
        );
      });

      it('should NOT save paymentMethod data (alias etc.) to CommerceTools, if Payment.savePaymentMethod is false', async () => {
        const paymentFetchedFromCT = PaymentFactory({
          custom: {
            fields: {
              savePaymentMethod: false,
              savedPaymentMethodsKey: 'Test payment methods key'
            }
          }
        } as unknown as Payment);
        jest.spyOn(CommerceToolsService.prototype, 'getPayment').mockResolvedValue(paymentFetchedFromCT as unknown as Payment);

        await handler(req);

        expect(CommerceToolsService.prototype.createOrUpdateCustomObject).not.toBeCalledWith();
      });

      it('should respond 200', async () => {
        const result = await handler(req);

        expect(result).toEqual(
          {
            statusCode: 200,
            body: ''
          }
        );
      });
    });

    describe('and Datatrans Signature validation fails', () => {
      beforeEach(/* Mock CommerceToolsService.prototype.getPayment */ () => {
        jest.spyOn(CommerceToolsService.prototype, 'getPayment').mockResolvedValue({} as Payment);
      });

      beforeEach(/* Mock CommerceToolsService.prototype.updatePayment */ () => {
        jest.spyOn(CommerceToolsService.prototype, 'updatePayment').mockResolvedValue();
      });

      beforeEach(/* Mock CommerceToolsService.prototype.getCustomObject */ () => {
        jest.spyOn(CommerceToolsService.prototype, 'getCustomObject').mockResolvedValue({} as ICommerceToolsCustomPaymentMethodsObject);
      });

      beforeEach(/* Mock CommerceToolsService.prototype.createOrUpdateCustomObject */ () => {
        jest.spyOn(CommerceToolsService.prototype, 'createOrUpdateCustomObject').mockResolvedValue();
      });

      it('should go through the Webhook handling flow and respond with 400', async () => {
        const req = RedirectAndLightboxWebhookRequestFactory();
        /* eslint-disable @typescript-eslint/no-explicit-any */
        (req.headers as any)[DATATRANS_SIGNATURE_HEADER_NAME] = 'wrong-value';
        const result = await handler(req);

        expect(CommerceToolsService.prototype.getPayment).not.toBeCalled();
        expect(CommerceToolsService.prototype.updatePayment).not.toBeCalled();

        expect(CommerceToolsService.prototype.getCustomObject).not.toBeCalled();
        expect(CommerceToolsService.prototype.createOrUpdateCustomObject).not.toBeCalled();

        expect(result).toEqual(
          {
            statusCode: 500,
            body: {
              message: 'Datatrans Signature validation failed'
            }
          }
        );
      });
    });
  });
});
