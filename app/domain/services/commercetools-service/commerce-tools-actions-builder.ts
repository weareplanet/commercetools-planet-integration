import {
  CommerceToolsCustomTypeKey,
  ICommerceToolsCustomInterfaceInteractionInfo,
  CommerceToolsCustomInteractionType,
} from '../../../interfaces';

import {
  PaymentUpdateAction,
  TypeResourceIdentifier,
  TransactionDraft
} from '@commercetools/platform-sdk';

export class CommerceToolsActionsBuilder {
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

  addInterfaceInteraction(interactionType: CommerceToolsCustomInteractionType, messageOrObject: string | ICommerceToolsCustomInterfaceInteractionInfo) {
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
