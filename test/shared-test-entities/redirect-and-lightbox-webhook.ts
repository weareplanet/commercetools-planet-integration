import {
  DatatransTransactionStatus,
  DatatransPaymentMethod,
  DatatransHistoryAction,
  IDatatransWebhookRequestBody
} from '../../app/interfaces';

import { abstractRequestFactory } from './abstract-request-factories';

export const RedirectAndLightboxWebhookRequestBodyFactory = (): IDatatransWebhookRequestBody =>  {
  return {
    merchantId: 'Test merchantId',
    refno: 'Test refno',
    transactionId: 'Test transactionId',
    status: DatatransTransactionStatus.authorized,
    paymentMethod: DatatransPaymentMethod.VIS,
    history: [
      {
        action: DatatransHistoryAction.init,
        // 'amount': 12457,
        // source: 'api',
        date: '2022-07-15T15:26:34Z',
        // success: true,
        // ip: '34.245.26.232'
      },
      {
        action: DatatransHistoryAction.authorize,
        // autoSettle: true,
        // amount: 12457,
        // source: 'redirect',
        date: '2022-07-15T15:27:05Z',
        // success: true,
        // ip: '95.67.122.124'
      }
    ]
  };
};

export const RedirectAndLightboxWebhookRequestFactory = () =>  {
  return abstractRequestFactory(
    RedirectAndLightboxWebhookRequestBodyFactory(),
    {
      'datatrans-signature': 't=TS,s0=SIGNATURE'
    }
  );
};
