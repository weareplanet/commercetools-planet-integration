import { ICommerceToolsConfig } from './schema';

let fakeConfigValues: ICommerceToolsConfig;
jest.mock('./env-loader', () => {
  fakeConfigValues = {
    clientId: 'Test clientId value',
    clientSercet: 'Test clientSercet value',
    projectId: 'Test projectId value',
    authUrl: 'Test authUrl value',
    apiUrl: 'Test apiUrl value',
    merchants: [
      { id: 'TestMervchant id', password: 'TestMervchant password', environment: 'test' }
    ]
  };
  return fakeConfigValues;
});

import configService from '.';

describe('ConfigService', () => {

  describe('getConfig', () => {
    it('returns the loaded variable set under `commerceToolsConfig` key', () => {
      expect(configService.getConfig()).toMatchObject({
        commerceToolsConfig: fakeConfigValues
      });
    });
  });

  describe('getConfigValueByKey', () => {
    it('returns the value kept under the specified key within `commerceToolsConfig`', () => {
      expect(configService.getConfigValueByKey('projectId')).toEqual(fakeConfigValues.projectId);
    });
  });

});
