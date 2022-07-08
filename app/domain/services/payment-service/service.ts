import { PaymentUpdateAction } from '@commercetools/platform-sdk';

import configService from '../config-service';
import logger from '../log-service';
import {
  CommerceToolsCustomInteractionType,
  ICommerceToolsPayment,
  DatatransTransactionStatus,
  DatatransPaymentMethod
} from '../../../interfaces';
import { DatatransService, prepareInitializeTransactionRequestPaylod } from '../datatrans-service';
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
// - from the higher level - a request handler should use this service to perform busines flows.
// - on a lower level - to communicate with CommerceTools and Datatrans this service uses CommerceToolsService and DtatransService correspondingly.
// This service can prepare some CT/DT structures (and use the corresponding CT/DT types for that), but it does not know how to pass them to 3-parties.
export class PaymentService {
  async initRedirectAndLightbox(payment: ICommerceToolsPayment): Promise<PaymentUpdateAction[]> {
    const initializeTransactionPayload = prepareInitializeTransactionRequestPaylod(
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

  async createAuthorizationTransactionInCommerceTools(opts: CreateAuthorizationTransactionOptions) {
    const commerceToolsService = new CommerceToolsService();
    const payment = await commerceToolsService.getPayment(opts.paymentKey);

    const currentTime = (new Date()).toISOString(); // UTC date & time in ISO 8601 format (YYYY-MM-DDThh:mm:ss.sssZ)

    // TODO: I order to adjust the approach with one Dmytro used in PR#19 -
    // instead of passing paymentDraft and transactionDraft to commerceToolsService.addTransactionToPayment:
    // prepare "actions" using Dmytro's CommerceToolsActionsBuilder (after PR#19 merge) -
    // and pass them into commerceToolsService.updatePayment.
    // What will be additionally needed is to extract the "custom type reference factory" from CommerceToolsActionsBuilder.addInterfaceInteraction
    // into a separate method (likely a static method of CommerceToolsActionsBuilder)
    // to reuse it in both CommerceToolsActionsBuilder.addInterfaceInteraction and
    // here for TransactionDraft.custom.type generation.
    await commerceToolsService.addTransactionToPayment({
      payment,
      paymentDraft: {
        paymentStatus: {
          interfaceCode: opts.paymentStatus
        },
        interfaceInteractions: [ // TODO: Dmytro's CommerceToolsActionsBuilder can be used here to generate the type
          {
            type: {
              typeId: 'type',
              key: 'pp-datatrans-interface-interaction-type'
            },
            interactionType: CommerceToolsCustomInteractionType.webhook,
            timeStamp: currentTime,
            message: opts.rawRequestBody
          }
        ]
      },
      transactionDraft: {
        type: 'Authorization',
        timestamp: currentTime,
        amount: {
          centAmount: payment.amountPlanned.centAmount,
          currencyCode: payment.amountPlanned.currencyCode
        },
        state: DatatransToCommercetoolsMapper.inferCtTransactionState(opts.paymentStatus),
        interactionId: opts.transactionId,
        custom: { // TODO: Dmytro's CommerceToolsActionsBuilder can be used here to generate the type
          type: {
            typeId: 'type',
            key: 'pp-datatrans-usedmethod-type'
          },
          fields: {
            paymentMethod: opts.paymentMethod
          }
        }
      }
    });
  }
}
