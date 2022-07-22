import { DATATRANS_SIGNATURE_HEADER_NAME } from '../../../interfaces';
import { ErrorsService } from '.';

const ValidError = { message: 'Error message' };

describe('ErrorsService', () => {

  describe('CommerceTools errors', () => {
    it('returns commercetools error with valid parameters', () => {
      const commerceToolsRequest = {
        headers: {},
        rawBody: '{}',
        body: { action: 'Create' }
      };
      const commerceToolsError = ErrorsService.getCommerceToolsError(ValidError);

      expect(ErrorsService.handleError(commerceToolsRequest, ValidError)).toMatchObject(commerceToolsError);
    });
  });

  describe('Datatrans errors', () => {
    it('returns datatrans error with valid parameters', () => {
      const datatransRequest = {
        headers: {
          [DATATRANS_SIGNATURE_HEADER_NAME]: 'SIGN_HEADER_NAME'
        },
        rawBody: '{}',
        body: {}
      };
      const datatransError = ErrorsService.getDatatransError(ValidError);

      expect(ErrorsService.handleError(datatransRequest, ValidError)).toMatchObject(datatransError);
    });
  });

  describe('Internal errors', () => {
    const internalError = ErrorsService.getInternalError(ValidError);
    const request = {
      headers: {},
      rawBody: '{}',
      body: {}
    };

    it('returns internal error with unknown request', () => {
      expect(ErrorsService.handleError(request, ValidError)).toMatchObject(internalError);
    });
  });
});
