import { Payment, type PaymentUpdateAction } from '@commercetools/platform-sdk';

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
import { DatatransService, prepareInitializeTransactionRequestPayload } from '../datatrans-service';
import { CommerceToolsService } from '../commercetools-service';
import { DatatransToCommerceToolsMapper, PaymentMethodInfoForCommerceTools } from './dt-to-ct-mapper';

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
      savedPaymentMethod = await this.validateSavedPaymentMethodExistense(savedPaymentMethodsKey, savedPaymentMethodAlias);
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

  private async saveAuthorizationToPayment(payment: Payment, opts: SaveAuthorizationOptions) {
    const actionsBuilder = this.commerceToolsService.getActionsBuilder();

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

  // TODO: it's validation and getting in one place,
  // what at lest does not follow our common design regarding validatiuons -
  // so consider moving the validation to where all other validations are implemented (in Yup schema):
  // https://github.com/weareplanet/commercetools-planet-integration/blob/main/app/interfaces/commerce-tools/payment.ts#L66
  private async validateSavedPaymentMethodExistense(methodKey: string, alias: string): Promise<IDatatransPaymentMethodInfo> {
    const paymentMethod = await this.findPaymentMethod(methodKey, alias);

    if (!paymentMethod) {
      throw new Error(ErrorMessages.savedPaymentMethodsKeyOrAliasNotFound());
    }
    return paymentMethod;
  }

  private async findPaymentMethod(methodKey: string, alias: string): Promise<IDatatransPaymentMethodInfo> {
    const paymentMethodsObject = await this.commerceToolsService.getCustomObject(PAYMENT_METHODS_CUSTOM_OBJECT_CONTAINER_NAME, methodKey);
    return this.findPaymentMethodAmongAlreadySaved(paymentMethodsObject, alias);
  }

  private findPaymentMethodAmongAlreadySaved(paymentMethodsObject: ICommerceToolsCustomPaymentMethodsObject, alias: string): IDatatransPaymentMethodInfo {
    return paymentMethodsObject?.value?.find((method) => {
      const currentMethodAlias = DatatransToCommerceToolsMapper.getPaymentMethodDetails(method).details.alias;
      return currentMethodAlias === alias;
    });
  }

  private filterPaymentMethodsByFingerprint(paymentMethodsObject: ICommerceToolsCustomPaymentMethodsObject, fingerprint: string): IDatatransPaymentMethodInfo[] {
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
      const paymentMethod = this.findPaymentMethodAmongAlreadySaved(paymentMethodsObject, paymentMethodDetailsToBeSaved.details.alias);
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
      const fingerprint = paymentMethodDetailsToBeSaved.details?.fingerprint?.toString();

      const savedValues = fingerprint
        ? this.filterPaymentMethodsByFingerprint(paymentMethodsObject, fingerprint)
        : paymentMethodsObject.value;

      valueToBeSaved = savedValues.concat(valueToBeSaved);
    }

    await this.commerceToolsService.createOrUpdateCustomObject(PAYMENT_METHODS_CUSTOM_OBJECT_CONTAINER_NAME, savedPaymentMethodsKey, valueToBeSaved);
  }
}
