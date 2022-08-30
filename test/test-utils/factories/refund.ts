import _merge from 'lodash.merge';
import { RecursivePartial } from '..';
import {
  ICommerceToolsPayment,
  IDatatransRefundTransaction,
  ICommerceToolsExtensionRequestBody
} from '../../../app/interfaces';
import { PaymentFactory } from '..';

export const RefundRequestBodyFactory = (explicitPayment?: RecursivePartial<ICommerceToolsPayment>) =>  {
  const defaultPayment = PaymentFactory();

  return {
    action: 'Update',
    resource: {
      id: '123',
      typeId: 'typeId',
      obj: _merge(
        defaultPayment,
        explicitPayment
      )
    }
  } as unknown as ICommerceToolsExtensionRequestBody; // TODO: provide all required fields
};

export const RefundTransactionRequestFactory = (): IDatatransRefundTransaction => {
  return {
    refno: '12345318909876543216',
    currency: 'EUR',
    amount:1555
  };
};
