import { DatatransPaymentMethod, ICreatePaymentRequestBodySchemaType, IDatatransInitializeTransaction } from '../../app/interfaces';

export const RedirectAndLightboxPaymentInitRequestBodyFactory = () =>  ({
  action: 'Create',
  resource: {
    id: '123',
    typeId: 'typeId',
    obj: {
      key: '12345318909876543216',
      amountPlanned: {
        type: 'centPrecision',
        currencyCode: 'EUR',
        centAmount: 1555,
        fractionDigits: 2
      },
      paymentMethodInfo: {
        paymentInterface: 'pp-datatrans-redirect-integration',
        method: 'VIS, PAP'
      },
      custom: {
        type: {
          typeId: 'type',
          id: '89637766-02f9-4391-9c7a-9077d9662daf'
        },
        fields: {
          key: 'refno',
          cancelUrl: 'https://google.com',
          merchantId: 'Test_merchant_id',
          successUrl: 'https://google.com',
          errorUrl: 'https://google.com'
        }
      },
      paymentStatus: {},
      transactions: [],
      interfaceInteractions: []
    }
  }
} as unknown as ICreatePaymentRequestBodySchemaType);

export const RedirectAndLightboxPaymentInitResponseBodyFactory = () => ({
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

export const CreateInitializeTransactionMockResponseFactory = () => ({
  headers: {
    location: 'https://example.com'
  },
  data: {
    transactionId: 'transactionId123'
  }
});
