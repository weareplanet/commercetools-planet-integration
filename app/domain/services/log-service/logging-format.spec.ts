import { loadLogServiceForTesting } from '../../../../test/test-utils';

describe('Log line', () => {
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

  it('contains `level` as a symbolic label (not a number as by default)', () => {
    const { logger, logStream } = loadLogServiceForTesting();

    logger.info('Test Log Line');

    expect(logStream.write).toHaveBeenCalledWith(
      expect.stringMatching(/{.*"level":"info".*}/)
    );
  });

  describe('contains `message` and (optionally) `payload`', () => {
    describe('When only the message is passed to the log method', () => {
      it('contains the log message under `message` key (not under the default `msg`)', () => {
        const { logger, logStream } = loadLogServiceForTesting();

        logger.info('Test Log Line');

        expect(logStream.write).toHaveBeenCalledWith(
          expect.stringMatching(/{.*"message":"Test Log Line".*}/)
        );

        expect(logStream.write).toHaveBeenCalledWith(
          expect.not.stringMatching(/"payload":/)
        );
      });
    });

    describe('When a log object and the message are passed to the log method', () => {
      it('contains the passed log object under `payload` key (not at the root level as by default)', () => {
        const { logger, logStream } = loadLogServiceForTesting();

        logger.info({ testKey: 'testValue' }, 'Test Log Line');

        expect(logStream.write).toHaveBeenCalledWith(
          expect.stringMatching(/{.*"payload":{"testKey":"testValue"}.*"message":"Test Log Line".*}/)
        );
      });
    });
  });

  it('contains `time`', () => {
    const { logger, logStream } = loadLogServiceForTesting();

    logger.info('Test Log Line');

    expect(logStream.write).toHaveBeenCalledWith(
      expect.stringMatching(/{.*"time":\d+.*}/)
    );
  });
});
