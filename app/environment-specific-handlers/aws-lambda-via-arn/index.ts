import { AwsArnGatewayAdapter } from './aws-lambda-arn-adapter';
import { allOperationHandler as envAgnosticAllOpsHandler }  from '../../domain/environment-agnostic-handlers';

const awsApiGatewayAdapter = new AwsArnGatewayAdapter();

export const allOperationsHandler = awsApiGatewayAdapter.createEnvSpecificHandler(envAgnosticAllOpsHandler);
