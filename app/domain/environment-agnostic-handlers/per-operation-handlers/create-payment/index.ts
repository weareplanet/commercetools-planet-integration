import handler from './handler';
import { RequestBodySchema, IRequestBody } from './request-schema';
import { wrapHandlerWithCommonLogic } from '../any-handler-wrapper';

export default wrapHandlerWithCommonLogic<IRequestBody>(handler, RequestBodySchema);
