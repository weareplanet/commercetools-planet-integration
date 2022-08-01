import { name, version } from '../../../../package.json';
import { LogService }  from '../log-service';
import { ConnectorVersionService } from '.';

describe('Connector version', () => {
  const logger =  new LogService();

  it('shows with which version Connector is running', () => {
    jest.spyOn(logger, 'info');

    const service = new ConnectorVersionService({ logger });
    service.logVersion();

    expect(logger.info).toHaveBeenCalledWith({ name, version }, 'Connector is running');
  });
});
