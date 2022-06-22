import * as yup from 'yup';

// NOTE: could be changed if it need
enum ConnectorEnvironments {
  PROD = 'prod',
  STAGE = 'stage',
  TEST = 'test'
}

export interface ICommerceToolsConfig {
  clientId: string;
  clientSercet: string;
  projectId: string;
  authUrl: string;
  apiUrl: string;
  merchants: Array<{ id: string; password: string; environment: ConnectorEnvironments | string }>
}

const {
  CT_CLIENT_ID,
  CT_CLIENT_SECRET,
  CT_PROJECT_ID,
  CT_AUTH_URL,
  CT_API_URL,
  CT_MERCHANTS
} = process.env;

export const commerceToolsConfig: ICommerceToolsConfig = {
  clientId: CT_CLIENT_ID,
  clientSercet: CT_CLIENT_SECRET,
  projectId: CT_PROJECT_ID,
  authUrl: CT_AUTH_URL,
  apiUrl: CT_API_URL,
  merchants: CT_MERCHANTS ? JSON.parse(CT_MERCHANTS) : undefined,
};

export const CommerceToolsConfigSchema = yup.object({
  clientId: yup.string()
    .typeError('CT_CLIENT_ID must be a string')
    .required('CT_CLIENT_ID is required'),
  clientSercet: yup
    .string()
    .typeError('CT_CLIENT_SECRET must be a string')
    .required('CT_CLIENT_SECRET is required'),
  projectId: yup
    .string()
    .typeError('CT_PROJECT_ID must be a string')
    .required('CT_PROJECT_ID is required'),
  authUrl: yup
    .string()
    .typeError('CT_AUTH_URL must be a string')
    .required('CT_AUTH_URL is required'),
  apiUrl: yup
    .string()
    .typeError('CT_API_URL must be a string')
    .required('CT_API_URL is required'),
  merchants: yup
    .array()
    .typeError('CT_MERCHANTS must be stringified array of objects')
    .of(
      yup
        .object({
          id: yup.string().required('CT_MERCHANTS must be stringified array with merchants\' id'),
          password: yup.string().required('CT_MERCHANTS must be stringified array with merchants\' password'),
          environment: yup
            .string()
            .oneOf(Object.values(ConnectorEnvironments))
            .typeError('CT_MERCHANTS must be stringified array with merchants\' enviroment specified')
            .required('CT_MERCHANTS must be stringified array with merchants\' enviroment specified')
        })
    ).required('CT_MERCHANTS is required'),
}).required();
