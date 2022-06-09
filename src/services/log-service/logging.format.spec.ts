import pino from 'pino';
let logger: pino.Logger; // just for TS compiler

describe('Log line', () => {
  let logLevelValue: string;
  beforeEach(async () => { // Ignore the LOG_LEVEL defined in the environment, reload the logger with enabled logging
    logLevelValue = process.env.LOG_LEVEL;
    process.env.LOG_LEVEL = 'trace'; // the lowest defined level

    jest.resetModules();
    logger = (await import('.')).default;
  });

  afterEach(() => { // Repair the LOG_LEVEL defined in the environment
    if (logLevelValue) {
      process.env.LOG_LEVEL = logLevelValue;
    } else {
      delete process.env.LOG_LEVEL;
    }
  });

  // Suppressing of eslint and ts errors appear below to organize a very specific spying on the underlying pino stream
  /* eslint-disable @typescript-eslint/no-explicit-any */
  let loggingStream: any;
  beforeEach(() => { // Spy on logger's underlying stream
    /* eslint-disable @typescript-eslint/no-var-requires */
    const { streamSym } = require('pino/lib/symbols');
    // @ts-ignore
    loggingStream = logger[streamSym];
    jest.spyOn(loggingStream, 'write');
  });

  it('contains `level` as a symbolic label (not a number as by default)', () => {
    logger.info('Test Log Line');

    expect(loggingStream.write).toHaveBeenCalledWith(
      expect.stringMatching(/{.*"level":"info".*}/)
    );
  });

  describe('contains `message` and (optionally) `payload`', () => {
    describe('When only the message is passed to the log method', () => {
      it('contains the log message under `message` key (not under the default `msg`)', () => {
        logger.info('Test Log Line');

        expect(loggingStream.write).toHaveBeenCalledWith(
          expect.stringMatching(/{.*"message":"Test Log Line".*}/)
        );

        expect(loggingStream.write).toHaveBeenCalledWith(
          expect.not.stringMatching(/"payload":/)
        );
      });
    });

    describe('When a log object and the message are passed to the log method', () => {
      it('contains the passed log object under `payload` key (not at the root level as by default)', () => {
        logger.info({ testKey: 'testValue' }, 'Test Log Line');

        expect(loggingStream.write).toHaveBeenCalledWith(
          expect.stringMatching(/{.*"payload":{"testKey":"testValue"}.*"message":"Test Log Line".*}/)
        );
      });
    });
  });

  it('contains `time`', () => {
    logger.info('Test Log Line');

    expect(loggingStream.write).toHaveBeenCalledWith(
      expect.stringMatching(/{.*"time":\d+.*}/)
    );
  });
});
