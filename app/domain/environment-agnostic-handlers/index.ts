/*
This file must export handler(s) of type AbstractRequestHandler (not AbstractRequestHandlerWithTypedInput).
SO THAT THEIR CONSUMER DOESN'T CARE ABOUT THE REQUEST BODY SHAPE
(could pass any AbstractRequest and rely on that the handler will carry about the request shape validation).
---
Initially only a single `all-operations-handler` handler is re-exported here (it already provides AbstractRequestHandler).
If you decide to re-export here some lower-level handler (directly from `per-operation-handlers`),
please apply `input-validation` module to it (see how `all-operations-handler` does that).
*/

/*
WHAT A CONSUMER SHOULD CARE ABOUT is about how to use AbstractRequestHandler
in some specific environment, i.e. how to convert:
- AWS Lambda event -> into AbstractRequest and AbstractResponse -> into AWS Lambda response,
- GCP function request -> into AbstractRequest and AbstractResponse -> into GCP function response
etc.
For this purpose some wrapper from app/environment-specific-handlers can be used.
*/

export { handler as allOperationsHandler } from './all-operations-handler';
