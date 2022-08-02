import { LogService } from '../../services/log-service';
import { loadLogServiceForTesting } from '../../../../test/test-utils';

function callAllLevelsOfLogs (logger: LogService) {
  logger.trace('trace');
  logger.debug('debug');
  logger.info('info');
  logger.warn('warn');
  logger.error('error');
  logger.fatal('fatal');
}

describe('Log levels', () => {
  let originalLogLevel: string;

  beforeAll(/* remember the original LOG_LEVEL */ () => {
    originalLogLevel = process.env.LOG_LEVEL as string;
    process.env.LOG_LEVEL = 'info';
  });

  afterAll(/* repair the original LOG_LEVEL */() => {
    if (originalLogLevel) {
      process.env.LOG_LEVEL = originalLogLevel;
    } else {
      delete process.env.LOG_LEVEL;
    }
  });

  beforeEach(() => {
    jest.resetModules();
  });

  describe('how LOG_LEVEL makes influence on OUTPUT stream', () => {
    it('uses "trace" level and shows all logs', async () => {
      process.env.LOG_LEVEL = 'trace';
      const { logger, logStream } = loadLogServiceForTesting();

      callAllLevelsOfLogs(logger);

      expect(logStream.write).toHaveBeenCalledWith(
        expect.stringMatching(/{.*"message":"trace".*}/)
      );
      expect(logStream.write).toHaveBeenCalledWith(
        expect.stringMatching(/{.*"message":"debug".*}/)
      );
      expect(logStream.write).toHaveBeenCalledWith(
        expect.stringMatching(/{.*"message":"info".*}/)
      );
      expect(logStream.write).toHaveBeenCalledWith(
        expect.stringMatching(/{.*"message":"warn".*}/)
      );
      expect(logStream.write).toHaveBeenCalledWith(
        expect.stringMatching(/{.*"message":"error".*}/)
      );
      expect(logStream.write).toHaveBeenCalledWith(
        expect.stringMatching(/{.*"message":"fatal".*}/)
      );
    });

    it('uses "warn" level and shows only warn, error and fatal logs', async () => {
      process.env.LOG_LEVEL = 'warn';
      const { logger, logStream } = loadLogServiceForTesting();

      callAllLevelsOfLogs(logger);

      expect(logStream.write).not.toHaveBeenCalledWith(
        expect.stringMatching(/{.*"message":"trace".*}/)
      );
      expect(logStream.write).not.toHaveBeenCalledWith(
        expect.stringMatching(/{.*"message":"debug".*}/)
      );
      expect(logStream.write).not.toHaveBeenCalledWith(
        expect.stringMatching(/{.*"message":"info".*}/)
      );
      expect(logStream.write).toHaveBeenCalledWith(
        expect.stringMatching(/{.*"message":"warn".*}/)
      );
      expect(logStream.write).toHaveBeenCalledWith(
        expect.stringMatching(/{.*"message":"error".*}/)
      );
      expect(logStream.write).toHaveBeenCalledWith(
        expect.stringMatching(/{.*"message":"fatal".*}/)
      );
    });
  });
});
