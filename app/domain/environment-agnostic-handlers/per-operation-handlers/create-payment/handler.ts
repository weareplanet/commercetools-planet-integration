import { HttpStatusCode } from 'http-status-code-const-enum';
import { LogService } from '../../../services/log-service';
import {
  IAbstractRequestWithTypedBody,
  IAbstractResponse
} from '../../../../interfaces';
import { PaymentService } from '../../../services/payment-service';
import { IRequestBody } from './request-schema';

export default async (req: IAbstractRequestWithTypedBody<IRequestBody>): Promise<IAbstractResponse> => {
  const logger = new LogService(req.traceContext);

  const paymentService = new PaymentService({ logger });
  const payment = req.body.resource?.obj;
  const actions = await paymentService.initRedirectAndLightbox(payment);

  return {
    statusCode: HttpStatusCode.OK,
    body: {
      actions
    }
  };
};
