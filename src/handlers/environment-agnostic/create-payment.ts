import { EnvironmentAgnosticRequest, EnvironmentAgnosticResponse } from '../../interfaces';
import { HttpStatusCode } from 'http-status-code-const-enum';
// import { PaymentService } from '../../services/payment-service';

export default async function handler(req: EnvironmentAgnosticRequest): Promise<EnvironmentAgnosticResponse> {
  // TODO: Business logic (with use of Services)
  // const paymentService = new PaymentService();
  // const result = await paymentService.initPayment();

  // TODO: Fill res
  return {
    statusCode: HttpStatusCode.OK,
    body: 'Fake response from create-payment handler'
  };
}
