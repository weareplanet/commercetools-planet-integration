import { AbstractRequest } from '../../interfaces';
import handler from './create-payment';
import logger from '../services/log-service';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { streamSym } = require('pino/lib/symbols');

describe('Log levels', () => {
  // Suppressing of eslint and ts errors appear below is due to a tricky spying on the underlying pino stream
  /* eslint-disable @typescript-eslint/no-explicit-any */
  let loggingStream: any;
  beforeEach(() => { // Spy on logger's underlying stream
    jest.resetModules();
    /* eslint-disable @typescript-eslint/ban-ts-comment */
    /* @ts-ignore */
    loggingStream = logger[streamSym];
    jest.spyOn(loggingStream, 'write');
  });

  describe('how LOG_LEVEL makes influence on OUTPUT stream', () => {
    it('uses "trace" level and shows all logs', async () => {
      logger.level = 'trace';

      await handler({} as AbstractRequest);

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
      logger.level = 'warn';

      await handler({} as AbstractRequest);

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
