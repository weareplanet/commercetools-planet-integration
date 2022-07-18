// In case of necessity something specific individually for exactly this handler
// should be exported instead of
// CommerceToolsExtensionRequestBodySchema and ICommerceToolsExtensionRequest from 'app/interfaces'
export {
  CommerceToolsExtensionRequestBodySchema as RequestBodySchema, // This is exported to perform the validation (where handler is leveraged)
  ICommerceToolsExtensionRequestBody as IRequestBody // This is exported to be used as a type variable for generics
} from '../../../../interfaces';
