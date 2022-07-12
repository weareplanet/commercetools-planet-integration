import handler from './handler';
import { RequestBodySchema, IRequestBody } from './request-schema';
import { wrapHandlerToValidateInput } from '../../request-validation';

export default wrapHandlerToValidateInput<IRequestBody>(handler, RequestBodySchema);
