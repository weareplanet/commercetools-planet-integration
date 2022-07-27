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

export const DATATRANS_SIGNATURE_HEADER_NAME = 'datatrans-signature';

const DatatransTransactionHistoryItemSchema = yup
  .object({
    action: yup.mixed<DatatransHistoryAction>().oneOf(Object.values(DatatransHistoryAction)),
    date: yup.string()
  }).required();

export type IDatatransTransactionHistoryItem = yup.TypeOf<typeof DatatransTransactionHistoryItemSchema>
  & IAnyObjectWithStringKeys; // Any fields not declared in DatatransTransactionHistoryItemSchema can be present in this type

const DatatransTransactionHistorySchema = yup
  .array()
  .of(DatatransTransactionHistoryItemSchema);

export type IDatatransTransactionHistory = IDatatransTransactionHistoryItem[];

export const DatatransWebhookRequestBodySchema = yup.object({
  merchantId: yup
    .string()
    // .required(), TODO: uncomment this when Datatrans starts to provide this field
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
