import {
  IAbstractRequestWithTypedBody,
  IAbstractResponse
} from '../../../../interfaces';
import { HttpStatusCode } from 'http-status-code-const-enum';
import { RequestBodySchemaType } from './request-schema';
// import { PaymentService } from '../../services/payment-service';

export default async (req: IAbstractRequestWithTypedBody<RequestBodySchemaType>): Promise<IAbstractResponse> => {
  // TODO: Take what's needed from req and leverage necessary services...
  // const paymentService = new PaymentService();
  // await paymentService.initPayment();

  return {
    statusCode: HttpStatusCode.OK,
    body: { message: 'Hello World from create-payment handler!' } // TODO: form a meaningful response
  };
};
