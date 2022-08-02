import { v4 as uuidV4 } from 'uuid';

import { OperationDetector } from './operation-detector';

import {
  IAbstractRequest,
  ITraceContext,
  getHttpHeaderValue,
  COMMERCETOOLS_CORRELATION_ID_HEADER_NAME,
} from '../../../interfaces';
import { LogService, ServiceWithLogger } from '../log-service';

export class RequestContextService extends ServiceWithLogger {
  constructor() {
    // This service (unlike most of others) does not expect a context-aware logger from outside,
    // because this service is the source of the context.
    const contextUnawareLogger = new LogService();
    super({ logger: contextUnawareLogger });
  }

  addTraceContextToRequest(req: IAbstractRequest): IAbstractRequest {
    const traceContext = this.getRequestContext(req);
    return {
      ...req,
      traceContext: traceContext
    };
  }

  private getRequestContext(req: IAbstractRequest): ITraceContext {
    return {
      correlationId: this.calculateCorrelationId(req),
      paymentKey: this.getPaymentKey(req),
    };
  }

  private calculateCorrelationId(req: IAbstractRequest): string {
    let correlationId = getHttpHeaderValue(req.headers, COMMERCETOOLS_CORRELATION_ID_HEADER_NAME);
    if (!correlationId) {
      // https://docs.commercetools.com/api/general-concepts#correlation-id
      // correlation IDs are strings that may only contain alphanumeric characters, underscores, and hyphens and have a length of 8 to 256 characters.
      // UUIDs can be used to ensure uniqueness.
      correlationId = uuidV4();
    }

    return correlationId;
  }

  private getPaymentKey(req: IAbstractRequest): string {
    if (OperationDetector.isCommerceToolsRequest(req)) {
      return req.body.resource.obj.key;
    }

    if (OperationDetector.isDatatransRequest(req)) {
      return req.body.refno;
    }

    return null;
  }
}
