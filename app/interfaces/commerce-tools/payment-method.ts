import { CustomObject } from '@commercetools/platform-sdk';
import { DatatransPaymentMethod } from '../datatrans';

export type CommerceToolsPaymentMethod = {
  [key in keyof typeof DatatransPaymentMethod]?: Record<string, unknown>;
} & {
  paymentMethod: DatatransPaymentMethod;
  card?: Record<string, unknown>;
};

export interface CommerceToolsPaymentMethodsObject extends CustomObject {
  value: CommerceToolsPaymentMethod[];
}
