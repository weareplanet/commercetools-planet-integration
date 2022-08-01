import pino from 'pino';

import { ITraceContext } from '../../../interfaces';

const { LOG_LEVEL = 'debug' } = process.env;

const longestPathsToRedacted: string[] = [
  // related to Payment obj in app/domain/environment-agnostic-handlers/per-operation-handlers/create-payment/request-schema.ts
  'body.resource.obj.custom.fields.savedPaymentMethodAlias',
  // related to DataTrans transaction request body
  'body.*.alias'
];

const getAllShortedPaths = (longestPath: string): string[] => {
  return longestPath.split('.')
    .reduce((acc, _, index, arr) => {
      acc.push(arr.slice(index).join('.'));
      return acc;
    }, []);
};

const getAllPathsToBeRedacted = (longestPaths: string[]): string[] => {
  return longestPaths.reduce((acc, currentLongestPath) => {
    return acc.concat(getAllShortedPaths(currentLongestPath));
  }, []);
};

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
    paths: getAllPathsToBeRedacted(longestPathsToRedacted),
    censor: '[REDACTED]'
  }
};

const pinoSingleton = pino(pinoOptions);

const wrapLogMethod = function(methodName: string) {
  return function(...args: unknown[]) {
    const argsWithRequestContext: unknown[] = Array.from(args);
    if (this.requestContext) {
      if (typeof argsWithRequestContext[0] === 'object') {
        argsWithRequestContext[0] = {
          ...argsWithRequestContext[0],
          ...this.requestContext
        };
      } else {
        argsWithRequestContext.unshift(this.requestContext);
      }
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (LogService.pinoLogger as unknown as any)[methodName](...argsWithRequestContext);
  };
};

export class LogService implements pino.BaseLogger {
  // pino.LoggerOptions allows to provide `formatters.log` to customize what to write into the underlying stream.
  // To use this option we would have to create a new pino object at least once for every request.
  // But its creation takes 300-700 ms - so we'd' like to avoid that).
  // So our approach is to use the singleton pino instance.
  private static readonly pinoLogger: pino.Logger = pinoSingleton;

  readonly requestContext?: ITraceContext;

  constructor(requestContext?: ITraceContext) {
    this.requestContext = requestContext;
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
