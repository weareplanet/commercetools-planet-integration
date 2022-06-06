import {
  setEnvLogLevel,
  repairEnvLogLevel,
  loadLogServiceForTesting,
  RedirectAndLightboxPaymentInitRequestBodyFactory,
  CreateInitializeTransactionRequestFactory,
  abstractRequestFactory
} from '../../../../test/test-utils';

describe('Redacted fields', () => {
  beforeAll(() => {
    setEnvLogLevel('info');
  });

  afterAll(() => {
    repairEnvLogLevel();
  });

  beforeEach(() => {
    jest.resetModules();
  });

  describe('should redact "savedPaymentMethodAlias" on different levels of depth', () => {
    it('"body.resource.obj.custom.fields.savedPaymentMethodAlias"', () => {
      const redirectAndLightboxPaymentInitRequestBody = RedirectAndLightboxPaymentInitRequestBodyFactory();
      redirectAndLightboxPaymentInitRequestBody.resource.obj.custom.fields.savedPaymentMethodAlias = 'savedPaymentMethodAlias';
      const commerceToolsExtensionRequestWithBodyOnly = {
        body: redirectAndLightboxPaymentInitRequestBody,
      };

      const { logger, logStream } = loadLogServiceForTesting();

      logger.info(commerceToolsExtensionRequestWithBodyOnly);

      expect(logStream.write).toBeCalledWith(
        expect.stringMatching(/"payload":{"body":{.*,"custom":{.*,"fields":{.*"savedPaymentMethodAlias":"\[REDACTED\]".*/)
      );
    });

    it('"body.resource.obj.custom.fields.savedPaymentMethodAlias"', () => {
      const redirectAndLightboxPaymentInitRequestBody = RedirectAndLightboxPaymentInitRequestBodyFactory();
      redirectAndLightboxPaymentInitRequestBody.resource.obj.custom.fields.savedPaymentMethodAlias = 'savedPaymentMethodAlias';
      const commerceToolsExtensionRequestWithBodyOnly = {
        body: redirectAndLightboxPaymentInitRequestBody,
      };

      const { logger, logStream } = loadLogServiceForTesting();

      logger.info({ req: commerceToolsExtensionRequestWithBodyOnly });

      expect(logStream.write).toBeCalledWith(
        expect.stringMatching(/"payload":{"req".*{.*"body":{.*,"custom":{.*,"fields":{.*"savedPaymentMethodAlias":"\[REDACTED\]".*/)
      );
    });

    it('"resource.obj.custom.fields.savedPaymentMethodAlias"', () => {
      const redirectAndLightboxPaymentInitRequestBody = RedirectAndLightboxPaymentInitRequestBodyFactory();
      redirectAndLightboxPaymentInitRequestBody.resource.obj.custom.fields.savedPaymentMethodAlias = 'savedPaymentMethodAlias';
      const commerceToolsExtensionRequestWithBodyOnly = {
        body: redirectAndLightboxPaymentInitRequestBody,
      };

      const { logger, logStream } = loadLogServiceForTesting();

      logger.info(commerceToolsExtensionRequestWithBodyOnly.body);

      expect(logStream.write).toBeCalledWith(
        expect.stringMatching(/"payload":.*"custom":{.*,"fields":{.*"savedPaymentMethodAlias":"\[REDACTED\]".*/)
      );
    });

    it('"obj.custom.fields.savedPaymentMethodAlias"', () => {
      const redirectAndLightboxPaymentInitRequestBody = RedirectAndLightboxPaymentInitRequestBodyFactory();
      redirectAndLightboxPaymentInitRequestBody.resource.obj.custom.fields.savedPaymentMethodAlias = 'savedPaymentMethodAlias';
      const commerceToolsExtensionRequestWithBodyOnly = {
        body: redirectAndLightboxPaymentInitRequestBody,
      };

      const { logger, logStream } = loadLogServiceForTesting();

      logger.info(commerceToolsExtensionRequestWithBodyOnly.body.resource);

      expect(logStream.write).toBeCalledWith(
        expect.stringMatching(/"payload":{"id":"123".*"custom":{.*,"fields":{.*"savedPaymentMethodAlias":"\[REDACTED\]".*/)
      );
    });

    it('"custom.fields.savedPaymentMethodAlias"', () => {
      const redirectAndLightboxPaymentInitRequestBody = RedirectAndLightboxPaymentInitRequestBodyFactory();
      redirectAndLightboxPaymentInitRequestBody.resource.obj.custom.fields.savedPaymentMethodAlias = 'savedPaymentMethodAlias';
      const commerceToolsExtensionRequestWithBodyOnly = {
        body: redirectAndLightboxPaymentInitRequestBody,
      };

      const { logger, logStream } = loadLogServiceForTesting();

      logger.info(commerceToolsExtensionRequestWithBodyOnly.body.resource.obj);

      expect(logStream.write).toBeCalledWith(
        expect.stringMatching(/"payload":{"key":"12345318909876543216".*"custom":{.*,"fields":{.*"savedPaymentMethodAlias":"\[REDACTED\]".*/)
      );
    });

    it('"fields.savedPaymentMethodAlias"', () => {
      const redirectAndLightboxPaymentInitRequestBody = RedirectAndLightboxPaymentInitRequestBodyFactory();
      redirectAndLightboxPaymentInitRequestBody.resource.obj.custom.fields.savedPaymentMethodAlias = 'savedPaymentMethodAlias';
      const commerceToolsExtensionRequestWithBodyOnly = {
        body: redirectAndLightboxPaymentInitRequestBody,
      };

      const { logger, logStream } = loadLogServiceForTesting();

      logger.info(commerceToolsExtensionRequestWithBodyOnly.body.resource.obj.custom);

      expect(logStream.write).toBeCalledWith(
        expect.stringMatching(/"payload":{"type":.*"fields":{.*"savedPaymentMethodAlias":"\[REDACTED\]".*/)
      );
    });

    it('"savedPaymentMethodAlias" (at the top level)', () => {
      const redirectAndLightboxPaymentInitRequestBody = RedirectAndLightboxPaymentInitRequestBodyFactory();
      redirectAndLightboxPaymentInitRequestBody.resource.obj.custom.fields.savedPaymentMethodAlias = 'savedPaymentMethodAlias';
      const commerceToolsExtensionRequestWithBodyOnly = {
        body: redirectAndLightboxPaymentInitRequestBody,
      };

      const { logger, logStream } = loadLogServiceForTesting();

      logger.info(commerceToolsExtensionRequestWithBodyOnly.body.resource.obj.custom.fields);

      expect(logStream.write).toBeCalledWith(
        expect.stringMatching(/"payload":{"key":"refno".*"savedPaymentMethodAlias":"\[REDACTED\]".*/)
      );
    });

    it('"savedPaymentMethodAlias" in a validation error log message', () => {
      const msg = {
        payload: {
          error: {
            value: {
              resource: {
                obj: {
                  custom: {
                    fields: {
                      initRequest: {},
                      savedPaymentMethodAlias: '7LHXscqwAAEAAAGCbQ5u7XjzHbaRAO91',
                      cancelUrl: 'http://localhost:3000/cancel',
                      errorUrl: 'http://localhost:3000/error',
                      successUrl: 'http://localhost:3000/success',
                      merchantId: '1110002457'
                    }
                  }
                }
              }
            }
          }
        }
      };

      const { logger, logStream } = loadLogServiceForTesting();

      logger.info(msg);

      expect(logStream.write).toBeCalledWith(
        expect.stringMatching(/"payload":{.*"error":{.*"savedPaymentMethodAlias":"\[REDACTED\]".*/)
      );
    });

    it('"savedPaymentMethodAlias" (within a serialized JSON) in rawBody', () => {
      const redirectAndLightboxPaymentInitRequestBody = RedirectAndLightboxPaymentInitRequestBodyFactory();
      redirectAndLightboxPaymentInitRequestBody.resource.obj.custom.fields.savedPaymentMethodAlias = 'savedPaymentMethodAlias';
      const commerceToolsExtensionRequestWithBodyOnly = abstractRequestFactory({
        body: redirectAndLightboxPaymentInitRequestBody
      });

      const { logger, logStream } = loadLogServiceForTesting();

      logger.info(commerceToolsExtensionRequestWithBodyOnly);

      expect(logStream.write).toBeCalledWith(
        expect.stringMatching(/"payload":{.*"rawBody":"\[REDACTED\]".*/)
      );
    });

    it('"savedPaymentMethodAlias" (within a serialized JSON) in req.rawBody', () => {
      const redirectAndLightboxPaymentInitRequestBody = RedirectAndLightboxPaymentInitRequestBodyFactory();
      redirectAndLightboxPaymentInitRequestBody.resource.obj.custom.fields.savedPaymentMethodAlias = 'savedPaymentMethodAlias';
      const commerceToolsExtensionRequestWithBodyOnly = abstractRequestFactory({
        body: redirectAndLightboxPaymentInitRequestBody
      });

      const { logger, logStream } = loadLogServiceForTesting();

      logger.info({ req: commerceToolsExtensionRequestWithBodyOnly });

      expect(logStream.write).toBeCalledWith(
        expect.stringMatching(/"payload":{"req":{.*"rawBody":"\[REDACTED\]".*/)
      );
    });
  });

  describe('should redact "alias" on different levels of depth', () => {
    it('"body.card.alias" and "body.BON.alias"', () => {
      const createInitializeTransactionRequest = CreateInitializeTransactionRequestFactory();
      createInitializeTransactionRequest.card = { alias: 'card alias', expiryMonth: '06', expiryYear: '25' };
      createInitializeTransactionRequest.BON = { alias: 'BON alias' };

      const { logger, logStream } = loadLogServiceForTesting();

      logger.info({ body: createInitializeTransactionRequest });

      expect(logStream.write).toBeCalledWith(
        expect.stringMatching(/"payload":{"body":.*"card":{"alias":"\[REDACTED\]","expiryMonth":"06","expiryYear":"25"},"BON":{"alias":"\[REDACTED\]".*/)
      );
    });

    it('"card.alias" and "BON.alias"', () => {
      const createInitializeTransactionRequest = CreateInitializeTransactionRequestFactory();
      createInitializeTransactionRequest.card = { alias: 'card alias', expiryMonth: '06', expiryYear: '25' };
      createInitializeTransactionRequest.BON = { alias: 'BON alias' };

      const { logger, logStream } = loadLogServiceForTesting();

      logger.info(createInitializeTransactionRequest);

      expect(logStream.write).toBeCalledWith(
        expect.stringMatching(/"payload":{"refno":.*"card":{"alias":"\[REDACTED\]","expiryMonth":"06","expiryYear":"25"},"BON":{"alias":"\[REDACTED\]".*/)
      );
    });

    it('"alias" (at the top level)', () => {
      const createInitializeTransactionRequest = CreateInitializeTransactionRequestFactory();
      createInitializeTransactionRequest.card = { alias: 'card alias', expiryMonth: '06', expiryYear: '25' };
      createInitializeTransactionRequest.BON = { alias: 'BON alias' };

      const { logger, logStream } = loadLogServiceForTesting();

      logger.info(createInitializeTransactionRequest.card);

      expect(logStream.write).toBeCalledWith(
        expect.stringMatching(/"payload":{"alias":"\[REDACTED\]",/)
      );
    });

    it('"alias" fields (at the top level)', () => {
      const createInitializeTransactionRequest = CreateInitializeTransactionRequestFactory();
      createInitializeTransactionRequest.card = { alias: 'card alias', expiryMonth: '06', expiryYear: '25' };
      createInitializeTransactionRequest.BON = { alias: 'BON alias' };

      const { logger, logStream } = loadLogServiceForTesting();

      logger.info(createInitializeTransactionRequest.BON);

      expect(logStream.write).toBeCalledWith(
        expect.stringMatching(/"payload":{"alias":"\[REDACTED\]"}/)
      );
    });

    it('"alias" in a savedPaymentMethods Custom Object for "card"', () => {
      const customObject = {
        'id': 'd03aad3a-638d-46b9-bc7a-924794a1fcc1',
        'version': 2,
        'versionModifiedAt': '2022-08-05T08:10:48.842Z',
        'createdAt': '2022-08-05T07:55:07.293Z',
        'lastModifiedAt': '2022-08-05T08:10:48.842Z',
        'lastModifiedBy': {
          'clientId': 'E6VZz54cZHcaW7Xs_NWw1Txe',
          'isPlatformClient': false
        },
        'createdBy': {
          'clientId': 'E6VZz54cZHcaW7Xs_NWw1Txe',
          'isPlatformClient': false
        },
        'container': 'savedPaymentMethods',
        'key': 'ct-e2e-app-payment-methods',
        'value': [
          {
            'paymentMethod': 'VIS',
            'card': {
              'alias': '7LHXscqwAAEAAAGCbQArfeHJDUlkAHh_',
              'fingerprint': 'F-ejQK0Azts8br5mnOfyjurl',
              'masked': '424242xxxxxx4242',
              'expiryMonth': '06',
              'expiryYear': '25',
              'info': {
                'brand': 'VISA CREDIT',
                'type': 'credit',
                'usage': 'consumer',
                'country': 'GB',
                'issuer': 'DATATRANS'
              },
              '3D': {
                'authenticationResponse': 'D'
              }
            }
          }
        ]
      };

      const { logger, logStream } = loadLogServiceForTesting();

      logger.info(customObject);

      expect(logStream.write).toBeCalledWith(
        expect.stringMatching(/"value":\[.*"card":{"alias":"\[REDACTED\]".*/)
      );
    });

    it('"alias" in a savedPaymentMethods Custom Object for a method other than "card"', () => {
      const customObject = {
        'id': 'd03aad3a-638d-46b9-bc7a-924794a1fcc1',
        'version': 2,
        'versionModifiedAt': '2022-08-05T08:10:48.842Z',
        'createdAt': '2022-08-05T07:55:07.293Z',
        'lastModifiedAt': '2022-08-05T08:10:48.842Z',
        'lastModifiedBy': {
          'clientId': 'E6VZz54cZHcaW7Xs_NWw1Txe',
          'isPlatformClient': false
        },
        'createdBy': {
          'clientId': 'E6VZz54cZHcaW7Xs_NWw1Txe',
          'isPlatformClient': false
        },
        'container': 'savedPaymentMethods',
        'key': 'ct-e2e-app-payment-methods',
        'value': [
          {
            'paymentMethod': 'TWI',
            'TWI': {
              'alias': '7LHXscqwAAEAAAGCbQArfeHJDUlkAHh_',
              'fingerprint': 'F-ejQK0Azts8br5mnOfyjurl',
              'masked': '424242xxxxxx4242',
              'expiryMonth': '06',
              'expiryYear': '25',
              'info': {
                'brand': 'VISA CREDIT',
                'type': 'credit',
                'usage': 'consumer',
                'country': 'GB',
                'issuer': 'DATATRANS'
              },
              '3D': {
                'authenticationResponse': 'D'
              }
            }
          }
        ]
      };

      const { logger, logStream } = loadLogServiceForTesting();

      logger.info(customObject);

      expect(logStream.write).toBeCalledWith(
        expect.stringMatching(/"value":\[.*"TWI":{"alias":"\[REDACTED\]".*/)
      );
    });

    it('"alias" (within a serialized JSON) in actions ("addTransaction", "addInterfaceInteraction")', () => {
      const actions = [
        {
          'action': 'setStatusInterfaceCode',
          'interfaceCode': 'settled'
        },
        {
          'action': 'addInterfaceInteraction',
          'type': {
            'typeId': 'type',
            'key': 'pp-datatrans-interface-interaction-type'
          },
          'fields': {
            'message': '{\n  "transactionId" : "220805100911533880",\n  "type" : "payment",\n  "status" : "settled",\n  "currency" : "EUR",\n  "refno" : "71291799636443127129",\n  "paymentMethod" : "VIS",\n  "detail" : {\n    "authorize" : {\n      "amount" : 2050,\n      "acquirerAuthorizationCode" : "101045"\n    },\n    "settle" : {\n      "amount" : 2050\n    }\n  },\n  "language" : "en",\n  "card" : {\n    "alias" : "7LHXscqwAAEAAAGCbQ5u7XjzHbaRAO91",\n    "fingerprint" : "F-fJDJxxBYscYziftGqTVAPZ",\n    "masked" : "490000xxxxxx0003",\n    "expiryMonth" : "06",\n    "expiryYear" : "25",\n    "info" : {\n      "brand" : "VISA",\n      "type" : "credit",\n      "usage" : "consumer",\n      "country" : "US",\n      "issuer" : "DATATRANS"\n    },\n    "3D" : {\n      "authenticationResponse" : "Y"\n    }\n  },\n  "history" : [ {\n    "action" : "init",\n    "amount" : 2050,\n    "source" : "api",\n    "date" : "2022-08-05T08:09:11Z",\n    "success" : true,\n    "ip" : "3.250.131.215"\n  }, {\n    "action" : "authorize",\n    "autoSettle" : true,\n    "amount" : 2050,\n    "source" : "redirect",\n    "date" : "2022-08-05T08:10:45Z",\n    "success" : true,\n    "ip" : "62.16.31.237"\n  } ]\n}',
            'timeStamp': '2022-08-05T08:10:47.179Z',
            'interactionType': 'webhook'
          }
        },
        {
          'action': 'addTransaction',
          'transaction': {
            'type': 'Authorization',
            'timestamp': '2022-08-05T08:10:45Z',
            'amount': {
              'centAmount': 2050,
              'currencyCode': 'EUR'
            },
            'state': 'Success',
            'interactionId': '220805100911533880',
            'custom': {
              'type': {
                'typeId': 'type',
                'key': 'pp-datatrans-usedmethod-type'
              },
              'fields': {
                'paymentMethod': 'VIS',
                'info': '{"alias":"7LHXscqwAAEAAAGCbQ5u7XjzHbaRAO91","fingerprint":"F-fJDJxxBYscYziftGqTVAPZ","masked":"490000xxxxxx0003","expiryMonth":"06","expiryYear":"25","info":{"brand":"VISA","type":"credit","usage":"consumer","country":"US","issuer":"DATATRANS"},"3D":{"authenticationResponse":"Y"}}'
              }
            }
          }
        }
      ];

      const { logger, logStream } = loadLogServiceForTesting();

      logger.info({ actions });

      expect(logStream.write).toBeCalledWith(
        expect.stringMatching(/"payload":.*"actions":.*"fields":.*"message":"\[REDACTED\]".*fields":.*"info":"\[REDACTED\]".*/)
      );
    });

    it('"alias" (within a serialized JSON) in Payment.transactions, Payment.interfaceInteractions', () => {
      const paymentPart = {
        transactions: [
          {
            'id': '05ddd4eb-e091-4467-90d9-1ba785bb3b91',
            'timestamp': '2022-08-05T08:10:45.000Z',
            'type': 'Authorization',
            'amount': {
              'type': 'centPrecision',
              'currencyCode': 'EUR',
              'centAmount': 2050,
              'fractionDigits': 2
            },
            'interactionId': '220805100911533880',
            'state': 'Success',
            'custom': {
              'type': {
                'typeId': 'type',
                'id': '2e9cc996-02a7-4d93-9b70-6b066dcde069'
              },
              'fields': {
                'paymentMethod': 'VIS',
                'info': '{"alias":"7LHXscqwAAEAAAGCbQ5u7XjzHbaRAO91","fingerprint":"F-fJDJxxBYscYziftGqTVAPZ","masked":"490000xxxxxx0003","expiryMonth":"06","expiryYear":"25","info":{"brand":"VISA","type":"credit","usage":"consumer","country":"US","issuer":"DATATRANS"},"3D":{"authenticationResponse":"Y"}}'
              }
            }
          }
        ],
        interfaceInteractions: [
          {
            'type': {
              'typeId': 'type',
              'id': '759f6174-d743-40d6-a37c-3c4ea35c4019'
            },
            'fields': {
              'message': '{"body":{"webhook":{"url":"https://fe3irsk9ra.execute-api.eu-west-1.amazonaws.com/v1/dt-webhook"},"refno":"41378985446555405413","currency":"EUR","amount":2050,"paymentMethods":["VIS"],"redirect":{"successUrl":"http://localhost:3000/success","cancelUrl":"http://localhost:3000/cancel","errorUrl":"http://localhost:3000/error"},"card":{"alias":"7LHXscqwAAEAAAGCbQ5u7XjzHbaRAO91","expiryMonth":"06","expiryYear":"25"}}}',
              'timeStamp': '2022-08-05T08:11:47.581Z',
              'interactionType': 'initRequest'
            }
          },
          {
            'type': {
              'typeId': 'type',
              'id': '759f6174-d743-40d6-a37c-3c4ea35c4019'
            },
            'fields': {
              'message': '{"body":{"transactionId":"220805101147254194","3D":{"enrolled":true}},"headers":{"location":"https://pay.sandbox.datatrans.com/v1/start/220805101147254194"}}',
              'timeStamp': '2022-08-05T08:11:47.581Z',
              'interactionType': 'initResponse'
            }
          }
        ]
      };

      const { logger, logStream } = loadLogServiceForTesting();

      logger.info(paymentPart);

      expect(logStream.write).toBeCalledWith(
        expect.stringMatching(/"payload":.*"transactions":.*"custom":.*"fields":.*"info":"\[REDACTED\]".*"interfaceInteractions":.*"fields":.*"message":"\[REDACTED\]".*fields":.*"message":"\[REDACTED\]".*/)
      );
    });
  });
});
