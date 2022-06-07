import { EnvironmentAgnosticRequest, EnvironmentAgnosticResponse } from '../../interfaces';
import createPaymentHandler from './create-payment';

// For Cloud providers (AWS, GCP, Azure etc.) this handler
// must be wrapped into a Cloud-specific adapter which will translate:
// AWS Lambda event - into EnvironmentAgnosticRequest and EnvironmentAgnosticResponse - into AWS Lambda response,
// GCP function event - into EnvironmentAgnosticRequest and EnvironmentAgnosticResponse - into GCP function response
// etc. (see https://github.com/southworks/multicloud/tree/dev-gcp-module for insights).
// ---
// In a monolith application (express-based for example) it can be used directly.
export default async function multiPurposeHandler(req: EnvironmentAgnosticRequest): Promise<EnvironmentAgnosticResponse> {

  // Delegate the request to a proper handler depending on the req content

  if (req.body /*some specific check*/) {
    return createPaymentHandler(req);
  }

  // if (/*req.body...*/) {
  //   return refundPaymentHandler(req);
  // }

}
