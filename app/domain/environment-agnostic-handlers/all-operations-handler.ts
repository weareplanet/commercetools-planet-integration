import { HttpStatusCode } from 'http-status-code-const-enum';
import {
  AbstractRequestWithTypedBody,
  AbstractResponse
} from '../../interfaces';

// Import all possible operation handlers (alongside with their request shape declarations)
import {
  handler as createPaymentHandler,
  RequestBodySchema as CreatePaymentRequestBodySchema,
  RequestBodySchemaType as CreatePaymentRequestBodySchemaType
} from './per-operation-handlers/create-payment';


///// PREPARE A MULTI-PURPOSE ABSTRACT HANDLER (A SINGLE FUNCTION WHICH IS ABLE TO PROCESS ANY OPERATION).

const handler = async <TRequestBody>(req: AbstractRequestWithTypedBody<TRequestBody>): Promise<AbstractResponse> => {
  // Delegate the request to a proper handler depending on the req content
  if (typeof req.body === 'object' /* TODO: condition for the call on a Payment creation */) {
    return createPaymentHandler(req as AbstractRequestWithTypedBody<CreatePaymentRequestBodySchemaType>); // TODO: think how to improve this brutal type cast
  }

  // if (/* req.body TODO: condition for the call on a Payment refund */) {
  //   return refundPaymentHandler(req);
  // }

  return {
    statusCode: HttpStatusCode.BAD_REQUEST,
    body: { message: 'No specific handler found for this request (incorrect request body?)' }
  };
};

// TODO: Combine request shapes for all handlers (from per-operation-handlers) covered by `handler`.
const RequestBodySchema = CreatePaymentRequestBodySchema; // | AnotherRequestBobySchema | YetAnotherRequestBobySchema
type RequestBodySchemaType = CreatePaymentRequestBodySchemaType; // | AnotherRequestBobySchemaType | YetAnotherRequestBobySchemaType
// Maybe it will be better to apply input-validation (like now ./index.ts does with anyOperationAbstractHandler)
// to every of low-level handlers separately,
// use them (already whapped) witin `handler`
// and export `handler` as AbstractRequestHandler rather than AbstractRequestWithTypedBody (as it is now) -
// in such a case we won't need to combine many request shapes into a single schema.

export {
  handler,
  RequestBodySchema, // This is exported to perform the validation (where handler is leveraged)
  RequestBodySchemaType // This is exported to parametrize the outer wrapper call - to make `req` structure controlled at the writing/compilation time
};
