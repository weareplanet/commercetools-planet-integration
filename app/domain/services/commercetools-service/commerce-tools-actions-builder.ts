import {
  CommerceToolsCustomTypeKey,
  ICommerceToolsCustomInterfaceInteractionInfo,
  CommerceToolsCustomInteractionType,
} from '../../../interfaces';

import { PaymentUpdateAction } from '@commercetools/platform-sdk';

export class CommerceToolsActionsBuilder {
  private actions: PaymentUpdateAction[] = [];

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

  addInterfaceInteraction(interactionType: CommerceToolsCustomInteractionType, message: ICommerceToolsCustomInterfaceInteractionInfo) {
    this.actions.push({
      action: 'addInterfaceInteraction',
      type: {
        typeId: 'type',
        key: CommerceToolsCustomTypeKey.PlanetPaymentCustomInteractionType,
      },
      fields: {
        message: JSON.stringify(message),
        timeStamp: new Date().toISOString(),
        interactionType
      }
    });

    return this;
  }

  getActions() {
    return this.actions;
  }
}
