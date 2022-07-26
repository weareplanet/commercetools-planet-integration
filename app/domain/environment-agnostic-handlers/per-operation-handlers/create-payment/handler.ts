import { HttpStatusCode } from 'http-status-code-const-enum';
import {
  IAbstractRequestWithTypedBody,
  IAbstractResponse
} from '../../../../interfaces';
import { PaymentService } from '../../../services/payment-service';
import { IRequestBody } from './request-schema';

export default async (req: IAbstractRequestWithTypedBody<IRequestBody>): Promise<IAbstractResponse> => {
  const paymentService = new PaymentService();
  const payment = req.body.resource?.obj;

  const actions = await paymentService.initRedirectAndLightbox(payment);

  return {
    statusCode: HttpStatusCode.OK,
    body: {
      actions,
    }
  };
};
