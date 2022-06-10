import { AbstractRequest, AbstractResponse } from '../../interfaces';
import { HttpStatusCode } from 'http-status-code-const-enum';
// import { PaymentService } from '../../services/payment-service';

export default async function handler(req: AbstractRequest): Promise<AbstractResponse> {
  // TODO: Take what's needed from req and leverage necessary services...
  // const paymentService = new PaymentService();
  // const result = await paymentService.initPayment();

  return {
    statusCode: HttpStatusCode.OK,
    body: { message: 'Hello World from create-payment handler!' }
  };
}
