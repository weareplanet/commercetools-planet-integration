import * as yup from 'yup';

const RequestBodySchema = yup.object({
  key: yup.string()
    .max(20, 'Attribute key is longer than expected in Payment')
    .optional(),
  // custom: yup.object({
  //   fields: yup.object({
  //     merchantId: yup.string().required('Custom field MerchantId is missing in Payment'),
  //     successUrl: yup.string().required('Custom field successUrl is missing in Payment'),
  //     errorUrl: yup.string().required('Custom field errorUrl is missing in Payment'),
  //     cancelUrl: yup.string().required('Custom field cancelUrl is missing in Payment'),
  //     savePaymentMethod: yup.boolean()
  //       .optional()
  //       .when('savedPaymentMethodAlias', {
  //         is: (value: string) => !!value,
  //         then: (thisField) => thisField.test(
  //           'Custom field savePaymentMethod cannot be true when savedPaymentMethodAlias is not empty',
  //           (value) => !value
  //         )
  //       }),
  //     savedPaymentMethodKey: yup.string()
  //       .when('savePaymentMethod', {
  //         is: true,
  //         then: (thisField) => thisField.required()
  //       }),
  //     savedPaymentMethodAlias: yup.string().optional(),
  //     initRequest: yup.string()  // TODO: custom validation which deserializes initRequest from JSON and then performs checks...
  //     //  “Values [attributeName] specified in initRequest are duplicated” if also present in the <root> or `<root>.custom`
  //     //  autoSettle          // “Feature autoSettle not supported” if false    <-- strange
  //     //  authneticationOnly  // “Feature authneticationOnly not supported” if true
  //     //  mcp                 // “Feature mcp not supported” if present
  //     //  returnMobileToken   // “Feature returnMobileToken not supported” if present
  //     //  webhook             // “Webhook is a connector wide setting; setting it individually per request is not supported” if present
  //     // }).required()
  //   }).required()
  // })
}).required();

type RequestBodySchemaType = yup.TypeOf<typeof RequestBodySchema>;


export {
  RequestBodySchema, // This is exported to perform the validation (where handler is leveraged)
  RequestBodySchemaType // This is exported to be used as a type variable for generics
};
