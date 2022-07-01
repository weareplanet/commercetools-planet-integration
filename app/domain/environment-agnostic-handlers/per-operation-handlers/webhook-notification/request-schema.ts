import * as yup from 'yup';

import {
  DatatransTransactionStatus,
  DatatransPaymentMethod
} from '../../../../interfaces';

const RequestBodySchema = yup.object({
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


type RequestBodySchemaType = yup.TypeOf<typeof RequestBodySchema>;


export {
  RequestBodySchema, // This is exported to perform the validation (where handler is leveraged)
  RequestBodySchemaType // This is exported to be used as a type variable for generics
};
