import ConfigService from '../configs';

// This service implements the domain logic
// when necessary - does necessary requests to datatrans (using DatatransService).
export class PaymentService {
  config: unknown;

  constructor() {
    this.config = ConfigService.getConfig();
  }

  initPayment() {
    // It's temporary. We need it for providing some mock behavior for initiating ConfigService.
  }
  // refundTransaction(...)

}
