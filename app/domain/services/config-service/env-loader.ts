import { ICommerceToolsConfig } from './schema';

const configFromEnv: ICommerceToolsConfig = {
  clientId: process.env.CT_CLIENT_ID,
  clientSercet: process.env.CT_CLIENT_SECRET,
  projectId: process.env.CT_PROJECT_ID,
  authUrl: process.env.CT_AUTH_URL,
  apiUrl: process.env.CT_API_URL,
  // TODO: likely it'd be better to not do JSON.parse here, but delegate it to Yup.
  // Or (less desirable), if here - then add some error handling...
  merchants: process.env.CT_MERCHANTS ? JSON.parse(process.env.CT_MERCHANTS) : undefined,
};

export default configFromEnv;
