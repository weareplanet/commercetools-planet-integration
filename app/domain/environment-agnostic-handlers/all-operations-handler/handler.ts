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

///// PREPARE A MULTI-PURPOSE ABSTRACT HANDLER (A SINGLE FUNCTION WHICH IS ABLE TO PROCESS ANY OPERATION).

export default async (req: IAbstractRequest): Promise<IAbstractResponse> => {
  // Cross-envs connector initialization phase
  logConnectorVersion();
  const operation = detectOperation(req.body as unknown as ICommerceToolsExtensionRequestBoby);

  switch (operation) {
    case PaymentCreateOperation.RedirectAndLightboxInit: {
      return createPaymentHandler(req);
    }

    default: {
      return {
        statusCode: HttpStatusCode.OK,
      };
    }
  }
};
