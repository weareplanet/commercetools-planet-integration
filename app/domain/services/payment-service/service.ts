import { PaymentUpdateAction } from '@commercetools/platform-sdk';

import configService from '../config-service';
import logger from '../log-service';
import {
  CommerceToolsCustomInteractionType,
  ICommerceToolsPayment,
  DatatransTransactionStatus,
  DatatransPaymentMethod
} from '../../../interfaces';
import { DatatransService } from '../datatrans-service';
import { CommerceToolsActionsBuilder } from '../commerce-tools-actions-builder';
import { toInitializeTransaction } from '../datatrans-service/mapper';
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
  async initRedirectAndLightboxInit(payment: ICommerceToolsPayment): Promise<PaymentUpdateAction[]> {
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
        CommerceToolsCustomInteractionType.initRequest,
        { body: initializeTransactionPayload }
      )
      .addInterfaceInteraction(
        CommerceToolsCustomInteractionType.initResponse,
        { body: transaction, headers: { location } }
      )
      .setStatus({ interfaceCode: 'Initial' })
      .getActions();

    return actions;
  }

  async createAuthorizationTransaction(opts: CreateAuthorizationTransactionOptions) {
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
