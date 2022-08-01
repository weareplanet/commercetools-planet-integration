import { LogService }  from '../log-service';
import { CryptoService } from '../crypto-service';
import { DatatransService } from '.';

import { when, resetAllWhenMocks } from 'jest-when';

describe('DatatransService', () => {

  describe('validateIncomingRequestSignature', () => {
    const timestamp = 1559303131511;
    const reqBody = 'test req body';
    const merchantId = 'merchId';
    const fakeMerchantHmacKey = 'secret1234';

    const logger =  new LogService();
    const datatransService = new DatatransService({ logger });

    const expectedSignature = new CryptoService({ logger }).createSha256Hmac(fakeMerchantHmacKey, timestamp + reqBody);

    beforeEach(() => {
      /* eslint-disable @typescript-eslint/no-explicit-any */
      jest.spyOn((datatransService as any), 'getMerchantHmacKey');
      /* eslint-disable @typescript-eslint/no-explicit-any */
      when((datatransService as any).getMerchantHmacKey as jest.Mock)
        .calledWith(merchantId)
        .mockReturnValue(fakeMerchantHmacKey);
    });

    afterEach(() => {
      resetAllWhenMocks();
    });

    it('when signature validation passes - does not throw an error', () => {
      const reqHeaders = {
        'datatrans-signature': `t=${timestamp},s0=${expectedSignature}`
      };

      expect(() => {
        datatransService.validateIncomingRequestSignature(merchantId, reqHeaders, reqBody);
      }).not.toThrow();
    });

    it('when signature validation fails - throws an error', () => {
      const reqHeaders = {
        'datatrans-signature': `t=${timestamp},s0=UNexpectedSignature`
      };

      expect(() => {
        datatransService.validateIncomingRequestSignature(merchantId, reqHeaders, reqBody);
      }).toThrow('Datatrans Signature validation failed');
    });

  });

});
