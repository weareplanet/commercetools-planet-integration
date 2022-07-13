import {
  IAbstractRequest,
  ICommerceToolsExtensionRequest,
  IDatatransWebhookRequest
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

  // Type quard for ICommerceToolsExtensionRequest
  public static isCommerceToolsRequest(req: IAbstractRequest | ICommerceToolsExtensionRequest): req is ICommerceToolsExtensionRequest {
    const request = req as ICommerceToolsExtensionRequest;
    return !!request.body && (typeof request.body === 'object') && !!request.body.action;
  }

  // Type quard for IDatatransWebhookRequest
  public static isDatatransRequest(req: IAbstractRequest | IDatatransWebhookRequest): req is IDatatransWebhookRequest {
    const request = req as IDatatransWebhookRequest;
    return !!request.headers && !!request.headers['datatrans-signature'];
  }

  public static detectCase = (req: IAbstractRequest) => {

    if (this.isCommerceToolsRequest(req)) {
      const reqBody = req.body;
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
