// `app/interfaces` has a (circular) dependency on ConfigService -
// thus importing DatatransEnvironment from there hinders:
// import { DatatransEnvironment } from '../../../interfaces';
// Well, for testing it's not a big deal to not use DatatransEnvironment, but to hardcode the environment value(s) -
// maybe it's even more "honest" testing.

import { LogService }  from '../log-service';
import { IAppConfig } from './schema';

// 'env-loader' module is globally mocked in the test environment - so to test its internals we need to unmock it
jest.unmock('./env-loader');

describe('Connector config validations', () => {
  const {
    CT_CLIENT_ID,
    CT_CLIENT_SECRET,
    CT_PROJECT_ID,
    CT_AUTH_URL,
    CT_API_URL,
    DT_MERCHANTS,
    DT_CONNECTOR_WEBHOOK_URL
  } = process.env;

  let logger: LogService;
  const createLogger = () => {
    logger =  new LogService();
    jest.spyOn(logger, 'debug');
    return logger;
  };

  const loadConfig = async () => {
    const ConfigService = (await import('.')).ConfigService;
    const config = new ConfigService({ logger: createLogger() }).getConfig();
    return config;
  };

  const originalEnvVarsValues = {
    commerceTools: {
      clientId: CT_CLIENT_ID,
      clientSecret: CT_CLIENT_SECRET,
      projectId: CT_PROJECT_ID,
      authUrl: CT_AUTH_URL,
      apiUrl: CT_API_URL,
    },
    datatrans: {
      webhookUrl: DT_CONNECTOR_WEBHOOK_URL,
      merchants: DT_MERCHANTS,
    }
  };

  const testEnvVarsValues = {
    commerceTools: {
      clientId: 'clientId',
      clientSecret: 'clientSercet',
      projectId: 'projectId',
      authUrl: 'https://authUrl.test',
      apiUrl: 'https://apiUrl.test',
    },
    datatrans: {
      webhookUrl: 'https://webhookUrl.test',
      merchants: [{ id: 'id', password: 'password', environment: 'test', dtHmacKey: 'HMAC key' }],
    }
  };

  const setProcessEnvVars = (envVars: IAppConfig) => {
    if (envVars.commerceTools.clientId) {
      process.env.CT_CLIENT_ID = envVars.commerceTools.clientId;
    } else {
      delete process.env.CT_CLIENT_ID;
    }
    if (envVars.commerceTools.clientSecret) {
      process.env.CT_CLIENT_SECRET = envVars.commerceTools.clientSecret;
    } else {
      delete process.env.CT_CLIENT_SECRET;
    }
    if (envVars.commerceTools.projectId) {
      process.env.CT_PROJECT_ID = envVars.commerceTools.projectId;
    } else {
      delete process.env.CT_PROJECT_ID;
    }
    if (envVars.commerceTools.authUrl) {
      process.env.CT_AUTH_URL = envVars.commerceTools.authUrl;
    } else {
      delete process.env.CT_AUTH_URL;
    }
    if (envVars.commerceTools.apiUrl) {
      process.env.CT_API_URL = envVars.commerceTools.apiUrl;
    } else {
      delete process.env.CT_API_URL;
    }
    if (envVars.datatrans.webhookUrl) {
      process.env.DT_CONNECTOR_WEBHOOK_URL = envVars.datatrans.webhookUrl;
    } else {
      delete process.env.DT_CONNECTOR_WEBHOOK_URL;
    }
    if (envVars.datatrans.merchants) {
      process.env.DT_MERCHANTS = envVars.datatrans.merchants ? JSON.stringify(envVars.datatrans.merchants) : undefined;
    } else {
      delete process.env.DT_MERCHANTS;
    }
  };

  beforeEach(async () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    setProcessEnvVars(originalEnvVarsValues); // reset to defaults
    jest.resetModules();
  });

  afterAll(() => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    setProcessEnvVars(originalEnvVarsValues); // reset to defaults
    jest.resetModules();
  });

  describe('commerTools config validations', () => {
    it('should pass when all neccessary values are provided and correct', async () => {
      setProcessEnvVars(testEnvVarsValues);
      const config = await loadConfig();
      expect(config).toEqual(testEnvVarsValues);
      expect(logger.debug).toHaveBeenCalled();
    });

    it('should throw validation error about clientId', async () => {
      setProcessEnvVars({
        ...testEnvVarsValues,
        commerceTools: {
          ...testEnvVarsValues.commerceTools,
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          clientId: undefined
        }
      });

      await expect(loadConfig())
        .rejects
        .toThrowError('CT_CLIENT_ID is required');

      expect(logger.debug).not.toHaveBeenCalledWith(expect.anything, 'Loaded configuration');
    });

    it('should throw validation error about clientSecret', async () => {
      setProcessEnvVars({
        ...testEnvVarsValues,
        commerceTools: {
          ...testEnvVarsValues.commerceTools,
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          clientSecret: undefined
        }
      });

      await expect(loadConfig())
        .rejects
        .toThrowError('CT_CLIENT_SECRET is required');

      expect(logger.debug).not.toHaveBeenCalledWith(expect.anything, 'Loaded configuration');
    });

    it('should throw validation error about projectId', async () => {
      setProcessEnvVars({
        ...testEnvVarsValues,
        commerceTools: {
          ...testEnvVarsValues.commerceTools,
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          projectId: undefined
        }
      });

      await expect(loadConfig())
        .rejects
        .toThrowError('CT_PROJECT_ID is required');

      expect(logger.debug).not.toHaveBeenCalledWith(expect.anything, 'Loaded configuration');
    });

    it('should throw validation error about authUrl', async () => {
      setProcessEnvVars({
        ...testEnvVarsValues,
        commerceTools: {
          ...testEnvVarsValues.commerceTools,
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          authUrl: undefined
        }
      });

      await expect(loadConfig())
        .rejects
        .toThrowError('CT_AUTH_URL is required');

      expect(logger.debug).not.toHaveBeenCalledWith(expect.anything, 'Loaded configuration');
    });

    it('should throw validation error about apiUrl', async () => {
      setProcessEnvVars({
        ...testEnvVarsValues,
        commerceTools: {
          ...testEnvVarsValues.commerceTools,
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          apiUrl: undefined
        }
      });

      await expect(loadConfig())
        .rejects
        .toThrowError('CT_API_URL is required');

      expect(logger.debug).not.toHaveBeenCalledWith(expect.anything, 'Loaded configuration');
    });
  });

  describe('Datatrans config validations', () => {

    describe('webhookUrl validations', () => {
      it('when absent - should throw an error', async () => {
        setProcessEnvVars({
          ...testEnvVarsValues,
          datatrans: {
            ...testEnvVarsValues.datatrans,
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            webhookUrl: undefined
          }
        });

        await expect(loadConfig())
          .rejects
          .toThrowError('DT_CONNECTOR_WEBHOOK_URL is required');

        expect(logger.debug).not.toHaveBeenCalledWith(expect.anything, 'Loaded configuration');
      });

      it('when is malformed - should throw an error', async () => {
        setProcessEnvVars({
          ...testEnvVarsValues,
          datatrans: {
            ...testEnvVarsValues.datatrans,
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            webhookUrl: 'incorrect URL'
          }
        });

        await expect(loadConfig())
          .rejects
          .toThrowError('DT_CONNECTOR_WEBHOOK_URL must be a valid URL');

        expect(logger.debug).not.toHaveBeenCalledWith(expect.anything, 'Loaded configuration');
      });
    });

    describe('merchants validations', () => {

      describe('should throw validation error about merchants\' id', () => {
        it('when it is absent', async() => {
          setProcessEnvVars({
            ...testEnvVarsValues,
            datatrans: {
              ...testEnvVarsValues.datatrans,
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              merchants: [{ password: '123', environment: 'test', dtHmacKey: 'HMAC key' }]
            }
          });

          await expect(loadConfig())
            .rejects
            .toThrowError('DT_MERCHANTS must be stringified JSON array of objects with merchants\' id specified');

          expect(logger.debug).not.toHaveBeenCalledWith(expect.anything, 'Loaded configuration');
        });

        it('when it is malformed', async() => {
          setProcessEnvVars({
            ...testEnvVarsValues,
            datatrans: {
              ...testEnvVarsValues.datatrans,
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              merchants: [{ id: 1, password: '123', environment: 'test', dtHmacKey: 'HMAC key' }]
            }
          });

          await expect(loadConfig())
            .rejects
            .toThrowError('DT_MERCHANTS must be stringified JSON array of objects with merchants\' id as string');

          expect(logger.debug).not.toHaveBeenCalledWith(expect.anything, 'Loaded configuration');
        });
      });

      describe('should throw validation error about merchants\' password', () => {
        it('when it is absent', async() => {
          setProcessEnvVars({
            ...testEnvVarsValues,
            datatrans: {
              ...testEnvVarsValues.datatrans,
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              merchants: [{ id: '1', environment: 'test', dtHmacKey: 'HMAC key' }]
            }
          });

          await expect(loadConfig())
            .rejects
            .toThrowError('DT_MERCHANTS must be stringified JSON array of objects with merchants\' password specified');

          expect(logger.debug).not.toHaveBeenCalledWith(expect.anything, 'Loaded configuration');
        });

        it('when it is malformed', async() => {
          setProcessEnvVars({
            ...testEnvVarsValues,
            datatrans: {
              ...testEnvVarsValues.datatrans,
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              merchants: [{ id: '1', password: 123, environment: 'test', dtHmacKey: 'HMAC key' }]
            }
          });

          await expect(loadConfig())
            .rejects
            .toThrowError('DT_MERCHANTS must be stringified JSON array of objects with merchants\' password as a string');

          expect(logger.debug).not.toHaveBeenCalledWith(expect.anything, 'Loaded configuration');
        });
      });

      describe('should throw validation error about merchants\' enviroment', () => {
        it('when it is absent', async() => {
          setProcessEnvVars({
            ...testEnvVarsValues,
            datatrans: {
              ...testEnvVarsValues.datatrans,
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              merchants: [{ id: 'id', password: 'password', dtHmacKey: 'HMAC key' }]
            }
          });

          await expect(loadConfig())
            .rejects
            .toThrowError('DT_MERCHANTS must be stringified JSON array of objects with merchants\' enviroment specified');

          expect(logger.debug).not.toHaveBeenCalledWith(expect.anything, 'Loaded configuration');
        });

        it('when it is malformed', async() => {
          setProcessEnvVars({
            ...testEnvVarsValues,
            datatrans: {
              ...testEnvVarsValues.datatrans,
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              merchants: [{ id: 'id', password: 'password', environment: 'incorrect env value', dtHmacKey: 'HMAC key' }]
            }
          });

          await expect(loadConfig())
            .rejects
            .toThrowError('merchant\'s enviroment must be one of the following values: prod, test');

          expect(logger.debug).not.toHaveBeenCalledWith(expect.anything, 'Loaded configuration');
        });
      });

      describe('should throw validation error about merchants\' dtHmacKey', () => {
        it('when it is absent', async() => {
          setProcessEnvVars({
            ...testEnvVarsValues,
            datatrans: {
              ...testEnvVarsValues.datatrans,
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              merchants: [{ id: 'id', password: 'password', environment: 'test' }]
            }
          });

          await expect(loadConfig())
            .rejects
            .toThrowError('DT_MERCHANTS must be stringified JSON array of objects with merchants\' dtHmacKey specified');

          expect(logger.debug).not.toHaveBeenCalledWith(expect.anything, 'Loaded configuration');
        });

        it('when it is malformed', async() => {
          setProcessEnvVars({
            ...testEnvVarsValues,
            datatrans: {
              ...testEnvVarsValues.datatrans,
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              merchants: [{ id: 'id', password: 'password', environment: 'test', dtHmacKey: 123 }]
            }
          });

          await expect(loadConfig())
            .rejects
            .toThrowError('DT_MERCHANTS must be stringified JSON array of objects with merchants\' dtHmacKey as string');

          expect(logger.debug).not.toHaveBeenCalledWith(expect.anything, 'Loaded configuration');
        });
      });
    });
  });

});
