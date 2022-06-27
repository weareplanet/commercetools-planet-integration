import logger from '../log-service';
import { InputValidationService } from '../input-validation-service';

import { CommerceToolsConfigSchema, ICommerceToolsConfig } from './schema';
import configFromEnv from './env-loader';

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

  getConfigValueByKey<K extends keyof ICommerceToolsConfig>(key: K) {
    // TODO: when we have some other config section(s) alongside with `commerceToolsConfig` -
    // then enhance this logic (maybe support "path" key like `commerceToolsConfig.clientId`).
    return this.config.commerceToolsConfig[key];
  }

  private init() {
    const inputValidationService = new InputValidationService();
    this.config.commerceToolsConfig = inputValidationService.transformAndValidate(
      configFromEnv,
      CommerceToolsConfigSchema,
      { strict: true }
    );

    logger.debug(this.config.commerceToolsConfig, 'CommerceTools config');
    logger.info('All configs are valid');
  }
}

export default new ConfigService();
