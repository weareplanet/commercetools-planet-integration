import _merge from 'lodash.merge';

import { RecursivePartial } from './test-utils';

import {
  DatatransTransactionStatus,
  DatatransPaymentMethod,
  DatatransHistoryAction,
  IDatatransWebhookRequestBody,
  DATATRANS_SIGNATURE_HEADER_NAME
} from '../../app/interfaces';

import { abstractRequestFactory } from './abstract-request-factories';

export const RedirectAndLightboxWebhookRequestBodyFactory = (webhookRequestBodyExplicitStuff: RecursivePartial<IDatatransWebhookRequestBody> = {}): IDatatransWebhookRequestBody =>  {
  const defaultStuff = {
    merchantId: 'Test merchantId',
    refno: 'Test refno',
    transactionId: 'Test transactionId',
    status: DatatransTransactionStatus.authorized,
    paymentMethod: DatatransPaymentMethod.VIS, // ECA, VIS, AMX, CUP, DIN, DIS, JCB, MAU, DNK
    card: {
      alias: 'Test card alias',
      masked: '424242xxxxxx4242'
    },
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

  return _merge(
    defaultStuff,
    webhookRequestBodyExplicitStuff
  );
};

export const RedirectAndLightboxWebhookRequestFactory = (webhookRequestBodyExplicitStuff: RecursivePartial<IDatatransWebhookRequestBody> = {}) =>  {
  return abstractRequestFactory(
    RedirectAndLightboxWebhookRequestBodyFactory(webhookRequestBodyExplicitStuff),
    {
      [DATATRANS_SIGNATURE_HEADER_NAME]: 't=TS,s0=SIGNATURE'
    }
  );
};
