import {
  IAnyObjectWithStringKeys,
  CommerceToolsCustomTypeKey,
  CommerceToolsCustomInteractionType,
} from '../../../interfaces';

import {
  PaymentUpdateAction,
  TypeResourceIdentifier,
  TransactionDraft,
  TransactionState,
  Payment,
  Transaction
} from '@commercetools/platform-sdk';

export class CommerceToolsPaymentActionsBuilder {

  private payment?: Payment;
  private actions: PaymentUpdateAction[] = [];

  withPayment(payment: Payment) {
    this.payment = payment;
    return this;
  }

  makeCustomTypeReference(typeKey: CommerceToolsCustomTypeKey): TypeResourceIdentifier {
    return {
      typeId: 'type',
      key: typeKey,
    };
  }

  setCustomField(field: string, value: unknown) {
    if (!this.payment || this.payment.custom.fields[field] !== value) {
      this.actions.push({
        action: 'setCustomField',
        name: field,
        value: value
      });
    }
    return this;
  }

  setStatus(payload: { interfaceCode: string }) {
    if (
      payload.interfaceCode &&
      (!this.payment || this.payment.paymentStatus.interfaceCode !== payload.interfaceCode)
    ) {
      this.actions.push({
        action: 'setStatusInterfaceCode',
        interfaceCode: payload.interfaceCode
      });
    }

    return this;
  }

  addTransaction(transactionDraft: TransactionDraft) {
    this.actions.push({
      action: 'addTransaction',
      transaction: transactionDraft
    });

    return this;
  }

  changeTransactionState(transaction: Transaction, state: TransactionState) {
    if (transaction.state !== state) {
      this.actions.push({
        action: 'changeTransactionState',
        transactionId: transaction.id,
        state
      });
    }

    return this;
  }

  changeTransactionInteractionId(transaction: Transaction, interactionId: string) {
    if (transaction.interactionId !== interactionId) {
      this.actions.push({
        action: 'changeTransactionInteractionId',
        transactionId: transaction.id,
        interactionId
      });
    }

    return this;
  }

  addInterfaceInteraction(interactionType: CommerceToolsCustomInteractionType, messageOrObject: string | IAnyObjectWithStringKeys) {
    const message = (typeof messageOrObject === 'string') ? messageOrObject : JSON.stringify(messageOrObject);

    this.actions.push({
      action: 'addInterfaceInteraction',
      type: this.makeCustomTypeReference(CommerceToolsCustomTypeKey.PlanetPaymentInterfaceInteractionType),
      fields: {
        message,
        timeStamp: (new Date()).toISOString(),
        interactionType
      }
    });

    return this;
  }

  getActions() {
    return this.actions;
  }
}
