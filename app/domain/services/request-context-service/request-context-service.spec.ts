import { IAbstractRequest } from '../../../interfaces';
import { RequestContextService } from './service';
import { OperationDetector } from './operation-detector';

import { abstractRequestFactory } from '../../../../test/test-utils';

describe('RequestContextService', () => {

  describe('addTraceContextToRequest', () => {
    describe('adds `traceContext.correlationId` into the request', () => {
      it('if `X-Correlation-ID` header is PRESENT in the request - taking the value from there', () => {
        const req: IAbstractRequest = abstractRequestFactory({
          headers: {
            'X-Correlation-ID': 'value-of-X-Correlation-ID-header'
          }
        });

        const requestContextService = new RequestContextService();
        const amendedReq = requestContextService.addTraceContextToRequest(req);

        expect(amendedReq.traceContext?.correlationId).toEqual('value-of-X-Correlation-ID-header');
      });

      it('if `X-Correlation-ID` header is ABSENT in the request - generating a UUID v4', () => {
        const req: IAbstractRequest = abstractRequestFactory();

        const requestContextService = new RequestContextService();
        const amendedReq = requestContextService.addTraceContextToRequest(req);

        const regexpUuidV4 = new RegExp(/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89aAbB][a-f0-9]{3}-[a-f0-9]{12}$/);
        expect(amendedReq.traceContext?.correlationId).toMatch(regexpUuidV4);
      });
    });

    describe('adds `traceContext.getPaymentKey` into the request', () => {
      describe('When the request is recognized as a request from CommerceTools', () => {
        beforeEach(() => {
          jest.spyOn(OperationDetector, 'isCommerceToolsRequest').mockReturnValue(true);
        });

        it('if `req.body.resource.obj.key` is PRESENT in the request body - taking the value from there', () => {
          const req: IAbstractRequest = abstractRequestFactory({
            body: {
              resource: {
                obj: {
                  key: 'Test PaymentKey from ComerceTools'
                }
              }
            }
          });

          const requestContextService = new RequestContextService();
          const amendedReq = requestContextService.addTraceContextToRequest(req);

          expect(amendedReq.traceContext?.paymentKey).toEqual('Test PaymentKey from ComerceTools');
        });
      });

      describe('When the request is recognized as a request from Datatrans', () => {
        beforeEach(() => {
          jest.spyOn(OperationDetector, 'isDatatransRequest').mockReturnValue(true);
        });

        it('if `req.body.refno` is PRESENT in the request body - taking the value from there', () => {
          const req: IAbstractRequest = abstractRequestFactory({
            body: {
              refno: 'Test PaymentKey from Datatrans'
            }
          });

          const requestContextService = new RequestContextService();
          const amendedReq = requestContextService.addTraceContextToRequest(req);

          expect(amendedReq.traceContext?.paymentKey).toEqual('Test PaymentKey from Datatrans');
        });
      });

      describe('When the request is not recognized as a request from either CommerceTools or Datanrans', () => {
        it('assigns null', () => {
          const req: IAbstractRequest = abstractRequestFactory();
          const requestContextService = new RequestContextService();

          const amendedReq = requestContextService.addTraceContextToRequest(req);


          expect(amendedReq.traceContext?.paymentKey).toBeNull();
        });
      });
    });
  });

});
