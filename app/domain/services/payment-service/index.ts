// This service implements the domain logic
// when necessary - does necessary requests to datatrans (using DatatransService).
import { PaymentUpdateAction } from '@commercetools/platform-sdk';

import { InterfaceInteractionType, ICommerceToolsPaymentType } from '../../../interfaces';
import logger from '../log-service';
import { DatatransService } from '../datatrans-service';
import { CommerceToolsActionsBuilder } from '../commerce-tools-actions-builder';
import { toInitializeTransaction } from '../datatrans-service/mapper';
import configService from '../config-service';

export class PaymentService {
  async initRedirectAndLightboxInit(payment: ICommerceToolsPaymentType): Promise<PaymentUpdateAction[]> {
    const datatransConfig = configService.getConfig().datatrans;
    const datatransService = new DatatransService();
    const actionsBuilder = new CommerceToolsActionsBuilder();
    const initializeTransactionPayload = toInitializeTransaction(payment, datatransConfig.webhookUrl);
    logger.debug({ body: initializeTransactionPayload }, 'DataTrans initRequest');

    const { data: transaction, headers: { location } } = await datatransService
      .createInitializeTransaction(payment.custom?.fields?.merchantId, initializeTransactionPayload);

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
