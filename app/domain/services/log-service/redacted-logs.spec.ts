import pino from 'pino';

import { getRedirectAndLightboxPaymentInitRequestBody, getCreateInitializeTransactionRequest } from '../../../../test/shared-test-entities/redirect-and-lightbox-payment-init';
import { ICreatePaymentRequestBodySchemaType } from '../../../interfaces';

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
    const redirectAndLightboxPaymentInitRequestBody: ICreatePaymentRequestBodySchemaType = getRedirectAndLightboxPaymentInitRequestBody();
    redirectAndLightboxPaymentInitRequestBody.resource.obj.custom.fields.savedPaymentMethodAlias = 'savedPaymentMethodAlias';
    const commerceToolsExtensionRequestWithBodyOnly = {
      body: redirectAndLightboxPaymentInitRequestBody,
    };
    const createInitializeTransactionRequest = getCreateInitializeTransactionRequest();
    createInitializeTransactionRequest.card = { alias: 'card alias' };
    createInitializeTransactionRequest.BON = { alias: 'BON alias' };

    logger.info(commerceToolsExtensionRequestWithBodyOnly);
    logger.info(commerceToolsExtensionRequestWithBodyOnly.body);
    logger.info(commerceToolsExtensionRequestWithBodyOnly.body.resource.obj);
    logger.info({ body: createInitializeTransactionRequest });

    expect(loggingStream.write).toBeCalledWith(
      expect.stringContaining('"payload":{"body":{"action":"Create","resource":{"id":"123","typeId":"typeId","obj":{"key":"12345318909876543216","amountPlanned":{"type":"centPrecision","currencyCode":"EUR","centAmount":1555,"fractionDigits":2},"paymentMethodInfo":{"paymentInterface":"pp-datatrans-redirect-integration","method":"VIS, PAP"},"custom":{"type":{"typeId":"type","id":"89637766-02f9-4391-9c7a-9077d9662daf"},"fields":{"key":"refno","cancelUrl":"https://google.com","merchantId":"Test_merchant_id","successUrl":"https://google.com","errorUrl":"https://google.com","savedPaymentMethodAlias":"[REDACTED]"}},"paymentStatus":{},"transactions":[],"interfaceInteractions":[]}}}}')
    );
    expect(loggingStream.write).toBeCalledWith(
      expect.stringContaining('"payload":{"action":"Create","resource":{"id":"123","typeId":"typeId","obj":{"key":"12345318909876543216","amountPlanned":{"type":"centPrecision","currencyCode":"EUR","centAmount":1555,"fractionDigits":2},"paymentMethodInfo":{"paymentInterface":"pp-datatrans-redirect-integration","method":"VIS, PAP"},"custom":{"type":{"typeId":"type","id":"89637766-02f9-4391-9c7a-9077d9662daf"},"fields":{"key":"refno","cancelUrl":"https://google.com","merchantId":"Test_merchant_id","successUrl":"https://google.com","errorUrl":"https://google.com","savedPaymentMethodAlias":"[REDACTED]"}},"paymentStatus":{},"transactions":[],"interfaceInteractions":[]}}}')
    );
    expect(loggingStream.write).toBeCalledWith(
      expect.stringContaining('"payload":{"key":"12345318909876543216","amountPlanned":{"type":"centPrecision","currencyCode":"EUR","centAmount":1555,"fractionDigits":2},"paymentMethodInfo":{"paymentInterface":"pp-datatrans-redirect-integration","method":"VIS, PAP"},"custom":{"type":{"typeId":"type","id":"89637766-02f9-4391-9c7a-9077d9662daf"},"fields":{"key":"refno","cancelUrl":"https://google.com","merchantId":"Test_merchant_id","successUrl":"https://google.com","errorUrl":"https://google.com","savedPaymentMethodAlias":"[REDACTED]"}},"paymentStatus":{},"transactions":[],"interfaceInteractions":[]}')
    );
    expect(loggingStream.write).toBeCalledWith(
      expect.stringContaining('"payload":{"body":{"refno":"12345318909876543216","currency":"EUR","amount":1555,"paymentMethods":["VIS","PAP"],"redirect":{"successUrl":"https://google.com","cancelUrl":"https://google.com","errorUrl":"https://google.com"},"webhook":{"url":"https://webhookUrl.fake"},"card":{"alias":"[REDACTED]"},"BON":{"alias":"[REDACTED]"}}}')
    );
  });
});
