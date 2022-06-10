import pino from 'pino';

const { LOG_LEVEL = 'debug' } = process.env;

const pinoOptions = {
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
  base: {} // the same effect as of (now commented out) bindings above
};

export default pino(pinoOptions);
