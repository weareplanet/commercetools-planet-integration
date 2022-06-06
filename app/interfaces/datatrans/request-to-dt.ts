import { DatatransPaymentMethod } from './entities';

export interface IDatatransTransactionBase {
  currency: string; // 3 letter ISO-4217
  refno: string; // [1...20]
  amount?: number;
}

export interface IDatatransInitializeTransaction extends IDatatransTransactionBase {
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
  };
  card?: {
    alias: string;
    expiryMonth: string; // \d{2}
    expiryYear: string; // \d{2}
  };
  [key: string]: unknown;
}

export type IDatatransRefundTransaction = IDatatransTransactionBase
