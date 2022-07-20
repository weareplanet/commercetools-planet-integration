import { CustomObject } from '@commercetools/platform-sdk';
import { IDatatransPaymentMethodInfo } from '../datatrans';

export interface ICommerceToolsCustomPaymentMethodsObject extends CustomObject {
  // we just use a subset of Datatrans fields as is
  // to save them in CommerceTools (Custom Object) -
  // so we consider keeping "Datatrans" word in the name
  value: IDatatransPaymentMethodInfo[];
}
