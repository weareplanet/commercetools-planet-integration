import {
  type Payment,
  type PaymentUpdateAction,
  type CustomObject
} from '@commercetools/platform-sdk';

import { ServiceWithLogger } from '../log-service/service-with-logger';
import { ctApiRoot } from './commerce-tools-client';
import { CommerceToolsActionsBuilder } from './commerce-tools-actions-builder';
import { ConfigService } from '../config-service';

// Only this service knows how to communicate with CommerceTools.
// It is unaware of business flows.
export class CommerceToolsService extends ServiceWithLogger {
  public getActionsBuilder() {
    return new CommerceToolsActionsBuilder();
  }

  public async getPayment(paymentKey: string): Promise<Payment> {
    this.logger.debug({ paymentKey }, 'Requesting Payment from CommerceTools...');

    const res = await ctApiRoot
      .withProjectKey({ projectKey: new ConfigService().getConfig().commerceTools.projectId })
      .payments()
      .withKey({ key: paymentKey })
      .get()
      .execute();

    this.logger.debug(res.body, 'Response from CommerceTools to the Payment request.');
    return res.body;
  }

  public async updatePayment(payment: Payment, actions: PaymentUpdateAction[]) {
    this.logger.debug(actions, `Updating Payment ${payment.key} in CommerceTools...`);

    const res = await ctApiRoot
      .withProjectKey({ projectKey: new ConfigService().getConfig().commerceTools.projectId })
      .payments()
      .withKey({ key: payment.key })
      .post({
        body: {
          version: payment.version,
          actions
        }
      })
      .execute();

    this.logger.debug(res.body, 'Response from CommerceTools after the Payment update.');
  }

  public async getCustomObject<TCustomObject extends CustomObject>(containerName: string, key: string): Promise<TCustomObject> {
    this.logger.debug({ containerName, key }, 'Requesting CustomObject from CommerceTools...');
    let res;
    try {
      res = await ctApiRoot
        .withProjectKey({ projectKey: new ConfigService().getConfig().commerceTools.projectId })
        .customObjects()
        .withContainerAndKey({ container: containerName, key })
        .get()
        .execute();
    } catch (err) {
      if (err.code == 404) {
        this.logger.debug(err.body.message);
        return null;
      }
    }

    this.logger.debug(res.body, 'Response from CommerceTools to the CustomObject request.');
    return res.body as TCustomObject; // TODO: this cast is not safe
  }

  public async createOrUpdateCustomObject<TValue>(containerName: string, key: string, value: TValue) {
    this.logger.debug({ containerName, key }, 'Creating CustomObject in CommerceTools...');

    const customObjectDraft = {
      container: containerName,
      key,
      value
    };

    const res = await ctApiRoot
      .withProjectKey({ projectKey: new ConfigService().getConfig().commerceTools.projectId })
      .customObjects()
      .post({ body: customObjectDraft })
      .execute();

    this.logger.debug(res.body, 'Response from CommerceTools after the CustomObject creation.');
  }
}
