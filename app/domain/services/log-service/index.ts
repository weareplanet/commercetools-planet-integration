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

export default pino(pinoOptions);
