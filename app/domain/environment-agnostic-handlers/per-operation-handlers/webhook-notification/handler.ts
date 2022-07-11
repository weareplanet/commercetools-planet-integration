import {
  IAbstractRequestWithTypedBody,
  IAbstractResponse
} from '../../../../interfaces';
import { HttpStatusCode } from 'http-status-code-const-enum';
import { RequestBodySchemaType } from './request-schema';
import logger from '../../../services/log-service';
// import { PaymentService } from '../../../services/payment-service/service';
// import { DatatransService } from '../../../services/datatrans-service';

export default async (req: IAbstractRequestWithTypedBody<RequestBodySchemaType>): Promise<IAbstractResponse> => {
  logger.debug(req, 'Request from Datatrans');

  // const rawRequestBody = JSON.stringify(req.body);
  // At a higher level the raw request body was already a string - but that would look strange to pass it to here - so JSON.stringify it again...

  /// Validate the signature of the received notification
  // try {
  // DatatransService.validateIncomingRequestSignature(req.body.merchantId, req.headers, rawRequestBody);
  // } catch (err) {

  // }

  /// Process the request body
  // try {
  // const paymentService = new PaymentService();
  // paymentService.saveAuthorizationTransactionInCommerceTools({
  //   paymentKey: req.body.refno,
  //   paymentStatus: req.body.status,
  //   transactionId: req.body.transactionId,
  //   paymentMethod: req.body.paymentMethod,
  //   rawRequestBody
  // });
  // // } catch (err) {

  // // }

  // return {
  //   statusCode: HttpStatusCode.OK,
  //   body: { message: 'Hello from Webhook DRAFT!' }
  // };

  return {
    statusCode: HttpStatusCode.OK,
    body: { message: 'Hello World from webhook-notification handler!' } // TODO: form a meaningful response
  };
};
