import { HttpStatusCode } from 'http-status-code-const-enum';
import { IAbstractRequest, IAbstractResponse, ICommerceToolsErrorCode, NestedError } from '../../../interfaces';
import { OperationDetector } from '../../environment-agnostic-handlers/all-operations-handler/operation-detector';
import logger from '../../services/log-service';

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
    const message = err.message.toString();
    let error = err;

    if (err instanceof NestedError) {
      error = (err as NestedError).innerError;
    }

    logger.error({ error }, message);

    if (OperationDetector.isCommerceToolsRequest(req)) {
      return this.makeCommerceToolsErrorResponse(message, error);
    }
    if (OperationDetector.isDatatransRequest(req)) {
      return this.makeDatatransErrorResponse(message);
    }
    return this.makeGeneralErrorResponse();
  }

  /**
   * Returns error for CommerceTools
   * @param err error
   * @returns Error in CommerceTools format
   */
  public static makeCommerceToolsErrorResponse(message: string, err: Record<string, unknown>) {
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
        message,
        errors: [commerceToolsError]
      }
    };
  }

  /**
   * Returns error for Datatrans
   * @param err error
   * @returns Error in Datatrans format
   */
  public static makeDatatransErrorResponse(message: string) {
    return {
      statusCode: HttpStatusCode.INTERNAL_SERVER_ERROR,
      body: {
        message
      }
    };
  }

  /**
   * Returns connector's internal error
   * @param err error
   * @returns Internal error
   */
  public static makeGeneralErrorResponse() {
    return {
      statusCode: HttpStatusCode.BAD_REQUEST,
      body: ''
    };
  }
}
