import { UseCaseDetector } from './usecase-detector';

describe('UseCaseDetector', () => {

  describe('detectCase, isCommerceToolsRequest, isDatatransRequest', () => {
    it('should return "Redirect And Lightbox Init" when its criteria are detected', () => {
      const req = {
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
      };

      const result = UseCaseDetector.detectCase(req);

      expect(result).toEqual('Redirect And Lightbox Init');

      expect(UseCaseDetector.isCommerceToolsRequest(req)).toBe(true);
      expect(UseCaseDetector.isDatatransRequest(req)).toBe(false);
    });

    it('should return "Redirect And Lightbox Webhook" when its criteria are detected', () => {
      const req = {
        headers: {
          'datatrans-signature': 'timestamp=TS,s0=SIGNATURE'
        },
        body: {}
      };

      const result = UseCaseDetector.detectCase(req);

      expect(result).toEqual('Redirect And Lightbox Webhook');

      expect(UseCaseDetector.isCommerceToolsRequest(req)).toBe(false);
      expect(UseCaseDetector.isDatatransRequest(req)).toBe(true);
    });

    it('should return an empty string if no any supported caswe is detected', () => {
      const req = {
        body: {}
      };

      const result = UseCaseDetector.detectCase(req);

      expect(result).toEqual('');

      expect(UseCaseDetector.isCommerceToolsRequest(req)).toBe(false);
      expect(UseCaseDetector.isDatatransRequest(req)).toBe(false);
    });
  });
});
