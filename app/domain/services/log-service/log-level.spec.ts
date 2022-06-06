import { LogService } from '../../services/log-service';
import {
  setEnvLogLevel,
  repairEnvLogLevel,
  loadLogServiceForTesting
} from '../../../../test/test-utils';

function callAllLevelsOfLogs (logger: LogService) {
  logger.trace('trace');
  logger.debug('debug');
  logger.info('info');
  logger.warn('warn');
  logger.error('error');
  logger.fatal('fatal');
}

describe('Log levels', () => {
  afterAll(() => {
    repairEnvLogLevel();
  });

  beforeEach(() => {
    jest.resetModules();
  });

  describe('how LOG_LEVEL makes impacts OUTPUT stream', () => {
    it('uses "trace" level and shows all logs', async () => {
      setEnvLogLevel('trace');
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
      setEnvLogLevel('warn');
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
