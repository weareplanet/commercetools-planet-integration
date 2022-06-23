import { AwsApiGatewayAdapter } from './api-gateway-adapter';
import envAgnosticAllOpsHandler from '../../domain/environment-agnostic-handlers/all-operations-handler';

const awsApiGatewayAdapter = new AwsApiGatewayAdapter();

export const allOperationsHandler = awsApiGatewayAdapter.createEnvSpecificHandler(envAgnosticAllOpsHandler);

// Other (lower-level) handlers can be exported here in case of necessity,
// but that is not needed acccording to the single-function design.
