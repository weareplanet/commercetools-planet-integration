import pino from 'pino';

export type ServiceWithLoggerOptions = {
  logger: pino.Logger
}

export class ServiceWithLogger {
  protected logger: pino.Logger;

  constructor({ logger }: ServiceWithLoggerOptions) {
    this.logger = logger;
  }
}
