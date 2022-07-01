import {
  type TransactionState
} from '@commercetools/platform-sdk';

import { DatatransTransactionStatus } from '../../../interfaces';

export class DatatransToCommercetoolsMapper {
  static inferCtTransactionState(dtTransactionStatus: DatatransTransactionStatus): TransactionState {
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
}
