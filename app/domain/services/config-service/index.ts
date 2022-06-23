import logger from '../log-service';
import { InputValidationService } from '../input-validation-service';

import { CommerceToolsConfigSchema, ICommerceToolsConfig, commerceToolsConfig } from './schema';

class ConfigService {
  private config: {
    commerceToolsConfig?: ICommerceToolsConfig,
  } = {};

  constructor() {
    this.init();
  }

  getConfig() {
    return this.config;
  }

  private init() {
    const inputValidationService = new InputValidationService();
    this.config.commerceToolsConfig = inputValidationService
      .transformAndValidate(commerceToolsConfig, CommerceToolsConfigSchema, { strict: true });

    logger.debug(commerceToolsConfig, 'CommerceTools config');
    logger.info('All configs are valid');
  }
}

export default new ConfigService();
