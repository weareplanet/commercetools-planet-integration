export interface IPayment {
  paymentMethodInfo: {
    paymentInterface?: string;
  };
  custom?: {
    fields: {
      transactionId?: string;
      savedPaymentMethodAlias?: string;
    }
  };
  paymentStatus: {
    interfaceCode?: string;
  };
}

export enum ExtensionAction {
  Create = 'Create',
  Update = 'Update'
}

export enum InterfaceInteractionType {
  InitRequest = 'initRequest',
  InitResponse = 'initResponse'
}

export interface InterfaceInteraction {
  body: unknown;
  headers?: Record<string, string>;
  [key: string]: unknown;
}

// !IMPORTANT!: values must have the same name as "key" field in files '/deploy/commercetools/types'
export enum CommerceToolsCustomTypesKey {
  PlanetPaymentRedirectPaymentType = 'pp-datatrans-redirect-payment-type',
  PlanetPaymentSecuredFieldPaymentType = 'pp-datatrans-securefields-payment-type',
  PlanetPaymentInterfaceInteractionType = 'pp-datatrans-interface-interaction-type',
  PlanetPaymentUsedMethodType = 'pp-datatrans-usedmethod-type'
}

export interface ICommerceToolsExtensionRequestBoby {
  action: ExtensionAction,
  resource: {
    obj: IPayment;
  }
}

export enum ICommerceToolsErrorCode {
  InvalidInput = 'InvalidInput'
}

export interface ICommerceToolsError {
  code: ICommerceToolsErrorCode;
  message: string;
  localizedMessage?: string;
  extensionExtraInfo?: Record<string, unknown>;
}
