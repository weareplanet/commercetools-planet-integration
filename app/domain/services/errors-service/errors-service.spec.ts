import { DATATRANS_SIGNATURE_HEADER_NAME } from '../../../interfaces';
import { ErrorsService } from '.';

const ValidError = { message: 'Error message' };

describe('ErrorsService', () => {

  describe('When a request was from CommerceTools', () => {
    it('should return commercetools error with valid parameters', () => {
      const commerceToolsRequest = {
        headers: {},
        rawBody: '{}',
        body: { action: 'Create' }
      };
      const commerceToolsError = ErrorsService.makeCommerceToolsErrorResponse(ValidError);

      expect(ErrorsService.handleError(commerceToolsRequest, ValidError)).toMatchObject(commerceToolsError);
    });
  });

  describe('When a request was from Datatrans', () => {
    it('should return datatrans error with valid parameters', () => {
      const datatransRequest = {
        headers: {
          [DATATRANS_SIGNATURE_HEADER_NAME]: 'SIGN_HEADER_NAME'
        },
        rawBody: '{}',
        body: {}
      };
      const datatransError = ErrorsService.makeDatatransErrorResponse(ValidError);

      expect(ErrorsService.handleError(datatransRequest, ValidError)).toMatchObject(datatransError);
    });
  });

  describe('When a request was neither from CommerceTools nor from Datatrans', () => {
    const internalError = ErrorsService.makeGeneralErrorResponse(ValidError);
    const request = {
      headers: {},
      rawBody: '{}',
      body: {}
    };

    it('should return internal error with unknown request', () => {
      expect(ErrorsService.handleError(request, ValidError)).toMatchObject(internalError);
    });
  });
});
