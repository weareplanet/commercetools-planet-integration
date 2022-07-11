import { HttpStatusCode } from 'http-status-code-const-enum';
import {
  IAbstractRequestWithTypedBody,
  IAbstractResponse
} from '../../../../interfaces';
import { PaymentService } from '../../../services/payment-service';
import { FailedValidationError } from '../../../services/errors-service';
import logger from '../../../services/log-service';
import { RequestBodySchemaType } from './request-schema';

export default async (req: IAbstractRequestWithTypedBody<RequestBodySchemaType>): Promise<IAbstractResponse> => {
  try {
    const paymentService = new PaymentService();
    const payment = req.body.resource?.obj;

    const actions = await paymentService.initRedirectAndLightbox(payment);

    return {
      statusCode: HttpStatusCode.OK,
      body: {
        actions,
      }
    };
  } catch (err) {
    logger.error(err);
    throw new FailedValidationError((err as Error).message, err);
  }
};
