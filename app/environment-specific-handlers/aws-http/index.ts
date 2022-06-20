import { createApiGatewayHandler } from './api-gateway-adapter';
import { default as envAgnosticAllOpsHandler } from '../../domain/environment-agnostic-handlers/all-operations-handler';


export const allOperationsHandler = createApiGatewayHandler(envAgnosticAllOpsHandler);

// Other (lower-level) handlers can be exported here in case of necessity,
// but that is not needed acccording to the single-function design.
