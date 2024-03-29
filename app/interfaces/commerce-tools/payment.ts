import * as yup from 'yup';

import { ConfigService } from '../../domain/services/config-service';
import { ErrorMessages } from './error-messages';

export enum ActionRequestedOnPayment {
  syncPaymentInformation = 'syncPaymentInformation' // status check should be performed
}

export const CommerceToolsPaymentSchema = yup.object({
  key: yup.string()
    .required(ErrorMessages.missingPaymentField())
    .max(20, ErrorMessages.longKey()),
  amountPlanned: yup.object({
    currencyCode: yup.string().optional(),
    centAmount: yup.number().optional(),
  }).optional(),
  paymentMethodInfo: yup.object({
    method: yup.string().optional(),
    paymentInterface: yup.string().optional(),
  }).optional(),
  paymentStatus: yup.object({
    interfaceCode: yup.string().optional(),
  }).optional(),
  custom: yup.object({
    fields: yup.object({
      action: yup
        .mixed<ActionRequestedOnPayment>()
        .oneOf(Object.values(ActionRequestedOnPayment))
        .optional(),
      merchantId: yup
        .string()
        .required(ErrorMessages.missingCustomField())
        .test((value, context) => {
          const merchantConfig = new ConfigService().getConfig().datatrans.merchants.find((mc) => mc.id === value);
          if (!merchantConfig || !merchantConfig.password) {
            return context.createError({ message: ErrorMessages.merchantCredentialsMissing() });
          }
          return true;
        }),
      successUrl: yup
        .string()
        .required(ErrorMessages.missingCustomField()),
      errorUrl: yup
        .string()
        .required(ErrorMessages.missingCustomField()),
      cancelUrl: yup
        .string()
        .required(ErrorMessages.missingCustomField()),
      savePaymentMethod: yup
        .boolean()
        .optional()
        .when('savedPaymentMethodAlias', {
          is: (value: string) => !!value,
          then: (thisField) => thisField.test(
            'savePaymentMethod vs savedPaymentMethodAlias validator',
            ErrorMessages.rejectedSavePaymentMethod(),
            (value) => !value
          )
        }),
      savedPaymentMethodsKey: yup
        .string()
        .optional()
        .when('savePaymentMethod', {
          is: true,
          then: (thisField) => thisField.required(ErrorMessages.missingCustomField())
        })
        .when('savedPaymentMethodAlias', {
          is: (value: string) => !!value,
          then: (thisField) => thisField.required(ErrorMessages.missingCustomField())
        }),
      savedPaymentMethodAlias: yup
        .string()
        .optional(),
      initRequest: yup
        .object({
          option: yup.object().optional(),
          autoSettle: yup.boolean().optional(),
          authenticationOnly: yup.boolean().optional(),
          returnMobileToken: yup.boolean().optional(),
          webhook: yup.object().optional(),
          mcp: yup.object().optional(),
        })
        .optional()
        .test('initRequest content validator', (initRequestObj) => {
          if (!initRequestObj) {
            return true;
          }

          yup.boolean()
            .test('boolean', ErrorMessages.featureDisablingNotSupported('autoSettle'), (value) => (value === undefined) || (value === true))
            .validateSync(initRequestObj.autoSettle);

          yup.boolean()
            .test('boolean', ErrorMessages.featureNotSupported('authenticationOnly'), (value) => !value)
            .validateSync(initRequestObj.authenticationOnly);

          yup.mixed()
            .test('mixed', ErrorMessages.featureNotSupported('mcp'), (value) => value === undefined)
            .validateSync(initRequestObj.mcp);

          yup.mixed()
            .test('mixed', ErrorMessages.featureNotSupported('returnMobileToken'), (value) => value === undefined)
            .validateSync(initRequestObj.returnMobileToken);

          yup.mixed()
            .test('mixed', ErrorMessages.rejectedWebhook(), (value) => value === undefined)
            .validateSync(initRequestObj.webhook);

          return true;
        }),
      language: yup.string().optional(),
    }).required()
  }).required()
}).required()
  .test('initRequest fields duplication validator', (rootObj, context) => {
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

//see:  https://planet.atlassian.net/browse/INC-158
export type ICommerceToolsPayment = yup.TypeOf<typeof CommerceToolsPaymentSchema>;
