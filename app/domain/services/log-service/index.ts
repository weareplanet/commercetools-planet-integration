import pino from 'pino';

const { LOG_LEVEL = 'debug' } = process.env;

const getPossiblePaths = (path: string): string[] => path.split('.').reduce((acc, _, index, arr) => {
  acc.push(arr.slice(index).join('.'));

  return acc;
}, []);

const pathsToRedactedFields: string[] = [
  // related to Payment obj in app/domain/environment-agnostic-handlers/per-operation-handlers/create-payment/request-schema.ts
  ...getPossiblePaths('body.resource.obj.custom.fields.savedPaymentMethodAlias'),
  // related to DataTrans transaction request body
  ...getPossiblePaths('body.*.alias'),
];

const pinoOptions: pino.LoggerOptions = {
  level: LOG_LEVEL,
  messageKey: 'message', // Log the string passed to a log method under this key (instead of the default `msg`)
  nestedKey: 'payload',  // Log the object passed to a log method under this key
  formatters: {
    level(label: unknown /* , number: unknown */) {
      // default is { level: number }
      return { level: label };
    },
    // bindings(/* bindings: Record<string, unknown> */) {
    //   // default is { pid, hostname }
    //   return {};
    // },
  },
  base: {}, // the same effect as of (now commented out) bindings above
  redact: {
    paths: pathsToRedactedFields,
    censor: '[REDACTED]'
  }
};

// TODO: to implement INC-59 requirements:
//
// Create RequestContextService:
// 1. Implement the instantiable RequestContextService class which has at least getContext() method.
// 2. On every entry point ASAP (at least in app/domain/environment-agnostic-handlers/per-operation-handlers/any-handler-wrapper.ts) -
//    create an instance pasing request to it -
//    the constructor should extract paymentKey from the request,
//    extract correlationId from the request or create it otherwise
//    and keep that context data in the instance.
// 3. Create an instance of LogService passing requestContextService into it.
// 4. Pass this logService instance to all used services (everywhere below this logService instance should be used).
//    To achieve this - make ALL service instantiable to inject a logService instance to each of them.
//
// Make LogService context-aware:
// 1. Make this module exporting the instantiable LogService class.
// 2. Pass requestContextService instance as an argument into LogService constructor.
// 3. Make LogService passing { requestContext: requestContextService.getContext() } for every log message.

export default pino(pinoOptions);
