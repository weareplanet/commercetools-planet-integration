import { abstractRequestFactory } from '../../../../test/shared-test-entities/abstract-request-factories';
import handler from '.';
import * as handlerMock from '.';
import * as createPaymentHandler from '../per-operation-handlers/create-payment';
import * as createPaymentWebhookHandler from '../per-operation-handlers/webhook-notification';
import { ErrorsService } from '../../services/errors-service';

const dtHttpClientMock = {
  post: jest.fn()
};
jest.mock('axios', () => {
  return {
    create: () => dtHttpClientMock
  };
});


describe('Errors Service Integration', () => {

  afterEach(() => {
    dtHttpClientMock.post.mockReset();
  });

  describe('When a request not matches CommerceTools format', () => {
    it('should return CommerceTools error', async () => {
      const req = abstractRequestFactory({
        action: 'Create',
        resource: {
          obj: {
            paymentMethodInfo: {
              paymentInterface: 'pp-datatrans-redirect-integration',
            },
            custom: {
              fields: {}
            },
            paymentStatus: {}
          }
        }
      });

      jest.spyOn(createPaymentHandler, 'default').mockResolvedValue(
        ErrorsService.makeCommerceToolsErrorResponse({})
      );

      const result = await handler(req);

      expect(result.statusCode).toEqual(400);
      expect(dtHttpClientMock.post).not.toBeCalled();
    });
  });

  describe('When a request not matches Datatrans format', () => {
    it('should return Datatrans error', async () => {

      const req = abstractRequestFactory({}, {
        'datatrans-signature': 't=TS,s0=SIGNATURE'
      });

      jest.spyOn(createPaymentWebhookHandler, 'default').mockResolvedValue(
        ErrorsService.makeDatatransErrorResponse({})
      );

      const result = await handler(req);

      expect(result.statusCode).toEqual(500);
      expect(dtHttpClientMock.post).not.toBeCalled();
    });
  });

  describe('When a request not matches any format', () => {
    it('should return general error with 400', async () => {

      const req = abstractRequestFactory({}, {});

      jest.spyOn(handlerMock, 'default').mockResolvedValue(
        ErrorsService.makeGeneralErrorResponse({})
      );

      const result = await handler(req);

      expect(result.statusCode).toEqual(400);
      expect(dtHttpClientMock.post).not.toBeCalled();
    });
  });
});
