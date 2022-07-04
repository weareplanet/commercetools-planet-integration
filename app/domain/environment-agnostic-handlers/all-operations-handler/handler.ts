import { HttpStatusCode } from 'http-status-code-const-enum';
import {
  IAbstractRequest,
  IAbstractResponse,
  IExtensionRequestBody
} from '@app/interfaces';
import { logConnectorVersion } from '../../services/connector-version-service';
import { PaymentCreateOperation, getOperation } from './operations-mapper';
import '../../services/config-service';

// Import all possible operation handlers
import createPaymentHandler from '../per-operation-handlers/create-payment';

///// PREPARE A MULTI-PURPOSE ABSTRACT HANDLER (A SINGLE FUNCTION WHICH IS ABLE TO PROCESS ANY OPERATION).

export default async (req: IAbstractRequest): Promise<IAbstractResponse> => {
  // Cross-envs connector initialization phase
  logConnectorVersion();
  const operation = getOperation(req.body as unknown as IExtensionRequestBody);

  switch (operation) {
    case PaymentCreateOperation.RedirectAndLightboxInit: {
      return createPaymentHandler(req);
    }

    default: {
      return {
        statusCode: HttpStatusCode.OK,
        body: {}
      };
    }
  }
};
