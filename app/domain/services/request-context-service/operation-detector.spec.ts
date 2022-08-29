import { OperationDetector } from './operation-detector';
import { abstractRequestFactory } from '../../../../test/test-utils';

describe('OperationDetector', () => {

  describe('detectOperation, isCommerceToolsRequest, isDatatransRequest', () => {
    it('should return "Redirect And Lightbox Init" when its criteria are detected', () => {
      const req = abstractRequestFactory({
        body: {
          action: 'Create',
          resource: {
            obj: {
              paymentMethodInfo: {
                paymentInterface: 'pp-datatrans-redirect-integration',
              },
              custom: {
                fields: {}
              },
              paymentStatus: {}
            }
          }
        }
      });

      const result = OperationDetector.detectOperation(req);

      expect(result).toEqual('Redirect And Lightbox Init');

      expect(OperationDetector.isCommerceToolsRequest(req)).toBe(true);
      expect(OperationDetector.isDatatransRequest(req)).toBe(false);
    });

    it('should return "Redirect And Lightbox Webhook" when its criteria are detected', () => {
      const req = abstractRequestFactory({
        headers: {
          'datatrans-signature': 't=TS,s0=SIGNATURE' // this header presence is the criterion
        }
      });

      const result = OperationDetector.detectOperation(req);

      expect(result).toEqual('Redirect And Lightbox Webhook');

      expect(OperationDetector.isCommerceToolsRequest(req)).toBe(false);
      expect(OperationDetector.isDatatransRequest(req)).toBe(true);
    });

    it('should return "Status Check" when its criteria are detected', () => {
      const req = abstractRequestFactory({
        body: {
          action: 'Update',
          resource: {
            obj: {
              custom: {
                fields: {
                  action: 'status'
                }
              }
            }
          }
        }
      });

      const result = OperationDetector.detectOperation(req);

      expect(result).toEqual('Status Check');

      expect(OperationDetector.isCommerceToolsRequest(req)).toBe(true);
      expect(OperationDetector.isDatatransRequest(req)).toBe(false);
    });

    it('should return an empty string if no any supported operation is detected', () => {
      const req = abstractRequestFactory({}); // no headers

      const result = OperationDetector.detectOperation(req);

      expect(result).toEqual('');

      expect(OperationDetector.isCommerceToolsRequest(req)).toBe(false);
      expect(OperationDetector.isDatatransRequest(req)).toBe(false);
    });
  });
});
