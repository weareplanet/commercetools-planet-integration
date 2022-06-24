import { name, version } from '../../../../package.json';
import logger from '../log-service';
import { logConnectorVersion } from '.';

describe('Connector version', () => {
  it('shows with which version Connector is running', () => {
    jest.spyOn(logger, 'info');

    logConnectorVersion();

    expect(logger.info).toHaveBeenCalledWith({ name, version }, 'Connector is running');
  });
});
