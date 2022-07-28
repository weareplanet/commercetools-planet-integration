import pino from 'pino';

import { ITracingRequestContext } from '../../../interfaces';

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
    paths: getAllPathsToBeRedacted(longestPathsToRedacted),
    censor: '[REDACTED]'
  }
};

export class LogService {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() {}

  // Use this factory method instead of the service constructor (this is why constructor is private).
  // Why - see a long comment below.
  public static getLogger(requestContext?: ITracingRequestContext) {
    if (requestContext) {
      // Amend pinoOptions so that requestContext is used for every log message
    }

    return pino(pinoOptions);
  }
}

/* TODO: (maybe)
pino library exports a factory function and we cannot do `class LogService extends pino.Logger`.
If we want LogService to provide an instance of LogService which has log methods -
we should make LogService a decorator for the output of pino() factory -
something like this:

export class LogService {
  private logger: pino.Logger;

  constructor() {
    this.logger = pino(pinoOptions);

    Object.keys(pino.levels.values).forEach(function (methodName) {
      this[methodName] = function(...args) {
        this.logger[methodName](...args);
      }
    })
  }
}
*/
