//See: https://planet.atlassian.net/browse/INC-155

import { AwsApiGatewayAdapter } from './aws-lambda-http-adapter';
import { allOperationHandler as envAgnosticAllOpsHandler }  from '../../domain/environment-agnostic-handlers';

const awsApiGatewayAdapter = new AwsApiGatewayAdapter();

export const allOperationsHandler = awsApiGatewayAdapter.createEnvSpecificHandler(envAgnosticAllOpsHandler);

// Other (lower-level) handlers can be exported here in case of necessity,
// but that is not needed acccording to the single-function design.
