import {
  type ExtensionAction
} from '@commercetools/platform-sdk';

///// Re-export types describing shapes of HTTP requests from CommerceTools and some their parts
// TODO: Move those schemas declarations to here?
export {
  type RequestBodySchemaType as ICreatePaymentRequestBodySchemaType
} from '../../domain/environment-agnostic-handlers/per-operation-handlers/create-payment/request-schema';

///// Other request types

import { ICommerceToolsPayment }  from './payment';

export interface ICommerceToolsExtensionRequestBoby {
  action: ExtensionAction,
  resource: {
    obj: ICommerceToolsPayment;
  }
}
