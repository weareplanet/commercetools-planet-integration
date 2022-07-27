import {
  type Payment,
  type PaymentUpdateAction
} from '@commercetools/platform-sdk';

import logger from './../log-service';
import { ctApiRoot } from './commerce-tools-client';
import { CommerceToolsActionsBuilder } from './commerce-tools-actions-builder';
import {
  IDatatransPaymentMethodInfo,
  ICommerceToolsCustomPaymentMethodsObject
} from '../../../interfaces';
import configService from '../config-service';

// Only this service knows how to communicate with CommerceTools.
// It is unaware of business flows.
export class CommerceToolsService {
  public static getActionsBuilder() {
    return new CommerceToolsActionsBuilder();
  }

  public static async getPayment(paymentKey: string): Promise<Payment> {
    logger.debug({ paymentKey }, 'Requesting Payment from CommerceTools...');

    const res = await ctApiRoot
      .withProjectKey({ projectKey: configService.getConfig().commerceTools.projectId })
      .payments()
      .withKey({ key: paymentKey })
      .get()
      .execute();

    logger.debug(res.body, 'Response from CommerceTools to the Payment request.');
    return res.body;
  }

  public static async updatePayment(payment: Payment, actions: PaymentUpdateAction[]) {
    logger.debug(actions, `Updating Payment ${payment.key} in CommerceTools...`);

    const res = await ctApiRoot
      .withProjectKey({ projectKey: configService.getConfig().commerceTools.projectId })
      .payments()
      .withKey({ key: payment.key })
      .post({
        body: {
          version: payment.version,
          actions
        }
      })
      .execute();

    logger.debug(res.body, 'Response from CommerceTools after the Payment update.');
  }

  public static async getCustomPaymentMethodsObject(containerName: string, key: string): Promise<ICommerceToolsCustomPaymentMethodsObject> {
    logger.debug({ containerName, key }, 'Requesting CustomObject from CommerceTools...');
    let res;
    try {
      res = await ctApiRoot
        .withProjectKey({ projectKey: configService.getConfig().commerceTools.projectId })
        .customObjects()
        .withContainerAndKey({ container: containerName, key })
        .get()
        .execute();
    } catch (err) {
      if (err.code == 404) {
        logger.debug(err.body.message);
        return null;
      }
    }

    logger.debug(res.body, 'Response from CommerceTools to the CustomObject request.');
    return res.body;
  }

  public static async createOrUpdateCustomPaymentMethodsObject(containerName: string, key: string, value: IDatatransPaymentMethodInfo[]) {
    logger.debug({ containerName, key }, 'Creating CustomObject in CommerceTools...');

    const customObjectDraft = {
      container: containerName,
      key,
      value
    };

    const res = await ctApiRoot
      .withProjectKey({ projectKey: configService.getConfig().commerceTools.projectId })
      .customObjects()
      .post({ body: customObjectDraft })
      .execute();

    logger.debug(res.body, 'Response from CommerceTools after the CustomObject creation.');
  }
}
