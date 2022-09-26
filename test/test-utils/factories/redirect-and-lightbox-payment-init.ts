import { RecursivePartial } from '..';
import {
  ICommerceToolsPayment,
  DatatransPaymentMethod,
  IDatatransInitializeTransaction,
  ICommerceToolsExtensionRequestBody
} from '../../../app/interfaces';
import { PaymentFactory } from '..';

export const RedirectAndLightboxPaymentInitRequestBodyFactory = (payment?: RecursivePartial<ICommerceToolsPayment>) =>  {
  return {
    action: 'Create',
    resource: {
      id: '123',
      typeId: 'typeId',
      obj: payment || PaymentFactory()
    }
  } as unknown as ICommerceToolsExtensionRequestBody;
};

export const RedirectAndLightboxPaymentInitResponseFactory = () => ({
  statusCode: 200,
  body: {
    actions: [
      {
        action: 'setCustomField',
        name: 'transactionId',
        value: 'transactionId123',
      },
      {
        action: 'setCustomField',
        name: 'redirectUrl',
        value: 'https://example.com',
      },
      {
        action: 'addInterfaceInteraction',
        fields: {
          interactionType: 'initRequest',
          message: '{"body":{"webhook":{"url":"https://webhookUrl.fake"},"refno":"12345318909876543216","currency":"EUR","amount":1555,"paymentMethods":["VIS","PAP"],"redirect":{"successUrl":"https://google.com","cancelUrl":"https://google.com","errorUrl":"https://google.com"}}}',
        },
        type: {
          key: 'pp-datatrans-interface-interaction-type',
        },
      },
      {
        action: 'addInterfaceInteraction',
        fields: {
          interactionType: 'initResponse',
          message: '{"body":{"transactionId":"transactionId123"},"headers":{"location":"https://example.com"}}',
        },
        type: {
          key: 'pp-datatrans-interface-interaction-type',
        },
      },
      {
        action: 'setStatusInterfaceCode',
        interfaceCode: 'Initial',
      }
    ]
  }
});

export const CreateInitializeTransactionRequestFactory = (): IDatatransInitializeTransaction => ({
  refno: '12345318909876543216',
  currency: 'EUR',
  amount:1555,
  paymentMethods:['VIS','PAP'] as DatatransPaymentMethod[],
  redirect: {
    successUrl: 'https://google.com',
    cancelUrl: 'https://google.com',
    errorUrl: 'https://google.com'
  },
  webhook: {
    url: 'https://webhookUrl.fake'
  }
});

export const CreateInitializeTransactionResponseFactory = () => ({
  headers: {
    location: 'https://example.com'
  },
  data: {
    transactionId: 'transactionId123'
  }
});
