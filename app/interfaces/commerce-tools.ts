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

// !IMPORTANT!: values must have the same name as "key" field in files '/deploy/commercetools/types'
export enum CommerceToolsCustomTypesKey {
  PlanetPaymentRedirectPaymentType = 'pp-datatrans-redirect-payment-type',
  PlanetPaymentSecuredFieldPaymentType = 'pp-datatrans-securefields-payment-type',
  PlanetPaymentInterfaceInteractionType = 'pp-datatrans-interface-interaction-type',
  PlanetPaymentUsedMethodType = 'pp-datatrans-usedmethod-type'
}

export interface ICommerceToolsExtensionRequestBoby {
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

export enum ICommerceToolsErrorCode {
  InvalidInput = 'InvalidInput'
}

export interface ICommerceToolsError {
  code: ICommerceToolsErrorCode;
  message: string;
  localizedMessage?: string;
  extensionExtraInfo?: Record<string, unknown>;
}
