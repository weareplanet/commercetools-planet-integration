import axios, { AxiosInstance } from 'axios';

import logger from '../log-service';
import configService from '../config-service';
import { IDatatransConfig } from '../config-service/schema';
import {
  type IAbstractHeaders,
  IDatatransInitializeTransaction,
  DatatransEnvironment
} from '../../../interfaces';

import { CryptoService } from '../crypto-service';

// Only this service knows how to communicate with Datatrans.
// It is anaware of business flows.
export class DatatransService {
  private config: IDatatransConfig;
  private client: AxiosInstance;

  public static validateIncomingRequestSignature(merchantId: string, reqHeaders: IAbstractHeaders, requestBody: string) {
    // datatrans-signature: t=1559303131511,s0=33819a1220fd8e38fc5bad3f57ef31095fac0deb38c001ba347e694f48ffe2fc
    const { groups: { timestamp, signature } } = reqHeaders['datatrans-signature'].match(/t=(?<timestamp>\d+),s0=(?<signature>.+)$/);

    const reCalculatedSignature = CryptoService.createSha256Hmac(this.getMerchantHmacKey(merchantId), timestamp + requestBody);
    if (reCalculatedSignature != signature) {
      throw new Error('Datatrans Signature validation failed');
    }
  }

  // TODO: Maybe move this method to ConfigService
  private static getMerchantHmacKey(merchantId: string): string {
    return configService.getConfig()
      .datatrans.merchants.find((mc) => mc.id === merchantId)
      .dtHmacKey; // Presence of the merchant configuration was already validated, so here we don't care
  }

  constructor() {
    this.config = configService.getConfig().datatrans;

    this.client = axios.create();
  }

  // TODO: make this method static?
  async createInitializeTransaction(merchantId: string, transactionData: IDatatransInitializeTransaction) {
    logger.debug({ body: transactionData }, 'DataTrans initRequest');

    const merchant = this.config.merchants?.find(({ id }) => merchantId === id);
    const baseUrl = merchant.environment === DatatransEnvironment.TEST
      ? this.config.apiUrls.test
      : this.config.apiUrls.prod;
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

    logger.debug({ body: transaction, headers: { location } }, 'DataTrans initResponse');

    return {
      transaction,
      location
    };
  }
}
