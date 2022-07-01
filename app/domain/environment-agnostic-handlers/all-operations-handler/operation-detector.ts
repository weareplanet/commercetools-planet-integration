import { ICommerceToolsExtensionRequestBoby } from '../../../interfaces';

// eslint-disable-next-line no-prototype-builtins
const hasProperties = (obj: object, fields: string[]) => obj && fields.every((field) => obj.hasOwnProperty(field));

export enum PaymentCreateOperation {
  RedirectAndLightboxInit = 'Redirect And Lightbox Init'
}

export enum PaymentInterface {
  DataTransRedirectIntegration = 'pp-datatrans-redirect-integration'
}

export const detectOperation = (body: ICommerceToolsExtensionRequestBoby) => {
  const payment = body.resource.obj;
  const isRedirectLightboxPaymentFlow =
    body?.action === 'Create'
    && payment?.paymentMethodInfo?.paymentInterface === PaymentInterface.DataTransRedirectIntegration
    && !hasProperties(payment?.custom?.fields, ['transactionId', 'savedPaymentMethodAlias'])
    && !payment?.paymentStatus?.interfaceCode;

  if (isRedirectLightboxPaymentFlow) {
    return PaymentCreateOperation.RedirectAndLightboxInit;
  }

  return '';
};
