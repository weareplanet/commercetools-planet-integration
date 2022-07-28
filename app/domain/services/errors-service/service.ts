import { HttpStatusCode } from 'http-status-code-const-enum';
import { IAbstractRequest, IAbstractResponse, ICommerceToolsErrorCode, NestedError } from '../../../interfaces';
import { OperationDetector } from '../../environment-agnostic-handlers/all-operations-handler/operation-detector';
import { ServiceWithLogger } from '../log-service';

/**
 * This service handles and formats all connector errors
 */
export class ErrorsService extends ServiceWithLogger {

  /**
   * Formats the error according to the request type
   * @param req incoming request
   * @param err error
   * @returns Formatted error
   */
  public handleError(req: IAbstractRequest, err: Error | NestedError): IAbstractResponse {
    const message = err.message.toString();

    const error: Error = (err instanceof NestedError) ? err.innerError : err;

    this.logger.error({ error }, message);

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
  public makeCommerceToolsErrorResponse(message: string, err: Error) {
    delete (err as unknown as Record<string, unknown>)?.config;
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
  public makeDatatransErrorResponse(message: string) {
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
  public makeGeneralErrorResponse() {
    return {
      statusCode: HttpStatusCode.BAD_REQUEST,
      body: ''
    };
  }
}
