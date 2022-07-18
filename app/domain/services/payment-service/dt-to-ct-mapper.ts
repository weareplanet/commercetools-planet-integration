import {
  type TransactionState
} from '@commercetools/platform-sdk';

import {
  DatatransTransactionStatus,
  DatatransHistoryAction,
  IDatatransWebhookRequestBody,
  IDatatransTransactionHistory
} from '../../../interfaces';

export class DatatransToCommerceToolsMapper {
  public static inferCtTransactionState(dtTransactionStatus: DatatransTransactionStatus): TransactionState {
    switch (dtTransactionStatus) {
      case DatatransTransactionStatus.initialized:
        return 'Initial';
      case DatatransTransactionStatus.challenge_required:
      case DatatransTransactionStatus.challenge_ongoing:
      case DatatransTransactionStatus.authenticated:
        return 'Pending';
      case DatatransTransactionStatus.settled:
      case DatatransTransactionStatus.authorized:
      // case 'submitted':  // absent on https://api-reference.datatrans.ch/#operation/status - maybe 'transmitted' ?
        return 'Success';
      case DatatransTransactionStatus.canceled:
      case DatatransTransactionStatus.failed:
        return 'Failure';
      default:
        throw new Error('Unexpected/unhandled Datatrans transaction status');
    }
  }

  // Despite the visible simplicity of this code it requires a lot of fields of IDatatransWebhookRequestBody -
  // so it was easier to pass the entire request body.
  // Strongly saying, IRequestBody exported from app/domain/environment-agnostic-handlers/per-operation-handlers/webhook-notification/request-schema.ts
  // should be used, but we try to keep this class anaware of any handlers...
  public static inferCtPaymentInfo(reqBody: IDatatransWebhookRequestBody): string {
    const infoObj = reqBody.card || reqBody[reqBody.paymentMethod];
    return infoObj ? JSON.stringify(infoObj) : '';
  }

  public static inferCtTransactionTimestamp(history: IDatatransTransactionHistory): string {
    return history
      .find((t) => t.action === DatatransHistoryAction.authorize)
      ?.date;
  }
}
