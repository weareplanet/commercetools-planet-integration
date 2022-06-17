import pino from 'pino';
let logger: pino.Logger;

function callAllLevelsOfLogs () {
  logger.trace('trace');
  logger.debug('debug');
  logger.info('info');
  logger.warn('warn');
  logger.error('error');
  logger.fatal('fatal');
}

async function prepeareLoggerForTesting() {
  logger = (await import('.')).default;
  /* eslint-disable @typescript-eslint/no-var-requires */
  const { streamSym } = require('pino/lib/symbols');
  /* eslint-disable @typescript-eslint/ban-ts-comment */
  /* @ts-ignore */
  const loggingStream = logger[streamSym];
  jest.spyOn(loggingStream, 'write');

  return loggingStream;
}

describe('Log levels', () => {
  describe('how LOG_LEVEL makes influence on OUTPUT stream', () => {
    const resetToDefaultTestingState = () => {
      jest.resetModules();
      // set default value
      process.env.LOG_LEVEL = 'info';
    };

    beforeEach(resetToDefaultTestingState);
    afterAll(resetToDefaultTestingState);

    it('uses "trace" level and shows all logs', async () => {
      process.env.LOG_LEVEL = 'trace';
      const loggingStream = await prepeareLoggerForTesting();

      callAllLevelsOfLogs();

      expect(loggingStream.write).toHaveBeenCalledWith(
        expect.stringMatching(/{.*"message":"trace".*}/)
      );
      expect(loggingStream.write).toHaveBeenCalledWith(
        expect.stringMatching(/{.*"message":"debug".*}/)
      );
      expect(loggingStream.write).toHaveBeenCalledWith(
        expect.stringMatching(/{.*"message":"info".*}/)
      );
      expect(loggingStream.write).toHaveBeenCalledWith(
        expect.stringMatching(/{.*"message":"warn".*}/)
      );
      expect(loggingStream.write).toHaveBeenCalledWith(
        expect.stringMatching(/{.*"message":"error".*}/)
      );
      expect(loggingStream.write).toHaveBeenCalledWith(
        expect.stringMatching(/{.*"message":"fatal".*}/)
      );
    });

    it('uses "warn" level and shows only warn, error and fatal logs', async () => {
      process.env.LOG_LEVEL = 'warn';
      const loggingStream = await prepeareLoggerForTesting();

      callAllLevelsOfLogs();

      expect(loggingStream.write).not.toHaveBeenCalledWith(
        expect.stringMatching(/{.*"message":"trace".*}/)
      );
      expect(loggingStream.write).not.toHaveBeenCalledWith(
        expect.stringMatching(/{.*"message":"debug".*}/)
      );
      expect(loggingStream.write).not.toHaveBeenCalledWith(
        expect.stringMatching(/{.*"message":"info".*}/)
      );
      expect(loggingStream.write).toHaveBeenCalledWith(
        expect.stringMatching(/{.*"message":"warn".*}/)
      );
      expect(loggingStream.write).toHaveBeenCalledWith(
        expect.stringMatching(/{.*"message":"error".*}/)
      );
      expect(loggingStream.write).toHaveBeenCalledWith(
        expect.stringMatching(/{.*"message":"fatal".*}/)
      );
    });
  });
});
