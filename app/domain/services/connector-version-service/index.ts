import logger from '../log-service';

import { version } from '../../../../package.json';

export const logConnectorVersion = () => {
  logger.info(`Connector is running with version: ${version}`);
};
