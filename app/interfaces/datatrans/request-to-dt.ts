import { DatatransPaymentMethod } from './entities';

export interface IDatatransInitializeTransaction {
  currency: string; // 3 letter ISO-4217
  refno: string; // [1...20]
  amount?: number;
  paymentMethods?: DatatransPaymentMethod[];
  language?: string;
  option?: {
    createAlias?: boolean;
    [key: string]: unknown;
  };
  redirect?: {
    successUrl: string;
    cancelUrl: string;
    errorUrl: string;
  };
  webhook: {
    url: string;
  }
  [key: string]: unknown;
}
