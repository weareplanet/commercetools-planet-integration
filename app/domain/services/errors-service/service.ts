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
    if (OperationDetector.isCommerceToolsRequest(req)) {
      return this.makeCommerceToolsErrorResponse(err);
    }
    else if (OperationDetector.isDatatransRequest(req)) {
      return this.makeDatatransErrorResponse(err);
    }
    return this.makeGeneralErrorResponse(err);
  }

  /**
   * Returns error for CommerceTools
   * @param err error
   * @returns Error in CommerceTools format
   */
  public static makeCommerceToolsErrorResponse(err: Record<string, unknown>) {
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
  public static makeDatatransErrorResponse(err: Record<string, unknown>) {
    return {
      statusCode: HttpStatusCode.INTERNAL_SERVER_ERROR,
      body: {
        message: err?.message
      }
    };
  }

  /**
   * Returns connector's internal error
   * @param err error
   * @returns Internal error
   */
  public static makeGeneralErrorResponse(err: Record<string, unknown>) {
    return {
      statusCode: HttpStatusCode.BAD_REQUEST,
      body: ''
    };
  }
}
