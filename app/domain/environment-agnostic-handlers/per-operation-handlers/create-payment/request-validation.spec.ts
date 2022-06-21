import handler  from '.';

jest.mock('../../../services/config-service/index', () => ({
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  getConfig: () => ({}),
}));

describe('createPayment handler', () => {
  afterAll(() => {
    jest.resetModules();
  });

  describe('cuccess cases', () => {

    describe('when the request body has a CORRECT STRUCTURE', () => {
      it('responds with 200 and Hello World in the body', async () => {
        const req = {
          body: {
            'key': 'some string value'
          }
        };

        const response = await handler(req);

        expect(response.statusCode).toEqual(200);

        expect(response.body).toMatchObject({
          message: 'Hello World from create-payment handler!'
        });
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