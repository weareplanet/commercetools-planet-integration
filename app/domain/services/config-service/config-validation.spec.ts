import { ConnectorEnvironment } from './interfaces';
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
    DT_TEST_API_URL,
    DT_PROD_API_URL
  } = process.env;

  const originalEnvVarsValues = {
    commerceTools: {
      clientId: CT_CLIENT_ID,
      clientSercet: CT_CLIENT_SECRET,
      projectId: CT_PROJECT_ID,
      authUrl: CT_AUTH_URL,
      apiUrl: CT_API_URL,
    },
    datatrans: {
      apiUrls: {
        test: DT_TEST_API_URL,
        prod: DT_PROD_API_URL
      },
      merchants: DT_MERCHANTS,
    }
  };

  const testEnvVarsValues = {
    commerceTools: {
      clientId: 'clientId',
      clientSercet: 'clientSercet',
      projectId: 'projectId',
      authUrl: 'authUrl',
      apiUrl: 'apiUrl',
    },
    datatrans: {
      apiUrls: {
        test: 'testUrl',
        prod: 'prodUrl'
      },
      merchants: [{ id: 'id', password: 'password', environment: ConnectorEnvironment.TEST }],
    }
  };

  const setProcessEnvVars = (envVars: IAppConfig) => {
    if (envVars.commerceTools.clientId) {
      process.env.CT_CLIENT_ID = envVars.commerceTools.clientId;
    } else {
      delete process.env.CT_CLIENT_ID;
    }
    if (envVars.commerceTools.clientSercet) {
      process.env.CT_CLIENT_SECRET = envVars.commerceTools.clientSercet;
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
    if (envVars.datatrans.merchants) {
      process.env.DT_MERCHANTS = envVars.datatrans.merchants ? JSON.stringify(envVars.datatrans.merchants) : undefined;
    } else {
      delete process.env.DT_MERCHANTS;
    }
    if (envVars.datatrans.apiUrls.test) {
      process.env.DT_TEST_API_URL = envVars.datatrans.apiUrls.test;
    } else {
      delete process.env.DT_TEST_API_URL;
    }
    if (envVars.datatrans.apiUrls.prod) {
      process.env.DT_PROD_API_URL = envVars.datatrans.apiUrls.prod;
    } else {
      delete process.env.DT_PROD_API_URL;
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

      expect(configService.getConfig()).toEqual(testEnvVarsValues);
      expect(logger.info).toHaveBeenCalled();
      expect(logger.debug).toHaveBeenCalled();
    });

    it('should throw validation error about merchants\' enviroment for commerceToolsConfig', async () => {
      expect.assertions(4);
      const logger = await loadLogger();
      setProcessEnvVars({
        ...testEnvVarsValues,
        datatrans: {
          ...testEnvVarsValues.datatrans,
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          merchants: [{ id: 1 }]
        }
      });

      try {
        await import('.');
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect(err.message).toEqual('CT_MERCHANTS must be stringified array with merchants\' enviroment specified');
      }
      expect(logger.info).not.toHaveBeenCalled();
      expect(logger.debug).not.toHaveBeenCalled();
    });

    it('should throw validation error about merchants\' password for commerceToolsConfig', async () => {
      expect.assertions(4);
      const logger = await loadLogger();
      setProcessEnvVars({
        ...testEnvVarsValues,
        datatrans: {
          ...testEnvVarsValues.datatrans,
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          merchants: [{ id: '1', password: 123, environment: ConnectorEnvironment.TEST }]
        }
      });

      try {
        await import('.');
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect(err.message).toEqual('CT_MERCHANTS must be stringified array with merchants\' password as a string');
      }
      expect(logger.info).not.toHaveBeenCalled();
      expect(logger.debug).not.toHaveBeenCalled();
    });

    it('should throw validation error about merchants\' id for commerceToolsConfig', async () => {
      expect.assertions(4);
      const logger = await loadLogger();
      setProcessEnvVars({
        ...testEnvVarsValues,
        datatrans: {
          ...testEnvVarsValues.datatrans,
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          merchants: [{ id: 1, password: '123', environment: 'test' }]
        },
      });

      try {
        await import('.');
        expect.assertions(1);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect(err.message).toEqual('CT_MERCHANTS must be stringified array with merchants\' id as string');
      }
      expect(logger.info).not.toHaveBeenCalled();
      expect(logger.debug).not.toHaveBeenCalled();
    });

    it('should throw validation error about clientId for commerceToolsConfig', async () => {
      expect.assertions(4);
      const logger = await loadLogger();
      setProcessEnvVars({
        ...testEnvVarsValues,
        commerceTools: {
          ...testEnvVarsValues.commerceTools,
          clientId: undefined
        }
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
        commerceTools: {
          ...testEnvVarsValues.commerceTools,
          clientSercet: undefined
        }
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
        commerceTools: {
          ...testEnvVarsValues.commerceTools,
          projectId: undefined
        }
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
        commerceTools: {
          ...testEnvVarsValues.commerceTools,
          authUrl: undefined
        }
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
        commerceTools: {
          ...testEnvVarsValues.commerceTools,
          apiUrl: undefined
        }
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
