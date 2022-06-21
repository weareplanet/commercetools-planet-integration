import handler from './handler';
import { RequestBodySchema, RequestBodySchemaType } from './request-schema';
import { wrapHandlerToValidateInput } from '../../request-validation';

export default wrapHandlerToValidateInput<RequestBodySchemaType>(handler, RequestBodySchema);
