import {
  IAbstractRequest,
  ICommerceToolsExtensionRequest,
  IDatatransWebhookRequest,
  DATATRANS_SIGNATURE_HEADER_NAME
} from '../../../interfaces';

// eslint-disable-next-line no-prototype-builtins
const hasProperties = (obj: object, fields: string[]) => obj && fields.every((field) => obj.hasOwnProperty(field));

export enum Operation {
  RedirectAndLightboxInit = 'Redirect And Lightbox Init',
  RedirectAndLightboxWebhook = 'Redirect And Lightbox Webhook'
}

enum PaymentInterface {
  DataTransRedirectIntegration = 'pp-datatrans-redirect-integration'
}

export class OperationDetector {

  // Type guard for ICommerceToolsExtensionRequest
  public static isCommerceToolsRequest(req: IAbstractRequest | ICommerceToolsExtensionRequest): req is ICommerceToolsExtensionRequest {
    const request = req as ICommerceToolsExtensionRequest;
    return !!request.body && (typeof request.body === 'object') && !!request.body.action;
  }

  // Type guard for IDatatransWebhookRequest
  public static isDatatransRequest(req: IAbstractRequest | IDatatransWebhookRequest): req is IDatatransWebhookRequest {
    const request = req as IDatatransWebhookRequest;
    return !!request.headers && !!request.headers[DATATRANS_SIGNATURE_HEADER_NAME];
  }

  public static detectOperation = (req: IAbstractRequest) => {

    if (this.isCommerceToolsRequest(req)) {
      if (this.isRedirectAndLightboxInitOperation(req)) {
        return Operation.RedirectAndLightboxInit;
      }
    } else if (this.isDatatransRequest(req)) {
      return Operation.RedirectAndLightboxWebhook;
    }

    return '';
  };

  private static isRedirectAndLightboxInitOperation(req: ICommerceToolsExtensionRequest): boolean {
    const reqBody = req.body;
    const payment = reqBody.resource.obj;

    return reqBody.action === 'Create'
      && payment?.paymentMethodInfo?.paymentInterface === PaymentInterface.DataTransRedirectIntegration
      && !hasProperties(payment?.custom?.fields, ['transactionId'])
      && !payment?.paymentStatus?.interfaceCode;
  }
}
