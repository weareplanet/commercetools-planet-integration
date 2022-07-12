import * as yup from 'yup';
import {
  type ExtensionAction
} from '@commercetools/platform-sdk';

import { IAbstractHeaders } from '../handler-interfaces';
import { CommerceToolsPaymentSchema } from './payment';

export const CommerceToolsExtensionRequestBodySchema = yup.object({
  action: yup
    .mixed<ExtensionAction>()
    .required(),
  resource: yup.object({
    obj: CommerceToolsPaymentSchema
  })
});

export type ICommerceToolsExtensionRequestBody = yup.TypeOf<typeof CommerceToolsExtensionRequestBodySchema>;

export interface ICommerceToolsExtensionRequest /*extends IAbstractRequest*/ {
  headers?: IAbstractHeaders;
  body: ICommerceToolsExtensionRequestBody;
}
