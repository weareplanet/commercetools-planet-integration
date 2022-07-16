import { IAnyObjectWithStringKeys } from '../../interfaces';
import {
  IAbstractHeaders
} from '../handler-interfaces';

import * as yup from 'yup';
import {
  DatatransTransactionStatus,
  DatatransPaymentMethod,
  DatatransHistoryAction
} from './entities';

const DatatransTransactionHistorySchema = yup
  .array()
  .of(yup
    .object({
      action: yup.mixed<DatatransHistoryAction>().oneOf(Object.values(DatatransHistoryAction)),
      date: yup.string()
    })
    .required()
  );
export type IDatatransTransactionHistory = yup.TypeOf<typeof DatatransTransactionHistorySchema>;

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
    .required(),
  history: DatatransTransactionHistorySchema
});

export type IDatatransWebhookRequestBody = yup.TypeOf<typeof DatatransWebhookRequestBodySchema> & IAnyObjectWithStringKeys;

export interface IDatatransWebhookRequest /*extends IAbstractRequest*/ {
  headers?: IAbstractHeaders;
  body: IDatatransWebhookRequestBody;
}
