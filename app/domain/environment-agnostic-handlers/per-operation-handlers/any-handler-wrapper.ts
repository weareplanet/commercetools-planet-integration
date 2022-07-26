import { AnyObjectSchema } from 'yup';
import {
  IAbstractRequest,
  IAbstractResponse,
  IAbstractRequestHandler,
  IAbstractRequestWithTypedBody,
  IAbstractRequestHandlerWithTypedInput,
  NestedError
} from '../../../interfaces';
import logger from '../../services/log-service';
import { InputValidationService } from '../../services/input-validation-service';
import { ErrorsService } from '../../services/errors-service';

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
          throw new NestedError(err, 'Input validation error');
        }
      }
    };

    try {
      // place for parsing request body
      validateInput();
      return await lowLevelHandler(req as IAbstractRequestWithTypedBody<TRequestBody>); // TODO: think how to improve this brutal type cast;
    } catch (err) {
      if (err instanceof NestedError) {
        const structuredError = err as NestedError;
        logger.error(structuredError.message);
        return ErrorsService.handleError(req, structuredError.error);
      }
      logger.error(err.message);
      return ErrorsService.handleError(req, err);
    }
  };
};
