import { HttpStatusCode } from 'http-status-code-const-enum';
import logger from '../../../services/log-service';
import configService from '../../../services/config-service';
import {
  IAbstractRequestWithTypedBody,
  IAbstractResponse
} from '../../../../interfaces';
import { IRequestBody } from './request-schema';
import { PaymentService, DatatransToCommercetoolsMapper } from '../../../services/payment-service';
import { DatatransService } from '../../../services/datatrans-service';

export default async (req: IAbstractRequestWithTypedBody<IRequestBody>): Promise<IAbstractResponse> => {
  // Validate the signature of the received notification
  try {
    // TODO: when Datatrans starts to pass merchantId into the Webhook request -
    // delete `tempMerchantId` and use `req.body.merchantId` instead.
    const tempMerchantId = configService.getConfig().datatrans.merchants[0].id;
    DatatransService.validateIncomingRequestSignature(tempMerchantId, req.headers, req.rawBody);
  } catch (err) {
    return {
      statusCode: HttpStatusCode.BAD_REQUEST, // TODO: According to INC-57 we should return INTERNAL_SERVER_ERROR ?
      body: { message: err.message }
    };
  }

  // Process the request body
  try {
    const paymentService = new PaymentService();
    await paymentService.saveAuthorizationTransactionInCommerceTools({
      paymentKey: req.body.refno,
      paymentStatus: req.body.status,
      transactionId: req.body.transactionId,
      transactionHistory: req.body.history,
      paymentMethod: req.body.paymentMethod,
      // It would be good to hide DatatransToCommercetoolsMapper from the handler, but I even more want to abstract PaymentService from dealing with req.body
      paymentMethodInfo: DatatransToCommercetoolsMapper.inferCtPaymentInfo(req.body),
      rawRequestBody: req.rawBody
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
