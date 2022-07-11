import { HttpStatusCode } from 'http-status-code-const-enum';
import logger from '../../services/log-service';
import {
  IAbstractRequest,
  IAbstractResponse
} from '../../../interfaces';
import { logConnectorVersion } from '../../services/connector-version-service';
import { UseCaseDetector, UseCase } from './usecase-detector';
import '../../services/config-service';

// Import all possible operation handlers
import createPaymentHandler from '../per-operation-handlers/create-payment';
import createPaymentWebhookHandler from '../per-operation-handlers/webhook-notification';

///// PREPARE A MULTI-PURPOSE ABSTRACT HANDLER (A SINGLE FUNCTION WHICH IS ABLE TO PROCESS ANY OPERATION).

export default async (req: IAbstractRequest): Promise<IAbstractResponse> => {
  logConnectorVersion();

  // Delegate the request to a proper handler depending on the req content
  const useCase = UseCaseDetector.detectCase(req);
  switch (useCase) {
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
