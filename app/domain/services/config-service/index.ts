import { ServiceWithLogger, ServiceWithLoggerOptions, LogService } from '../log-service';
import { InputValidationService } from '../input-validation-service';

import { AppConfigSchema, IAppConfig } from './schema';
import configFromEnv from './env-loader';

export class ConfigService extends ServiceWithLogger {
  // To avoid multiple configuration load from the environment into the same process
  // the config is static (loaded config is "cached" within the class object).
  private static config: IAppConfig;

  constructor(opts?: ServiceWithLoggerOptions) {
    super({
      // It is not a big problem, if this service will use a context-unaware logger.
      // Why such a design:
      // that's an overhead to provide a context-aware logger into `new ConfigService()` every time you need just to get the config.
      // Providing a context-aware logger makes sense only
      // when the config is requested for the first time (and going to be (lazily) loaded).
      // And even in this case if it is not provided - that's OK (just a log message about the config load will be without the request context information).
      // Also it basically makes sense to load the config on the cold start phase (before any request).
      logger: opts?.logger || new LogService()
    });
  }

  public getConfig() {
    if (!ConfigService.config) {
      this.init();
    }
    return ConfigService.config;
  }

  private init() {
    const inputValidationService = new InputValidationService({ logger: this.logger });
    ConfigService.config =inputValidationService.transformAndValidate(
      configFromEnv,
      AppConfigSchema,
      { strict: true }
    );

    this.logger.debug(ConfigService.config, 'Loaded configuration');
  }
}
