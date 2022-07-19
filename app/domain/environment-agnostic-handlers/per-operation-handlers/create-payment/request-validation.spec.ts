import {
  IAbstractRequestWithTypedBody
} from '../../../../interfaces';
import { IRequestBody } from './request-schema';
import configService from '../../../services/config-service';
import { abstractRequestFactory } from '../../../../../test/shared-test-entities/abstract-request-factories';
import { commerceToolsClientFactory  } from '../../../../../test/shared-test-entities/commercetools-client';

jest.mock('axios', () => ({
  create: () => ({ post: () => Promise.resolve({ data: {}, headers: {} }) })
}));

jest.mock('../../../services/commercetools-service/commerce-tools-client', () => {
  return {
    ctApiRoot: commerceToolsClientFactory()
  };
});

import handler from '.';

describe('createPayment handler', () => {

  const requiredCustomFields = () => {
    const merchantIdPresentInConfig = configService.getConfig().datatrans?.merchants[0].id;
    return {
      merchantId: merchantIdPresentInConfig,
      successUrl: 'successUrl string value',
      errorUrl: 'errorUrl string value',
      cancelUrl: 'cancelUrl string value'
    };
  };

  const optionalCustomFields = () => {
    return {
      savePaymentMethod: false,
      savedPaymentMethodsKey: 'savedPaymentMethodsKey string value',
      savedPaymentMethodAlias: '',
      initRequest: '{"refno2": "refno2", "option": { "returnMaskedCardNumber": true }}'
    };
  };

  const requestWithOnlyRequiredFields = () => {
    return abstractRequestFactory({
      action: 'Create',
      resource: {
        obj: {
          key: 'key string value',
          custom: {
            fields: requiredCustomFields()
          }
        }
      }
    });
  };

  const requestWithOptionalFields = (): IAbstractRequestWithTypedBody<IRequestBody> => {
    return abstractRequestFactory({
      action: 'Create',
      resource: {
        typeId: 'typeId',
        id: 'id',
        obj: {
          key: 'key string value',
          custom: {
            /* eslint-disable @typescript-eslint/ban-ts-comment */
            /* @ts-ignore */
            fields: { // TODO: if this goes more crazy - use lodash.merge
              ...requiredCustomFields(),
              ...optionalCustomFields()
            }
          }
        }
      }
    }) as IAbstractRequestWithTypedBody<IRequestBody>;
  };

  describe('when the request body contains only the required part', () => {
    it('responds with 200 and actions with updates', async () => {
      const response = await handler(requestWithOnlyRequiredFields());

      expect(response.body).toMatchObject({
        'actions': [
          {
            'action': 'setCustomField',
            'name': 'transactionId',
            'value': undefined,
          },
          {
            'action': 'setCustomField',
            'name': 'redirectUrl',
            'value': undefined,
          },
          {
            'action': 'addInterfaceInteraction',
            'fields': {
              'interactionType': 'initRequest',
              'message': '{"body":{"webhook":{"url":"https://webhookUrl.fake"},"refno":"key string value","redirect":{"successUrl":"successUrl string value","cancelUrl":"cancelUrl string value","errorUrl":"errorUrl string value"}}}',
            },
            'type': {
              'key': 'pp-datatrans-interface-interaction-type',
            },
          },
          {
            'action': 'addInterfaceInteraction',
            'fields': {
              'interactionType': 'initResponse',
              'message': '{"body":{},"headers":{}}',
            },
            'type': {
              'key': 'pp-datatrans-interface-interaction-type',
            },
          },
          {
            'action': 'setStatusInterfaceCode',
            'interfaceCode': 'Initial',
          }
        ]
      });

      expect(response.statusCode).toEqual(200);
    });
  });

  describe('when the request body contains the required part + some optional custom fields', () => {
    it('responds with 200 and actions with updates', async () => {
      const response = await handler(requestWithOptionalFields());

      expect(response.body).toMatchObject({
        'actions': [
          {
            'action': 'setCustomField',
            'name': 'transactionId',
            'value': undefined,
          },
          {
            'action': 'setCustomField',
            'name': 'redirectUrl',
            'value': undefined,
          },
          {
            'action': 'addInterfaceInteraction',
            'fields': {
              'interactionType': 'initRequest',
              'message': '{"body":{"refno2":"refno2","option":{"returnMaskedCardNumber":true,"createAlias":false},"refno":"key string value","redirect":{"successUrl":"successUrl string value","cancelUrl":"cancelUrl string value","errorUrl":"errorUrl string value"},"webhook":{"url":"https://webhookUrl.fake"}}}',
            },
            'type': {
              'key': 'pp-datatrans-interface-interaction-type',
            },
          },
          {
            'action': 'addInterfaceInteraction',
            'fields': {
              'interactionType': 'initResponse',
              'message': '{"body":{},"headers":{}}',
            },
            'type': {
              'key': 'pp-datatrans-interface-interaction-type',
            },
          },
          {
            'action': 'setStatusInterfaceCode',
            'interfaceCode': 'Initial',
          }
        ]
      });

      expect(response.statusCode).toEqual(200);
    });
  });

  describe('when the request body misses a required field - responds with status 400 and the corresponding error message', () => {
    it('key', async () => {
      const requestWithoutPaymentKey = requestWithOnlyRequiredFields();
      delete (requestWithoutPaymentKey.body as IRequestBody).resource.obj.key;

      const response = await handler(requestWithoutPaymentKey);

      expect(response.body).toMatchObject({
        message: 'Field key is missing in Payment'
      });

      expect(response.statusCode).toEqual(400);
    });

    describe('custom.fields:', () => {
      let request: IAbstractRequestWithTypedBody<IRequestBody>;

      beforeEach(() => {
        request = requestWithOptionalFields();
      });

      it.each([
        'merchantId',
        'successUrl',
        'errorUrl',
        'cancelUrl'
      ])('%s', async (fieldName) => {
        // Stub eslint and TS to allow the dynamic access by fieldName
        /* eslint-disable @typescript-eslint/ban-ts-comment */
        /* @ts-ignore */
        delete request.body.resource.obj.custom.fields[fieldName];

        const response = await handler(request);

        expect(response.body).toMatchObject({
          message: `Custom field ${fieldName} is missing in Payment`
        });

        expect(response.statusCode).toEqual(400);
      });
    });
  });

  describe('merchantId specific validations', () => {
    let request: IAbstractRequestWithTypedBody<IRequestBody>;
    beforeEach(() => {
      request = requestWithOptionalFields();
    });

    describe('when the credentials for merchantId are PRESENT in config', () => {
      beforeEach(() => {
        const merchantIdPresentInConfig = configService.getConfig().datatrans?.merchants[0].id;
        request.body.resource.obj.custom.fields.merchantId = merchantIdPresentInConfig;
      });

      it('responds with 200', async () => {
        const response = await handler(request);

        expect(response.statusCode).toEqual(200);
      });
    });

    describe('when the credentials for merchantId are ABSENT in config', () => {
      beforeEach(() => {
        request.body.resource.obj.custom.fields.merchantId = 'merchantIdAbsentInConfig';
      });

      it('responds with status 400 and the corresponding error message', async () => {
        const response = await handler(request);

        expect(response.body).toMatchObject({
          message: 'Merchant credentials are missing'
        });

        expect(response.statusCode).toEqual(400);
      });
    });
  });

  describe('Payment key specific validations', () => {
    let request: IAbstractRequestWithTypedBody<IRequestBody>;
    beforeEach(() => {
      request = requestWithOptionalFields();
    });

    describe('when key contains 20 symbols', () => {
      beforeEach(() => {
        request.body.resource.obj.key = '01234567890123456789';
      });

      it('responds with 200', async () => {
        const response = await handler(request);

        expect(response.statusCode).toEqual(200);
      });
    });

    describe('when key contains 21 symbols', () => {
      beforeEach(() => {
        request.body.resource.obj.key = '012345678901234567891';
      });

      it('responds with status 400 and the corresponding error message', async () => {
        const response = await handler(request);

        expect(response.body).toMatchObject({
          message: 'Attribute key is longer than expected in Payment'
        });

        expect(response.statusCode).toEqual(400);
      });
    });
  });

  describe('savedPaymentMethodsKey specific validations', () => {
    let request: IAbstractRequestWithTypedBody<IRequestBody>;
    beforeEach(() => {
      request = requestWithOptionalFields();
    });

    describe('when savePaymentMethod is true', () => {
      beforeEach(() => {
        request.body.resource.obj.custom.fields.savePaymentMethod = true;
      });

      describe('and savedPaymentMethodsKey is absent', () => {
        it('responds with status 400 and the corresponding error message', async () => {
          delete request.body.resource.obj.custom.fields.savedPaymentMethodsKey;
          const response = await handler(request);

          expect(response.body).toMatchObject({
            message: 'Custom field savedPaymentMethodsKey is missing in Payment'
          });

          expect(response.statusCode).toEqual(400);
        });
      });

      describe('and savedPaymentMethodsKey is present', () => {
        it('responds with 200', async () => {
          const response = await handler(request);

          expect(response.statusCode).toEqual(200);
        });
      });
    });

    describe('when savePaymentMethod is false', () => {
      beforeEach(() => {
        request.body.resource.obj.custom.fields.savePaymentMethod = false;
      });

      describe('and savedPaymentMethodsKey is absent', () => {
        it('responds with 200', async () => {
          delete request.body.resource.obj.custom.fields.savedPaymentMethodsKey;
          const response = await handler(request);

          expect(response.statusCode).toEqual(200);
        });
      });

      describe('and savedPaymentMethodsKey is present', () => {
        it('responds with 200', async () => {
          const response = await handler(request);

          expect(response.statusCode).toEqual(200);
        });
      });
    });

    describe('when savePaymentMethod is absent', () => {
      beforeEach(() => {
        delete request.body.resource.obj.custom.fields.savePaymentMethod;
      });

      describe('and savedPaymentMethodsKey is absent', () => {
        it('responds with 200', async () => {
          delete request.body.resource.obj.custom.fields.savedPaymentMethodsKey;
          const response = await handler(request);

          expect(response.statusCode).toEqual(200);
        });
      });

      describe('and savedPaymentMethodsKey is present', () => {
        it('responds with 200', async () => {
          const response = await handler(request);

          expect(response.statusCode).toEqual(200);
        });
      });
    });
  });

  describe('savePaymentMethod specific validations', () => {
    let request: IAbstractRequestWithTypedBody<IRequestBody>;
    beforeEach(() => {
      request = requestWithOptionalFields();
    });

    describe('when savedPaymentMethodAlias is NOT empty', () => {
      beforeEach(() => {
        request.body.resource.obj.custom.fields.savedPaymentMethodAlias = 'savedPaymentMethodAlias value';
      });

      describe('and savePaymentMethod is true', () => {
        it('responds with status 400 and the corresponding error message', async () => {
          request.body.resource.obj.custom.fields.savePaymentMethod = true;
          const response = await handler(request);

          expect(response.body).toMatchObject({
            message: 'Custom field savePaymentMethod cannot be true when savedPaymentMethodAlias is not empty'
          });

          expect(response.statusCode).toEqual(400);
        });
      });

      describe('and savePaymentMethod is false', () => {
        it('responds with 200', async () => {
          request.body.resource.obj.custom.fields.savePaymentMethod = false;
          const response = await handler(request);

          expect(response.statusCode).toEqual(200);
        });
      });

      describe('and savePaymentMethod is absent', () => {
        it('responds with 200', async () => {
          delete request.body.resource.obj.custom.fields.savePaymentMethod;
          const response = await handler(request);

          expect(response.statusCode).toEqual(200);
        });
      });
    });

    describe('when savedPaymentMethodAlias is empty', () => {
      beforeEach(() => {
        request.body.resource.obj.custom.fields.savedPaymentMethodAlias = '';
      });

      describe('and savePaymentMethod is true', () => {
        it('responds with 200', async () => {
          request.body.resource.obj.custom.fields.savePaymentMethod = true;
          const response = await handler(request);

          expect(response.statusCode).toEqual(200);
        });
      });

      describe('and savePaymentMethod is false', () => {
        it('responds with 200', async () => {
          request.body.resource.obj.custom.fields.savePaymentMethod = false;
          const response = await handler(request);

          expect(response.statusCode).toEqual(200);
        });
      });

      describe('and savePaymentMethod is absent', () => {
        it('responds with 200', async () => {
          delete request.body.resource.obj.custom.fields.savePaymentMethod;
          const response = await handler(request);

          expect(response.statusCode).toEqual(200);
        });
      });
    });

    describe('when savedPaymentMethodAlias is absent', () => {
      beforeEach(() => {
        delete request.body.resource.obj.custom.fields.savedPaymentMethodAlias;
      });

      describe('and savePaymentMethod is true', () => {
        it('responds with 200', async () => {
          request.body.resource.obj.custom.fields.savePaymentMethod = true;
          const response = await handler(request);

          expect(response.statusCode).toEqual(200);
        });
      });

      describe('and savePaymentMethod is false', () => {
        it('responds with 200', async () => {
          request.body.resource.obj.custom.fields.savePaymentMethod = false;
          const response = await handler(request);

          expect(response.statusCode).toEqual(200);
        });
      });

      describe('and savePaymentMethod is absent', () => {
        it('responds with 200', async () => {
          delete request.body.resource.obj.custom.fields.savePaymentMethod;
          const response = await handler(request);

          expect(response.statusCode).toEqual(200);
        });
      });
    });
  });

  describe('initRequest specific validations', () => {
    describe('When initRequest has a correct content', () => {
      it('responds with 200', async () => {
        const optCustomFields = optionalCustomFields();
        optCustomFields.initRequest = '{ "autoSettle":true, "authenticationOnly":false }';
        const req = abstractRequestFactory({
          action: 'Create',
          resource: {
            id: 'id',
            typeId: 'typeId',
            obj: {
              key: 'key string value',
              custom: {
                fields: {
                  ...requiredCustomFields(),
                  ...optCustomFields,
                }
              }
            }
          }
        });

        const response = await handler(req);

        expect(response.statusCode).toEqual(200);
      });
    });

    describe('when some initRequest fields are also present somewhere outside of initRequest', () => {
      it('responds with status 400 and the corresponding error message', async () => {
        const optCustomFields = optionalCustomFields();
        optCustomFields.initRequest = '{ "autoSettle":true, "authenticationOnly":false }';
        const req = abstractRequestFactory({
          action: 'Create',
          resource: {
            obj: {
              key: 'key string value',
              custom: {
                fields: {
                  ...requiredCustomFields(),
                  ...optCustomFields,
                  autoSettle: false,
                  authenticationOnly: false
                }
              }
            }
          }
        });
        const response = await handler(req);

        expect(response.body).toMatchObject({
          message: 'Values autoSettle,authenticationOnly specified in initRequest are duplicated'
        });

        expect(response.statusCode).toEqual(400);
      });
    });

    describe('When initRequest.autoSettle is true', () => {
      it('responds with status 400 and the corresponding error message', async () => {
        const optCustomFields = optionalCustomFields();
        optCustomFields.initRequest = '{ "autoSettle":false }';
        const req = abstractRequestFactory({
          action: 'Create',
          resource: {
            obj: {
              key: 'key string value',
              custom: {
                fields: {
                  ...requiredCustomFields(),
                  ...optCustomFields,
                }
              }
            }
          }
        });
        const response = await handler(req);

        expect(response.body).toMatchObject({
          message: 'Feature autoSettle disabling not supported'
        });

        expect(response.statusCode).toEqual(400);
      });
    });

    describe('When initRequest.authenticationOnly is false', () => {
      it('responds with status 400 and the corresponding error message', async () => {
        const optCustomFields = optionalCustomFields();
        optCustomFields.initRequest = '{ "authenticationOnly":true }';
        const req = abstractRequestFactory({
          action: 'Create',
          resource: {
            obj: {
              key: 'key string value',
              custom: {
                fields: {
                  ...requiredCustomFields(),
                  ...optCustomFields,
                }
              }
            }
          }
        });
        const response = await handler(req);

        expect(response.body).toMatchObject({
          message: 'Feature authenticationOnly not supported'
        });

        expect(response.statusCode).toEqual(400);
      });
    });

    describe.each(['mcp', 'returnMobileToken'])('When initRequest.%s is present', (fieldName) => {
      it('responds with status 400 and the corresponding error message', async () => {
        const optCustomFields = optionalCustomFields();
        optCustomFields.initRequest = `{ "${fieldName}":"something" }`;
        const req = abstractRequestFactory({
          action: 'Create',
          resource: {
            obj: {
              key: 'key string value',
              custom: {
                fields: {
                  ...requiredCustomFields(),
                  ...optCustomFields,
                }
              }
            }
          }
        });
        const response = await handler(req);

        expect(response.body).toMatchObject({
          message: `Feature ${fieldName} not supported`
        });

        expect(response.statusCode).toEqual(400);
      });
    });

    describe('When initRequest.webhook is present', () => {
      it('responds with status 400 and the corresponding error message', async () => {
        const optCustomFields = optionalCustomFields();
        optCustomFields.initRequest = '{ "webhook":"something" }';
        const req = abstractRequestFactory({
          action: 'Create',
          resource: {
            obj: {
              key: 'key string value',
              custom: {
                fields: {
                  ...requiredCustomFields(),
                  ...optCustomFields,
                }
              }
            }
          }
        });
        const response = await handler(req);

        expect(response.body).toMatchObject({
          message: 'Webhook is a connector wide setting; setting it individually per request is not supported'
        });

        expect(response.statusCode).toEqual(400);
      });
    });
  });

});
