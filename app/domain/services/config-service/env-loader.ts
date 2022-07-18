import { IAppConfig } from './schema';

const configFromEnv: IAppConfig = {
  commerceTools: {
    clientId: process.env.CT_CLIENT_ID,
    clientSecret: process.env.CT_CLIENT_SECRET,
    projectId: process.env.CT_PROJECT_ID,
    authUrl: process.env.CT_AUTH_URL,
    apiUrl: process.env.CT_API_URL,
  },
  datatrans: {
    apiUrls: {
      test: process.env.DT_TEST_API_URL,
      prod: process.env.DT_PROD_API_URL,
    },
    webhookUrl: process.env.DT_CONNECTOR_WEBHOOK_URL,
    // TODO: likely it'd be better to not do JSON.parse here, but delegate it to Yup.
    // Or (less desirable), if here - then add some error handling...
    merchants: process.env.DT_MERCHANTS ? JSON.parse(process.env.DT_MERCHANTS) : undefined,
  }
};

export default configFromEnv;
