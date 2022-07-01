import { IAppConfig } from './schema';

let fakeConfigValues: IAppConfig;
jest.mock('./env-loader', () => {
  fakeConfigValues = {
    commerceTools: {
      clientId: 'Test clientId value',
      clientSercet: 'Test clientSercet value',
      projectId: 'Test projectId value',
      authUrl: 'Test authUrl value',
      apiUrl: 'Test apiUrl value',
    },
    datatrans: {
      merchants: [
        { id: 'TestMervchant id', password: 'TestMervchant password', environment: 'test' }
      ],
      apiUrls: {
        test: 'test apiUrl',
        prod: 'prod apiUrl'
      }
    }
  };
  return fakeConfigValues;
});

import configService from '.';

describe('ConfigService', () => {

  describe('getConfig', () => {
    it('returns the loaded variable set under `commerceToolsConfig` key', () => {
      expect(configService.getConfig()).toMatchObject(fakeConfigValues);
    });
  });
});
