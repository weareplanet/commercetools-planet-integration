import handler  from '.';

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

  const requestWithoutFields = {
    body: {
      custom: {
        fields: requiredCustomFields
      }
    }
  };

  const requestWithOnlyRequiredFields = {
    body: {
      custom: {
        fields: requiredCustomFields
      }
    }
  };

  const requestWithOptionalFields = {
    // TODO: if this goes more crazy - use lodash.merge
    body: {
      custom: {
        fields: {
          ...requiredCustomFields,
          ...optionalCustomFields
        }
      }
    }
  };

  describe('cuccess cases', () => {

    describe('when the request body contains only the required part', () => {
      it('responds with 200 and Hello World in the body', async () => {
        console.log(JSON.stringify(requestWithoutFields, null, 5));
        const response = await handler(requestWithoutFields);

        expect(response.body).toMatchObject({
          message: 'Hello World from create-payment handler!'
        });

        expect(response.statusCode).toEqual(200);
      });
    });

    describe('when the request body contains the required part + required custom fields', () => {
      it('responds with 200 and Hello World in the body', async () => {
        console.log(JSON.stringify(requestWithOnlyRequiredFields, null, 5));
        const response = await handler(requestWithOnlyRequiredFields);

        expect(response.body).toMatchObject({
          message: 'Hello World from create-payment handler!'
        });

        expect(response.statusCode).toEqual(200);
      });
    });

    describe('when the request body contains the required part + required and some optional custom fields', () => {
      it('responds with 200 and Hello World in the body', async () => {
        console.log(JSON.stringify(requestWithOptionalFields, null, 5));
        const response = await handler(requestWithOptionalFields);

        expect(response.body).toMatchObject({
          message: 'Hello World from create-payment handler!'
        });

        expect(response.statusCode).toEqual(200);
      });
    });

  });

  describe('error cases', () => {

    describe('when the request body has an INCORRECT STRUCTURE', () => {
      it('responds with status 400', async () => {
        const req = {
          body: { x: 123 }
        };

        const response = await handler(req);

        expect(response.statusCode).toEqual(400);
      });
    });

  });

});
