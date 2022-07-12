import pino from 'pino';

describe('Redacted fields', () => {
  let logger: pino.Logger;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let loggingStream: any;
  let originalLogLevel: string;

  beforeEach(async () => {
    logger = (await import('.')).default;
    /* eslint-disable @typescript-eslint/no-var-requires */
    const { streamSym } = require('pino/lib/symbols');
    /* eslint-disable @typescript-eslint/ban-ts-comment */
    /* @ts-ignore */
    loggingStream = logger[streamSym];
    jest.spyOn(loggingStream, 'write');
  });

  beforeAll(() => {
    originalLogLevel = process.env.LOG_LEVEL;
    process.env.LOG_LEVEL = 'info';
  });

  afterAll(() => {
    if (originalLogLevel) {
      process.env.LOG_LEVEL = originalLogLevel;
    } else {
      delete process.env.LOG_LEVEL;
    }
  });

  it('should redact all configured fields', () => {
    const logPayloadWithRedactedFiled = {
      body: {
        resource: {
          obj: {
            custom: {
              savedPaymentMethodAlias: 'savedPaymentMethodAlias'
            }
          }
        },
        card: {
          alias: 'alias'
        }
      },
      resource: {
        obj: {
          custom: {
            savedPaymentMethodAlias: 'savedPaymentMethodAlias'
          }
        }
      },
      custom: {
        savedPaymentMethodAlias: 'savedPaymentMethodAlias'
      }
    };

    logger.info(logPayloadWithRedactedFiled);

    expect(loggingStream.write).toBeCalledWith(
      expect.stringContaining('"payload":{"body":{"resource":{"obj":{"custom":{"savedPaymentMethodAlias":"[REDACTED]"}}},"card":{"alias":"[REDACTED]"}},"resource":{"obj":{"custom":{"savedPaymentMethodAlias":"[REDACTED]"}}},"custom":{"savedPaymentMethodAlias":"[REDACTED]"}}')
    );
  });
});
