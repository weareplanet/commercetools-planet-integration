import {
  type Payment,
  type PaymentUpdateAction
} from '@commercetools/platform-sdk';

import { ctApiRoot } from './commerce-tools-client';
import { CommerceToolsActionsBuilder } from './commerce-tools-actions-builder';
import configService from '../config-service';

// Only this service knows how to communicate with CommerceTools.
// It is anaware of business flows.
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
    return ctApiRoot
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
  }
}
