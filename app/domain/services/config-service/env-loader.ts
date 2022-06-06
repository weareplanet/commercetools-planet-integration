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
    webhookUrl: process.env.DT_CONNECTOR_WEBHOOK_URL,
    merchants: process.env.DT_MERCHANTS ? JSON.parse(process.env.DT_MERCHANTS) : undefined,
  }
};

export default configFromEnv;
