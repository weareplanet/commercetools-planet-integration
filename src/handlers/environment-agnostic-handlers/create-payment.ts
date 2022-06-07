import { EnvironmentAgnosticRequest, EnvironmentAgnosticResponse } from '../../interfaces';
import { PaymentService } from '../../services/payment-service';

export default async function handler(req: EnvironmentAgnosticRequest): Promise<EnvironmentAgnosticResponse> {
  // TODO: Business logic (with use of Services)
  const paymentService = new PaymentService();
  // const result = await paymentService.initPayment();

  let res: EnvironmentAgnosticResponse;
  // TODO: Fill res
  return res;
}
