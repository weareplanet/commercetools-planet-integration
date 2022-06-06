import {
  type CustomFieldsDraft,
  type TypeResourceIdentifier
} from '@commercetools/platform-sdk';

export enum CommerceToolsCustomInteractionType {
  initRequest = 'initRequest',
  initResponse = 'initResponse',
  authorizeSplitRequest = 'authorizeSplitRequest',
  authorizeSplitResponse = 'authorizeSplitResponse',
  statusResponse = 'statusResponse',
  webhook = 'webhook',
  refundRequest = 'refundRequest',
  refundResponse = 'refundResponse',
  settleRequest = 'settleRequest',
  settleResponse = 'settleResponse',
  cancelRequest = 'cancelRequest',
  cancelResponse = 'cancelResponse'
}

export interface ICommerceToolsCustomInterfaceInteraction extends CustomFieldsDraft {
  type: TypeResourceIdentifier;
  interactionType: CommerceToolsCustomInteractionType;
  timeStamp: string; // JSON string representation of UTC date & time in ISO 8601 format (YYYY-MM-DDThh:mm:ss.sssZ)
  message: string; // serialized ICustomInterfaceInteractionInfo
}
