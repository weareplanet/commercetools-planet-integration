import axios, { AxiosInstance } from 'axios';

import configService from '../config-service';
import { IDatatransConfig } from '../config-service/schema';
import {
  type IAbstarctHeaders,
  IDatatransInitializeTransaction,
  DatatransEnvironment
} from '../../../interfaces';

import { CryptoService } from '../crypto-service';

// Only this service knows how to communicate with Datatrans.
// It is anaware of business flows.
export class DatatransService {
  private config: IDatatransConfig;
  private client: AxiosInstance;

  public static validateIncomingRequestSignature(merchantId: string, reqHeaders: IAbstarctHeaders, requestBody: string) {
    // Datatrans-Signature: t=1559303131511,s0=33819a1220fd8e38fc5bad3f57ef31095fac0deb38c001ba347e694f48ffe2fc
    const { groups: { timestamp, signature } } = reqHeaders['Datatrans-Signature'].match(/t=(?<timestamp>\d+),s0=(?<signature>.+)$/);

    const reCalculatedSignature = CryptoService.createSha256Hmac(this.getMerchantHmacKey(merchantId), timestamp + requestBody);
    if (reCalculatedSignature != signature) {
      throw new Error('Datatrans Signature validation error: looks like the request payload is tampered');
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

  createInitializeTransaction(merchantId: string, transaction: IDatatransInitializeTransaction) {
    const merchant = this.config.merchants?.find(({ id }) => merchantId === id);
    const baseUrl = merchant.environment === DatatransEnvironment.TEST
      ? this.config.apiUrls.test
      : this.config.apiUrls.prod;
    const merchantAuth = {
      username: merchant.id,
      password: merchant.password
    };

    return this.client.post(
      `${baseUrl}/transactions`,
      transaction,
      {
        headers: {
          'Content-Type': 'application/json; charset=UTF-8'
        },
        auth: merchantAuth
      }
    );
  }
}
