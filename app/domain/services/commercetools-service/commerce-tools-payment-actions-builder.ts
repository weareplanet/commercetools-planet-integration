import {
  IAnyObjectWithStringKeys,
  CommerceToolsCustomTypeKey,
  CommerceToolsCustomInteractionType,
} from '../../../interfaces';

import {
  PaymentUpdateAction,
  TypeResourceIdentifier,
  TransactionDraft,
  TransactionState
} from '@commercetools/platform-sdk';

export class CommerceToolsPaymentActionsBuilder {
  private actions: PaymentUpdateAction[] = [];

  makeCustomTypeReference(typeKey: CommerceToolsCustomTypeKey): TypeResourceIdentifier {
    return {
      typeId: 'type',
      key: typeKey,
    };
  }

  setCustomField(field: string, value: unknown) {
    this.actions.push({
      action: 'setCustomField',
      name: field,
      value: value
    });

    return this;
  }

  setStatus(payload: { interfaceCode: string }) {
    if (payload.interfaceCode) {
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

  changeTransactionState(transactionId: string, state: TransactionState) {
    this.actions.push({
      action: 'changeTransactionState',
      transactionId,
      state
    });
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
