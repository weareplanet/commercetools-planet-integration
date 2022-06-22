import handler  from '.';
import { AbstractRequest } from '../../../../interfaces';
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
    savedPaymentMethodAlias: 'savedPaymentMethodAlias string value',
    initRequest: 'initRequest string value' // TODO: JSON
  };

  const requestWithOnlyRequiredFields = {
    body: {
      key: 'key string value',
      custom: {
        fields: requiredCustomFields
      }
    }
  };

  const requestWithOptionalFields = {
    body: {
      key: 'key string value',
      custom: {
        fields: { // TODO: if this goes more crazy - use lodash.merge
          ...requiredCustomFields,
          ...optionalCustomFields
        }
      }
    }
  };

  describe('cuccess cases', () => {

    describe('when the request body contains only the required part', () => {
      it('responds with 200 and Hello World in the body', async () => {
        const response = await handler(requestWithOnlyRequiredFields);

        expect(response.body).toMatchObject({
          message: 'Hello World from create-payment handler!'
        });

        expect(response.statusCode).toEqual(200);
      });
    });

    describe('when the request body contains the required part + required and some optional custom fields', () => {
      it('responds with 200 and Hello World in the body', async () => {
        const response = await handler(requestWithOptionalFields);

        expect(response.body).toMatchObject({
          message: 'Hello World from create-payment handler!'
        });

        expect(response.statusCode).toEqual(200);
      });
    });

  });

  describe('error cases', () => {

    describe('when the request body misses a required field - responds with status 400 and the corresponding error message', () => {
      it('key', async () => {
        const requestWithoutPaymentKey: AbstractRequest = {
          body: {
            custom: {
              fields: requiredCustomFields
            }
          }
        };

        const response = await handler(requestWithoutPaymentKey);

        expect(response.body).toMatchObject({
          message: 'Field key is missing in Payment'
        });

        expect(response.statusCode).toEqual(400);
      });

      describe('custom.fields:', () => {
        let request: AbstractRequest;

        beforeEach(() => {
          request = {
            body: {
              key: 'key string value',
              custom: {
                fields: requiredCustomFields
              }
            }
          };
        });

        it.each([
          'merchantId',
          'successUrl',
          'errorUrl',
          'cancelUrl'
        ])('%s', async (fieldName) => {
          // Stub eslint and TS to allow the access by fieldName
          /* eslint-disable @typescript-eslint/ban-ts-comment */
          /* @ts-ignore */
          delete (request.body as RequestBodySchemaType).custom.fields[fieldName];

          const response = await handler(request);

          expect(response.body).toMatchObject({
            message: `Custom field ${fieldName} is missing in Payment`
          });

          expect(response.statusCode).toEqual(400);
        });
      });
    });
  });

});
