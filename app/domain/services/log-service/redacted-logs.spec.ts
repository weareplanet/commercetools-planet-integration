import {
  setEnvLogLevel,
  repairEnvLogLevel,
  loadLogServiceForTesting,
  RedirectAndLightboxPaymentInitRequestBodyFactory,
  CreateInitializeTransactionRequestFactory
} from '../../../../test/test-utils';

describe('Redacted fields', () => {
  beforeAll(() => {
    setEnvLogLevel('info');
  });

  afterAll(() => {
    repairEnvLogLevel();
  });

  beforeEach(() => {
    jest.resetModules();
  });

  describe('should redact "savedPaymentMethodAlias" on different level of depth', () => {
    it('should redact "body.resource.obj.custom.fields.savedPaymentMethodAlias" filed', () => {
      const redirectAndLightboxPaymentInitRequestBody = RedirectAndLightboxPaymentInitRequestBodyFactory();
      redirectAndLightboxPaymentInitRequestBody.resource.obj.custom.fields.savedPaymentMethodAlias = 'savedPaymentMethodAlias';
      const commerceToolsExtensionRequestWithBodyOnly = {
        body: redirectAndLightboxPaymentInitRequestBody,
      };

      const { logger, logStream } = loadLogServiceForTesting();

      logger.info(commerceToolsExtensionRequestWithBodyOnly);

      expect(logStream.write).toBeCalledWith(
        expect.stringMatching(/"payload":{"body":{.*,"custom":{.*,"fields":{.*"savedPaymentMethodAlias":"\[REDACTED\]".*/)
      );
    });

    it('should redact "resource.obj.custom.fields.savedPaymentMethodAlias" filed', () => {
      const redirectAndLightboxPaymentInitRequestBody = RedirectAndLightboxPaymentInitRequestBodyFactory();
      redirectAndLightboxPaymentInitRequestBody.resource.obj.custom.fields.savedPaymentMethodAlias = 'savedPaymentMethodAlias';
      const commerceToolsExtensionRequestWithBodyOnly = {
        body: redirectAndLightboxPaymentInitRequestBody,
      };

      const { logger, logStream } = loadLogServiceForTesting();

      logger.info(commerceToolsExtensionRequestWithBodyOnly.body);

      expect(logStream.write).toBeCalledWith(
        expect.stringMatching(/"payload":.*"custom":{.*,"fields":{.*"savedPaymentMethodAlias":"\[REDACTED\]".*/)
      );
    });

    it('should redact "obj.custom.fields.savedPaymentMethodAlias" filed', () => {
      const redirectAndLightboxPaymentInitRequestBody = RedirectAndLightboxPaymentInitRequestBodyFactory();
      redirectAndLightboxPaymentInitRequestBody.resource.obj.custom.fields.savedPaymentMethodAlias = 'savedPaymentMethodAlias';
      const commerceToolsExtensionRequestWithBodyOnly = {
        body: redirectAndLightboxPaymentInitRequestBody,
      };

      const { logger, logStream } = loadLogServiceForTesting();

      logger.info(commerceToolsExtensionRequestWithBodyOnly.body.resource);

      expect(logStream.write).toBeCalledWith(
        expect.stringMatching(/"payload":{"id":"123".*"custom":{.*,"fields":{.*"savedPaymentMethodAlias":"\[REDACTED\]".*/)
      );
    });

    it('should redact "custom.fields.savedPaymentMethodAlias" filed', () => {
      const redirectAndLightboxPaymentInitRequestBody = RedirectAndLightboxPaymentInitRequestBodyFactory();
      redirectAndLightboxPaymentInitRequestBody.resource.obj.custom.fields.savedPaymentMethodAlias = 'savedPaymentMethodAlias';
      const commerceToolsExtensionRequestWithBodyOnly = {
        body: redirectAndLightboxPaymentInitRequestBody,
      };

      const { logger, logStream } = loadLogServiceForTesting();

      logger.info(commerceToolsExtensionRequestWithBodyOnly.body.resource.obj);

      expect(logStream.write).toBeCalledWith(
        expect.stringMatching(/"payload":{"key":"12345318909876543216".*"custom":{.*,"fields":{.*"savedPaymentMethodAlias":"\[REDACTED\]".*/)
      );
    });

    it('should redact "fields.savedPaymentMethodAlias" filed', () => {
      const redirectAndLightboxPaymentInitRequestBody = RedirectAndLightboxPaymentInitRequestBodyFactory();
      redirectAndLightboxPaymentInitRequestBody.resource.obj.custom.fields.savedPaymentMethodAlias = 'savedPaymentMethodAlias';
      const commerceToolsExtensionRequestWithBodyOnly = {
        body: redirectAndLightboxPaymentInitRequestBody,
      };

      const { logger, logStream } = loadLogServiceForTesting();

      logger.info(commerceToolsExtensionRequestWithBodyOnly.body.resource.obj.custom);

      expect(logStream.write).toBeCalledWith(
        expect.stringMatching(/"payload":{"type":.*"fields":{.*"savedPaymentMethodAlias":"\[REDACTED\]".*/)
      );
    });

    it('should redact "savedPaymentMethodAlias" filed', () => {
      const redirectAndLightboxPaymentInitRequestBody = RedirectAndLightboxPaymentInitRequestBodyFactory();
      redirectAndLightboxPaymentInitRequestBody.resource.obj.custom.fields.savedPaymentMethodAlias = 'savedPaymentMethodAlias';
      const commerceToolsExtensionRequestWithBodyOnly = {
        body: redirectAndLightboxPaymentInitRequestBody,
      };

      const { logger, logStream } = loadLogServiceForTesting();

      logger.info(commerceToolsExtensionRequestWithBodyOnly.body.resource.obj.custom.fields);

      expect(logStream.write).toBeCalledWith(
        expect.stringMatching(/"payload":{"key":"refno".*"savedPaymentMethodAlias":"\[REDACTED\]".*/)
      );
    });
  });

  describe('should redact "alias" on different level of depth', () => {
    it('should redact "body.[card & BON].alias" fields', () => {
      const createInitializeTransactionRequest = CreateInitializeTransactionRequestFactory();
      createInitializeTransactionRequest.card = { alias: 'card alias', expiryMonth: '06', expiryYear: '25' };
      createInitializeTransactionRequest.BON = { alias: 'BON alias' };

      const { logger, logStream } = loadLogServiceForTesting();

      logger.info({ body: createInitializeTransactionRequest });

      expect(logStream.write).toBeCalledWith(
        expect.stringMatching(/"payload":{"body":.*"card":{"alias":"\[REDACTED\]","expiryMonth":"06","expiryYear":"25"},"BON":{"alias":"\[REDACTED\]".*/)
      );
    });

    it('should redact "[card & BON].alias" fields', () => {
      const createInitializeTransactionRequest = CreateInitializeTransactionRequestFactory();
      createInitializeTransactionRequest.card = { alias: 'card alias', expiryMonth: '06', expiryYear: '25' };
      createInitializeTransactionRequest.BON = { alias: 'BON alias' };

      const { logger, logStream } = loadLogServiceForTesting();

      logger.info(createInitializeTransactionRequest);

      expect(logStream.write).toBeCalledWith(
        expect.stringMatching(/"payload":{"refno":.*"card":{"alias":"\[REDACTED\]","expiryMonth":"06","expiryYear":"25"},"BON":{"alias":"\[REDACTED\]".*/)
      );
    });

    it('should redact "alias" fields', () => {
      const createInitializeTransactionRequest = CreateInitializeTransactionRequestFactory();
      createInitializeTransactionRequest.card = { alias: 'card alias', expiryMonth: '06', expiryYear: '25' };
      createInitializeTransactionRequest.BON = { alias: 'BON alias' };

      const { logger, logStream } = loadLogServiceForTesting();

      logger.info(createInitializeTransactionRequest.BON);

      expect(logStream.write).toBeCalledWith(
        expect.stringMatching(/"payload":{"alias":"\[REDACTED\]"}/)
      );
    });
  });
});
