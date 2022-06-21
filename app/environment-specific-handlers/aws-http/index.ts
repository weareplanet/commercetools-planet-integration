import { createApiGatewayHandler } from './api-gateway-adapter';
import { default as envAgnosticAllOpsHandler } from '../../domain/environment-agnostic-handlers/all-operations-handler';

export const allOperationsHandler = createApiGatewayHandler(envAgnosticAllOpsHandler);
