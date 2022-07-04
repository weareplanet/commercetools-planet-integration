import { createSchema, morphism } from 'morphism';

import { IInitializeTransaction, PaymentMethod } from '@app/interfaces/datatrans';
import { PaymentSchemaType } from '@domain/environment-agnostic-handlers/per-operation-handlers/create-payment/request-schema';



export const toInitializeTransaction = (payment: PaymentSchemaType): IInitializeTransaction => {
  const result = morphism(createSchema<IInitializeTransaction, PaymentSchemaType>({
    refno: ({ custom }) => custom?.fields?.merchantId,
    currency: ({ amountPlanned }) => amountPlanned?.currencyCode,
    amount: ({ amountPlanned }) => amountPlanned?.centAmount,
    paymentMethods: ({ paymentMethodInfo }) => paymentMethodInfo?.method?.split(',').map(method => method.trim()) as unknown as PaymentMethod[],
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

  return {
    ...payment?.custom?.fields?.initRequest,
    ...result,
    option: {
      ...(payment?.custom?.fields?.initRequest?.option as Record<string, unknown>),
      ...result.option
    }
  };
};
