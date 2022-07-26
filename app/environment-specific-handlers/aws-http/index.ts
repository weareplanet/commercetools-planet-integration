// TODO: If an error happens somewhere before handler body the error format will not conform INC-57.
import { AwsApiGatewayAdapter } from './api-gateway-adapter';
import { allOperationHandler as envAgnosticAllOpsHandler }  from '../../domain/environment-agnostic-handlers';

const awsApiGatewayAdapter = new AwsApiGatewayAdapter();

export const allOperationsHandler = awsApiGatewayAdapter.createEnvSpecificHandler(envAgnosticAllOpsHandler);

// Other (lower-level) handlers can be exported here in case of necessity,
// but that is not needed acccording to the single-function design.
