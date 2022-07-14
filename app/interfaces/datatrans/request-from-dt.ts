import { IAbstractHeaders } from '../handler-interfaces';

import * as yup from 'yup';
import {
  DatatransTransactionStatus,
  DatatransPaymentMethod
} from './entities';

export const DatatransWebhookRequestBodySchema = yup.object({
  merchantId: yup // so far it's only our dream that Datatrans provides this field
    .string()
    // .required(),
    .optional(),
  refno: yup  // Corresponds to Payment.key in CommerceTools
    .string()
    .required(),
  transactionId: yup
    .string()
    .required(),
  status: yup
    .mixed<DatatransTransactionStatus>()
    .oneOf(Object.values(DatatransTransactionStatus))
    .required(),
  paymentMethod: yup
    .mixed<DatatransPaymentMethod>()
    .oneOf(Object.values(DatatransPaymentMethod))
    .required()
});

type AnyExtraFields = Record<string, unknown>;
export type IDatatransWebhookRequestBody = yup.TypeOf<typeof DatatransWebhookRequestBodySchema> & AnyExtraFields;

export interface IDatatransWebhookRequest /*extends IAbstractRequest*/ {
  headers?: IAbstractHeaders;
  body: IDatatransWebhookRequestBody;
}
