import { muptipurposeHandler as envAgnosticMuptipurposeHandler } from '../environment-agnostic/index';
import { createApiGatewayHandler } from './aws/api-gateway-adapter';

const targetEnvVariableName = 'TARGET_ENVIRONMENT';

export enum TargetEnvironment {
  AWS_LAMBDA_BEHIND_API_GATEWAY = 'AWS_LAMBDA_BEHIND_API_GATEWAY',
  // AWS_LAMBDA_DIRECTLY = 'AWS_LAMBDA_DIRECTLY',
  // GCP_FUNCTION = 'GCP_FUNCTION'
}

let choosenHandler;

switch (process.env[targetEnvVariableName]) {
  case TargetEnvironment.AWS_LAMBDA_BEHIND_API_GATEWAY:
    choosenHandler = createApiGatewayHandler(envAgnosticMuptipurposeHandler);
    break;
  // case TargetEnvironment.GCP_FUNCTION:
  //   choosenHandler = createGoogleFunction(envAgnosticHandler);
  //   break;
  // default:
  //   choosenHandler = envAgnosticHandler;

}

export const muptipurposeHandler = choosenHandler;
