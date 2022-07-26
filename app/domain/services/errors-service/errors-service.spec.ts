import { ErrorsService } from '.';
import { OperationDetector } from '../../../domain/environment-agnostic-handlers/all-operations-handler/operation-detector';
import { abstractRequestFactory } from '../../../../test/shared-test-entities/abstract-request-factories';
import { NestedError } from '../../../interfaces';

const ErrorMessage = 'Error message';
const ValidError = { message: ErrorMessage };

describe('ErrorsService', () => {

  describe('When a request was from CommerceTools', () => {

    beforeEach(() => {
      jest.spyOn(OperationDetector, 'isCommerceToolsRequest').mockReturnValue(true);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      jest.spyOn((OperationDetector as any), 'isRedirectAndLightboxInitOperation').mockReturnValue(true);
    });

    it('should return commercetools error with valid parameters', () => {
      const request = abstractRequestFactory({});
      const error = ErrorsService.makeCommerceToolsErrorResponse(ErrorMessage, ValidError);

      expect(ErrorsService.handleError(request, ValidError)).toMatchObject(error);
    });
  });

  describe('When a request was from Datatrans', () => {

    beforeEach(() => {
      jest.spyOn(OperationDetector, 'isDatatransRequest').mockReturnValue(true);
    });

    it('should return datatrans error with valid parameters', () => {
      const request = abstractRequestFactory({});
      const error = ErrorsService.makeDatatransErrorResponse(ErrorMessage);

      expect(ErrorsService.handleError(request, ValidError)).toMatchObject(error);
    });
  });

  describe('When a request was neither from CommerceTools nor from Datatrans', () => {
    const request = abstractRequestFactory({});
    const error = ErrorsService.makeGeneralErrorResponse();

    it('should return internal error with unknown request', () => {
      expect(ErrorsService.handleError(request, ValidError)).toMatchObject(error);
    });
  });

  describe('When a request was from CommerceTools and ErrorsService recieved a NestedError', () => {

    beforeEach(() => {
      jest.spyOn(OperationDetector, 'isCommerceToolsRequest').mockReturnValue(true);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      jest.spyOn((OperationDetector as any), 'isRedirectAndLightboxInitOperation').mockReturnValue(true);
    });

    it('should return custom error message', () => {

      const request = abstractRequestFactory({});
      const nestedMessage = 'Error message from nested error';
      const nestedError = new NestedError(ValidError, nestedMessage);
      const response = ErrorsService.handleError(request, nestedError as unknown as Record<string, unknown>);

      expect((response.body as Record<string, unknown>).message).toEqual(nestedMessage);
    });
  });

  describe('When a request was from Datatrans and ErrorsService recieved a NestedError', () => {

    beforeEach(() => {
      jest.spyOn(OperationDetector, 'isDatatransRequest').mockReturnValue(true);
    });

    it('should return custom error message', () => {

      const request = abstractRequestFactory({});
      const nestedMessage = 'Error message from nested error';
      const nestedError = new NestedError(ValidError, nestedMessage);
      const response = ErrorsService.handleError(request, nestedError as unknown as Record<string, unknown>);

      expect(response.body).toMatchObject({ message: nestedMessage });
    });
  });
});
