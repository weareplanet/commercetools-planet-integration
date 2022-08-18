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
import { ConfigService } from '../../domain/services/config-service';
import { ErrorMessages } from '../commerce-tools/error-messages';

export const DATATRANS_SIGNATURE_HEADER_NAME = 'Datatrans-Signature';

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
    .required()
    .test((value, context) => {
      const merchantConfig = new ConfigService().getConfig().datatrans.merchants.find((mc) => mc.id === value);
      if (!merchantConfig || !merchantConfig.password) {
        return context.createError({ message: ErrorMessages.merchantCredentialsMissing() });
      }
      return true;
    }),
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
