import {
  type TransactionState
} from '@commercetools/platform-sdk';

import {
  DatatransTransactionStatus,
  DatatransHistoryAction,
  IDatatransTransactionHistory,
  IDatatransPaymentMethodInfo,
  DatatransPaymentMethodDetails
} from '../../../interfaces';

export interface PaymentMethodInfoForCommerceTools {
  paymentDetailsSerialized: string,
  ctCustomPaymentMethod: IDatatransPaymentMethodInfo
}

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
        throw new Error(`Unexpected/unhandled Datatrans transaction status: ${dtTransactionStatus}`);
    }
  }

  public static inferCtTransactionTimestamp(history: IDatatransTransactionHistory): string {
    return history
      .find((t) => t.action === DatatransHistoryAction.authorize)
      ?.date;
  }

  public static inferCtPaymentMethodInfo(dtPaymentMethodInfo: IDatatransPaymentMethodInfo): PaymentMethodInfoForCommerceTools {
    const paymentMethodDetails = this.getPaymentMethodDetails(dtPaymentMethodInfo);
    return {
      paymentDetailsSerialized: paymentMethodDetails ? JSON.stringify(paymentMethodDetails.details) : '',
      ctCustomPaymentMethod: {
        paymentMethod: dtPaymentMethodInfo.paymentMethod,
        [paymentMethodDetails.name]: paymentMethodDetails.details
      }
    };
  }

  public static getPaymentMethodDetails(dtPaymentMethodInfo: IDatatransPaymentMethodInfo): {
    name: string;
    details: DatatransPaymentMethodDetails
   } {
    if (dtPaymentMethodInfo.card) {
      return {
        name: 'card',
        details: dtPaymentMethodInfo.card
      };
    }

    return {
      name: dtPaymentMethodInfo.paymentMethod,
      details: dtPaymentMethodInfo[dtPaymentMethodInfo.paymentMethod]
    };
  }
}
