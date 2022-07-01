import * as yup from 'yup';

import { ConnectorEnvironment } from './interfaces';

const CommerceToolsConfigSchema = yup.object({
  clientId: yup
    .string()
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
});

const DatatransConfigSchema = yup.object({
  apiUrls: yup.object({
    test: yup.string().required(),
    prod: yup.string().required(),
  }),
  merchants: yup
    .array()
    .typeError('CT_MERCHANTS must be stringified array of objects')
    .of(
      yup
        .object({
          id: yup
            .string()
            .typeError('CT_MERCHANTS must be stringified array with merchants\' id as string')
            .required('CT_MERCHANTS must be stringified array with merchants\' id as string'),
          password: yup
            .string()
            .typeError('CT_MERCHANTS must be stringified array with merchants\' password as a string')
            .required('CT_MERCHANTS must be stringified array with merchants\' password as a string'),
          environment: yup
            .string()
            .oneOf(Object.values(ConnectorEnvironment))
            .typeError('CT_MERCHANTS must be stringified array with merchants\' enviroment specified')
            .required('CT_MERCHANTS must be stringified array with merchants\' enviroment specified')
        }).required()
    ).required('CT_MERCHANTS is required'),
});

export const AppConfigSchema = yup.object({
  commerceTools: CommerceToolsConfigSchema,
  datatrans: DatatransConfigSchema
}).required();

export type IAppConfig = yup.InferType<typeof AppConfigSchema>;
export type ICommerceToolsConfig = yup.InferType<typeof CommerceToolsConfigSchema>;
export type IDatatransConfig = yup.InferType<typeof DatatransConfigSchema>;
