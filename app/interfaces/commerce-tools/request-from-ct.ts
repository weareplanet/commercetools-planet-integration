import {
  type ExtensionAction
} from '@commercetools/platform-sdk';

///// Re-export types describing shapes of HTTP requests from CommerceTools and some their parts
// TODO: Move those schemas declarations to here?
export {
  type RequestBodySchemaType as ICreatePaymentRequestBodySchemaType
} from '../../domain/environment-agnostic-handlers/per-operation-handlers/create-payment/request-schema';

///// Other request types

import { IAbstractHeaders } from '../handler-interfaces';
import { ICommerceToolsPayment }  from './payment';

export interface ICommerceToolsExtensionRequestBody /*extends IAbstractBody*/{
  action: ExtensionAction,
  resource: {
    obj: ICommerceToolsPayment;
  }
}

// TODO: ICommerceToolsExtensionRequestBody declaration above duplicates RequestBodySchemaType
// declared in app/domain/environment-agnostic-handlers/per-operation-handlers/create-payment/request-schema.ts
// Below is the attempt to get rid of the duplication.
// import * as yup from 'yup';
// import { CommerceToolsPaymentSchema } from './payment';

// const CommerceToolsExtensionRequestBodySchema = yup.object({
//   action: yup
//     .mixed<ExtensionAction>()
//     .required(),
//   resource: yup.object({
//     obj: CommerceToolsPaymentSchema
//   })
// });

// type ICommerceToolsExtensionRequestBody = yup.TypeOf<typeof CommerceToolsExtensionRequestBodySchema>;


export interface ICommerceToolsExtensionRequest /*extends IAbstractRequest*/ {
  headers?: IAbstractHeaders;
  body: ICommerceToolsExtensionRequestBody;
}
