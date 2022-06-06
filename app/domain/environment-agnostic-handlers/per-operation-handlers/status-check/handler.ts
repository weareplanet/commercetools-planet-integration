import { HttpStatusCode } from 'http-status-code-const-enum';
import { LogService } from '../../../services/log-service';
import { type Payment } from '@commercetools/platform-sdk';
import {
  IAbstractRequestWithTypedBody,
  IAbstractResponse
} from '../../../../interfaces';
import { IRequestBody } from './request-schema';
import { PaymentService } from '../../../services/payment-service';

export default async (req: IAbstractRequestWithTypedBody<IRequestBody>): Promise<IAbstractResponse> => {
  const logger = new LogService(req.traceContext);

  const paymentService = new PaymentService({ logger });
  const payment = req.body.resource?.obj as unknown as Payment;
  const actions = await paymentService.checkStatus(payment);

  logger.debug({ actions }, 'checkStatus results');

  return {
    statusCode: HttpStatusCode.OK,
    body: {
      actions
    }
  };
};
