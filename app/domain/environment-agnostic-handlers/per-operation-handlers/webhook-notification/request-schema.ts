// In case of necessity something specific individually for exactly this handler
// should be exported instead of
// DatatransWebhookRequestBodySchema and IDatatransWebhookRequestBody from 'app/interfaces'
export {
  DatatransWebhookRequestBodySchema, // This is exported to perform the validation (where handler is leveraged)
  IDatatransWebhookRequestBody // This is exported to be used as a type variable for generics
} from '../../../../interfaces';
