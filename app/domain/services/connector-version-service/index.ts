import { ServiceWithLogger }  from '../log-service';

import { name, version } from '../../../../package.json';

export class ConnectorVersionService extends ServiceWithLogger {
  logVersion() {
    this.logger.info({ name, version }, 'Connector is running');
  }
}
