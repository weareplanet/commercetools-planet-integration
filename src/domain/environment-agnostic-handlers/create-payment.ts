import { AbstractRequest, AbstractResponse } from '../../interfaces';
import logger from '../services/log-service';
import { HttpStatusCode } from 'http-status-code-const-enum';
// import { PaymentService } from '../../services/payment-service';

export default async function handler(req: AbstractRequest): Promise<AbstractResponse> {
  // TODO: Take what's needed from req and leverage necessary services...
  // const paymentService = new PaymentService();
  // const result = await paymentService.initPayment();
  logger.trace('trace');
  logger.debug('debug');
  logger.info('info');
  logger.warn('warn');
  logger.error('error');
  logger.fatal('fatal');

  return {
    statusCode: HttpStatusCode.OK,
    body: { message: 'Hello World from create-payment handler!' }
  };
}
