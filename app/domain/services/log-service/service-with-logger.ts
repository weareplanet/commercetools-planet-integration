import { LogService } from './service';

export type ServiceWithLoggerOptions = {
  logger: LogService
}

export class ServiceWithLogger {
  protected logger: LogService;

  constructor({ logger }: ServiceWithLoggerOptions) {
    this.logger = logger;
  }
}
