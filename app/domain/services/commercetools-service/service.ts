import {
  type Payment,
  type TransactionDraft,
} from '@commercetools/platform-sdk';

import { ICommerceToolsPaymentDraft } from '../../../interfaces';

import { ctApiRoot } from './commerce-tools-client';
import { CommerceToolsActionsBuilder } from './commerce-tools-actions-builder';
import configService from '../config-service';

interface AddTransactionOptions {
  payment: Payment;
  paymentDraft: Partial<ICommerceToolsPaymentDraft>;
  transactionDraft: TransactionDraft;
}

// Only this service knows how to communicate with CommerceTools.
// It is anaware of business flows.
export class CommerceToolsService {
  public static getActionsBuilder() {
    return new CommerceToolsActionsBuilder();
  }

  async getPayment(paymentKey: string) {
    const res = await ctApiRoot
      .withProjectKey({ projectKey: configService.getConfig().commerceTools.projectId })
      .payments()
      .withKey({ key: paymentKey })
      .get()
      .execute();

    return res.body;
  }

  async addTransactionToPayment(opts: AddTransactionOptions) {
    return ctApiRoot
      .withProjectKey({ projectKey: configService.getConfig().commerceTools.projectId })
      .payments()
      .withKey({ key: opts.payment.key })
      .post({
        body: {
          version: opts.payment.version,
          actions: [ // TODO: maybe Dmytro's CommerceToolsActionsBuilder can be reused here after PR#19 merge
            {
              action: 'addTransaction',
              transaction: opts.transactionDraft
            },
            {
              action: 'setStatusInterfaceCode',
              interfaceCode: opts.paymentDraft.paymentStatus.interfaceCode
            },
            {
              action: 'addInterfaceInteraction',
              ...opts.paymentDraft.interfaceInteractions[0]
            }
          ]
        }
      })
      .execute();
  }
}
