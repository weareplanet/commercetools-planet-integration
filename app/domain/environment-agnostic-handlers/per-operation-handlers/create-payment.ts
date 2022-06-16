import {
  AbstractRequestWithTypedBody,
  AbstractResponse
} from '../../../interfaces';
import logger from '../../services/log-service';
import { HttpStatusCode } from 'http-status-code-const-enum';
// import { PaymentService } from '../../services/payment-service';

//////////////////// Request schema ////////////////////

import * as yup from 'yup';

const RequestBodySchema = yup.object({
  // TODO: declare a meaningful schema for this handler
  s: yup.string().required(),
  n: yup.number().required()
}).required();

type RequestBodySchemaType = yup.TypeOf<typeof RequestBodySchema>;

//////////////////// Request Handler ////////////////////

const handler = async (req: AbstractRequestWithTypedBody<RequestBodySchemaType>): Promise<AbstractResponse> => {
  // TODO: Take what's needed from req and leverage necessary services...
  req.body.s;
  req.body.n;
  // const paymentService = new PaymentService();
  // const result = await paymentService.initPayment();

  logger.trace('trace');
  logger.debug('debug');
  logger.info('info');
  logger.warn('warn');
  logger.error('error');
  logger.fatal('fatal');

  return {
    statusCode: HttpStatusCode.OK,
    body: { message: 'Hello World from create-payment handler!' } // TODO: form a meaningful response
  };
};

export {
  handler,
  RequestBodySchema, // This is exported to perform the validation (where handler is leveraged)
  RequestBodySchemaType // This is exported to parametrize the outer wrapper call - to make `req` structure controlled at the writing/compilation time
};
