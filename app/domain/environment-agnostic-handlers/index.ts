import { wrapHandlerToValidateInput } from './input-validation';

// Import all possible operation handlers (alongside with their request shape declarations)
import {
  handler as anyOperationAbstractHandler,
  RequestBodySchema as AnyOperationRequestBodySchema,
  RequestBodySchemaType as AnyOperationRequestBodySchemaType
} from './all-operations-handler';

/*
For Cloud providers (AWS, GCP, Azure etc.) any handler exported from this file
must be used (somewhere outside) via a Cloud-specific adapter would translate:
- AWS Lambda event -> into AbstractRequest and AbstractResponse -> into AWS Lambda response,
- GCP function request -> into AbstractRequest and AbstractResponse -> into GCP function response
etc. (see app/environment-specific-handlers).
---
Also you can use any exported handler directly (that's up to you).
---
Initially only a single multi-purpose handler is exported (see the root README).
Theoretically other, more specific-purpose handlers (like createPaymentHandler, for example), can be exported and deployed separately in case of necessity.
*/

///// WRAP ALL FUNCTIONS BEING EXPORTED SO THAT THEIR CONSUMER DOESN'T CARE ABOUT THE REQUEST SHAPE
// (the underlying handler cares about that).
export const allOperationsHandler = wrapHandlerToValidateInput<AnyOperationRequestBodySchemaType>(
  anyOperationAbstractHandler,
  AnyOperationRequestBodySchema
);
