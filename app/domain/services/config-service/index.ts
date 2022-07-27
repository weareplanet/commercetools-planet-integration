import logger from '../log-service';
import { InputValidationService } from '../input-validation-service';

import { AppConfigSchema, IAppConfig } from './schema';
import configFromEnv from './env-loader';

class ConfigService {
  private config: IAppConfig;

  getConfig() {
    if (!this.config) {
      this.init();
    }
    return this.config;
  }

  private init() {
    const inputValidationService = new InputValidationService();
    this.config = inputValidationService.transformAndValidate(
      configFromEnv,
      AppConfigSchema,
      { strict: true }
    );

    logger.debug(this.config, 'Loaded configuration');
  }
}

export default new ConfigService();
