import { abstractRequestFactory } from '../../../../test/shared-test-entities/abstract-request-factories';
import handler from '../../../domain/environment-agnostic-handlers/all-operations-handler';
import { ErrorsService } from '.';

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

      const result = await handler(req);
      const error = ErrorsService.getCommerceToolsError({});

      expect(result.statusCode).toEqual(error.statusCode);
      expect(dtHttpClientMock.post).not.toBeCalled();
    });
  });

  describe('When a request not matches Datatrans format', () => {
    it('should return Datatrans error', async () => {

      const req = abstractRequestFactory({}, {
        'datatrans-signature': 't=TS,s0=SIGNATURE'
      });

      const result = await handler(req);
      const error = ErrorsService.getDatatransError({});

      expect(result.statusCode).toEqual(error.statusCode);
      expect(dtHttpClientMock.post).not.toBeCalled();
    });
  });

  describe('When a request not matches any format', () => {
    it('should return 200 and empty body', async () => {

      const req = abstractRequestFactory({}, {});
      const result = await handler(req);
      const error = {
        statusCode: 200,
        body: ''
      };

      expect(result).toEqual(error);
      expect(dtHttpClientMock.post).not.toBeCalled();
    });
  });
});
