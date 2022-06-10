import { multipurposeHandler as envAgnosticMuptipurposeHandler } from '../../domain/environment-agnostic-handlers/index';
import { createApiGatewayHandler } from './adapter';

export const multipurposeHandler = createApiGatewayHandler(envAgnosticMuptipurposeHandler);

// Theoretically other (more specific-purpose) handlers can be exported here in case of necessity.
