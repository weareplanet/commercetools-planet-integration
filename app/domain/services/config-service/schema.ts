import * as yup from 'yup';

// see: https://planet.atlassian.net/browse/INC-153
import { DatatransEnvironment } from '../../../interfaces/datatrans';

const CommerceToolsConfigSchema = yup.object({
  clientId: yup
    .string()
    .typeError('CT_CLIENT_ID must be a string')
    .required('CT_CLIENT_ID is required'),
  clientSecret: yup
    .string()
    .typeError('CT_CLIENT_SECRET must be a string')
    .required('CT_CLIENT_SECRET is required'),
  projectId: yup
    .string()
    .typeError('CT_PROJECT_ID must be a string')
    .required('CT_PROJECT_ID is required'),
  authUrl: yup
    .string()
    .url('CT_AUTH_URL must be a valid URL')
    .required('CT_AUTH_URL is required'),
  apiUrl: yup
    .string()
    .url('CT_API_URL must be a valid URL')
    .required('CT_API_URL is required'),
});
export type ICommerceToolsConfig = yup.InferType<typeof CommerceToolsConfigSchema>;

const DatatransMerchantConfigSchema = yup.object({
  id: yup
    .string()
    .typeError('DT_MERCHANTS must be stringified JSON array of objects with merchants\' id as string')
    .required('DT_MERCHANTS must be stringified JSON array of objects with merchants\' id specified'),
  password: yup
    .string()
    .typeError('DT_MERCHANTS must be stringified JSON array of objects with merchants\' password as a string')
    .required('DT_MERCHANTS must be stringified JSON array of objects with merchants\' password specified'),
  environment: yup
    .string()
    .oneOf(Object.values(DatatransEnvironment), 'merchant\'s enviroment must be one of the following values: ${values}')
    .required('DT_MERCHANTS must be stringified JSON array of objects with merchants\' enviroment specified'),
  dtHmacKey: yup
    .string()
    .typeError('DT_MERCHANTS must be stringified JSON array of objects with merchants\' dtHmacKey as string')
    .required('DT_MERCHANTS must be stringified JSON array of objects with merchants\' dtHmacKey specified')
})
  .required();
export type IDatatransMerchantConfig = yup.InferType<typeof DatatransMerchantConfigSchema>;

const DatatransConfigSchema = yup.object({
  webhookUrl: yup
    .string()
    .url('DT_CONNECTOR_WEBHOOK_URL must be a valid URL')
    .required('DT_CONNECTOR_WEBHOOK_URL is required'),
  merchants: yup
    .array()
    .typeError('DT_MERCHANTS must be stringified array of objects')
    .of(DatatransMerchantConfigSchema)
    .required('DT_MERCHANTS is required'),
});
export type IDatatransConfig = yup.InferType<typeof DatatransConfigSchema>;

export const AppConfigSchema = yup.object({
  commerceTools: CommerceToolsConfigSchema,
  datatrans: DatatransConfigSchema
})
  .required();
export type IAppConfig = yup.InferType<typeof AppConfigSchema>;
