import { AbstractRequest, AbstractResponse } from '../../interfaces';
import createPaymentHandler from './create-payment';
import { HttpStatusCode } from 'http-status-code-const-enum';

// For Cloud providers (AWS, GCP, Azure etc.) this handler
// must be wrapped into a Cloud-specific adapter which will translate:
// AWS Lambda event - into AbstractRequest and AbstractResponse - into AWS Lambda response,
// GCP function event - into AbstractRequest and AbstractResponse - into GCP function response
// etc. (see https://github.com/southworks/multicloud/tree/dev-gcp-module for insights).
// ---
// In a monolith application (express-based for example) it can be used directly.
export async function multipurposeHandler(req: AbstractRequest): Promise<AbstractResponse> {
  // try {
  // Delegate the request to a proper handler depending on the req content

  if (typeof req.body === 'object' /* TODO: condition for the call on a Payment creation */) {
    return createPaymentHandler(req);
  }

  // if (/* req.body TODO: condition for the call on a Payment refund */) {
  //   return refundPaymentHandler(req);
  // }

  return {
    statusCode: HttpStatusCode.BAD_REQUEST,
    body: { message: 'No specific handler found for this request (incorrect request body?)' }
  };
  // } catch (e) {
  //   // TODO: process here all cloud-agnostic errors (which rather relate to the underlying business logic)
  //   throw e;
  // }
}

// Theoretically other (more specific-purpose ones, like createPaymentHandler) handlers can be exported here in case of necessity.
