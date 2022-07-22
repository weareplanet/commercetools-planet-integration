import { CustomObject } from '@commercetools/platform-sdk';
import { DatatransPaymentMethod } from '../datatrans';

// TODO: in future we will support different types of PaymentMethods but for now only PaymentMethod with card
// export type ICommerceToolsPaymentMethod = {
//   [key in keyof typeof DatatransPaymentMethod]?: Record<string, unknown>;
// } & {
//   paymentMethod: DatatransPaymentMethod;
//   card?: Record<string, unknown>;
// };

export type ICommerceToolsPaymentMethod = {
  paymentMethod: DatatransPaymentMethod;
  card: {
    alias: string;
    expiryMonth: string;
    expiryYear: string;
    [key: string]: unknown;
  };
};

export interface ICommerceToolsPaymentMethodsObject extends CustomObject {
  value: ICommerceToolsPaymentMethod[];
}
