// The problem described below relates to any environment adapter.
//
// TODO: IF AN ERROR HAPPENS SOMEWHERE BEFORE THE HANDLER BODY
// (in the "static initialization" phase, https://docs.aws.amazon.com/lambda/latest/operatorguide/static-initialization.html) -
// THE ERROR FORMAT WILL NOT CONFORM INC-57 REQUIREMENTS.
//
// To solve this problem we can enclose all this module body into `try`
// and export a "fallback" handler from the `catch`, i.e.:
//    try {
//       const AwsApiGatewayAdapter = require('./api-gateway-adapter');
//       // ... other requires (we have to use `require`)
//       exports.allOperationsHandler = awsApiGatewayAdapter.createEnvSpecificHandler(envAgnosticAllOpsHandler);
//    } catch(e) {
//      exports.allOperationsHandler = async(event) { // "fallback" handler
//         // Use ErrorsService.handleError() and return the error conforming INC-57 requirements
//      };
//    }
//}
// But there is an obstacle. If we want the "fallback" handler to conform INC-57 requirements -
// the shortest way for that is to (re)use `ErrorsService.handleError` -
// but it also can be a source of errors (first of all - due to its dependecies (on ConfigService etc.))!
// So we should either duplicate its logic here
// or rewrite it so that it becomes at least zero-dependent.

import { AwsApiGatewayAdapter } from './api-gateway-adapter';
import { allOperationHandler as envAgnosticAllOpsHandler }  from '../../domain/environment-agnostic-handlers';

const awsApiGatewayAdapter = new AwsApiGatewayAdapter();

export const allOperationsHandler = awsApiGatewayAdapter.createEnvSpecificHandler(envAgnosticAllOpsHandler);

// Other (lower-level) handlers can be exported here in case of necessity,
// but that is not needed acccording to the single-function design.
