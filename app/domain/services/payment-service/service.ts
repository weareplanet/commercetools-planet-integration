import { type PaymentUpdateAction } from '@commercetools/platform-sdk';

import configService from '../config-service';
import logger from '../log-service';
import {
  CommerceToolsCustomTypeKey,
  CommerceToolsCustomInteractionType,
  ICommerceToolsPayment,
  DatatransTransactionStatus,
  DatatransPaymentMethod,
} from '../../../interfaces';
import { DatatransService, prepareInitializeTransactionRequestPaylod as prepareInitializeTransactionRequestPayload } from '../datatrans-service';
import { CommerceToolsService } from '../commercetools-service';
import { DatatransToCommercetoolsMapper } from './dt-to-ct-mapper';

interface CreateAuthorizationTransactionOptions {
  paymentKey: string;
  paymentStatus: DatatransTransactionStatus;
  transactionId: string;
  paymentMethod: DatatransPaymentMethod;
  rawRequestBody: string;
}

// This service implements DOMAIN LOGIC FLOWS.
// It is abstracted from HTTP communications and 3-parties:
// - from the higher level - a request handler should use this service to perform business flows.
// - on a lower level - to communicate with CommerceTools and Datatrans this service uses CommerceToolsService and DtatransService correspondingly.
// This service can prepare some CT/DT structures (and use the corresponding CT/DT types for that), but it does not know how to pass them to 3-parties.
export class PaymentService {
  async initRedirectAndLightbox(payment: ICommerceToolsPayment): Promise<PaymentUpdateAction[]> {
    const initializeTransactionPayload = prepareInitializeTransactionRequestPayload(
      payment,
      configService.getConfig().datatrans.webhookUrl
    );

    logger.debug({ body: initializeTransactionPayload }, 'DataTrans initRequest');

    const datatransService = new DatatransService();
    const { data: transaction, headers: { location } } = await datatransService
      .createInitializeTransaction(payment.custom.fields.merchantId, initializeTransactionPayload);

    logger.debug({ body: transaction, headers: { location } }, 'DataTrans initResponse');

    return CommerceToolsService.getActionsBuilder()
      .setCustomField('transactionId', transaction.transactionId)
      .setCustomField('redirectUrl', location)
      .addInterfaceInteraction(
        CommerceToolsCustomInteractionType.initRequest,
        { body: initializeTransactionPayload }
      )
      .addInterfaceInteraction(
        CommerceToolsCustomInteractionType.initResponse,
        { body: transaction, headers: { location } }
      )
      .setStatus({ interfaceCode: 'Initial' })
      .getActions();
  }

  async saveAuthorizationTransactionInCommerceTools(opts: CreateAuthorizationTransactionOptions) {
    const payment = await CommerceToolsService.getPayment(opts.paymentKey);

    logger.debug(payment, 'Payment fetched from CT, before update');

    const actionsBuilder = CommerceToolsService.getActionsBuilder();

    actionsBuilder.setStatus({ interfaceCode: opts.paymentStatus });

    actionsBuilder.addInterfaceInteraction(CommerceToolsCustomInteractionType.webhook, opts.rawRequestBody);

    actionsBuilder.addTransaction({
      type: 'Authorization',
      timestamp: (new Date()).toISOString(), // TODO: “date“ from the history entry with "action" : "authorize"
      amount: {
        centAmount: payment.amountPlanned.centAmount,
        currencyCode: payment.amountPlanned.currencyCode
      },
      state: DatatransToCommercetoolsMapper.inferCtTransactionState(opts.paymentStatus),
      interactionId: opts.transactionId,
      custom: {
        type: actionsBuilder.makeCustomTypeReference(CommerceToolsCustomTypeKey.PlanetPaymentUsedMethodType),
        fields: {
          paymentMethod: opts.paymentMethod,
          info: JSON.stringify({ paymentMethod: opts.paymentMethod })
        }
      }
    });

    await CommerceToolsService.updatePayment(payment, actionsBuilder.getActions());
  }
}
