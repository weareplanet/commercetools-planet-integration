import * as yup from 'yup';
import { MessageParams } from 'yup/lib/types';
import configService from '../../../services/config-service';

const takeFieldNameFromPath = (path: string) => {
  return path.split('.').pop();
};

const ErrorMessages = {
  missingPaymentField: (params: MessageParams): string => `Field ${takeFieldNameFromPath(params.path)} is missing in Payment`,
  longKey: () => 'Attribute key is longer than expected in Payment',
  merchantCredentialsMissing: () => 'Merchant credentials are missing',
  missingCustomField: (params: MessageParams): string => `Custom field ${takeFieldNameFromPath(params.path)} is missing in Payment`,
  rejectedSavePaymentMethod: () => 'Custom field savePaymentMethod cannot be true when savedPaymentMethodAlias is not empty',
  rejectedWebhook: () => 'Webhook is a connector wide setting; setting it individually per request is not supported',
  // For the following messages I couldn't force Yup to calculate the field name -
  // so you cannot just pass any of these functions to Yup,
  // you have to call it on the schema declaration time
  featureNotSupported: (fieldName: string): string => `Feature ${fieldName} not supported`,
  featureDisablingNotSupported: (fieldName: string): string => `Feature ${takeFieldNameFromPath(fieldName)} disabling not supported`,
};

const RequestBodySchema = yup.object({
  key: yup.string()
    .required(ErrorMessages.missingPaymentField)
    .max(20, ErrorMessages.longKey),
  custom: yup.object({
    fields: yup.object({
      merchantId: yup
        .string()
        .required(ErrorMessages.missingCustomField)
        .test((value, context) => {
          const merchantConfig = configService.getConfig().commerceToolsConfig?.merchants.find((mc) => mc.id === value);
          if (!merchantConfig || !merchantConfig.password) {
            return context.createError({ message: ErrorMessages.merchantCredentialsMissing });
          }
          return true;
        }),
      successUrl: yup
        .string()
        .required(ErrorMessages.missingCustomField),
      errorUrl: yup
        .string()
        .required(ErrorMessages.missingCustomField),
      cancelUrl: yup
        .string()
        .required(ErrorMessages.missingCustomField),
      savePaymentMethod: yup
        .boolean()
        .optional()
        .when('savedPaymentMethodAlias', {
          is: (value: string) => !!value,
          then: (thisField) => thisField.test(
            'savePaymentMethod vs savedPaymentMethodAlias validator',
            ErrorMessages.rejectedSavePaymentMethod,
            (value) => !value
          )
        }),
      savedPaymentMethodKey: yup
        .string()
        .optional()
        .when('savePaymentMethod', {
          is: true,
          then: (thisField) => thisField.required(ErrorMessages.missingCustomField)
        }),
      savedPaymentMethodAlias: yup
        .string()
        .optional(),
      initRequest: yup
        .object()
        .optional()
        .test('initRequest content validator', (initRequestObj) => {
          if (!initRequestObj) {
            return true;
          }

          yup.boolean()
            .test('boolean', ErrorMessages.featureDisablingNotSupported('autoSettle'), (value) => (value === undefined) || (value === true))
            .validateSync(initRequestObj.autoSettle);

          yup.boolean()
            .test('boolean', ErrorMessages.featureNotSupported('authneticationOnly'), (value) => !value)
            .validateSync(initRequestObj.authneticationOnly);

          yup.mixed()
            .test('mixed', ErrorMessages.featureNotSupported('mcp'), (value) => value === undefined)
            .validateSync(initRequestObj.mcp);

          yup.mixed()
            .test('mixed', ErrorMessages.featureNotSupported('returnMobileToken'), (value) => value === undefined)
            .validateSync(initRequestObj.returnMobileToken);

          yup.mixed()
            .test('mixed', ErrorMessages.rejectedWebhook, (value) => value === undefined)
            .validateSync(initRequestObj.webhook);

          return true;
        })
    }).required()
  }).required()
}).required()
  .test('initRequest fields duplicaction validator', (rootObj, context) => {
    const initRequest = rootObj.custom.fields.initRequest;
    if (!initRequest) {
      return true;
    }
    const initRequestKeys = Object.keys(initRequest);

    let duplicatedFields =
    initRequestKeys.filter((key) => (key in rootObj))
      .concat(initRequestKeys.filter((key) => (key in rootObj.custom)))
      .concat(initRequestKeys.filter((key) => (key in rootObj.custom.fields)));

    if (duplicatedFields.length) {
      duplicatedFields = [...new Set(duplicatedFields)];
      return context.createError({ message: `Values ${duplicatedFields} specified in initRequest are duplicated` });
    }

    return true;
  });

type RequestBodySchemaType = yup.TypeOf<typeof RequestBodySchema>;


export {
  RequestBodySchema, // This is exported to perform the validation (where handler is leveraged)
  RequestBodySchemaType // This is exported to be used as a type variable for generics
};
