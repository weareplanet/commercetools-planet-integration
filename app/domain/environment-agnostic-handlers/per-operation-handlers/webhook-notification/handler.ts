import { HttpStatusCode } from 'http-status-code-const-enum';
import logger from '../../../services/log-service';
import {
  IAbstractRequestWithTypedBody,
  IAbstractResponse
} from '../../../../interfaces';
import { IRequestBody } from './request-schema';
import { PaymentService } from '../../../services/payment-service/service';
import { DatatransService } from '../../../services/datatrans-service';

export default async (req: IAbstractRequestWithTypedBody<IRequestBody>): Promise<IAbstractResponse> => {
  logger.debug(req, 'Request from Datatrans');

  // At a higher level the raw request body was already a string -
  // but that would look strange to pass it to here - so JSON.stringify the parsed body again...
  const rawRequestBody = JSON.stringify(req.body);

  // Validate the signature of the received notification
  try {
    DatatransService.validateIncomingRequestSignature(req.body.merchantId, req.headers, rawRequestBody);
  } catch (err) {
    logger.debug(err, 'Error of Datatrans signature validation');
    return {
      statusCode: HttpStatusCode.BAD_REQUEST, // TODO: According to INC-57 we should return INTERNAL_SERVER_ERROR ?
      body: { message: err.message }
    };
  }

  // Process the request body
  try {
    const paymentService = new PaymentService();
    paymentService.saveAuthorizationTransactionInCommerceTools({
      paymentKey: req.body.refno,
      paymentStatus: req.body.status,
      transactionId: req.body.transactionId,
      paymentMethod: req.body.paymentMethod,
      rawRequestBody
    });
  } catch (err) {
    logger.debug(err, 'Error of updating the Payment in CommerceTools');
    return {
      statusCode: HttpStatusCode.INTERNAL_SERVER_ERROR, // TODO: According to INC-57 we should return INTERNAL_SERVER_ERROR ?
      body: { message: err.message }
    };
  }

  return {
    statusCode: HttpStatusCode.OK,
    body: { message: 'Hello World from webhook-notification handler!' } // TODO: form a meaningful response
  };
};
