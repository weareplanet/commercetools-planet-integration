import { HttpStatusCode } from 'http-status-code-const-enum';
import {
  AbstractRequest,
  AbstractResponse
} from '../../../interfaces';

// Import all possible operation handlers
import createPaymentHandler from '../per-operation-handlers/create-payment';

///// PREPARE A MULTI-PURPOSE ABSTRACT HANDLER (A SINGLE FUNCTION WHICH IS ABLE TO PROCESS ANY OPERATION).

export default async (req: AbstractRequest): Promise<AbstractResponse> => {
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
};
