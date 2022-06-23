import handler  from '.';
import { AbstractRequestWithTypedBody } from '../../../../interfaces';
import { RequestBodySchemaType } from './request-schema';

jest.mock('../../../services/config-service/index', () => ({
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  getConfig: () => ({}),
}));

describe('createPayment handler', () => {
  afterAll(() => {
    jest.resetModules();
  });

  const requiredCustomFields = {
    merchantId: 'merchantId string value',
    successUrl: 'successUrl string value',
    errorUrl: 'errorUrl string value',
    cancelUrl: 'cancelUrl string value'
  };

  const optionalCustomFields = {
    savePaymentMethod: false,
    savedPaymentMethodKey: 'savedPaymentMethodKey string value',
    savedPaymentMethodAlias: '',
    initRequest: '{}'
  };

  const requestWithOnlyRequiredFields = () => {
    return {
      body: {
        key: 'key string value',
        custom: {
          fields: requiredCustomFields
        }
      }
    };
  };

  const requestWithOptionalFields = (): AbstractRequestWithTypedBody<RequestBodySchemaType> => {
    return {
      body: {
        key: 'key string value',
        custom: {
          /* eslint-disable @typescript-eslint/ban-ts-comment */
          /* @ts-ignore */
          fields: { // TODO: if this goes more crazy - use lodash.merge
            ...requiredCustomFields,
            ...optionalCustomFields
          }
        }
      }
    };
  };

  describe('when the request body contains only the required part', () => {
    it('responds with 200 and Hello World in the body', async () => {
      const response = await handler(requestWithOnlyRequiredFields());

      expect(response.body).toMatchObject({
        message: 'Hello World from create-payment handler!'
      });

      expect(response.statusCode).toEqual(200);
    });
  });

  describe('when the request body contains the required part + some optional custom fields', () => {
    it('responds with 200 and Hello World in the body', async () => {
      const response = await handler(requestWithOptionalFields());

      expect(response.body).toMatchObject({
        message: 'Hello World from create-payment handler!'
      });

      expect(response.statusCode).toEqual(200);
    });
  });

  describe('when the request body misses a required field - responds with status 400 and the corresponding error message', () => {
    it('key', async () => {
      const requestWithoutPaymentKey = requestWithOnlyRequiredFields();
      delete (requestWithoutPaymentKey.body as RequestBodySchemaType).key;

      const response = await handler(requestWithoutPaymentKey);

      expect(response.body).toMatchObject({
        message: 'Field key is missing in Payment'
      });

      expect(response.statusCode).toEqual(400);
    });

    describe('custom.fields:', () => {
      let request: AbstractRequestWithTypedBody<RequestBodySchemaType>;

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
        delete request.body.custom.fields[fieldName];

        const response = await handler(request);

        expect(response.body).toMatchObject({
          message: `Custom field ${fieldName} is missing in Payment`
        });

        expect(response.statusCode).toEqual(400);
      });
    });
  });

  describe('Payment key specific validations', () => {
    let request: AbstractRequestWithTypedBody<RequestBodySchemaType>;
    beforeEach(() => {
      request = requestWithOptionalFields();
    });

    describe('when key contains 20 symbols', () => {
      beforeEach(() => {
        request.body.key = '01234567890123456789';
      });

      it('responds with 200', async () => {
        const response = await handler(request);

        expect(response.statusCode).toEqual(200);
      });
    });

    describe('when key contains 21 symbols', () => {
      beforeEach(() => {
        request.body.key = '012345678901234567891';
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

  describe('savedPaymentMethodKey specific validations', () => {
    let request: AbstractRequestWithTypedBody<RequestBodySchemaType>;
    beforeEach(() => {
      request = requestWithOptionalFields();
    });

    describe('when savePaymentMethod is true', () => {
      beforeEach(() => {
        request.body.custom.fields.savePaymentMethod = true;
      });

      describe('and savedPaymentMethodKey is absent', () => {
        it('responds with status 400 and the corresponding error message', async () => {
          delete request.body.custom.fields.savedPaymentMethodKey;
          const response = await handler(request);

          expect(response.body).toMatchObject({
            message: 'Custom field savedMethodsKey is missing in Payment'
          });

          expect(response.statusCode).toEqual(400);
        });
      });

      describe('and savedPaymentMethodKey is present', () => {
        it('responds with 200', async () => {
          const response = await handler(request);

          expect(response.statusCode).toEqual(200);
        });
      });
    });

    describe('when savePaymentMethod is false', () => {
      beforeEach(() => {
        request.body.custom.fields.savePaymentMethod = false;
      });

      describe('and savedPaymentMethodKey is absent', () => {
        it('responds with 200', async () => {
          delete request.body.custom.fields.savedPaymentMethodKey;
          const response = await handler(request);

          expect(response.statusCode).toEqual(200);
        });
      });

      describe('and savedPaymentMethodKey is present', () => {
        it('responds with 200', async () => {
          const response = await handler(request);

          expect(response.statusCode).toEqual(200);
        });
      });
    });

    describe('when savePaymentMethod is absent', () => {
      beforeEach(() => {
        delete request.body.custom.fields.savePaymentMethod;
      });

      describe('and savedPaymentMethodKey is absent', () => {
        it('responds with 200', async () => {
          delete request.body.custom.fields.savedPaymentMethodKey;
          const response = await handler(request);

          expect(response.statusCode).toEqual(200);
        });
      });

      describe('and savedPaymentMethodKey is present', () => {
        it('responds with 200', async () => {
          const response = await handler(request);

          expect(response.statusCode).toEqual(200);
        });
      });
    });
  });

  describe('savePaymentMethod specific validations', () => {
    let request: AbstractRequestWithTypedBody<RequestBodySchemaType>;
    beforeEach(() => {
      request = requestWithOptionalFields();
    });

    describe('when savedPaymentMethodAlias is NOT empty', () => {
      beforeEach(() => {
        request.body.custom.fields.savedPaymentMethodAlias = 'savedPaymentMethodAlias value';
      });

      describe('and savePaymentMethod is true', () => {
        it('responds with status 400 and the corresponding error message', async () => {
          request.body.custom.fields.savePaymentMethod = true;
          const response = await handler(request);

          expect(response.body).toMatchObject({
            message: 'Custom field savePaymentMethod cannot be true when savedPaymentMethodAlias is not empty'
          });

          expect(response.statusCode).toEqual(400);
        });
      });

      describe('and savePaymentMethod is false', () => {
        it('responds with 200', async () => {
          request.body.custom.fields.savePaymentMethod = false;
          const response = await handler(request);

          expect(response.statusCode).toEqual(200);
        });
      });

      describe('and savePaymentMethod is absent', () => {
        it('responds with 200', async () => {
          delete request.body.custom.fields.savePaymentMethod;
          const response = await handler(request);

          expect(response.statusCode).toEqual(200);
        });
      });
    });

    describe('when savedPaymentMethodAlias is empty', () => {
      beforeEach(() => {
        request.body.custom.fields.savedPaymentMethodAlias = '';
      });

      describe('and savePaymentMethod is true', () => {
        it('responds with 200', async () => {
          request.body.custom.fields.savePaymentMethod = true;
          const response = await handler(request);

          expect(response.statusCode).toEqual(200);
        });
      });

      describe('and savePaymentMethod is false', () => {
        it('responds with 200', async () => {
          request.body.custom.fields.savePaymentMethod = false;
          const response = await handler(request);

          expect(response.statusCode).toEqual(200);
        });
      });

      describe('and savePaymentMethod is absent', () => {
        it('responds with 200', async () => {
          delete request.body.custom.fields.savePaymentMethod;
          const response = await handler(request);

          expect(response.statusCode).toEqual(200);
        });
      });
    });

    describe('when savedPaymentMethodAlias is absent', () => {
      beforeEach(() => {
        delete request.body.custom.fields.savedPaymentMethodAlias;
      });

      describe('and savePaymentMethod is true', () => {
        it('responds with 200', async () => {
          request.body.custom.fields.savePaymentMethod = true;
          const response = await handler(request);

          expect(response.statusCode).toEqual(200);
        });
      });

      describe('and savePaymentMethod is false', () => {
        it('responds with 200', async () => {
          request.body.custom.fields.savePaymentMethod = false;
          const response = await handler(request);

          expect(response.statusCode).toEqual(200);
        });
      });

      describe('and savePaymentMethod is absent', () => {
        it('responds with 200', async () => {
          delete request.body.custom.fields.savePaymentMethod;
          const response = await handler(request);

          expect(response.statusCode).toEqual(200);
        });
      });
    });
  });

  describe('initRequest specific validations', () => {
    describe('when some initRequest fields are also present somewhere outside of initRequest', () => {
      it('responds with status 400 and the corresponding error message', async () => {
        optionalCustomFields.initRequest = '{ "autoSettle":true, "authneticationOnly":false }';
        const response = await handler({
          body: {
            key: 'key string value',
            custom: {
              /* eslint-disable @typescript-eslint/ban-ts-comment */
              /* @ts-ignore */
              fields: {
                ...requiredCustomFields,
                ...optionalCustomFields,
                autoSettle: false,
                authneticationOnly: false
              }
            }
          }
        });

        expect(response.body).toMatchObject({
          message: 'Values autoSettle,authneticationOnly specified in initRequest are duplicated'
        });

        expect(response.statusCode).toEqual(400);
      });
    });
  });

});
