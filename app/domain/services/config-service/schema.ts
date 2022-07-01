import * as yup from 'yup';

import { ConnectorEnvironment } from './interfaces';

export const CommerceToolsConfigSchema = yup.object({
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
  merchants: yup
    .array()
    .typeError('CT_MERCHANTS must be stringified array of objects')
    .of(
      yup
        .object({
          id: yup
            .string()
            .typeError('CT_MERCHANTS must be stringified JSON array of objects with merchants\' id as string')
            .required('CT_MERCHANTS must be stringified JSON array of objects with merchants\' id specified'),
          password: yup
            .string()
            .typeError('CT_MERCHANTS must be stringified JSON array of objects with merchants\' password as a string')
            .required('CT_MERCHANTS must be stringified JSON array of objects with merchants\' password specified'),
          environment: yup
            .string()
            .oneOf(Object.values(ConnectorEnvironment), 'merchant\'s enviroment must be one of the following values: prod, stage, test')
            // .typeError('CT_MERCHANTS must be stringified JSON array of objects with merchants\' enviroment as string')
            .required('CT_MERCHANTS must be stringified JSON array of objects with merchants\' enviroment specified'),
          dtHmacKey: yup
            .string()
            .typeError('CT_MERCHANTS must be stringified JSON array of objects with merchants\' dtHmacKey as string')
            .required('CT_MERCHANTS must be stringified JSON array of objects with merchants\' dtHmacKey specified')
        }).required()
    ).required('CT_MERCHANTS is required'),
}).required();

export type ICommerceToolsConfig = yup.InferType<typeof CommerceToolsConfigSchema>;
