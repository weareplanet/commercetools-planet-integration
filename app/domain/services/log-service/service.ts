import pino from 'pino';

import { ITraceContext } from '../../../interfaces';

const { LOG_LEVEL = 'debug' } = process.env;

const getAllShortedPaths = (longestPath: string): string[] => {
  return longestPath.split('.')
    .reduce((acc, _, index, arr) => {
      acc.push(arr.slice(index).join('.'));
      return acc;
    }, []);
};

const pathsToBeRedacted: string[] = [
  ...getAllShortedPaths('*.resource.obj.custom.fields.savedPaymentMethodAlias'), // Payment.savedPaymentMethodAlias in a request from CommerceTools

  // "alias" field of the log Object:
  ...getAllShortedPaths('body.*.alias'),         // alias in a Datatrans initRequest when alias (to be used) is passed to Datatrans
  ...getAllShortedPaths('value[*].card.alias'),  // alias in a "savedPaymentMethods" Custom Object

  // "alias" within a serialized JSON in some field of the log Object:
  'actions[*].transaction.custom.fields.info',   // info in "addTransaction" action
  'actions[*].fields.message',                   // message in "addInterfaceInteraction" action
  '*.transactions[*].custom.fields.info',        // info in Payment.transactions[]
  '*.interfaceInteractions[*].fields.message',   // message in Payment.interfaceInteractions[]
];

const pinoOptions: pino.LoggerOptions = {
  level: LOG_LEVEL,
  messageKey: 'message', // Log the string passed to a log method under this key (instead of the default `msg`)
  nestedKey: 'payload',  // Log the object passed to a log method under this key
  formatters: {
    level(label: unknown /* , number: unknown */) {
      return { level: label }; // default is { level: number }
    },
    // bindings(/* bindings: Record<string, unknown> */) {
    //   return {}; // default is { pid, hostname }
    // },
  },
  base: {}, // the same effect as of (now commented out) bindings above
  redact: {
    paths: pathsToBeRedacted,
    censor: '[REDACTED]'
  }
};

const pinoSingleton = pino(pinoOptions);

const wrapLogMethod = function(methodName: string) {
  return function(...args: unknown[]) {
    const argsWithRequestContext: unknown[] = Array.from(args);
    if (this.traceContext) {
      if (typeof argsWithRequestContext[0] === 'object') {
        argsWithRequestContext[0] = {
          ...argsWithRequestContext[0],
          traceContext: this.traceContext
        };
      } else {
        argsWithRequestContext.unshift({ traceContext: this.traceContext });
      }
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (LogService.pinoLogger as unknown as any)[methodName](...argsWithRequestContext);
  };
};

// This service (unlike most of others) does not derive from ServiceWithLogger
// because this service itself provides the logger (chicken and egg).
export class LogService implements pino.BaseLogger {
  // pino.LoggerOptions allows to provide `formatters.log` to customize what to write into the underlying stream.
  // To use this option we would have to create a new pino object at least once for every request.
  // But its creation takes 300-700 ms - so we'd' like to avoid that).
  // So our approach is to use the singleton pino instance.
  private static readonly pinoLogger: pino.Logger = pinoSingleton;

  readonly traceContext?: ITraceContext;

  constructor(traceContext?: ITraceContext) {
    this.traceContext = traceContext;
  }

  level: string; // we do not do anything with this, just had to declare this due to `implements pino.BaseLogger`

  fatal = wrapLogMethod('fatal');
  error = wrapLogMethod('error');
  warn = wrapLogMethod('warn');
  info = wrapLogMethod('info');
  debug = wrapLogMethod('debug');
  trace = wrapLogMethod('trace');
  silent = wrapLogMethod('silent');
}
