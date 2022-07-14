import handler from './handler';
import { RequestBodySchema, IRequestBody }  from './request-schema';
import { wrapHandlerWithCommonLogic } from '../handler-wrapper';

export default wrapHandlerWithCommonLogic<IRequestBody>(handler, RequestBodySchema);
