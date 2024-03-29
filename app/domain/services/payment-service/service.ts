import {
  type Payment,
  type Transaction,
  type PaymentUpdateAction
} from '@commercetools/platform-sdk';

import { ServiceWithLogger, ServiceWithLoggerOptions } from '../log-service';
import { ConfigService } from '../config-service';
import {
  CommerceToolsCustomTypeKey,
  CommerceToolsCustomInteractionType,
  ICommerceToolsPayment,
  ICommerceToolsCustomPaymentMethodsObject,
  DatatransTransactionStatus,
  IDatatransTransactionHistory,
  IDatatransPaymentMethodInfo,
  DatatransPaymentMethod,
  ErrorMessages
} from '../../../interfaces';
import {
  DatatransService,
  prepareInitializeTransactionRequestPayload,
  prepareRefundTransactionRequestPayload
} from '../datatrans-service';
import { CommerceToolsService } from '../commercetools-service';
import { DatatransToCommerceToolsMapper, PaymentMethodInfoForCommerceTools } from './dt-to-ct-mapper';
import { CommerceToolsPaymentActionsBuilder } from '../commercetools-service/commerce-tools-payment-actions-builder';

type SaveAuthorizationOptions = {
  rawRequestBody: string;
  paymentKey: string;
  paymentStatus: DatatransTransactionStatus;
  transactionId: string;
  transactionHistory: IDatatransTransactionHistory;
} & PaymentMethodInfoForCommerceTools;

const PAYMENT_METHODS_CUSTOM_OBJECT_CONTAINER_NAME = 'savedPaymentMethods';

// This service implements DOMAIN LOGIC FLOWS.
// It is abstracted from HTTP communications and 3-parties:
// - from the higher level - a request handler should use this service to perform business flows.
// - on a lower level - to communicate with CommerceTools and Datatrans this service uses CommerceToolsService and DatatransService correspondingly.
// This service can prepare some CT/DT structures (and use the corresponding CT/DT types for that), but it does not know how to pass them to 3-parties.
export class PaymentService extends ServiceWithLogger {
  private commerceToolsService: CommerceToolsService;
  private datatransService: DatatransService;

  constructor({ logger }: ServiceWithLoggerOptions) {
    super({ logger });
    this.commerceToolsService = new CommerceToolsService({ logger });
    this.datatransService = new DatatransService({ logger });
  }

