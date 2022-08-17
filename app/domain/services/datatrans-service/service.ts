import axios, { AxiosInstance } from 'axios';

import { ServiceWithLogger, ServiceWithLoggerOptions } from '../log-service';
import { ConfigService } from '../config-service';
import { IDatatransConfig } from '../config-service/schema';
import {
  type IAbstractHeaders,
  IDatatransInitializeTransaction,
  DatatransEnvironment,
  getHttpHeaderValue,
  DATATRANS_SIGNATURE_HEADER_NAME
} from '../../../interfaces';

import { CryptoService } from '../crypto-service';
import { DTConstants } from './constants';

// Only this service knows how to communicate with Datatrans.
// It is unaware of business flows.
export class DatatransService extends ServiceWithLogger {
  private config: IDatatransConfig;
  private client: AxiosInstance;
  private cryptoService: CryptoService;

  // TODO: Maybe move this method to ConfigService
  private getMerchantHmacKey(merchantId: string): string {
    return new ConfigService().getConfig()
      .datatrans.merchants.find((mc) => mc.id === merchantId)
      .dtHmacKey; // Presence of the merchant configuration was already validated, so here we don't care
  }

  constructor({ logger }: ServiceWithLoggerOptions) {
    super({ logger });
    this.config = new ConfigService().getConfig().datatrans;
    this.client = axios.create();
    this.cryptoService = new CryptoService({ logger });
  }

  public validateIncomingRequestSignature(merchantId: string, reqHeaders: IAbstractHeaders, requestBody: string) {
    // datatrans-signature: t=1559303131511,s0=33819a1220fd8e38fc5bad3f57ef31095fac0deb38c001ba347e694f48ffe2fc
    const headerValue = getHttpHeaderValue(reqHeaders, DATATRANS_SIGNATURE_HEADER_NAME);
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

  // TODO: make this method static?
  async createInitializeTransaction(merchantId: string, transactionData: IDatatransInitializeTransaction) {
    this.logger.debug({ body: transactionData }, 'DataTrans initRequest');

    const merchant = this.config.merchants?.find(({ id }) => merchantId === id);

    const baseUrl = merchant.environment === DatatransEnvironment.TEST
      ? DTConstants.apiUrls.test
      : DTConstants.apiUrls.prod;

    const merchantAuth = {
      username: merchant.id,
      password: merchant.password
    };

    const { data: transaction, headers: { location } } = await this.client.post(
      `${baseUrl}/transactions`,
      transactionData,
      {
        headers: {
          'Content-Type': 'application/json; charset=UTF-8'
        },
        auth: merchantAuth
      }
    );

    this.logger.debug({ body: transaction, headers: { location } }, 'DataTrans initResponse');

    return {
      transaction,
      location
    };
  }
}
