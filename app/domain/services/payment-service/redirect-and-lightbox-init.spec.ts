import { Logger } from 'pino';

import {
  RedirectAndLightboxPaymentInitRequestBodyFactory,
  CreateInitializeTransactionMockResponseFactory,
  CreateInitializeTransactionRequestFactory
} from '../../../../test/shared-test-entities/redirect-and-lightbox-payment-init';

const expectedResult = [
  {
    action: 'setCustomField',
    name: 'transactionId',
    value: 'transactionId123',
  },
  {
    action: 'setCustomField',
    name: 'redirectUrl',
    value: 'https://example.com',
  },
  {
    action: 'addInterfaceInteraction',
    fields: {
      interactionType: 'initRequest',
      message: '{"body":{"BON":{"alias":"BON test card alias"},"refno":"12345318909876543216","currency":"EUR","amount":1555,"paymentMethods":["VIS","PAP"],"redirect":{"successUrl":"https://google.com","cancelUrl":"https://google.com","errorUrl":"https://google.com"},"webhook":{"url":"https://webhookUrl.fake"}}}',
    },
    type: {
      key: 'pp-datatrans-interface-interaction-type',
    },
  },
  {
    action: 'addInterfaceInteraction',
    fields: {
      interactionType: 'initResponse',
      message: '{"body":{"transactionId":"transactionId123"},"headers":{"location":"https://example.com"}}',
    },
    type: {
      key: 'pp-datatrans-interface-interaction-type',
    },
  },
  {
    action: 'setStatusInterfaceCode',
    interfaceCode: 'Initial',
  }
];

describe('#initRedirectAndLightbox method', () => {
  let logger: Logger;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let loggingStream: any;
  const originalLogLevel = process.env.LOG_LEVEL;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let paymentService: any;
  const clientMock = {
    post: jest.fn()
  };
  const axiosMockFactory = () => ({
    create: () => clientMock
  });

  beforeAll(async () => {
    process.env.LOG_LEVEL = 'debug';
    jest.mock('axios', axiosMockFactory);
  });

  beforeEach(async () => {
    jest.resetModules();

    logger = (await import('../log-service')).default;
    /* eslint-disable @typescript-eslint/no-var-requires */
    const { streamSym } = require('pino/lib/symbols');
    /* eslint-disable @typescript-eslint/ban-ts-comment */
    /* @ts-ignore */
    loggingStream = logger[streamSym];
    jest.spyOn(loggingStream, 'write');

    const { PaymentService } = (await import('./service'));
    paymentService = new PaymentService();
  });

  afterAll(() => {
    if (originalLogLevel) {
      process.env.LOG_LEVEL = originalLogLevel;
    } else {
      delete process.env.LOG_LEVEL;
    }
    jest.unmock('axios');
  });

  it('should create transaction and return right actions for Redirect And Lightbox Init operation', async () => {
    clientMock.post.mockResolvedValue(CreateInitializeTransactionMockResponseFactory());
    const mockPayment = RedirectAndLightboxPaymentInitRequestBodyFactory().resource.obj;
    mockPayment.custom.fields.initRequest = {
      BON: {
        alias: 'BON test card alias'
      },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any; // HACK: yup schema not allowed not declared fields

    const result = await paymentService.initRedirectAndLightbox(mockPayment);

    expect(clientMock.post).toBeCalledWith(
      'https://apiUrl.test.fake/transactions',
      {
        ...CreateInitializeTransactionRequestFactory(),
        BON: {
          alias: 'BON test card alias'
        }
      },
      {
        auth: {
          password: 'Test_merchant_password',
          username: 'Test_merchant_id'
        },
        headers: {
          'Content-Type': 'application/json; charset=UTF-8'
        }
      }
    );
    expect(result).toMatchObject(expectedResult);
    expect(loggingStream.write).toHaveBeenCalledWith(
      expect.stringContaining('"payload":{"body":{"BON":{"alias":"[REDACTED]"},"refno":"12345318909876543216","currency":"EUR","amount":1555,"paymentMethods":["VIS","PAP"],"redirect":{"successUrl":"https://google.com","cancelUrl":"https://google.com","errorUrl":"https://google.com"},"webhook":{"url":"https://webhookUrl.fake"}}},"message":"DataTrans initRequest"}')
    );
  });
});
