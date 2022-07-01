import logger from '../log-service';
import { InputValidationService } from '../input-validation-service';

import { AppConfigSchema, IAppConfig } from './schema';
import configFromEnv from './env-loader';

class ConfigService {
  private config: IAppConfig;

  constructor() {
    this.init();
  }

  getConfig() {
    return this.config;
  }

  private init() {
    const inputValidationService = new InputValidationService();
    this.config = inputValidationService.transformAndValidate(
      configFromEnv,
      AppConfigSchema,
      { strict: true }
    );

    logger.debug(this.config.commerceTools, 'CommerceTools config');
    logger.debug(this.config.datatrans, 'Datatrans config');
    logger.info('All configs are valid');
  }
}

export default new ConfigService();
