import pino from 'pino';

import { RedirectAndLightboxPaymentInitRequestBodyFactory, CreateInitializeTransactionRequestFactory } from '../../../../test/shared-test-entities/redirect-and-lightbox-payment-init';

describe('Redacted fields', () => {
  let logger: pino.Logger;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let loggingStream: any;
  let originalLogLevel: string;

  beforeEach(async () => {
    logger = (await import('.')).default;
    /* eslint-disable @typescript-eslint/no-var-requires */
    const { streamSym } = require('pino/lib/symbols');
    /* eslint-disable @typescript-eslint/ban-ts-comment */
    /* @ts-ignore */
    loggingStream = logger[streamSym];
    jest.spyOn(loggingStream, 'write');
  });

  beforeAll(() => {
    originalLogLevel = process.env.LOG_LEVEL as string;
    process.env.LOG_LEVEL = 'info';
  });

  afterAll(() => {
    if (originalLogLevel) {
      process.env.LOG_LEVEL = originalLogLevel;
    } else {
      delete process.env.LOG_LEVEL;
    }
  });
  describe('should redact "savedPaymentMethodAlias" on different level of depth', () => {
    it('should redact "body.resource.obj.custom.fields.savedPaymentMethodAlias" filed', () => {
      const redirectAndLightboxPaymentInitRequestBody = RedirectAndLightboxPaymentInitRequestBodyFactory();
      redirectAndLightboxPaymentInitRequestBody.resource.obj.custom.fields.savedPaymentMethodAlias = 'savedPaymentMethodAlias';
      const commerceToolsExtensionRequestWithBodyOnly = {
        body: redirectAndLightboxPaymentInitRequestBody,
      };

      logger.info(commerceToolsExtensionRequestWithBodyOnly);

      expect(loggingStream.write).toBeCalledWith(
        expect.stringMatching(/"payload":{"body":{.*,"custom":{.*,"fields":{.*"savedPaymentMethodAlias":"\[REDACTED\]".*/)
      );
    });

    it('should redact "resource.obj.custom.fields.savedPaymentMethodAlias" filed', () => {
      const redirectAndLightboxPaymentInitRequestBody = RedirectAndLightboxPaymentInitRequestBodyFactory();
      redirectAndLightboxPaymentInitRequestBody.resource.obj.custom.fields.savedPaymentMethodAlias = 'savedPaymentMethodAlias';
      const commerceToolsExtensionRequestWithBodyOnly = {
        body: redirectAndLightboxPaymentInitRequestBody,
      };

      logger.info(commerceToolsExtensionRequestWithBodyOnly.body);

      expect(loggingStream.write).toBeCalledWith(
        expect.stringMatching(/"payload":.*"custom":{.*,"fields":{.*"savedPaymentMethodAlias":"\[REDACTED\]".*/)
      );
    });

    it('should redact "obj.custom.fields.savedPaymentMethodAlias" filed', () => {
      const redirectAndLightboxPaymentInitRequestBody = RedirectAndLightboxPaymentInitRequestBodyFactory();
      redirectAndLightboxPaymentInitRequestBody.resource.obj.custom.fields.savedPaymentMethodAlias = 'savedPaymentMethodAlias';
      const commerceToolsExtensionRequestWithBodyOnly = {
        body: redirectAndLightboxPaymentInitRequestBody,
      };

      logger.info(commerceToolsExtensionRequestWithBodyOnly.body.resource);

      expect(loggingStream.write).toBeCalledWith(
        expect.stringMatching(/"payload":{"id":"123".*"custom":{.*,"fields":{.*"savedPaymentMethodAlias":"\[REDACTED\]".*/)
      );
    });

    it('should redact "custom.fields.savedPaymentMethodAlias" filed', () => {
      const redirectAndLightboxPaymentInitRequestBody = RedirectAndLightboxPaymentInitRequestBodyFactory();
      redirectAndLightboxPaymentInitRequestBody.resource.obj.custom.fields.savedPaymentMethodAlias = 'savedPaymentMethodAlias';
      const commerceToolsExtensionRequestWithBodyOnly = {
        body: redirectAndLightboxPaymentInitRequestBody,
      };

      logger.info(commerceToolsExtensionRequestWithBodyOnly.body.resource.obj);

      expect(loggingStream.write).toBeCalledWith(
        expect.stringMatching(/"payload":{"key":"12345318909876543216".*"custom":{.*,"fields":{.*"savedPaymentMethodAlias":"\[REDACTED\]".*/)
      );
    });

    it('should redact "fields.savedPaymentMethodAlias" filed', () => {
      const redirectAndLightboxPaymentInitRequestBody = RedirectAndLightboxPaymentInitRequestBodyFactory();
      redirectAndLightboxPaymentInitRequestBody.resource.obj.custom.fields.savedPaymentMethodAlias = 'savedPaymentMethodAlias';
      const commerceToolsExtensionRequestWithBodyOnly = {
        body: redirectAndLightboxPaymentInitRequestBody,
      };

      logger.info(commerceToolsExtensionRequestWithBodyOnly.body.resource.obj.custom);

      expect(loggingStream.write).toBeCalledWith(
        expect.stringMatching(/"payload":{"type":.*"fields":{.*"savedPaymentMethodAlias":"\[REDACTED\]".*/)
      );
    });

    it('should redact "savedPaymentMethodAlias" filed', () => {
      const redirectAndLightboxPaymentInitRequestBody = RedirectAndLightboxPaymentInitRequestBodyFactory();
      redirectAndLightboxPaymentInitRequestBody.resource.obj.custom.fields.savedPaymentMethodAlias = 'savedPaymentMethodAlias';
      const commerceToolsExtensionRequestWithBodyOnly = {
        body: redirectAndLightboxPaymentInitRequestBody,
      };

      logger.info(commerceToolsExtensionRequestWithBodyOnly.body.resource.obj.custom.fields);

      expect(loggingStream.write).toBeCalledWith(
        expect.stringMatching(/"payload":{"key":"refno".*"savedPaymentMethodAlias":"\[REDACTED\]".*/)
      );
    });
  });

  describe('should redact "alias" on different level of depth', () => {
    it('should redact "body.[card & BON].alias" fields', () => {
      const createInitializeTransactionRequest = CreateInitializeTransactionRequestFactory();
      createInitializeTransactionRequest.card = { alias: 'card alias', expiryMonth: '06', expiryYear: '25' };
      createInitializeTransactionRequest.BON = { alias: 'BON alias' };

      logger.info({ body: createInitializeTransactionRequest });

      expect(loggingStream.write).toBeCalledWith(
        expect.stringMatching(/"payload":{"body":.*"card":{"alias":"\[REDACTED\]","expiryMonth":"06","expiryYear":"25"},"BON":{"alias":"\[REDACTED\]".*/)
      );
    });

    it('should redact "[card & BON].alias" fields', () => {
      const createInitializeTransactionRequest = CreateInitializeTransactionRequestFactory();
      createInitializeTransactionRequest.card = { alias: 'card alias', expiryMonth: '06', expiryYear: '25' };
      createInitializeTransactionRequest.BON = { alias: 'BON alias' };

      logger.info(createInitializeTransactionRequest);

      expect(loggingStream.write).toBeCalledWith(
        expect.stringMatching(/"payload":{"refno":.*"card":{"alias":"\[REDACTED\]","expiryMonth":"06","expiryYear":"25"},"BON":{"alias":"\[REDACTED\]".*/)
      );
    });

    it('should redact "alias" fields', () => {
      const createInitializeTransactionRequest = CreateInitializeTransactionRequestFactory();
      createInitializeTransactionRequest.card = { alias: 'card alias', expiryMonth: '06', expiryYear: '25' };
      createInitializeTransactionRequest.BON = { alias: 'BON alias' };

      logger.info(createInitializeTransactionRequest.BON);

      expect(loggingStream.write).toBeCalledWith(
        expect.stringMatching(/"payload":{"alias":"\[REDACTED\]"}/)
      );
    });
  });
});
