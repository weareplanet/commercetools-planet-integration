import axios, { AxiosInstance } from 'axios';

import { ServiceWithLogger, ServiceWithLoggerOptions } from '../log-service';
import { ConfigService } from '../config-service';
import {
  IDatatransConfig,
  IDatatransMerchantConfig
} from '../config-service/schema';
import {
  type IAbstractHeaders,
  IDatatransInitializeTransaction,
  DatatransURL,
  getHttpHeaderValue,
  DATATRANS_SIGNATURE_HEADER_NAME,
  IDatatransWebhookRequestBody,
  IDatatransRefundTransaction
} from '../../../interfaces';

import { CryptoService } from '../crypto-service';

// Only this service knows how to communicate with Datatrans.
// It is unaware of business flows.
export class DatatransService extends ServiceWithLogger {
  private config: IDatatransConfig;
  private client: AxiosInstance;
  private cryptoService: CryptoService;

  constructor({ logger }: ServiceWithLoggerOptions) {
    super({ logger });
    this.config = new ConfigService().getConfig().datatrans;
    this.client = axios.create();
    this.cryptoService = new CryptoService({ logger });
  }

  public validateIncomingRequestSignature(merchantId: string, reqHeaders: IAbstractHeaders, requestBody: string) {
    // datatrans-signature: t=1559303131511,s0=33819a1220fd8e38fc5bad3f57ef31095fac0deb38c001ba347e694f48ffe2fc
    const headerValue = getHttpHeaderValue(DATATRANS_SIGNATURE_HEADER_NAME, reqHeaders);
    const matchResult = headerValue.match(/t=(?<timestamp>\d+),s0=(?<actualSignature>.+)$/);
    if (!matchResult) {
      this.logger.error({ headerValue }, `Missed expected ${DATATRANS_SIGNATURE_HEADER_NAME} header`);
      throw new Error('Datatrans Signature validation failed');
    }

    const { groups: { timestamp, actualSignature } } = matchResult;
    const expectedSignature = this.cryptoService.createSha256Hmac(this.getMerchantHmacKey(merchantId), timestamp + requestBody);
    if (expectedSignature != actualSignature) {
      this.logger.error({ actualSignature, timestamp, requestBody, expectedSignature }, 'Error of Datatrans signature validation');
      throw new Error('Datatrans Signature validation failed');
    }
  }

  async createInitializeTransaction(merchantId: string, transactionData: IDatatransInitializeTransaction) {
    this.logger.debug({ body: transactionData }, 'DataTrans initRequest');

    const merchantConfig = this.getMerchantConfig(merchantId);

    const { data: transaction, headers: { location } } = await this.client.post(
      `${this.getDatatransBaseUrl(merchantConfig)}/transactions`,
      transactionData,
      {
        headers: {
          'Content-Type': 'application/json; charset=UTF-8'
        },
        auth: this.prepareDatatransAuth(merchantConfig)
      }
    );

    this.logger.debug({ body: transaction, headers: { location } }, 'DataTrans initResponse');

    return {
      transaction,
      location
    };
  }

  async createRefundTransaction(merchantId: string, transactionId: string, transactionData: IDatatransRefundTransaction) {
    this.logger.debug({ body: transactionData }, 'DataTrans refundRequest');

    const merchantConfig = this.getMerchantConfig(merchantId);

    const { data: transaction } = await this.client.post(
      `${this.getDatatransBaseUrl(merchantConfig)}/transactions/${transactionId}/credit`,
      transactionData,
      {
        headers: {
          'Content-Type': 'application/json; charset=UTF-8'
        },
        auth: this.prepareDatatransAuth(merchantConfig)
      }
    );

    this.logger.debug({ body: transaction }, 'DataTrans refundResponse');

    return {
      transaction
    };
  }

  async getTransactionStatus(merchantId: string, transactionId: string): Promise<IDatatransWebhookRequestBody> {
    this.logger.debug({ transactionId }, 'DataTrans statusRequest');

    const merchantConfig = this.getMerchantConfig(merchantId);

    const { data: transactionInfo } = await this.client.get(
      `${this.getDatatransBaseUrl(merchantConfig)}/transactions/${transactionId}`,
      {
        headers: {
          'Content-Type': 'application/json; charset=UTF-8'
        },
        auth: this.prepareDatatransAuth(merchantConfig)
      }
    );

    this.logger.debug({ body: transactionInfo }, 'DataTrans statusResponse');

    return transactionInfo;
  }

  private getMerchantHmacKey(merchantId: string): string {
    return new ConfigService().getConfig()
      .datatrans.merchants.find((mc) => mc.id === merchantId)
      .dtHmacKey; // Presence of the merchant configuration was validated on config load, so here we don't care
  }

  private getMerchantConfig(merchantId: string): IDatatransMerchantConfig {
    return this.config.merchants?.find(({ id }) => merchantId === id);
  }

  private getDatatransBaseUrl(merchant: IDatatransMerchantConfig): DatatransURL {
    // Presence of the merchant configuration
    // (particulalry merchant.environment value)
    // was validated on config load, so here we don't care
    return DatatransURL[merchant.environment.toUpperCase() as keyof typeof DatatransURL];
  }

  private prepareDatatransAuth(merchant: IDatatransMerchantConfig) {
    // Presence of the merchant configuration
    // (particulalry merchant.id and password)
    // was validated on config load, so here we don't care
    return {
      username: merchant.id,
      password: merchant.password
    };
  }
}
