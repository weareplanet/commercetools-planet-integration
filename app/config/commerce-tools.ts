import * as yup from 'yup';

// NOTE: could change if it need
enum ConnectorEnvironments {
  PROD = 'prod',
  STAGE = 'stage',
  TEST = 'test'
}

interface CommerceToolsConfig {
  clientId: string;
  clientSercet: string;
  projectId: string;
  authUrl: string;
  apiUrl: string;
  merchants: Array<{ id: string; password: string; environment: ConnectorEnvironments }>
}

const {
  CT_CLIENT_ID,
  CT_CLIENT_SECRET,
  CT_PROJECT_ID,
  CT_AUTH_URL,
  CT_API_URL,
  CT_MERCHANTS
} = process.env;

export const config: CommerceToolsConfig = {
  clientId: CT_CLIENT_ID,
  clientSercet: CT_CLIENT_SECRET,
  projectId: CT_PROJECT_ID,
  authUrl: CT_AUTH_URL,
  apiUrl: CT_API_URL,
  merchants: JSON.parse(CT_MERCHANTS),
};

export const commerceToolsConfigSchema = yup.object().shape({
  clientId: yup.string().required(),
  clientSercet: yup.string().required(),
  projectId: yup.string().required(),
  authUrl: yup.string().required(),
  apiUrl: yup.string().required(),
  merchants: yup.array().of(
    yup.object().shape({
      id: yup.string().required(),
      password: yup.string().required(),
      environment: yup
        .string()
        .oneOf(Object.values(ConnectorEnvironments))
        .required()
    })
  ),
}).required();
