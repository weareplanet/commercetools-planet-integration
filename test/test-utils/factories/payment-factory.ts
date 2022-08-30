import _merge from 'lodash.merge';

import { RecursivePartial } from '..';
import {
  ICommerceToolsPayment
} from '../../../app/interfaces';

import {
  type Payment,
} from '@commercetools/platform-sdk';

export const PaymentFactory = (paymentExplicitStuff: RecursivePartial<ICommerceToolsPayment | Payment> = {}): ICommerceToolsPayment =>  {

  const defaultStuff = {
    key: '12345318909876543216',
    amountPlanned: {
      type: 'centPrecision',
      currencyCode: 'EUR',
      centAmount: 1555,
      fractionDigits: 2
    },
    paymentMethodInfo: {
      paymentInterface: 'pp-datatrans-redirect-integration',
      method: 'VIS, PAP'
    },
    custom: {
      type: {
        typeId: 'type',
        id: '89637766-02f9-4391-9c7a-9077d9662daf'
      },
      fields: {
        key: 'refno',
        cancelUrl: 'https://google.com',
        merchantId: 'Test_merchant_id',
        successUrl: 'https://google.com',
        errorUrl: 'https://google.com'
      }
    },
    paymentStatus: {},
    transactions: [],
    interfaceInteractions: []
  } as unknown as ICommerceToolsPayment; // TODO: provide all required fields

  return _merge(
    defaultStuff,
    paymentExplicitStuff
  );
};
