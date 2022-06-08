import { handler as  agnosticHandler } from '../environment-agnostic/index';
import { createApiGatewayHandler } from './aws/api-gateway-adapter';

const targetEnvVariableName = 'TARGET_ENVIRONMENT';

enum TargetEnvironment {
  AWS_LAMBDA_BEHIND_API_GATEWAY = 'AWS_LAMBDA_BEHIND_API_GATEWAY',
  // AWS_LAMBDA_DIRECTLY = 'AWS_LAMBDA_DIRECTLY',
  GCP_FUNCTION = 'GCP_FUNCTION'
}

let resultHandler;

switch(process.env[targetEnvVariableName]) {
  case TargetEnvironment.AWS_LAMBDA_BEHIND_API_GATEWAY:
    resultHandler = createApiGatewayHandler(agnosticHandler);
    break;
  // case TargetEnvironment.GCP_FUNCTION:
  //   resultHandler = createGoogleFunction(agnosticHandler);
  //   break;
  default:
    resultHandler = agnosticHandler;

}

export const handler = resultHandler;
