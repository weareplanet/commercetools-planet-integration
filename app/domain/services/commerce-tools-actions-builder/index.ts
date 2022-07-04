import {
  CommerceToolsTypesKey,
  InterfaceInteraction,
  InterfaceInteractionType,
  PaymentUpdateActions,
  PaymentUpdateActionsType,
} from '@app/interfaces';

export class CommerceToolsActionsBuilder {
  private actions: PaymentUpdateActions[] = [];

  setCustomField(field: string, value: unknown) {
    this.actions.push({
      action: PaymentUpdateActionsType.SetCustomField,
      name: field,
      value: value
    });

    return this;
  }

  setStatus(payload: { interfaceCode: string }) {
    if (payload.interfaceCode) {
      this.actions.push({
        action: PaymentUpdateActionsType.SetStatusInterfaceCode,
        interfaceCode: payload.interfaceCode
      });
    }

    return this;
  }

  addInterfaceInteraction(interactionType: InterfaceInteractionType, message: InterfaceInteraction) {
    this.actions.push({
      action: PaymentUpdateActionsType.AddInterfaceInteraction,
      type: {
        key: CommerceToolsTypesKey.PlanetPaymentInterfaceInteractionType,
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
