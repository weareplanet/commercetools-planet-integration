import { Logger } from 'pino';

import { commerceToolsClientFactory } from '../../../../test/shared-test-entities/commercetools-client';

const customObjectSpy = jest.fn();

jest.mock('../commercetools-service/commerce-tools-client', () => {
  return {
    ctApiRoot: commerceToolsClientFactory({ customObject: customObjectSpy })
  };
});

import {
  RedirectAndLightboxPaymentInitRequestBodyFactory,
  CreateInitializeTransactionResponseFactory,
  CreateInitializeTransactionRequestFactory
} from '../../../../test/shared-test-entities/redirect-and-lightbox-payment-init';

const expectedResult = [
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
      message: '{"body":{"BON":{"alias":"BON test card alias"},"refno":"12345318909876543216","currency":"EUR","amount":1555,"paymentMethods":["VIS","PAP"],"redirect":{"successUrl":"https://google.com","cancelUrl":"https://google.com","errorUrl":"https://google.com"},"webhook":{"url":"https://webhookUrl.fake"}}}',
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
];

const commerceToolsErrorWhenCustomObjectKeyIsNotExist = {
  'code': 404,
  'statusCode': 404,
  'status': 404,
  'message': 'URI not found: /planetpayment-discovery/custom-objects/savedPaymentMethods/merchantPaymentMethodKey123',
  'originalRequest': {
    'baseUri': 'https://api.europe-west1.gcp.commercetools.com',
    'method': 'GET',
    'uriTemplate': '/{projectKey}/custom-objects/{container}/{key}',
    'pathVariables': {
      'projectKey': 'planetpayment-discovery',
      'container': 'savedPaymentMethods',
      'key': 'merchantPaymentMethodKey123'
    },
    'headers': {
      'Authorization': 'Bearer ********'
    },
    'uri': '/planetpayment-discovery/custom-objects/savedPaymentMethods/merchantPaymentMethodKey123'
  },
  'retryCount': 0,
  'headers': {
    'server': [
      'istio-envoy'
    ],
    'date': [
      'Tue, 19 Jul 2022 11:50:09 GMT'
    ],
    'content-type': [
      'application/json; charset=utf-8'
    ],
    'x-http-status-caused-by-external-upstream': [
      'false'
    ],
    'access-control-allow-origin': [
      '*'
    ],
    'access-control-allow-headers': [
      'Accept, Authorization, Content-Type, Origin, User-Agent, X-Correlation-ID'
    ],
    'access-control-allow-methods': [
      'GET, POST, DELETE, OPTIONS'
    ],
    'access-control-expose-headers': [
      'X-Correlation-ID'
    ],
    'access-control-max-age': [
      '299'
    ],
    'x-correlation-id': [
      'projects-077f0e5d-8f89-4c77-8f2f-5f3e95e6f054'
    ],
    'server-timing': [
      'projects;dur=3'
    ],
    'content-encoding': [
      'gzip'
    ],
    'x-envoy-upstream-service-time': [
      '4'
    ],
    'via': [
      '1.1 google'
    ],
    'alt-svc': [
      'h3=\':443\'; ma=2592000,h3-29=\':443\'; ma=2592000'
    ],
    'connection': [
      'close'
    ],
    'transfer-encoding': [
      'chunked'
    ]
  },
  'body': {
    'statusCode': 404,
    'message': 'The CustomObject with ID \'(savedPaymentMethods,merchantPaymentMethodKey123)\' was not found.',
    'errors': [
      {
        'code': 'InvalidSubject',
        'message': 'The CustomObject with ID \'(savedPaymentMethods,merchantPaymentMethodKey123)\' was not found.'
      }
    ]
  },
  'name': 'NotFound'
};

