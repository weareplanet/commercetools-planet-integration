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
      initRequest: yup.object().optional()
        // .transform((value, originalvalue, context) => {
        //   if (context.isType(value)) return value; // already parsed to object
        //   try {
        //     return JSON.parse(value);
        //   } catch(e) {
        //     return {}
        //   }
        // })
        .test('initRequest content validator', (initRequestObj) => {
          if (!initRequestObj) {
            return true;
          }
          yup.boolean()
            .test('boolean', 'Feature autoSettle disabling not supported', (value) => (value === undefined) || (value === true))
            .validate(initRequestObj.autoSettle);

          yup.boolean()
            .test('boolean', 'Feature authneticationOnly not supported', (value) => !value)
            .validate(initRequestObj.authneticationOnly);

          yup.mixed()
            .test('mixed', 'Feature mcp not supported', (value) => value === undefined)
            .validate(initRequestObj.mcp);

          yup.mixed()
            .test('mixed', 'Feature returnMobileToken not supported', (value) => value === undefined)
            .validate(initRequestObj.returnMobileToken);

          yup.mixed()
            .test('mixed', 'Webhook is a connector wide setting; setting it individually per request is not supported', (value) => value === undefined)
            .validate(initRequestObj.webhook);

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
