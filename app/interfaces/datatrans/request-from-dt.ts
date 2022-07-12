///// Re-export types describing shapes of HTTP requests from Datatrans and some their parts
// TODO: Move those schemas declarations to here?
// export {
//   type RequestBodySchemaType as IWebhookRequestBody
// } from '../../domain/environment-agnostic-handlers/per-operation-handlers/webhook-notification/request-schema';


///// Other request types

import { IAbstractHeaders } from '../handler-interfaces';

// export interface IDatatransWebhookRequestBody /*extends IAbstractBody*/ {

// }

import * as yup from 'yup';
import {
  DatatransTransactionStatus,
  DatatransPaymentMethod
} from './entities';

export const DatatransWebhookRequestBodySchema = yup.object({
  merchantId: yup // so far it's only our dream that Datatrans provides this field
    .string()
    .required(),
  refno: yup  // Corresponds to Payment.key in CommerceTools
    .string()
    .required(),
  transactionId: yup
    .string()
    .required(),
  status: yup
    // .string()
    .mixed<DatatransTransactionStatus>()
    .oneOf(Object.values(DatatransTransactionStatus))
    .required(),
  paymentMethod: yup
    // .string()
    .mixed<DatatransPaymentMethod>()
    .oneOf(Object.values(DatatransPaymentMethod))
    .required()
});

export type IDatatransWebhookRequestBody = yup.TypeOf<typeof DatatransWebhookRequestBodySchema>;

export interface IDatatransWebhookRequest /*extends IAbstractRequest*/ {
  headers?: IAbstractHeaders;
  body: IDatatransWebhookRequestBody;
}
