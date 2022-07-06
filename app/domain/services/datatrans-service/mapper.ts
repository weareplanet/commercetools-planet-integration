import { createSchema, morphism } from 'morphism';

import {
  IInitializeTransaction,
  ICommerceToolsPaymentType,
  DatatransPaymentMethod
} from '@app/interfaces';

export const toInitializeTransaction = (payment: ICommerceToolsPaymentType): IInitializeTransaction => {
  const result = morphism(createSchema<IInitializeTransaction, ICommerceToolsPaymentType>({
    refno: ({ custom }) => custom?.fields?.merchantId,
    currency: ({ amountPlanned }) => amountPlanned?.currencyCode,
    amount: ({ amountPlanned }) => amountPlanned?.centAmount,
    paymentMethods: ({ paymentMethodInfo }) => paymentMethodInfo?.method?.split(',').map(method => method.trim()) as unknown as DatatransPaymentMethod[],
    language: ({ custom }) => custom?.fields?.language,
    option: ({ custom }) => custom?.fields?.savePaymentMethod ? ({
      createAlias: custom?.fields?.savePaymentMethod
    }) : undefined,
    redirect: ({ custom }) => ({
      successUrl: custom?.fields?.successUrl,
      cancelUrl: custom?.fields?.cancelUrl,
      errorUrl: custom?.fields?.errorUrl,
    })
  }, { undefinedValues: { strip: true } }))(payment);
  const option = result.option || payment?.custom?.fields?.initRequest?.option
    ? {
      option: {
        ...(payment?.custom?.fields?.initRequest?.option as Record<string, unknown>),
        ...result.option
      }
    }
    : { option: undefined };

  return {
    ...payment?.custom?.fields?.initRequest,
    ...result,
    ...option
  };
};
