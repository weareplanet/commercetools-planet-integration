import { HttpStatusCode } from 'http-status-code-const-enum';
import { AnyObjectSchema } from 'yup';
import logger from '../services/log-service';
import {
  AbstractRequest,
  AbstractResponse,
  AbstractRequestHandler,
  AbstractRequestWithTypedBody,
  AbstractRequestHandlerWithTypedInput
} from '../../interfaces';
import { InputValidationService } from '../services/input-validation-service';

// A higher-level consumer (AWS adapter etc.) does not care about the request body shape -
// it just parses the request body into an object and provides AbstractRequest to AbstractRequestHandler.
// ---
// This function wraps a request shape-aware AbstractRequestHandlerWithTypedInput
// into a shape-unaware AbstractRequestHandler suitable for higher-level consumers.
export const wrapHandlerToValidateInput = <TRequestBody>(lowLevelHandler: AbstractRequestHandlerWithTypedInput<TRequestBody>, inputSchema?: AnyObjectSchema): AbstractRequestHandler => {
  return async (req: AbstractRequest): Promise<AbstractResponse> => {
    if (!inputSchema) {
      req.body = {}; // TODO: think more about correctness of this
    } else {
      try {
        const validationService = new InputValidationService();
        req.body = validationService.transformAndValidate(req.body, inputSchema, { strict: false });
      } catch (err) {
        logger.error({ err }, 'Input validation error');
        return {
          statusCode: HttpStatusCode.BAD_REQUEST,
          body: { message: err.message }
        };
      }
    }

    return lowLevelHandler(req as AbstractRequestWithTypedBody<TRequestBody>); // TODO: think how to improve this brutal type cast
  };
};
