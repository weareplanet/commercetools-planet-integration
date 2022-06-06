import * as yup from 'yup';
import {
  type ExtensionAction
} from '@commercetools/platform-sdk';

import { IAbstractHeaders } from '../handler-interfaces';
import { IAnyObjectWithStringKeys } from '../extras';
import { CommerceToolsPaymentSchema } from './payment';

export const COMMERCETOOLS_CORRELATION_ID_HEADER_NAME = 'X-Correlation-ID';

export const CommerceToolsExtensionRequestBodySchema = yup.object({
  action: yup
    .mixed<ExtensionAction>()
    .required(),
  resource: yup.object({
    obj: CommerceToolsPaymentSchema
  })
});

export type ICommerceToolsExtensionRequestBody = yup.TypeOf<typeof CommerceToolsExtensionRequestBodySchema> & IAnyObjectWithStringKeys;

export interface ICommerceToolsExtensionRequest /*extends IAbstractRequest*/ {
  headers?: IAbstractHeaders;
  body: ICommerceToolsExtensionRequestBody;
}
