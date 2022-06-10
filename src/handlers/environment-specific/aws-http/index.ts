import { multipurposeHandler as envAgnosticMuptipurposeHandler } from '../../environment-agnostic/index';
import { createApiGatewayHandler } from './api-gateway-adapter';

export const multipurposeHandler = createApiGatewayHandler(envAgnosticMuptipurposeHandler);

// Theoretically other (more specific-purpose) handlers can be exported here in case of necessity.
