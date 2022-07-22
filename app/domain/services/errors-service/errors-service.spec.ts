import { ErrorsService } from '.';
import { OperationDetector } from '../../../domain/environment-agnostic-handlers/all-operations-handler/operation-detector';
import { abstractRequestFactory } from '../../../../test/shared-test-entities/abstract-request-factories';

const ValidError = { message: 'Error message' };

describe('ErrorsService', () => {

  describe('When a request was from CommerceTools', () => {

    beforeEach(() => {
      jest.spyOn(OperationDetector, 'isCommerceToolsRequest').mockReturnValue(true);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      jest.spyOn((OperationDetector as any), 'isRedirectAndLightboxInitOperation').mockReturnValue(true);
    });

    it('should return commercetools error with valid parameters', () => {
      const request = abstractRequestFactory({});
      const error = ErrorsService.makeCommerceToolsErrorResponse(ValidError);

      expect(ErrorsService.handleError(request, ValidError)).toMatchObject(error);
    });
  });

  describe('When a request was from Datatrans', () => {

    beforeEach(() => {
      jest.spyOn(OperationDetector, 'isDatatransRequest').mockReturnValue(true);
    });

    it('should return datatrans error with valid parameters', () => {
      const request = abstractRequestFactory({});
      const error = ErrorsService.makeDatatransErrorResponse(ValidError);

      expect(ErrorsService.handleError(request, ValidError)).toMatchObject(error);
    });
  });

  describe('When a request was neither from CommerceTools nor from Datatrans', () => {
    const request = abstractRequestFactory({});
    const error = ErrorsService.makeGeneralErrorResponse(ValidError);

    it('should return internal error with unknown request', () => {
      expect(ErrorsService.handleError(request, ValidError)).toMatchObject(error);
    });
  });
});
