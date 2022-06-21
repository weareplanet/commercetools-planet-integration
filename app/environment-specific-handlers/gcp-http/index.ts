import { createApiGatewayHandler } from './adapter';
import { default as envAgnosticAllOpsHandler } from '../../domain/environment-agnostic-handlers/all-operations-handler';

export const allOperationsHandler = createApiGatewayHandler(envAgnosticAllOpsHandler);

// Theoretically other (more specific-purpose) handlers can be exported here in case of necessity.
