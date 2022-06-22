import {
  AbstractRequestWithTypedBody,
  AbstractResponse
} from '../../../../interfaces';
import { HttpStatusCode } from 'http-status-code-const-enum';
import { RequestBodySchemaType } from './request-schema';
import configService from '../../../services/configs';
// import { PaymentService } from '../../services/payment-service';

export default async (req: AbstractRequestWithTypedBody<RequestBodySchemaType>): Promise<AbstractResponse> => {
  // TODO: Take what's needed from req and leverage necessary services...
  // const paymentService = new PaymentService();
  // await paymentService.initPayment();

  configService.getConfig();

  return {
    statusCode: HttpStatusCode.OK,
    body: { message: 'Hello World from create-payment handler!' } // TODO: form a meaningful response
  };
};
