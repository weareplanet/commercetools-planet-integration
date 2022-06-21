import {
  AbstractRequestWithTypedBody,
  AbstractResponse
} from '../../../../interfaces';
import logger from '../../../services/log-service';
import { HttpStatusCode } from 'http-status-code-const-enum';
import { RequestBodySchemaType } from './request-schema';
// import { PaymentService } from '../../services/payment-service';

export default async (req: AbstractRequestWithTypedBody<RequestBodySchemaType>): Promise<AbstractResponse> => {
  // TODO: Take what's needed from req and leverage necessary services...
  // const paymentService = new PaymentService();
  // const result = await paymentService.initPayment();

  // NOTE: needed only for showing demo for story INC-39
  logger.trace('trace');
  logger.debug('debug');
  logger.info('info');
  logger.warn('warn');
  logger.error('error');
  logger.fatal('fatal');

  return {
    statusCode: HttpStatusCode.OK,
    body: { message: 'Hello World from create-payment handler!' } // TODO: form a meaningful response
  };
};
