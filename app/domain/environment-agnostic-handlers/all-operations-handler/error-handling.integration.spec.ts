import { LogService }  from '../../services/log-service';
import { abstractRequestFactory } from '../../../../test/test-utils';
import handler from '.';
import * as handlerMock from '.';
import { ErrorsService } from '../../services/errors-service';
import { OperationDetector } from '../../services/request-context-service/operation-detector';

describe('Errors Service Integration', () => {
  const logger = new LogService();

  describe('When the request is recognized as a request from CommerceTools', () => {

    beforeEach(() => {
      jest.spyOn(OperationDetector, 'isCommerceToolsRequest').mockReturnValue(true);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      jest.spyOn((OperationDetector as any), 'isRedirectAndLightboxInitOperation').mockReturnValue(true);
    });

    it('should return CommerceTools error', async () => {
      const req = abstractRequestFactory({});
      const result = await handler(req);

      expect(result).toHaveProperty('statusCode');
      expect(result).toHaveProperty('body');
      expect(result.statusCode).toEqual(400);
      expect(result.body).toHaveProperty('message');
      expect(result.body).toHaveProperty('errors');
    });
  });

  describe('When the request is recognized as a request from Datatrans', () => {

    beforeEach(() => {
      jest.spyOn(OperationDetector, 'isDatatransRequest').mockReturnValue(true);
    });

    it('should return Datatrans error', async () => {
      const req = abstractRequestFactory({});
      const result = await handler(req);

      expect(result).toHaveProperty('statusCode');
      expect(result).toHaveProperty('body');
      expect(result.statusCode).toEqual(500);
      expect(result.body).toHaveProperty('message');
    });
  });

  describe('When the request is not recognized as a request from either CommerceTools or Datanrans', () => {

    beforeEach(() => {
      jest.spyOn(handlerMock, 'default').mockResolvedValue(
        new ErrorsService({ logger }).makeGeneralErrorResponse()
      );
    });

    it('should return general error with 400', async () => {
      const req = abstractRequestFactory({}, {});
      const result = await handler(req);

      expect(result).toHaveProperty('statusCode');
      expect(result).toHaveProperty('body');
      expect(result.statusCode).toEqual(400);
      expect(result.body).toEqual('');
    });
  });
});
