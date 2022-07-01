import { ConnectorEnvironment } from './interfaces';
import { ICommerceToolsConfig } from './schema';



// 'env-loader' module is globally mocked in the test environment - so to test its internals we need to unmock it
jest.unmock('./env-loader');

describe('Connector config validations', () => {
  const {
    CT_CLIENT_ID,
    CT_CLIENT_SECRET,
    CT_PROJECT_ID,
    CT_AUTH_URL,
    CT_API_URL,
    CT_MERCHANTS
  } = process.env;

  const originalEnvVarsValues = {
    clientId: CT_CLIENT_ID,
    clientSercet: CT_CLIENT_SECRET,
    projectId: CT_PROJECT_ID,
    authUrl: CT_AUTH_URL,
    apiUrl: CT_API_URL,
    merchants: CT_MERCHANTS,
  };

  const testEnvVarsValues = {
    clientId: 'clientId',
    clientSercet: 'clientSercet',
    projectId: 'projectId',
    authUrl: 'authUrl',
    apiUrl: 'apiUrl',
    merchants: [{ id: 'id', password: 'password', environment: ConnectorEnvironment.TEST, dtHmacKey: 'HMAC key' }],
  };

  const setProcessEnvVars = (envVars: ICommerceToolsConfig) => {
    if (envVars.clientId) {
      process.env.CT_CLIENT_ID = envVars.clientId;
    } else {
      delete process.env.CT_CLIENT_ID;
    }
    if (envVars.clientSercet) {
      process.env.CT_CLIENT_SECRET = envVars.clientSercet;
    } else {
      delete process.env.CT_CLIENT_SECRET;
    }
    if (envVars.projectId) {
      process.env.CT_PROJECT_ID = envVars.projectId;
    } else {
      delete process.env.CT_PROJECT_ID;
    }
    if (envVars.authUrl) {
      process.env.CT_AUTH_URL = envVars.authUrl;
    } else {
      delete process.env.CT_AUTH_URL;
    }
    if (envVars.apiUrl) {
      process.env.CT_API_URL = envVars.apiUrl;
    } else {
      delete process.env.CT_API_URL;
    }
    if (envVars.merchants) {
      process.env.CT_MERCHANTS = envVars.merchants ? JSON.stringify(envVars.merchants) : undefined;
    } else {
      delete process.env.CT_MERCHANTS;
    }
  };

  // TODO: get rid of this weird async load in every test
  const loadLogger = async () => {
    const logger = (await import('../log-service')).default;
    jest.spyOn(logger, 'info');
    jest.spyOn(logger, 'debug');

    return logger;
  };

  afterAll(() => {
    // reset to default
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    setProcessEnvVars(originalEnvVarsValues);
    jest.resetModules();
  });

  describe('Validate commerTools config', () => {
    beforeEach(async () => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      setProcessEnvVars(originalEnvVarsValues);
      jest.resetModules();
    });

    it('should pass validation for commerceToolsConfig', async () => {
      expect.assertions(3);
      const logger = await loadLogger();

      setProcessEnvVars(testEnvVarsValues);
      const configService = (await import('.')).default;

      expect(configService.getConfig().commerceToolsConfig).toEqual(testEnvVarsValues);
      expect(logger.info).toHaveBeenCalled();
      expect(logger.debug).toHaveBeenCalled();
    });

    describe('CT_MERCHANS validations', () => {

      describe('should throw validation error about merchants\' id for commerceToolsConfig', () => {
        it('when it is absent', async() => {
          expect.assertions(4);
          const logger = await loadLogger();
          setProcessEnvVars({
            ...testEnvVarsValues,
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            merchants: [{ password: '123', environment: 'test', dtHmacKey: 'HMAC key' }]
          });

          try {
            await import('.');
            expect.assertions(1);
          } catch (err) {
            expect(err).toBeInstanceOf(Error);
            expect(err.message).toEqual('CT_MERCHANTS must be stringified JSON array of objects with merchants\' id specified');
          }
          expect(logger.info).not.toHaveBeenCalled();
          expect(logger.debug).not.toHaveBeenCalled();
        });

        it('when it is malformed', async() => {
          expect.assertions(4);
          const logger = await loadLogger();
          setProcessEnvVars({
            ...testEnvVarsValues,
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            merchants: [{ id: 1, password: '123', environment: 'test', dtHmacKey: 'HMAC key' }]
          });

          try {
            await import('.');
            expect.assertions(1);
          } catch (err) {
            expect(err).toBeInstanceOf(Error);
            expect(err.message).toEqual('CT_MERCHANTS must be stringified JSON array of objects with merchants\' id as string');
          }
          expect(logger.info).not.toHaveBeenCalled();
          expect(logger.debug).not.toHaveBeenCalled();
        });
      });

      describe('should throw validation error about merchants\' password for commerceToolsConfig', () => {
        it('when it is absent', async() => {
          expect.assertions(4);
          const logger = await loadLogger();
          setProcessEnvVars({
            ...testEnvVarsValues,
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            merchants: [{ id: '1', environment: ConnectorEnvironment.TEST, dtHmacKey: 'HMAC key' }]
          });

          try {
            await import('.');
          } catch (err) {
            expect(err).toBeInstanceOf(Error);
            expect(err.message).toEqual('CT_MERCHANTS must be stringified JSON array of objects with merchants\' password specified');
          }
          expect(logger.info).not.toHaveBeenCalled();
          expect(logger.debug).not.toHaveBeenCalled();
        });

        it('when it is malformed', async() => {
          expect.assertions(4);
          const logger = await loadLogger();
          setProcessEnvVars({
            ...testEnvVarsValues,
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            merchants: [{ id: '1', password: 123, environment: ConnectorEnvironment.TEST, dtHmacKey: 'HMAC key' }]
          });

          try {
            await import('.');
          } catch (err) {
            expect(err).toBeInstanceOf(Error);
            expect(err.message).toEqual('CT_MERCHANTS must be stringified JSON array of objects with merchants\' password as a string');
          }
          expect(logger.info).not.toHaveBeenCalled();
          expect(logger.debug).not.toHaveBeenCalled();
        });
      });

      describe('should throw validation error about merchants\' enviroment for commerceToolsConfig', () => {
        it('when it is absent', async() => {
          expect.assertions(4);
          const logger = await loadLogger();
          setProcessEnvVars({
            ...testEnvVarsValues,
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            merchants: [{ id: 'id', password: 'password', dtHmacKey: 'HMAC key' }],
          });

          try {
            await import('.');
          } catch (err) {
            expect(err).toBeInstanceOf(Error);
            expect(err.message).toEqual('CT_MERCHANTS must be stringified JSON array of objects with merchants\' enviroment specified');
          }
          expect(logger.info).not.toHaveBeenCalled();
          expect(logger.debug).not.toHaveBeenCalled();
        });

        it('when it is malformed', async() => {
          expect.assertions(4);
          const logger = await loadLogger();
          setProcessEnvVars({
            ...testEnvVarsValues,
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            merchants: [{ id: 'id', password: 'password', environment: 'incorrect env value', dtHmacKey: 'HMAC key' }],
          });

          try {
            await import('.');
          } catch (err) {
            expect(err).toBeInstanceOf(Error);
            expect(err.message).toEqual('merchant\'s enviroment must be one of the following values: prod, stage, test');
          }
          expect(logger.info).not.toHaveBeenCalled();
          expect(logger.debug).not.toHaveBeenCalled();
        });
      });

      describe('should throw validation error about merchants\' dtHmacKey for commerceToolsConfig', () => {
        it('when it is absent', async() => {
          expect.assertions(4);
          const logger = await loadLogger();
          setProcessEnvVars({
            ...testEnvVarsValues,
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            merchants: [{ id: 'id', password: 'password', environment: ConnectorEnvironment.TEST }],
          });

          try {
            await import('.');
          } catch (err) {
            expect(err).toBeInstanceOf(Error);
            expect(err.message).toEqual('CT_MERCHANTS must be stringified JSON array of objects with merchants\' dtHmacKey specified');
          }
          expect(logger.info).not.toHaveBeenCalled();
          expect(logger.debug).not.toHaveBeenCalled();
        });

        it('when it is malformed', async() => {
          // expect.assertions(2);
          const logger = await loadLogger();
          setProcessEnvVars({
            ...testEnvVarsValues,
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            merchants: [{ id: 'id', password: 'password', environment: ConnectorEnvironment.TEST, dtHmacKey: 123 }],
          });

          try {
            await import('.');
          } catch (err) {
            expect(err).toBeInstanceOf(Error);
            expect(err.message).toEqual('CT_MERCHANTS must be stringified JSON array of objects with merchants\' dtHmacKey as string');
          }
          expect(logger.info).not.toHaveBeenCalled();
          expect(logger.debug).not.toHaveBeenCalled();
        });
      });
    });

    it('should throw validation error about clientId for commerceToolsConfig', async () => {
      expect.assertions(4);
      const logger = await loadLogger();
      setProcessEnvVars({
        ...testEnvVarsValues,
        clientId: undefined
      });

      try {
        await import('.');
        expect.assertions(1);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect(err.message).toEqual('CT_CLIENT_ID is required');
      }
      expect(logger.info).not.toHaveBeenCalled();
      expect(logger.debug).not.toHaveBeenCalled();
    });

    it('should throw validation error about clientSercet for commerceToolsConfig', async () => {
      expect.assertions(4);
      const logger = await loadLogger();
      setProcessEnvVars({
        ...testEnvVarsValues,
        clientSercet: undefined
      });

      try {
        await import('.');
        expect.assertions(1);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect(err.message).toEqual('CT_CLIENT_SECRET is required');
      }
      expect(logger.info).not.toHaveBeenCalled();
      expect(logger.debug).not.toHaveBeenCalled();
    });

    it('should throw validation error about projectId for commerceToolsConfig', async () => {
      expect.assertions(4);
      const logger = await loadLogger();
      setProcessEnvVars({
        ...testEnvVarsValues,
        projectId: undefined
      });

      try {
        await import('.');
        expect.assertions(1);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect(err.message).toEqual('CT_PROJECT_ID is required');
      }
      expect(logger.info).not.toHaveBeenCalled();
      expect(logger.debug).not.toHaveBeenCalled();
    });

    it('should throw validation error about authUrl for commerceToolsConfig', async () => {
      expect.assertions(4);
      const logger = await loadLogger();
      setProcessEnvVars({
        ...testEnvVarsValues,
        authUrl: undefined
      });

      try {
        await import('.');
        expect.assertions(1);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect(err.message).toEqual('CT_AUTH_URL is required');
      }
      expect(logger.info).not.toHaveBeenCalled();
      expect(logger.debug).not.toHaveBeenCalled();
    });

    it('should throw validation error about apiUrl for commerceToolsConfig', async () => {
      expect.assertions(4);
      const logger = await loadLogger();
      setProcessEnvVars({
        ...testEnvVarsValues,
        apiUrl: undefined
      });

      try {
        await import('.');
        expect.assertions(1);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect(err.message).toEqual('CT_API_URL is required');
      }
      expect(logger.info).not.toHaveBeenCalled();
      expect(logger.debug).not.toHaveBeenCalled();
    });
  });
});
