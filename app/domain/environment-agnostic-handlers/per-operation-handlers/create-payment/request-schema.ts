import * as yup from 'yup';

const RequestBodySchema = yup.object({
  key: yup.string().required('Field key is missing in Payment')
    .max(20, 'Attribute key is longer than expected in Payment'),
  custom: yup.object({
    fields: yup.object({
      merchantId: yup.string().required('Custom field merchantId is missing in Payment'), // TODO: try to use ${path}
      successUrl: yup.string().required('Custom field successUrl is missing in Payment'),
      errorUrl: yup.string().required('Custom field errorUrl is missing in Payment'),
      cancelUrl: yup.string().required('Custom field cancelUrl is missing in Payment'),
      savePaymentMethod: yup.boolean().optional()
        .when('savedPaymentMethodAlias', {
          is: (value: string) => !!value,
          then: (thisField) => thisField.test(
            'boolean',
            'Custom field savePaymentMethod cannot be true when savedPaymentMethodAlias is not empty',
            (value) => !value
          )
        }),
      savedPaymentMethodKey: yup.string().optional()
        .when('savePaymentMethod', {
          is: true,
          then: (thisField) => thisField.required('Custom field savedMethodsKey is missing in Payment')
        }),
      savedPaymentMethodAlias: yup.string().optional(),
      initRequest: yup.string().optional() // TODO: custom validation which deserializes initRequest from JSON and then performs checks... See .transform
      // //  “Values [attributeName] specified in initRequest are duplicated” if also present in the <root> or `<root>.custom`
      // //  autoSettle          // “Feature autoSettle not supported” if false    <-- strange
      // //  authneticationOnly  // “Feature authneticationOnly not supported” if true
      // //  mcp                 // “Feature mcp not supported” if present
      // //  returnMobileToken   // “Feature returnMobileToken not supported” if present
      // //  webhook             // “Webhook is a connector wide setting; setting it individually per request is not supported” if present
      // // }).optional()
    }).required()
  }).required()
}).required();

type RequestBodySchemaType = yup.TypeOf<typeof RequestBodySchema>;


export {
  RequestBodySchema, // This is exported to perform the validation (where handler is leveraged)
  RequestBodySchemaType // This is exported to be used as a type variable for generics
};
