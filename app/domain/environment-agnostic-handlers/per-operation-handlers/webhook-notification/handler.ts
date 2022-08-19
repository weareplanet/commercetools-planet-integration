import { HttpStatusCode } from 'http-status-code-const-enum';
import { LogService } from '../../../services/log-service';
import {
  IAbstractRequestWithTypedBody,
  IAbstractResponse
} from '../../../../interfaces';
import { IRequestBody } from './request-schema';
import { PaymentService, DatatransToCommerceToolsMapper } from '../../../services/payment-service';
import { DatatransService } from '../../../services/datatrans-service';

export default async (req: IAbstractRequestWithTypedBody<IRequestBody>): Promise<IAbstractResponse> => {
  const logger = new LogService(req.traceContext);

  // Validate the signature of the received notification
  const datatransService = new DatatransService({ logger });

  datatransService.validateIncomingRequestSignature(
    req.body.merchantId, req.headers, req.rawBody
  );

  // Process the request body
  const paymentService = new PaymentService({ logger });
  await paymentService.saveAuthorizationInCommerceTools({
    rawRequestBody: req.rawBody,
    paymentKey: req.body.refno,
    paymentStatus: req.body.status,
    transactionId: req.body.transactionId,
    transactionHistory: req.body.history,
    // It would be good to hide DatatransToCommerceToolsMapper from the handler, but I even more want to kepp PaymentService abstracted from dealing with any "Request"
    ...DatatransToCommerceToolsMapper.inferCtPaymentMethodInfo(req.body) // req.body matches to the required argument type
  });

  return {
    statusCode: HttpStatusCode.OK,
    body: ''
  };
};
