import { type PaymentUpdateAction } from '@commercetools/platform-sdk';

import configService from '../config-service';
import {
  CommerceToolsCustomTypeKey,
  CommerceToolsCustomInteractionType,
  ICommerceToolsPayment,
  DatatransTransactionStatus,
  DatatransPaymentMethod,
  IDatatransTransactionHistory,
  CommerceToolsPaymentMethod
} from '../../../interfaces';
import { DatatransService, prepareInitializeTransactionRequestPayload } from '../datatrans-service';
import { CommerceToolsService } from '../commercetools-service';
import { DatatransToCommerceToolsMapper } from './dt-to-ct-mapper';

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
// - on a lower level - to communicate with CommerceTools and Datatrans this service uses CommerceToolsService and DatatransService correspondingly.
// This service can prepare some CT/DT structures (and use the corresponding CT/DT types for that), but it does not know how to pass them to 3-parties.
export class PaymentService {
  async initRedirectAndLightbox(payment: ICommerceToolsPayment): Promise<PaymentUpdateAction[]> {
    const { savedPaymentMethodAlias, savedPaymentMethodsKey, merchantId } = payment.custom.fields;
    const withSavedPaymentMethod = savedPaymentMethodAlias && savedPaymentMethodsKey;

    if (withSavedPaymentMethod) {
      await this.findPaymentMethod(savedPaymentMethodsKey, savedPaymentMethodAlias);
    }

    const initializeTransactionPayload = prepareInitializeTransactionRequestPayload(
      payment,
      configService.getConfig().datatrans.webhookUrl
    );

    const datatransService = new DatatransService();
    const { transaction, location } = await datatransService
      .createInitializeTransaction(merchantId, initializeTransactionPayload);

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
      timestamp: DatatransToCommerceToolsMapper.inferCtTransactionTimestamp(opts.transactionHistory),
      amount: {
        centAmount: payment.amountPlanned.centAmount,
        currencyCode: payment.amountPlanned.currencyCode
      },
      state: DatatransToCommerceToolsMapper.inferCtTransactionState(opts.paymentStatus),
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

  // TODO: it's validation and getting in one place,
  // what at lest does not follow our common design regarding validatiuons:
  // Consider moving this validation to where all other validations are implemented (in Yup schema):
  // https://github.com/weareplanet/commercetools-planet-integration/blob/main/app/interfaces/commerce-tools/payment.ts#L66
  private async findPaymentMethod(key: string, alias: string): Promise<CommerceToolsPaymentMethod> {
    const paymentMethods = await CommerceToolsService.getCustomObjects('savedPaymentMethods', key);
    const paymentMethod = paymentMethods?.value?.find((method) => {
      const paymentDetails = method.card;

      return paymentDetails?.alias === alias;
    });

    if (!paymentMethod) {
      // TODO: think about making specific errors. It will allow use different code in commerce tools error
      throw new Error('savedPaymentMethodAlias not found');
    }

    return paymentMethod;
  }
}
