import { type Payment } from '@commercetools/platform-sdk';

import {
  setEnvLogLevel,
  repairEnvLogLevel,
  loadLogServiceForTesting,
  commerceToolsClientFactory,
  RedirectAndLightboxPaymentInitRequestBodyFactory,
  CreateInitializeTransactionResponseFactory,
  CreateInitializeTransactionRequestFactory,
  PaymentFactory
} from '../../../../test/test-utils';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let dtClientMock: any;
jest.mock('axios', () => {
  dtClientMock = {
    post: jest.fn()
  };
  return {
    create: () => dtClientMock
  };
});

const customObjectSpy = jest.fn();
jest.mock('../commercetools-service/commerce-tools-client', () => {
  return {
    ctApiRoot: commerceToolsClientFactory({ customObject: customObjectSpy })
  };
});

import { PaymentService } from '.';

const aliasExistingInCommerceTools = 'savedPaymentMethodAlias value';

const expectedResultRedirectAndLightboxWithoutPaymentMethod = [
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

const expectedResultRedirectAndLightboxWithPaymentMethod = [
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
      message: `{"body":{"refno":"12345318909876543216","currency":"EUR","amount":1555,"paymentMethods":["VIS","PAP"],"redirect":{"successUrl":"https://google.com","cancelUrl":"https://google.com","errorUrl":"https://google.com"},"webhook":{"url":"https://webhookUrl.fake"},"card":{"alias":"${aliasExistingInCommerceTools}","expiryMonth":"06","expiryYear":"25"}}}`,
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
  let paymentService: PaymentService;

  beforeAll(async () => {
    customObjectSpy.mockReturnValue({
      body: {
        value: [{
          paymentMethod: 'VIS',
          card: {
            alias: aliasExistingInCommerceTools,
            expiryMonth: '06',
            expiryYear: '25'
          }
        }]
      }
    });
  });

  beforeAll(() => {
    setEnvLogLevel('debug');
    jest.resetModules(); // need to reload LogService to use the new log level
  });

  afterAll(() => {
    repairEnvLogLevel();
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let logStream: any;
  beforeEach(async () => {
    const loggerAndStream = loadLogServiceForTesting();
    paymentService = new PaymentService({ logger: loggerAndStream.logger });
    logStream = loggerAndStream.logStream;
  });

  describe('actions creations for Redirect And Lightbox Init operation', () => {
    it('should return actions', async () => {
      dtClientMock.post.mockResolvedValue(CreateInitializeTransactionResponseFactory());
      const mockPayment = PaymentFactory({
        custom: {
          fields: {
            initRequest: {
              BON: {
                alias: 'BON test card alias'
              }
            }
          }
        }
      } as unknown as Payment);

      const result = await paymentService.initRedirectAndLightbox(mockPayment);

      expect(dtClientMock.post).toBeCalledWith(
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
      expect(result).toMatchObject(expectedResultRedirectAndLightboxWithoutPaymentMethod);
    });
  });

  describe('actions creations for Redirect And Lightbox Init operation with saved payment method', () => {
    it('should return actions', async () => {
      dtClientMock.post.mockResolvedValue(CreateInitializeTransactionResponseFactory());
      const mockPayment = RedirectAndLightboxPaymentInitRequestBodyFactory().resource.obj;
      const initializeTransactionPayload = {
        ...CreateInitializeTransactionRequestFactory(),
        card: {
          alias: aliasExistingInCommerceTools,
          expiryMonth: '06',
          expiryYear: '25'
        }
      };
      mockPayment.custom.fields.savedPaymentMethodAlias = aliasExistingInCommerceTools;
      mockPayment.custom.fields.savedPaymentMethodsKey = 'savedPaymentMethodsKey';

      const result = await paymentService.initRedirectAndLightbox(mockPayment);

      expect(dtClientMock.post).toBeCalledWith(
        'https://apiUrl.test.fake/transactions',
        initializeTransactionPayload,
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
      expect(result).toMatchObject(expectedResultRedirectAndLightboxWithPaymentMethod);
    });
  });

  describe('the redaction of logs for Redirect And Lightbox Init operation', () => {
    it('should redact logs', async () => {
      dtClientMock.post.mockResolvedValue(CreateInitializeTransactionResponseFactory());
      const mockPayment = PaymentFactory({
        custom: {
          fields: {
            initRequest: {
              BON: {
                alias: 'BON test card alias'
              }
            }
          }
        }
      } as unknown as Payment);

      await paymentService.initRedirectAndLightbox(mockPayment);

      expect(logStream.write).toHaveBeenCalledWith(
        expect.stringContaining('"payload":{"body":{"BON":{"alias":"[REDACTED]"},"refno":"12345318909876543216","currency":"EUR","amount":1555,"paymentMethods":["VIS","PAP"],"redirect":{"successUrl":"https://google.com","cancelUrl":"https://google.com","errorUrl":"https://google.com"},"webhook":{"url":"https://webhookUrl.fake"}}},"message":"DataTrans initRequest"}')
      );
    });
  });

  describe('payment method validation in Redirect And Lightbox Init operation', () => {
    it('should pass validation, if a card with the specified alias exists in CommerceTools', async () => {
      customObjectSpy.mockReturnValue({
        body: {
          value: [{
            paymentMethod: 'VIS',
            card: {
              alias: aliasExistingInCommerceTools,
              expiryMonth: '06',
              expiryYear: '25'
            }
          }]
        }
      });

      const mockPayment = RedirectAndLightboxPaymentInitRequestBodyFactory().resource.obj;
      mockPayment.custom.fields.savedPaymentMethodAlias = aliasExistingInCommerceTools;
      mockPayment.custom.fields.savedPaymentMethodsKey = 'savedPaymentMethodsKey';

      const result = await paymentService.initRedirectAndLightbox(mockPayment);

      expect(result).toBeInstanceOf(Array);
    });

    it('should throw an error, if the card with the specified alias was not found in CommerceTools', async () => {
      const mockPayment = RedirectAndLightboxPaymentInitRequestBodyFactory().resource.obj;
      mockPayment.custom.fields.savedPaymentMethodAlias = 'alias';
      mockPayment.custom.fields.savedPaymentMethodsKey = 'savedPaymentMethodsKey';

      await expect(paymentService.initRedirectAndLightbox(mockPayment))
        .rejects
        .toThrow(/^savedPaymentMethodsKey or savedPaymentMethodAlias not found$/);
    });

    it('should throw an error, if there is no savedPaymentMethodsKey Custom Object with the specified key in CommerceTools', async () => {
      customObjectSpy.mockRejectedValue(commerceToolsErrorWhenCustomObjectKeyIsNotExist);
      const mockPayment = RedirectAndLightboxPaymentInitRequestBodyFactory().resource.obj;
      mockPayment.custom.fields.savedPaymentMethodAlias = 'alias';
      mockPayment.custom.fields.savedPaymentMethodsKey = 'not-existing-savedPaymentMethodsKey';

      await expect(paymentService.initRedirectAndLightbox(mockPayment))
        .rejects
        .toThrow(/^savedPaymentMethodsKey or savedPaymentMethodAlias not found$/);
    });
  });
});
