import {
  type Payment,
  type PaymentUpdateAction,
  type CustomObject
} from '@commercetools/platform-sdk';

import { ServiceWithLogger } from '../log-service/service-with-logger';
import { ctApiRoot } from './commerce-tools-client';
import { CommerceToolsActionsBuilder } from './commerce-tools-actions-builder';
import { ConfigService } from '../config-service';
import { COMMERCETOOLS_CORRELATION_ID_HEADER_NAME } from '../../../interfaces';

// Only this service knows how to communicate with CommerceTools.
// It is unaware of business flows.
export class CommerceToolsService extends ServiceWithLogger {
  public getActionsBuilder() {
    return new CommerceToolsActionsBuilder();
  }

  public async getPayment(paymentKey: string): Promise<Payment> {
    this.logger.debug({ paymentKey }, 'Requesting Payment from CommerceTools...');

    const res = await ctApiRoot
      .withProjectKey(this.makeWithProjectKeyOption())
      .payments()
      .withKey({ key: paymentKey })
      .get({
        headers: this.makeXCorrelationIdHeader()
      })
      .execute();

    this.logger.debug(res.body, 'Response from CommerceTools to the Payment request.');
    return res.body;
  }

  public async updatePayment(payment: Payment, actions: PaymentUpdateAction[]) {
    this.logger.debug(actions, `Updating Payment ${payment.key} in CommerceTools...`);

    const res = await ctApiRoot
      .withProjectKey(this.makeWithProjectKeyOption())
      .payments()
      .withKey({ key: payment.key })
      .post({
        headers: this.makeXCorrelationIdHeader(),
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
        .withProjectKey(this.makeWithProjectKeyOption())
        .customObjects()
        .withContainerAndKey({ container: containerName, key })
        .get({
          headers: this.makeXCorrelationIdHeader()
        })
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
      .withProjectKey(this.makeWithProjectKeyOption())
      .customObjects()
      .post({
        headers: this.makeXCorrelationIdHeader(),
        body: customObjectDraft
      })
      .execute();

    this.logger.debug(res.body, 'Response from CommerceTools after the CustomObject creation.');
  }

  private makeWithProjectKeyOption(): { projectKey: string } {
    return { projectKey: new ConfigService().getConfig().commerceTools.projectId };
  }

  private makeXCorrelationIdHeader(): { [COMMERCETOOLS_CORRELATION_ID_HEADER_NAME]: string } | Record<string, never> {
    if (!this.logger.traceContext) {
      return {};
    }
    return { [COMMERCETOOLS_CORRELATION_ID_HEADER_NAME]: this.logger.traceContext.correlationId };
  }
}
