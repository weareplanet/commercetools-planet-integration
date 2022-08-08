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

const prepareSavedPaymentMethodData = (savedPaymentMethod?: IDatatransPaymentMethodInfo): Record<string, unknown> => {
  const paymentMethod = savedPaymentMethod?.paymentMethod;
  if (!paymentMethod) {
    return {};
  }

  if (savedPaymentMethod?.card) {
    return {
      card: {
        alias: savedPaymentMethod.card.alias,
        expiryMonth: savedPaymentMethod.card.expiryMonth,
        expiryYear: savedPaymentMethod.card.expiryYear
      }
    };
  }

  const pmaWithRecurrentPaymentSupported = [
    DatatransPaymentMethod.PAP,
    DatatransPaymentMethod.PFC,
    DatatransPaymentMethod.PEF,
    DatatransPaymentMethod.TWI
  ];
  if (pmaWithRecurrentPaymentSupported.includes(paymentMethod)) {
    return {
      [paymentMethod]: {
        alias: savedPaymentMethod[paymentMethod].alias
      }
    };
  }

  return {};
};

export const prepareInitializeTransactionRequestPayload = (parameters: IInputParametersForMapper): IDatatransInitializeTransaction => {
  const result = {
    refno: parameters.payment.key,
    currency: parameters.payment.amountPlanned?.currencyCode,
    amount: parameters.payment.amountPlanned?.centAmount,
    paymentMethods: parameters.payment.paymentMethodInfo?.method?.split(',').map(method => method.trim()) as unknown as DatatransPaymentMethod[],
    language: parameters.payment.custom?.fields?.language,
    option: parameters.payment.custom?.fields?.savePaymentMethod !== undefined ? ({
      createAlias: parameters.payment.custom?.fields?.savePaymentMethod
    }) : undefined,
    redirect: {
      successUrl: parameters.payment.custom?.fields?.successUrl,
      cancelUrl: parameters.payment.custom?.fields?.cancelUrl,
      errorUrl: parameters.payment.custom?.fields?.errorUrl,
    },
    webhook: {
      url: parameters.webhookUrl
    },
    ...prepareSavedPaymentMethodData(parameters.savedPaymentMethod)
  };

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
