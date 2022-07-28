import { HttpStatusCode } from 'http-status-code-const-enum';
import { LogService } from '../../services/log-service';
import { ConfigService } from '../../services/config-service';
import { ConnectorVersionService } from '../../services/connector-version-service';
import { OperationDetector, Operation } from './operation-detector';
import {
  IAbstractRequest,
  IAbstractResponse
} from '../../../interfaces';

// Import all possible operation handlers
import createPaymentHandler from '../per-operation-handlers/create-payment';
import createPaymentWebhookHandler from '../per-operation-handlers/webhook-notification';

///// PREPARE A MULTI-PURPOSE ABSTRACT HANDLER (A SINGLE FUNCTION WHICH IS ABLE TO PROCESS ANY OPERATION).

export default async (req: IAbstractRequest): Promise<IAbstractResponse> => {
  const logger = LogService.getLogger(req.tracingContext);

  new ConnectorVersionService({ logger }).logVersion();

  // Load the app configuration.
  new ConfigService({ logger }).getConfig();

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
