import { HttpStatusCode } from 'http-status-code-const-enum';
import {
  IAbstractRequest,
  IAbstractResponse
} from '../../../interfaces';
import { logConnectorVersion } from '../../services/connector-version-service';
import configService from '../../services/config-service';

// Import all possible operation handlers
import createPaymentHandler from '../per-operation-handlers/create-payment';

///// PREPARE A MULTI-PURPOSE ABSTRACT HANDLER (A SINGLE FUNCTION WHICH IS ABLE TO PROCESS ANY OPERATION).

export default async (req: IAbstractRequest): Promise<IAbstractResponse> => {
  // Cross-envs connector initialization phase
  logConnectorVersion();

  configService.getConfig();

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
