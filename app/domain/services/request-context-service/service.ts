import { v4 as uuidV4 } from 'uuid';

import {
  IAbstractRequest,
  ITracingRequestContext,
  getHttpHeaderValue,
  COMMERCETOOLS_CORRELATION_ID_HEADER_NAME,
} from '../../../interfaces';
import { LogService, ServiceWithLogger } from '../log-service';

export class RequestContextService extends ServiceWithLogger {

  constructor() {
    // This service does not expect a context-aware logger from outside,
    // because this service is the source of the context (chicken and egg).
    const contextUnawareLogger = LogService.getLogger();
    super({ logger: contextUnawareLogger });
  }

  amendRequestWithTracingContext(req: IAbstractRequest): IAbstractRequest {
    const tracingContext = this.getRequestContext(req);
    return {
      ...req,
      tracingContext
    };
  }

  private getRequestContext(req: IAbstractRequest): ITracingRequestContext {
    let correlationId = getHttpHeaderValue(req.headers, COMMERCETOOLS_CORRELATION_ID_HEADER_NAME);
    if (!correlationId) {
      // https://docs.commercetools.com/api/general-concepts#correlation-id
      // correlation IDs are strings that may only contain alphanumeric characters, underscores, and hyphens and have a length of 8 to 256 characters.
      // UUIDs can be used to ensure uniqueness.
      correlationId = uuidV4();
    }

    return {
      correlationId
      // TODO: paymentKey ?
    };
  }
}
