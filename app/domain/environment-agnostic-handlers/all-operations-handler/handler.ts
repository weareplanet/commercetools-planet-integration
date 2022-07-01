import { HttpStatusCode } from 'http-status-code-const-enum';
import {
  IAbstractRequest,
  IAbstractResponse,
  ICommerceToolsExtensionRequestBoby
} from '../../../interfaces';
import { logConnectorVersion } from '../../services/connector-version-service';
import { PaymentCreateOperation, detectOperation } from './operation-detector';
import '../../services/config-service';

// Import all possible operation handlers
import createPaymentHandler from '../per-operation-handlers/create-payment';
// import createPaymentWeb  hookHandler from '../per-operation-handlers/webhook-notification';
// import { WebhookRequestBody }  from '../../../interfaces';

///// PREPARE A MULTI-PURPOSE ABSTRACT HANDLER (A SINGLE FUNCTION WHICH IS ABLE TO PROCESS ANY OPERATION).

export default async (req: IAbstractRequest): Promise<IAbstractResponse> => {
  // Connector initialization phase
  logConnectorVersion();

  // Delegate the request to a proper handler depending on the req content

  const operation = detectOperation(req.body as unknown as ICommerceToolsExtensionRequestBoby);

  switch (operation) {
    case PaymentCreateOperation.RedirectAndLightboxInit: {
      return createPaymentHandler(req);
    }

    // case PaymentCreateOperation.RedirectAndLightboxWebhook: {
    // if ((req.body as WebhookRequestBody).refno) { // TODO: make at least a cast? See https://github.com/weareplanet/commercetools-planet-integration/pull/19#discussion_r911030420
    //   return createPaymentWebhookHandler(req);
    // }

    default: {
      return {
        statusCode: HttpStatusCode.OK,
        body: '',
      };
    }
  }
};
