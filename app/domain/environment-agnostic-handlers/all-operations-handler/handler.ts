import { HttpStatusCode } from 'http-status-code-const-enum';
import logger from '../../services/log-service';
import {
  IAbstractRequest,
  IAbstractResponse
} from '../../../interfaces';
import { logConnectorVersion } from '../../services/connector-version-service';
import { OperationDetector, Operation } from './operation-detector';

// Import all possible operation handlers
import createPaymentHandler from '../per-operation-handlers/create-payment';
import createPaymentWebhookHandler from '../per-operation-handlers/webhook-notification';

///// PREPARE A MULTI-PURPOSE ABSTRACT HANDLER (A SINGLE FUNCTION WHICH IS ABLE TO PROCESS ANY OPERATION).

export default async (req: IAbstractRequest): Promise<IAbstractResponse> => {
  logConnectorVersion();

  // Delegate the request to a proper handler depending on the req content
  const operation = OperationDetector.detectOperation(req);

  switch (operation) {
    case Operation.RedirectAndLightboxInit: {
      return createPaymentHandler(req);
    }

    case Operation.RedirectAndLightboxWebhook: {
      return createPaymentWebhookHandler(req);
    }

    default: {
      logger.warn({
        isCommerceToolsRequest: OperationDetector.isCommerceToolsRequest(req),
        isDatatransRequest: OperationDetector.isDatatransRequest(req)
      }, 'Handler not found (no supported use case was detected)');

      return {
        statusCode: HttpStatusCode.OK,
        body: '', // For CT it's OK: https://docs.commercetools.com/api/projects/api-extensions#validation-successful--no-updates-requested
      };
    }
  }
};
