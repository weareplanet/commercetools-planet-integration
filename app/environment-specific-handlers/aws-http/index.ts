import { createApiGatewayHandler } from './api-gateway-adapter';
import {
  allOperationsHandler as envAgnosticAllOpsHandler
} from '../../domain/environment-agnostic-handlers/index';


export const allOperationsHandler = createApiGatewayHandler(envAgnosticAllOpsHandler);

// Theoretically other (more specific-purpose) handlers can be exported here in case of necessity.
