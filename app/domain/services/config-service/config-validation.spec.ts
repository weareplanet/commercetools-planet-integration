import { ICommerceToolsConfig, ConnectorEnvironment } from './interfaces';

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
  const loadLogger = async () => {
    const logger = (await import('../log-service')).default;
    jest.spyOn(logger, 'info');
    jest.spyOn(logger, 'debug');

    return logger;
  };
  const testEnvVarsValues = {
    clientId: 'clientId',
    clientSercet: 'clientSercet',
    projectId: 'projectId',
    authUrl: 'authUrl',
    apiUrl: 'apiUrl',
    merchants: [{ id: 'id', password: 'password', environment: ConnectorEnvironment.TEST }],
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

    it('should throw validation error about merchants\' enviroment for commerceToolsConfig', async () => {
      expect.assertions(4);
      const logger = await loadLogger();
      setProcessEnvVars({
        ...testEnvVarsValues,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        merchants: [{ id: 1 }]
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
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        merchants: [{ id: '1', password: 123, environment: ConnectorEnvironment.TEST }]
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
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        merchants: [{ id: 1, password: '123', environment: 'test' }]
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