  async initRedirectAndLightbox(payment: ICommerceToolsPayment): Promise<PaymentUpdateAction[]> {
    const { savedPaymentMethodAlias, savedPaymentMethodsKey, merchantId } = payment.custom.fields;

    let savedPaymentMethod;
    const needToUseSavedPaymentMethod = savedPaymentMethodAlias && savedPaymentMethodsKey;
    if (needToUseSavedPaymentMethod) {
      savedPaymentMethod = await this.validateSavedPaymentMethodExistence(savedPaymentMethodsKey, savedPaymentMethodAlias);
    }

    const initializeTransactionPayload = prepareInitializeTransactionRequestPayload({
      payment,
      webhookUrl: new ConfigService().getConfig().datatrans.webhookUrl,
      savedPaymentMethod
    });

    const { transaction, location } = await this.datatransService.createInitializeTransaction(merchantId, initializeTransactionPayload);

    return this.commerceToolsService.getActionsBuilder()
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

  async saveAuthorizationInCommerceTools(opts: SaveAuthorizationOptions) {
    const payment = await this.commerceToolsService.getPayment(opts.paymentKey);

    await this.saveAuthorizationToPayment(payment, opts);

    await this.savePaymentMethodToCustomObject(payment, opts.ctCustomPaymentMethod);
  }

  async checkStatus(payment: Payment): Promise<PaymentUpdateAction[]> {
    const transactionsToBeChecked = payment.transactions.filter((t) => {
      return ['Authorization', 'Refund'].includes(t.type);
    });

    const actionsBuilder = this.commerceToolsService.getActionsBuilder().withPayment(payment);
    const getActionsByTransaction = (t: Transaction) => {
      return this.handleTransactionStatusUpdate(payment, t, actionsBuilder);
    };

    await Promise.all(
      transactionsToBeChecked.map((t: Transaction) => getActionsByTransaction(t))
    );

    // Prevent an excess status check processing (on a next Payment update even if the merchant did not request that).
    actionsBuilder.setCustomField('action', null);

    return actionsBuilder.getActions();
  }

  private async handleTransactionStatusUpdate(payment: Payment, transaction: Transaction, actionsBuilder: CommerceToolsPaymentActionsBuilder): Promise<void> {
    const { merchantId } = payment.custom.fields;

    const statusResponseBody = await this.datatransService.getTransactionStatus(merchantId, transaction.interactionId);

    actionsBuilder.addInterfaceInteraction(
      CommerceToolsCustomInteractionType.statusResponse,
      { body: statusResponseBody }
    );

    switch (transaction.type) {
      case 'Authorization':
        actionsBuilder.setStatus({ interfaceCode: statusResponseBody.status });
        await this.savePaymentMethodToCustomObject(
          payment,
          DatatransToCommerceToolsMapper.inferCtPaymentMethodInfo(statusResponseBody).ctCustomPaymentMethod
        );
      // do not break - fall through - below is a common logic for both Authorization and Refund
      case 'Refund':
        actionsBuilder.changeTransactionState(transaction, DatatransToCommerceToolsMapper.inferCtTransactionState(statusResponseBody.status));
        break;
      default:
      // ignore a transaction of any other type
    }
  }

  async refund(payment: ICommerceToolsPayment): Promise<PaymentUpdateAction[]> {
    const authorizationTransaction: Transaction =
      (payment as unknown as Payment)
        .transactions
        .find((t) => t.type === 'Authorization');
    const refundTransaction: Transaction =
      (payment as unknown as Payment)
        .transactions
        .find((t) => t.state === 'Initial' && !t.interactionId);
    const refundTransactionPayload = prepareRefundTransactionRequestPayload(payment.key, refundTransaction);

    const { merchantId } = payment.custom.fields;
    const {
      transaction: transactionFromDatatrans
    } = await this.datatransService.createRefundTransaction(merchantId, authorizationTransaction.interactionId, refundTransactionPayload);

    return this.commerceToolsService.getActionsBuilder()
      .addInterfaceInteraction(
        CommerceToolsCustomInteractionType.refundRequest,
        { body: refundTransactionPayload }
      )
      .addInterfaceInteraction(
        CommerceToolsCustomInteractionType.refundResponse,
        { body: transactionFromDatatrans }
      )
      .changeTransactionState(refundTransaction, 'Success')
      .changeTransactionInteractionId(refundTransaction, transactionFromDatatrans.transactionId)
      .getActions();
  }

  private async saveAuthorizationToPayment(payment: Payment, opts: SaveAuthorizationOptions) {
    const actionsBuilder = this.commerceToolsService.getActionsBuilder().withPayment(payment);

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
          paymentMethod: opts.ctCustomPaymentMethod.paymentMethod,
          info: opts.paymentDetailsSerialized
        }
      }
    });

    await this.commerceToolsService.updatePayment(payment, actionsBuilder.getActions());
  }

  // see: https://planet.atlassian.net/browse/INC-154
  private async validateSavedPaymentMethodExistence(methodKey: string, alias: string): Promise<IDatatransPaymentMethodInfo> {
    const paymentMethod = await this.findPaymentMethod(methodKey, alias);

    if (!paymentMethod) {
      throw new Error(ErrorMessages.savedPaymentMethodsKeyOrAliasNotFound());
    }
    return paymentMethod;
  }

  private async findPaymentMethod(methodKey: string, alias: string): Promise<IDatatransPaymentMethodInfo> {
    const paymentMethodsObject = await this.commerceToolsService.getCustomObject(PAYMENT_METHODS_CUSTOM_OBJECT_CONTAINER_NAME, methodKey);
    return this.getPaymentMethodByAlias(paymentMethodsObject, alias);
  }

  private getPaymentMethodByAlias(paymentMethodsObject: ICommerceToolsCustomPaymentMethodsObject, alias: string): IDatatransPaymentMethodInfo {
    return paymentMethodsObject?.value?.find((method) => {
      const currentMethodAlias = DatatransToCommerceToolsMapper.getPaymentMethodDetails(method).details.alias;
      return currentMethodAlias === alias;
    });
  }

  private getPaymentMethodsExceptFingerprint(paymentMethodsObject: ICommerceToolsCustomPaymentMethodsObject, fingerprint: string): IDatatransPaymentMethodInfo[] {
    return paymentMethodsObject?.value?.filter((method) => {
      const currentFingerprint = DatatransToCommerceToolsMapper.getPaymentMethodDetails(method)?.details?.fingerprint;
      return currentFingerprint != fingerprint;
    });
  }

  private async savePaymentMethodToCustomObject(payment: Payment, paymentMethodInfo: IDatatransPaymentMethodInfo) {
    if (!(payment as unknown as ICommerceToolsPayment).custom.fields.savePaymentMethod) {
      return; // it is not requested to save the payment method for this payment
    }
    if (paymentMethodInfo.card?.walletIndicator) {
      this.logger.debug(`Ignoring savePaymentMethod=true for a Wallet payment (${paymentMethodInfo.card?.walletIndicator})`);
      return; // we don’t support recurrent payments for wallets
    }
    if ([
      DatatransPaymentMethod.GPA,
      DatatransPaymentMethod.DEA,
      DatatransPaymentMethod.PSC,
      DatatransPaymentMethod.SAM,
      DatatransPaymentMethod.ELV
    ].includes(paymentMethodInfo.paymentMethod)) {
      this.logger.debug(`Ignoring savePaymentMethod=true for ${paymentMethodInfo.paymentMethod} APM`);
      return; // we don’t support recurrent payments for some APMs (see INC-125)
    }

    const { savedPaymentMethodsKey } = payment.custom.fields;

    const paymentMethodDetailsToBeSaved = DatatransToCommerceToolsMapper.getPaymentMethodDetails(paymentMethodInfo);

    const paymentMethodsObject = await this.commerceToolsService.getCustomObject(PAYMENT_METHODS_CUSTOM_OBJECT_CONTAINER_NAME, savedPaymentMethodsKey);

    if (paymentMethodsObject) {
      const paymentMethod = this.getPaymentMethodByAlias(paymentMethodsObject, paymentMethodDetailsToBeSaved.details.alias);
      if (paymentMethod) { // This payment method is already saved
        return;
      }
    }

    let valueToBeSaved = [
      {
        paymentMethod: paymentMethodInfo.paymentMethod,
        [paymentMethodDetailsToBeSaved.name]: paymentMethodDetailsToBeSaved.details
      }
    ];

    if (paymentMethodsObject) { // Need to amend already existing Custom Object
      const fingerprint = paymentMethodDetailsToBeSaved.details?.fingerprint;

      const savedValues = fingerprint
        ? this.getPaymentMethodsExceptFingerprint(paymentMethodsObject, fingerprint)
        : paymentMethodsObject.value;

      valueToBeSaved = savedValues.concat(valueToBeSaved);
    }

    await this.commerceToolsService.createOrUpdateCustomObject(PAYMENT_METHODS_CUSTOM_OBJECT_CONTAINER_NAME, savedPaymentMethodsKey, valueToBeSaved);
  }
}
