import handler from './handler';
import { DatatransWebhookRequestBodySchema, IDatatransWebhookRequestBody } from './request-schema';
import { wrapHandlerToValidateInput } from '../../request-validation';

export default wrapHandlerToValidateInput<IDatatransWebhookRequestBody>(handler, DatatransWebhookRequestBodySchema);
