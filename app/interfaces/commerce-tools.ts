import { AnyObject } from 'yup/lib/object';
import { ReferenceTypeId as CommerceToolsReferenceTypeId } from '@commercetools/platform-sdk';

export type ReferenceTypeId = CommerceToolsReferenceTypeId;

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

export enum ExtentionAction {
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

export enum PaymentUpdateActionsType {
  SetCustomField = 'setCustomField',
  SetStatusInterfaceCode = 'setStatusInterfaceCode',
  AddInterfaceInteraction = 'addInterfaceInteraction'
}

export interface ISetCustomFiledAction {
  action: PaymentUpdateActionsType.SetCustomField;
  name: string;
  value: unknown; // it must be the same type as you customField in commerceTools
}

export interface ISetStatusInterfaceCodeAction {
  action: PaymentUpdateActionsType.SetStatusInterfaceCode,
  interfaceCode: string;
}

// !IMPORTANT!: values must have the same name as "key" field in files '/deploy/commercetools/types'
export enum CommerceToolsTypesKey {
  PlanetPaymentRedirectPaymentType = 'pp-datatrans-redirect-payment-type',
  PlanetPaymentSecuredFieldPaymentType = 'pp-datatrans-securefields-payment-type',
  PlanetPaymentInterfaceInteractionType = 'pp-datatrans-interface-interaction-type',
  PlanetPaymentUsedMethodType = 'pp-datatrans-usedmethod-type'
}

export interface IAddInterfaceInteractionAction {
  action: PaymentUpdateActionsType.AddInterfaceInteraction,
  type: {
    key: CommerceToolsTypesKey;
  },
  fields: {
    message: string;
    timeStamp: string,
    interactionType: InterfaceInteractionType;
  }
}

export type PaymentUpdateActions = ISetCustomFiledAction | ISetStatusInterfaceCodeAction | IAddInterfaceInteractionAction;

export interface IExtensionRequestBody {
  action: ExtentionAction,
  resource: {
    obj: IPayment;
  }
}

export interface IIninitRequest extends AnyObject {
  option?: Record<string, unknown>;
  autoSettle?: boolean;
  authneticationOnly?: boolean;
  returnMobileToken?: boolean;
  webhook?: Record<string, unknown>;
  mcp?: Record<string, unknown>;
}

export interface ICommerceToolsError {
  code: string;
  message: string;
  localizedMessage?: string;
  extensionExtraInfo?: Record<string, unknown>;
}