describe('#initRedirectAndLightbox method', () => {
  let logger: Logger;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let loggingStream: any;
  const originalLogLevel = process.env.LOG_LEVEL;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let paymentService: any;
  const clientMock = {
    post: jest.fn()
  };
  const axiosMockFactory = () => ({
    create: () => clientMock
  });

  beforeAll(async () => {
    process.env.LOG_LEVEL = 'debug';
    jest.mock('axios', axiosMockFactory);
    customObjectSpy.mockReturnValue({
      body: {
        value: [{
          paymentMethod: 'VIS',
          card: {
            alias: 'savedPaymentMethodAlias value'
          }
        }]
      }
    });
  });

  beforeEach(async () => {
    jest.resetModules();

    logger = (await import('../log-service')).default;
    /* eslint-disable @typescript-eslint/no-var-requires */
    const { streamSym } = require('pino/lib/symbols');
    /* eslint-disable @typescript-eslint/ban-ts-comment */
    /* @ts-ignore */
    loggingStream = logger[streamSym];
    jest.spyOn(loggingStream, 'write');

    const { PaymentService } = (await import('./service'));
    paymentService = new PaymentService();
  });

  afterAll(() => {
    if (originalLogLevel) {
      process.env.LOG_LEVEL = originalLogLevel;
    } else {
      delete process.env.LOG_LEVEL;
    }
    jest.unmock('axios');
  });

  describe('actions creations for Redirect And Lightbox Init operation', () => {
    it('should return actions', async () => {
      clientMock.post.mockResolvedValue(CreateInitializeTransactionResponseFactory());
      const mockPayment = RedirectAndLightboxPaymentInitRequestBodyFactory().resource.obj;
      mockPayment.custom.fields.initRequest = {
        BON: {
          alias: 'BON test card alias'
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any; // HACK: yup schema not allowed not declared fields

      const result = await paymentService.initRedirectAndLightbox(mockPayment);

      expect(clientMock.post).toBeCalledWith(
        'https://apiUrl.test.fake/transactions',
        {
          ...CreateInitializeTransactionRequestFactory(),
          BON: {
            alias: 'BON test card alias'
          }
        },
        {
          auth: {
            password: 'Test_merchant_password',
            username: 'Test_merchant_id'
          },
          headers: {
            'Content-Type': 'application/json; charset=UTF-8'
          }
        }
      );
      expect(result).toMatchObject(expectedResult);
    });
  });

  describe('the redaction of logs for Redirect And Lightbox Init operation', () => {
    it('should redact logs', async () => {
      clientMock.post.mockResolvedValue(CreateInitializeTransactionResponseFactory());
      const mockPayment = RedirectAndLightboxPaymentInitRequestBodyFactory().resource.obj;
      mockPayment.custom.fields.initRequest = {
        BON: {
          alias: 'BON test card alias'
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any; // HACK: yup schema not allowed not declared fields

      await paymentService.initRedirectAndLightbox(mockPayment);

      expect(loggingStream.write).toHaveBeenCalledWith(
        expect.stringContaining('"payload":{"body":{"BON":{"alias":"[REDACTED]"},"refno":"12345318909876543216","currency":"EUR","amount":1555,"paymentMethods":["VIS","PAP"],"redirect":{"successUrl":"https://google.com","cancelUrl":"https://google.com","errorUrl":"https://google.com"},"webhook":{"url":"https://webhookUrl.fake"}}},"message":"DataTrans initRequest"}')
      );
    });
  });

  describe('payment method validation in Redirect And Lightbox Init operation', () => {
    it('should pass validation because card exist with same alias in CommerceTools', async () => {
      expect.assertions(1);
      const mockPayment = RedirectAndLightboxPaymentInitRequestBodyFactory().resource.obj;
      // the same alias we have in mocked implementation of client in test/__mocks__/domain/services/commercetools-service/commerce-tools-client.ts
      mockPayment.custom.fields.savedPaymentMethodAlias = 'savedPaymentMethodAlias value';
      mockPayment.custom.fields.savedPaymentMethodsKey = 'savedPaymentMethodsKey';

      const result = await paymentService.initRedirectAndLightbox(mockPayment);

      expect(result).toBeInstanceOf(Array);
    });

    it('should throw an error because card didn\'t find', async () => {
      expect.assertions(1);
      const mockPayment = RedirectAndLightboxPaymentInitRequestBodyFactory().resource.obj;
      mockPayment.custom.fields.savedPaymentMethodAlias = 'alias';
      mockPayment.custom.fields.savedPaymentMethodsKey = 'savedPaymentMethodsKey';

      try {
        await paymentService.initRedirectAndLightbox(mockPayment);
      } catch (e) {
        expect(e.message).toEqual('savedPaymentMethodAlias not found');
      }
    });

    it('should throw an error because card didn\'t find Commerce Tools with merchant savedPaymentMethodsKey', async () => {
      expect.assertions(1);
      customObjectSpy.mockRejectedValue(commerceToolsErrorWhenCustomObjectKeyIsNotExist);
      const mockPayment = RedirectAndLightboxPaymentInitRequestBodyFactory().resource.obj;
      mockPayment.custom.fields.savedPaymentMethodAlias = 'alias';
      mockPayment.custom.fields.savedPaymentMethodsKey = 'incorrect savedPaymentMethodsKey';

      try {
        await paymentService.initRedirectAndLightbox(mockPayment);
      } catch (e) {
        expect(e).toMatchObject(commerceToolsErrorWhenCustomObjectKeyIsNotExist);
      }
    });
  });
});
