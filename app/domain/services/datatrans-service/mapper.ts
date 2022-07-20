import { createSchema, morphism } from 'morphism';

import {
  IDatatransInitializeTransaction,
  ICommerceToolsPayment,
  DatatransPaymentMethod,
  IDatatransPaymentMethodInfo
} from '../../../interfaces';

interface IInputParametersForMapper {
  payment: ICommerceToolsPayment;
  webhookUrl: string;
  savedPaymentMethod?: IDatatransPaymentMethodInfo;
}

export const prepareInitializeTransactionRequestPayload = (parameters: IInputParametersForMapper): IDatatransInitializeTransaction => {
  const result = morphism(createSchema<IDatatransInitializeTransaction, IInputParametersForMapper>({
    refno: ({ payment }) => payment.key,
    currency: ({ payment }) => payment?.amountPlanned?.currencyCode,
    amount: ({ payment }) => payment?.amountPlanned?.centAmount,
    paymentMethods: ({ payment }) => payment?.paymentMethodInfo?.method?.split(',').map(method => method.trim()) as unknown as DatatransPaymentMethod[],
    language: ({ payment }) => payment?.custom?.fields?.language,
    option: ({ payment }) => payment?.custom?.fields?.savePaymentMethod !== undefined ? ({
      createAlias: payment?.custom?.fields?.savePaymentMethod
    }) : undefined,
    redirect: ({ payment }) => ({
      successUrl: payment?.custom?.fields?.successUrl,
      cancelUrl: payment?.custom?.fields?.cancelUrl,
      errorUrl: payment?.custom?.fields?.errorUrl,
    }),
    webhook: ({ webhookUrl }) => ({
      url: webhookUrl
    }),
    card: ({ savedPaymentMethod }) => savedPaymentMethod?.card
      ? ({
        alias: savedPaymentMethod.card.alias,
        expiryMonth: savedPaymentMethod.card.expiryMonth,
        expiryYear: savedPaymentMethod.card.expiryYear,
      })
      : undefined
  }, { undefinedValues: { strip: true } }))(parameters);

  const option = result.option || parameters.payment?.custom?.fields?.initRequest?.option
    ? {
      option: {
        ...(parameters.payment?.custom?.fields?.initRequest?.option as Record<string, unknown>),
        ...result.option
      }
    }
    : {};

  return {
    ...parameters.payment?.custom?.fields?.initRequest,
    ...result,
    ...option
  };
};
