// This service implements all the HTTP communication with Datatrans
// and hides it from a consumer
import axios, { AxiosInstance } from 'axios';

import { IInitializeTransaction } from '../../../interfaces';
import { IDatatransConfig } from '../config-service/schema';
import configService from '../config-service';
import { DatatransEnvironment } from '../config-service/interfaces';

export class DatatransService {
  private config: IDatatransConfig;
  private client: AxiosInstance;

  constructor() {
    this.config = configService.getConfig().datatrans;

    this.client = axios.create();
  }

  createInitializeTransaction(merchantId: string, transaction: IInitializeTransaction) {
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

  // refund(...)

}
