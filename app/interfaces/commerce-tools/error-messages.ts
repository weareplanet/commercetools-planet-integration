import { MessageParams } from 'yup/lib/types';

const takeFieldNameFromPath = (path: string) => {
  return path.split('.').pop();
};

// Every message is a function for the sake of unification.
// When it's possible (and makes sense) to force Yup to calculate the field name at the validation time - it returns a function (for Yup),
// otherwise - returns a string calculated at the schema declaration time.
export const ErrorMessages = {
  missingPaymentField: () => {
    return (params: MessageParams) => `Field ${takeFieldNameFromPath(params.path)} is missing in Payment`;
  },
  missingCustomField: () => {
    return (params: MessageParams) => `Custom field ${takeFieldNameFromPath(params.path)} is missing in Payment`;
  },
  longKey: () => {
    return 'Attribute key is longer than expected in Payment';
  },
  merchantCredentialsMissing: () => {
    return 'Merchant credentials are missing';
  },
  rejectedSavePaymentMethod: () => {
    return 'Custom field savePaymentMethod cannot be true when savedPaymentMethodAlias is not empty';
  },
  rejectedWebhook: () => {
    return 'Webhook is a connector wide setting; setting it individually per request is not supported';
  },
  featureNotSupported: (fieldName: string) => {
    return `Feature ${fieldName} not supported`;
  },
  featureDisablingNotSupported: (fieldName: string) => {
    return `Feature ${fieldName} disabling not supported`;
  },
};
