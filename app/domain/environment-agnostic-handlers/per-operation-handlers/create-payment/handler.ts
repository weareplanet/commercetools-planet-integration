import {
  IAbstractRequestWithTypedBody,
  IAbstractResponse
} from '@app/interfaces/handler-specific';
import { HttpStatusCode } from 'http-status-code-const-enum';
import { RequestBodySchemaType } from './request-schema';
import { PaymentService } from '@domain/services/payment-service';
import { FailedValidationError } from '@domain/services/errors';
import logger from '@domain/services/log-service';

export default async (req: IAbstractRequestWithTypedBody<RequestBodySchemaType>): Promise<IAbstractResponse> => {
  try {
    const paymentService = new PaymentService();
    const payment = req.body.resource?.obj;

    const actions = await paymentService.initRedirectAndLightboxInit(payment);

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
