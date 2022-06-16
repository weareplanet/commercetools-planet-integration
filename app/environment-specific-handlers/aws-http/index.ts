import { createApiGatewayHandler } from './api-gateway-adapter';
import {
  multipurposeHandler as envAgnosticmultipurposeHandler
} from '../../domain/environment-agnostic-handlers/index';


export const multipurposeHandler = createApiGatewayHandler(envAgnosticmultipurposeHandler);

// Theoretically other (more specific-purpose) handlers can be exported here in case of necessity.
