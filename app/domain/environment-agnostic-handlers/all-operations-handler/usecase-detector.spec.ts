import { UseCaseDetector } from './usecase-detector';
import { abstractRequestFactory } from '../../../../test/shared-test-entities/abstract-request-factories';

describe('UseCaseDetector', () => {

  describe('detectCase, isCommerceToolsRequest, isDatatransRequest', () => {
    it('should return "Redirect And Lightbox Init" when its criteria are detected', () => {
      const req = abstractRequestFactory({
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
      });

      const result = UseCaseDetector.detectCase(req);

      expect(result).toEqual('Redirect And Lightbox Init');

      expect(UseCaseDetector.isCommerceToolsRequest(req)).toBe(true);
      expect(UseCaseDetector.isDatatransRequest(req)).toBe(false);
    });

    it('should return "Redirect And Lightbox Webhook" when its criteria are detected', () => {
      const req = abstractRequestFactory({}, {
        'datatrans-signature': 'timestamp=TS,s0=SIGNATURE' // this header is the criterion
      });

      const result = UseCaseDetector.detectCase(req);

      expect(result).toEqual('Redirect And Lightbox Webhook');

      expect(UseCaseDetector.isCommerceToolsRequest(req)).toBe(false);
      expect(UseCaseDetector.isDatatransRequest(req)).toBe(true);
    });

    it('should return an empty string if no any supported caswe is detected', () => {
      const req = abstractRequestFactory({}); // no headers

      const result = UseCaseDetector.detectCase(req);

      expect(result).toEqual('');

      expect(UseCaseDetector.isCommerceToolsRequest(req)).toBe(false);
      expect(UseCaseDetector.isDatatransRequest(req)).toBe(false);
    });
  });
});
