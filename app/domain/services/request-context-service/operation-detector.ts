import {
  IAbstractRequest,
  ICommerceToolsExtensionRequest,
  IDatatransWebhookRequest,
  getHttpHeaderValue,
  DATATRANS_SIGNATURE_HEADER_NAME,
  ActionRequestedOnPayment
} from '../../../interfaces';

import { type Payment } from '@commercetools/platform-sdk';

// eslint-disable-next-line no-prototype-builtins
const hasProperties = (obj: object, fields: string[]) => obj && fields.every((field) => obj.hasOwnProperty(field));

export enum Operation {
  RedirectAndLightboxInit = 'Redirect And Lightbox Init',
  RedirectAndLightboxWebhook = 'Redirect And Lightbox Webhook',
  StatusCheck = 'Status Check',
  Refund = 'Refund'
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
    return !!getHttpHeaderValue(DATATRANS_SIGNATURE_HEADER_NAME, request.headers);
  }

  public static detectOperation = (req: IAbstractRequest) => {

    if (this.isCommerceToolsRequest(req)) {
      if (this.isRedirectAndLightboxInitOperation(req)) {
        return Operation.RedirectAndLightboxInit;
      }
      if (this.isStatusCheck(req)) {
        return Operation.StatusCheck;
      }
      if (this.isRefundOperation(req)) {
        return Operation.Refund;
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

  private static isStatusCheck(req: ICommerceToolsExtensionRequest): boolean {
    const reqBody = req.body;
    const payment = reqBody.resource.obj;

    return reqBody.action === 'Update'
      && payment?.custom?.fields.action == ActionRequestedOnPayment.syncPaymentInformation;
  }

  private static isRefundOperation(req: ICommerceToolsExtensionRequest): boolean {
    const reqBody = req.body;
    const payment = reqBody.resource.obj as unknown as Payment;

    const refundTransaction = payment.transactions.find((t) => {
      return t.state === 'Initial' && !t.interactionId;
    });

    return reqBody.action === 'Update'
      && !!refundTransaction;
  }
}
