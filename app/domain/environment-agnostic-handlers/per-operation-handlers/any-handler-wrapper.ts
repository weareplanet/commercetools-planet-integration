import { AnyObjectSchema } from 'yup';
import {
  IAbstractRequest,
  IAbstractResponse,
  IAbstractRequestHandler,
  IAbstractRequestWithTypedBody,
  IAbstractRequestHandlerWithTypedInput,
} from '../../../interfaces';
import { LogService } from '../../services/log-service';
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
    const logger = new LogService(req.traceContext);
    const validateInput = () => {
      if (inputSchema) {
        const validationService = new InputValidationService({ logger });
        req.body = validationService.transformAndValidate(req.body, inputSchema, { strict: false });
      }
    };

    try {
      validateInput();
      return await lowLevelHandler(req as IAbstractRequestWithTypedBody<TRequestBody>);
    } catch (err) {
      const errorService = new ErrorsService({ logger });
      return errorService.handleError(req, err);
    }
  };
};
