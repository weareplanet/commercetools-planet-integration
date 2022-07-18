import { HttpStatusCode } from 'http-status-code-const-enum';
import { AnyObjectSchema } from 'yup';

import {
  IAbstractRequest,
  IAbstractResponse,
  IAbstractRequestHandler,
  IAbstractRequestWithTypedBody,
  IAbstractRequestHandlerWithTypedInput,
  ICommerceToolsError
} from '../../../interfaces';
import { isErrorForCommerceTools } from '../../services/errors-service';
import logger from '../../services/log-service';
import { InputValidationService } from '../../services/input-validation-service';
import { ErrorForCommerceTools } from '../../services/errors-service';

// A higher-level consumer (AWS adapter etc.) does not care about the request body shape -
// it just parses the request body into an object and provides AbstractRequest to AbstractRequestHandler.
// ---
// This function wraps a request shape-aware AbstractRequestHandlerWithTypedInput
// into a shape-unaware AbstractRequestHandler suitable for higher-level consumers.
// This wrpper also performs some logic (input validation, errror handling etc.) common for any low-level business handler.
export const wrapHandlerWithCommonLogic = <TRequestBody>(lowLevelHandler: IAbstractRequestHandlerWithTypedInput<TRequestBody>, inputSchema?: AnyObjectSchema): IAbstractRequestHandler => {
  return async (req: IAbstractRequest): Promise<IAbstractResponse> => {
    const validateInput = () => {
      if (inputSchema) {
        try {
          const validationService = new InputValidationService();
          req.body = validationService.transformAndValidate(req.body, inputSchema, { strict: false });
        } catch (err) {
          logger.error({ err }, 'Input validation error');
          throw new ErrorForCommerceTools(err.message, err);
        }
      }
    };

    try {
      validateInput();
      return await lowLevelHandler(req as IAbstractRequestWithTypedBody<TRequestBody>); // TODO: think how to improve this brutal type cast;
    } catch (err) {
      return handleError(err);
    }
  };

  function handleError(err: Error | ICommerceToolsError) {
    if (isErrorForCommerceTools(err as ICommerceToolsError)) {
    // `isErrorForCommerceTools` logic (based on the error type/constitution) can be replaced with
    // differentiating "Error for Datatrans" from "Error for Commercetools"
    // based on from where was the request (OperationDetector.isCommerceToolsRequest/isDatatransRequest).
    // Such change could simplify the logic of error throwing in low-level handlers
    // (for example, app/domain/environment-agnostic-handlers/per-operation-handlers/create-payment/handler.ts would then not create `ValidationErrorForCommerceTools`).
    // !? The only anti-argument is that while such a multi-client logic looks natural for app/domain/environment-agnostic-handlers/all-operations-handler,
    // it does not for any of app/domain/environment-agnostic-handlers/per-operation-handlers.
      return {
        statusCode: HttpStatusCode.BAD_REQUEST,
        body: {
          message: err.message,
          errors: [err]
        }
      };
    }

    return {
      statusCode: HttpStatusCode.INTERNAL_SERVER_ERROR,
      body: ''
    };
  }
};
