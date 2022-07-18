import {
  type Payment,
  type PaymentUpdateAction
} from '@commercetools/platform-sdk';

import logger from './../log-service';
import { ctApiRoot } from './commerce-tools-client';
import { CommerceToolsActionsBuilder } from './commerce-tools-actions-builder';
import { CommerceToolsPaymentMethodsObject } from '../../../interfaces';
import configService from '../config-service';

// Only this service knows how to communicate with CommerceTools.
// It is unaware of business flows.
export class CommerceToolsService {
  public static getActionsBuilder() {
    return new CommerceToolsActionsBuilder();
  }

  public static async getPayment(paymentKey: string): Promise<Payment> {
    const res = await ctApiRoot
      .withProjectKey({ projectKey: configService.getConfig().commerceTools.projectId })
      .payments()
      .withKey({ key: paymentKey })
      .get()
      .execute();

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

    logger.debug(res.body, 'Response from CommerceTools after the payment update.');

    return res;
  }

  public static async getCustomObjects(containerName: string, key: string): Promise<CommerceToolsPaymentMethodsObject> {
    const res = await ctApiRoot
      .withProjectKey({ projectKey: configService.getConfig().commerceTools.projectId })
      .customObjects()
      .withContainerAndKey({ container: containerName, key })
      .get()
      .execute();

    return res.body;
  }
}
