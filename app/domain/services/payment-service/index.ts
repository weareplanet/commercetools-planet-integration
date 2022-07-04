// This service implements the domain logic
// when necessary - does necessary requests to datatrans (using DatatransService).
import { InterfaceInteractionType, PaymentUpdateActions } from '@app/interfaces';
import { PaymentSchemaType } from '@domain/environment-agnostic-handlers/per-operation-handlers/create-payment/request-schema';

import logger from '../log-service';
import { DatatransService } from '../datatrans-service';
import { CommerceToolsActionsBuilder } from '../commerce-tools-actions-builder';
import { toInitializeTransaction } from '../datatrans-service/mapper';

export class PaymentService {
  async initRedirectLightboxPayment(payment: PaymentSchemaType): Promise<PaymentUpdateActions[]> {
    const datatransService = new DatatransService();
    const actionsBuilder = new CommerceToolsActionsBuilder();
    const initializeTransactionPayload = toInitializeTransaction(payment);
    const { data: transaction, headers: { location } } = await datatransService
      .createInitializeTransaction(initializeTransactionPayload);

    logger.debug({ body: initializeTransactionPayload }, 'DataTrans initRequest');
    logger.debug({ body: transaction, headers: { location } }, 'DataTrans initResponse');

    const actions = actionsBuilder
      .setCustomField('transactionId', transaction.transactionId)
      .setCustomField('redirectUrl', location)
      .addInterfaceInteraction(
        InterfaceInteractionType.InitRequest,
        { body: initializeTransactionPayload }
      )
      .addInterfaceInteraction(
        InterfaceInteractionType.InitResponse,
        { body: transaction, headers: { location } }
      )
      .setStatus({ interfaceCode: 'Initial' })
      .getActions();

    return actions;
  }

  // initPaymentWithSecurityFields(...)
  // refundTransaction(...)

}
