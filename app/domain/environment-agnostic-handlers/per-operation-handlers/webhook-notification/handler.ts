import { HttpStatusCode } from 'http-status-code-const-enum';
import configService from '../../../services/config-service';
import {
  IAbstractRequestWithTypedBody,
  IAbstractResponse
} from '../../../../interfaces';
import { IRequestBody } from './request-schema';
import { PaymentService, DatatransToCommerceToolsMapper } from '../../../services/payment-service';
import { DatatransService } from '../../../services/datatrans-service';

export default async (req: IAbstractRequestWithTypedBody<IRequestBody>): Promise<IAbstractResponse> => {
  // Validate the signature of the received notification
  // TODO: when Datatrans starts to pass merchantId into the Webhook request -
  // delete `tempMerchantId` and use `req.body.merchantId` instead.
  const tempMerchantId = configService.getConfig().datatrans.merchants[0].id;
  DatatransService.validateIncomingRequestSignature(tempMerchantId, req.headers, req.rawBody);

  // Process the request body
  const paymentService = new PaymentService();
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
