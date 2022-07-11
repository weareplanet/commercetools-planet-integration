import { HttpStatusCode } from 'http-status-code-const-enum';
import logger from '../../services/log-service';
import {
  IAbstractRequest,
  IAbstractResponse
} from '../../../interfaces';
import { logConnectorVersion } from '../../services/connector-version-service';
import { UseCase, detectUsecase } from './usecase-detector';
import '../../services/config-service';

// Import all possible operation handlers
import createPaymentHandler from '../per-operation-handlers/create-payment';
import createPaymentWebhookHandler from '../per-operation-handlers/webhook-notification';
// import { WebhookRequestBody }  from '../../../interfaces';

///// PREPARE A MULTI-PURPOSE ABSTRACT HANDLER (A SINGLE FUNCTION WHICH IS ABLE TO PROCESS ANY OPERATION).

export default async (req: IAbstractRequest): Promise<IAbstractResponse> => {
  // Connector initialization phase
  logConnectorVersion();

  // Delegate the request to a proper handler depending on the req content

  const operation = detectUsecase(req);

  switch (operation) {
    case UseCase.RedirectAndLightboxInit: {
      return createPaymentHandler(req);
    }

    case UseCase.RedirectAndLightboxWebhook: {
      return createPaymentWebhookHandler(req);
    }

    default: {
      logger.warn('Handler not found (no use case was detected)');
      return {
        statusCode: HttpStatusCode.OK,
        body: '',
      };
    }
  }
};
