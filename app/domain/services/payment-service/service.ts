import { type PaymentUpdateAction } from '@commercetools/platform-sdk';

import configService from '../config-service';
import {
  CommerceToolsCustomTypeKey,
  CommerceToolsCustomInteractionType,
  ICommerceToolsPayment,
  DatatransTransactionStatus,
  DatatransPaymentMethod,
  IDatatransTransactionHistory
} from '../../../interfaces';
import { DatatransService, prepareInitializeTransactionRequestPaylod as prepareInitializeTransactionRequestPayload } from '../datatrans-service';
import { CommerceToolsService } from '../commercetools-service';
import { DatatransToCommercetoolsMapper } from './dt-to-ct-mapper';

interface CreateAuthorizationTransactionOptions {
  paymentKey: string;
  paymentStatus: DatatransTransactionStatus;
  transactionId: string;
  transactionHistory: IDatatransTransactionHistory;
  paymentMethod: DatatransPaymentMethod;
  paymentMethodInfo: string;
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

    const datatransService = new DatatransService();
    const { transaction, location } = await datatransService
      .createInitializeTransaction(payment.custom.fields.merchantId, initializeTransactionPayload);

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

    const actionsBuilder = CommerceToolsService.getActionsBuilder();

    actionsBuilder.setStatus({ interfaceCode: opts.paymentStatus });

    actionsBuilder.addInterfaceInteraction(CommerceToolsCustomInteractionType.webhook, opts.rawRequestBody);

    actionsBuilder.addTransaction({
      type: 'Authorization',
      timestamp: DatatransToCommercetoolsMapper.inferCtTransactionTimestamp(opts.transactionHistory),
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
          info: opts.paymentMethodInfo
        }
      }
    });

    await CommerceToolsService.updatePayment(payment, actionsBuilder.getActions());
  }
}
