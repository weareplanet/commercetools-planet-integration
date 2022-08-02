import { LogService }  from '../log-service';
import { OperationDetector } from '../request-context-service/operation-detector';
import { abstractRequestFactory } from '../../../../test/test-utils';
import { NestedError } from '../../../interfaces';
import { ErrorsService } from '.';

const errorMessage = 'Error message';
const validError = new Error(errorMessage);

describe('ErrorsService', () => {
  const logger =  new LogService();
  const errorsService = new ErrorsService({ logger });

  describe('When a request was from CommerceTools', () => {

    beforeEach(() => {
      jest.spyOn(OperationDetector, 'isCommerceToolsRequest').mockReturnValue(true);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      jest.spyOn((OperationDetector as any), 'isRedirectAndLightboxInitOperation').mockReturnValue(true);
    });

    it('should return commercetools error with valid parameters', () => {
      const request = abstractRequestFactory({});
      const error = errorsService.makeCommerceToolsErrorResponse(errorMessage, validError);

      expect(errorsService.handleError(request, validError)).toMatchObject(error);
    });
  });

  describe('When a request was from Datatrans', () => {

    beforeEach(() => {
      jest.spyOn(OperationDetector, 'isDatatransRequest').mockReturnValue(true);
    });

    it('should return datatrans error with valid parameters', () => {
      const request = abstractRequestFactory({});
      const error = errorsService.makeDatatransErrorResponse(errorMessage);

      expect(errorsService.handleError(request, validError)).toMatchObject(error);
    });
  });

  describe('When a request was neither from CommerceTools nor from Datatrans', () => {
    const request = abstractRequestFactory({});
    const error = errorsService.makeGeneralErrorResponse();

    it('should return internal error with unknown request', () => {
      expect(errorsService.handleError(request, validError)).toMatchObject(error);
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
      const nestedError = new NestedError(validError, nestedMessage);
      const response = errorsService.handleError(request, nestedError);

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
      const nestedError = new NestedError(validError, nestedMessage);
      const response = errorsService.handleError(request, nestedError);

      expect(response.body).toMatchObject({ message: nestedMessage });
    });
  });
});
