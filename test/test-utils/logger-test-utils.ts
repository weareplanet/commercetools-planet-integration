export const loadLogServiceForTesting = () => {
  // Load log-service module to be in safe side (in case if loaded modules were reset)
  /* eslint-disable @typescript-eslint/no-var-requires */
  const LogService = require('../../app/domain/services/log-service').LogService;

  const logger = new LogService();

  // Get the underlying writable stream and spy on it

  /* eslint-disable @typescript-eslint/no-var-requires */
  const { streamSym } = require('pino/lib/symbols');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pinoLogger = (LogService as unknown as any).pinoLogger;
  /* eslint-disable @typescript-eslint/ban-ts-comment */
  /* @ts-ignore */
  const logStream = pinoLogger[streamSym];

  jest.spyOn(logStream, 'write');

  return {
    logger,
    logStream
  };
};
