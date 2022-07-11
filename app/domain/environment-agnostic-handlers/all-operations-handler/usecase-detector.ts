import {
  IAbstractRequest,
  ICommerceToolsExtensionRequestBody
} from '../../../interfaces';

// eslint-disable-next-line no-prototype-builtins
const hasProperties = (obj: object, fields: string[]) => obj && fields.every((field) => obj.hasOwnProperty(field));

export enum UseCase {
  RedirectAndLightboxInit = 'Redirect And Lightbox Init',
  RedirectAndLightboxWebhook = 'Redirect And Lightbox Webhook'
}

enum PaymentInterface {
  DataTransRedirectIntegration = 'pp-datatrans-redirect-integration'
}

export class UseCaseDetector {

  public static isCommerceToolsRequest(req: IAbstractRequest): boolean {
    return !!req.body && (typeof req.body === 'object') && !!(req.body as unknown as ICommerceToolsExtensionRequestBody).action;
  }

  public static isDatatransRequest(req: IAbstractRequest): boolean {
    return !!req.headers && !!req.headers['Datatrans-Signature'];
  }

  public static detectCase = (req: IAbstractRequest) => {

    if (this.isCommerceToolsRequest(req)) {
      const reqBody: ICommerceToolsExtensionRequestBody = req.body as unknown as ICommerceToolsExtensionRequestBody;
      const payment = reqBody.resource.obj;
      const isRedirectLightboxPaymentFlow =
        reqBody.action === 'Create'
        && payment?.paymentMethodInfo?.paymentInterface === PaymentInterface.DataTransRedirectIntegration
        && !hasProperties(payment?.custom?.fields, ['transactionId', 'savedPaymentMethodAlias'])
        && !payment?.paymentStatus?.interfaceCode;

      if (isRedirectLightboxPaymentFlow) {
        return UseCase.RedirectAndLightboxInit;
      }
    } else if (this.isDatatransRequest(req)) {
      return UseCase.RedirectAndLightboxWebhook;
    }

    return '';
  };
}
