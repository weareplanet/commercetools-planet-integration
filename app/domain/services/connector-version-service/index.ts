import logger from '../log-service';

import { name, version } from '../../../../package.json';

export const logConnectorVersion = () => {
  logger.info({ name, version }, 'Connector is running');
};
