import { HttpStatusCode } from 'http-status-code-const-enum';
import { IAbstractRequest, IAbstractResponse, ICommerceToolsErrorCode } from '../../../interfaces';
import { OperationDetector } from '../../environment-agnostic-handlers/all-operations-handler/operation-detector';


/**
 * This service handles and formats all connector errors
 */
export class ErrorsService {

  /**
   * Formats the error according to the request type
   * @param req incoming request
   * @param err error
   * @returns Formatted error
   */
  public static handleError(req: IAbstractRequest, err: Record<string, unknown>): IAbstractResponse {
    if (req && err) {
      if (OperationDetector.isCommerceToolsRequest(req)) {
        return this.getCommerceToolsError(err);
      }
      else if (OperationDetector.isDatatransRequest(req)) {
        return this.getDatatransError(err);
      }
    }
    return this.getInternalError(err);
  }

  /**
   * Returns error for CommerceTools
   * @param err error
   * @returns Error in CommerceTools format
   */
  public static getCommerceToolsError(err: Record<string, unknown>) {
    delete err?.config;
    delete err?.stack;

    const commerceToolsError = {
      code: ICommerceToolsErrorCode.InvalidInput,
      message: err?.message,
      extensionExtraInfo: err
    };

    return {
      statusCode: HttpStatusCode.BAD_REQUEST,
      body: {
        message: err?.message,
        errors: [commerceToolsError]
      }
    };
  }

  /**
   * Returns error for Datatrans
   * @param err error
   * @returns Error in Datatrans format
   */
  public static getDatatransError(err: Record<string, unknown>) {
    const datatransError = {
      code: HttpStatusCode.INTERNAL_SERVER_ERROR,
      message: err?.message
    };

    return {
      statusCode: HttpStatusCode.BAD_REQUEST,
      body: {
        error: datatransError
      }
    };
  }

  /**
   * Returns connector's internal error
   * @param err error
   * @returns Internal error
   */
  public static getInternalError(err: Record<string, unknown>) {
    return {
      statusCode: HttpStatusCode.BAD_REQUEST,
      body: ''
    };
  }
}
