import * as yup from 'yup';

import { CommerceToolsPaymentSchema } from '../../../../interfaces';

const RequestBodySchema = yup.object({
  action: yup.string().required(),
  resource: yup.object({
    obj: CommerceToolsPaymentSchema
  })
});

type RequestBodySchemaType = yup.TypeOf<typeof RequestBodySchema>;

export {
  RequestBodySchema, // This is exported to perform the validation (where handler is leveraged)
  RequestBodySchemaType, // This is exported to be used as a type variable for generics
};
