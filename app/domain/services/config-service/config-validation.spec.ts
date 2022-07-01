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
    DT_TEST_API_URL,
    DT_PROD_API_URL,
    DT_MERCHANTS,
    DT_CONNECTOR_WEBHOOK_URL
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
      webhookUrl: DT_CONNECTOR_WEBHOOK_URL,
      merchants: DT_MERCHANTS,
    }
  };

  const testEnvVarsValues = {
    commerceTools: {
      clientId: 'clientId',
      clientSercet: 'clientSercet',
      projectId: 'projectId',
      authUrl: 'https://authUrl.test',
      apiUrl: 'https://apiUrl.test',
    },
    datatrans: {
      apiUrls: {
        test: 'https://testUrl.test',
        prod: 'https://prodUrl.test'
      },
      webhookUrl: 'https://webhookUrl.test',
      merchants: [{ id: 'id', password: 'password', environment: ConnectorEnvironment.TEST, dtHmacKey: 'HMAC key' }],
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

  // TODO: get rid of this weird async load in every test
  const loadLogger = async () => {
    const logger = (await import('../log-service')).default;
    jest.spyOn(logger, 'info');
    jest.spyOn(logger, 'debug');

    return logger;
  };

  afterAll(() => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    setProcessEnvVars(originalEnvVarsValues); // reset to defaults
    jest.resetModules();
  });

  describe('commerTools config validations', () => {
    beforeEach(async () => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      setProcessEnvVars(originalEnvVarsValues); // reset to defaults
      jest.resetModules();
    });

    it('should pass when all neccessary values are provided and correct', async () => {
      expect.assertions(3);
      const logger = await loadLogger();

      setProcessEnvVars(testEnvVarsValues);
      const configService = (await import('.')).default;

      expect(configService.getConfig()).toEqual(testEnvVarsValues);
      expect(logger.info).toHaveBeenCalled();
      expect(logger.debug).toHaveBeenCalled();
    });

    it('should throw validation error about clientId', async () => {
      expect.assertions(4);
      const logger = await loadLogger();
      setProcessEnvVars({
        ...testEnvVarsValues,
        commerceTools: {
          ...testEnvVarsValues.commerceTools,
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
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

    it('should throw validation error about clientSercet', async () => {
      expect.assertions(4);
      const logger = await loadLogger();
      setProcessEnvVars({
        ...testEnvVarsValues,
        commerceTools: {
          ...testEnvVarsValues.commerceTools,
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
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

    it('should throw validation error about projectId', async () => {
      expect.assertions(4);
      const logger = await loadLogger();
      setProcessEnvVars({
        ...testEnvVarsValues,
        commerceTools: {
          ...testEnvVarsValues.commerceTools,
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
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

    it('should throw validation error about authUrl', async () => {
      expect.assertions(4);
      const logger = await loadLogger();
      setProcessEnvVars({
        ...testEnvVarsValues,
        commerceTools: {
          ...testEnvVarsValues.commerceTools,
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
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

    it('should throw validation error about apiUrl', async () => {
      expect.assertions(4);
      const logger = await loadLogger();
      setProcessEnvVars({
        ...testEnvVarsValues,
        commerceTools: {
          ...testEnvVarsValues.commerceTools,
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
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

  describe('Datatrans config validations', () => {
    beforeEach(async () => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      setProcessEnvVars(originalEnvVarsValues);
      jest.resetModules();
    });

    describe('apiUrls validations', () => {
      describe('apiUrls.prod', () => {
        it('when prod URL is absent - should throw an error', async () => {
          expect.assertions(4);
          const logger = await loadLogger();
          setProcessEnvVars({
            ...testEnvVarsValues,
            datatrans: {
              ...testEnvVarsValues.datatrans,
              apiUrls: {
                ...testEnvVarsValues.datatrans.apiUrls,
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                prod: undefined
              }
            }
          });

          try {
            await import('.');
            expect.assertions(1);
          } catch (err) {
            expect(err).toBeInstanceOf(Error);
            expect(err.message).toEqual('DT_PROD_API_URL is required');
          }
          expect(logger.info).not.toHaveBeenCalled();
          expect(logger.debug).not.toHaveBeenCalled();
        });

        it('when prod URL is malformed - should throw an error', async () => {
          expect.assertions(4);
          const logger = await loadLogger();
          setProcessEnvVars({
            ...testEnvVarsValues,
            datatrans: {
              ...testEnvVarsValues.datatrans,
              apiUrls: {
                ...testEnvVarsValues.datatrans.apiUrls,
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                prod: 'incorrect URL'
              }
            }
          });

          try {
            await import('.');
            expect.assertions(1);
          } catch (err) {
            expect(err).toBeInstanceOf(Error);
            expect(err.message).toEqual('DT_PROD_API_URL must be a valid URL');
          }
          expect(logger.info).not.toHaveBeenCalled();
          expect(logger.debug).not.toHaveBeenCalled();
        });
      });

      describe('apiUrls.test', () => {
        it('when test URL is absent - should throw an error', async () => {
          expect.assertions(4);
          const logger = await loadLogger();
          setProcessEnvVars({
            ...testEnvVarsValues,
            datatrans: {
              ...testEnvVarsValues.datatrans,
              apiUrls: {
                ...testEnvVarsValues.datatrans.apiUrls,
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                test: undefined
              }
            }
          });

          try {
            await import('.');
            expect.assertions(1);
          } catch (err) {
            expect(err).toBeInstanceOf(Error);
            expect(err.message).toEqual('DT_TEST_API_URL is required');
          }
          expect(logger.info).not.toHaveBeenCalled();
          expect(logger.debug).not.toHaveBeenCalled();
        });

        it('when test URL is malformed - should throw an error', async () => {
          expect.assertions(4);
          const logger = await loadLogger();
          setProcessEnvVars({
            ...testEnvVarsValues,
            datatrans: {
              ...testEnvVarsValues.datatrans,
              apiUrls: {
                ...testEnvVarsValues.datatrans.apiUrls,
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                test: 'incorrect URL'
              }
            }
          });

          try {
            await import('.');
            expect.assertions(1);
          } catch (err) {
            expect(err).toBeInstanceOf(Error);
            expect(err.message).toEqual('DT_TEST_API_URL must be a valid URL');
          }
          expect(logger.info).not.toHaveBeenCalled();
          expect(logger.debug).not.toHaveBeenCalled();
        });
      });
    });

    describe('webhookUrl validations', () => {
      it('when absent - should throw an error', async () => {
        expect.assertions(4);
        const logger = await loadLogger();
        setProcessEnvVars({
          ...testEnvVarsValues,
          datatrans: {
            ...testEnvVarsValues.datatrans,
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            webhookUrl: undefined
          }
        });

        try {
          await import('.');
          expect.assertions(1);
        } catch (err) {
          expect(err).toBeInstanceOf(Error);
          expect(err.message).toEqual('DT_CONNECTOR_WEBHOOK_URL is required');
        }
        expect(logger.info).not.toHaveBeenCalled();
        expect(logger.debug).not.toHaveBeenCalled();
      });

      it('when is malformed - should throw an error', async () => {
        expect.assertions(4);
        const logger = await loadLogger();
        setProcessEnvVars({
          ...testEnvVarsValues,
          datatrans: {
            ...testEnvVarsValues.datatrans,
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            webhookUrl: 'incorrect URL'
          }
        });

        try {
          await import('.');
          expect.assertions(1);
        } catch (err) {
          expect(err).toBeInstanceOf(Error);
          expect(err.message).toEqual('DT_CONNECTOR_WEBHOOK_URL must be a valid URL');
        }
        expect(logger.info).not.toHaveBeenCalled();
        expect(logger.debug).not.toHaveBeenCalled();
      });
    });

    describe('merchants validations', () => {

      describe('should throw validation error about merchants\' id for commerceToolsConfig', () => {
        it('when it is absent', async() => {
          expect.assertions(4);
          const logger = await loadLogger();
          setProcessEnvVars({
            ...testEnvVarsValues,
            datatrans: {
              ...testEnvVarsValues.datatrans,
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              merchants: [{ password: '123', environment: 'test', dtHmacKey: 'HMAC key' }]
            }
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
            datatrans: {
              ...testEnvVarsValues.datatrans,
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              merchants: [{ id: 1, password: '123', environment: 'test', dtHmacKey: 'HMAC key' }]
            }
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
            datatrans: {
              ...testEnvVarsValues.datatrans,
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              merchants: [{ id: '1', environment: ConnectorEnvironment.TEST, dtHmacKey: 'HMAC key' }]
            }
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
            datatrans: {
              ...testEnvVarsValues.datatrans,
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              merchants: [{ id: '1', password: 123, environment: ConnectorEnvironment.TEST, dtHmacKey: 'HMAC key' }]
            }
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
            datatrans: {
              ...testEnvVarsValues.datatrans,
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              merchants: [{ id: 'id', password: 'password', dtHmacKey: 'HMAC key' }]
            }
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
            datatrans: {
              ...testEnvVarsValues.datatrans,
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              merchants: [{ id: 'id', password: 'password', environment: 'incorrect env value', dtHmacKey: 'HMAC key' }]
            }
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
            datatrans: {
              ...testEnvVarsValues.datatrans,
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              merchants: [{ id: 'id', password: 'password', environment: ConnectorEnvironment.TEST }]
            }
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
            datatrans: {
              ...testEnvVarsValues.datatrans,
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              merchants: [{ id: 'id', password: 'password', environment: ConnectorEnvironment.TEST, dtHmacKey: 123 }]
            }
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
  });
});
