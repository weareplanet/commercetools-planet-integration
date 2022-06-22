describe('Connector config validations', () => {
  const {
    CT_CLIENT_ID,
    CT_CLIENT_SECRET,
    CT_PROJECT_ID,
    CT_AUTH_URL,
    CT_API_URL,
    CT_MERCHANTS
  } = process.env;
  const defaultEnvVars = {
    clientId: CT_CLIENT_ID,
    clientSercet: CT_CLIENT_SECRET,
    projectId: CT_PROJECT_ID,
    authUrl: CT_AUTH_URL,
    apiUrl: CT_API_URL,
    merchants: CT_MERCHANTS,
  };
  const setProcessEnvVars = (envVars: Record<string, unknown>) => {
    if (envVars.clientId) {
      process.env.CT_CLIENT_ID = String(envVars.clientId);
    } else {
      delete process.env.CT_CLIENT_ID;
    }
    if (envVars.clientSercet) {
      process.env.CT_CLIENT_SECRET = String(envVars.clientSercet);
    } else {
      delete process.env.CT_CLIENT_SECRET;
    }
    if (envVars.projectId) {
      process.env.CT_PROJECT_ID = String(envVars.projectId);
    } else {
      delete process.env.CT_PROJECT_ID;
    }
    if (envVars.authUrl) {
      process.env.CT_AUTH_URL = String(envVars.authUrl);
    } else {
      delete process.env.CT_AUTH_URL;
    }
    if (envVars.apiUrl) {
      process.env.CT_API_URL = String(envVars.apiUrl);
    } else {
      delete process.env.CT_AUTH_URL;
    }
    if (envVars.merchants) {
      process.env.CT_MERCHANTS = envVars.merchants ? JSON.stringify(envVars.merchants) : undefined;
    } else {
      delete process.env.CT_MERCHANTS;
    }
  };
  const envVars = {
    clientId: 'clientId',
    clientSercet: 'clientSercet',
    projectId: 'projectId',
    authUrl: 'authUrl',
    apiUrl: 'apiUrl',
    merchants: [{ id: 'id', password: 'password', environment: 'test' }],
  };

  afterAll(() => {
    // reset to default
    setProcessEnvVars(defaultEnvVars);
    jest.resetModules();
  });

  describe('Validate commerTools config', () => {
    beforeEach(async () => {
      setProcessEnvVars(defaultEnvVars);
      jest.resetModules();
    });

    it('should pass validation for commerceToolsConfig', async () => {
      const logger = (await import('../log-service')).default;
      jest.spyOn(logger, 'info');
      jest.spyOn(logger, 'debug');
      setProcessEnvVars(envVars);

      const configService = (await import('.')).default;

      expect(configService.getConfig().commerceToolsConfig).toEqual(envVars);
    });

    it('should throw validation error for commerceToolsConfig', async () => {
      const logger = (await import('../log-service')).default;
      jest.spyOn(logger, 'info');
      jest.spyOn(logger, 'debug');
      setProcessEnvVars({
        ...envVars,
        merchants: [{ id: 1 }]
      });

      try {
        await import('.');
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
      }
    });
  });
});
