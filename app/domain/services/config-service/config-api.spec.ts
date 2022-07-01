import { IAppConfig } from './schema';

let fakeConfigValues: IAppConfig;
jest.mock('./env-loader', () => {
  fakeConfigValues = {
    commerceTools: {
      clientId: 'clientId',
      clientSercet: 'clientSercet',
      projectId: 'projectId',
      authUrl: 'https://authUrl.test',
      apiUrl: 'https://apiUrl.test',
    },
    datatrans: {
      apiUrls: {
        test: 'https://testUrl.test',
        prod: 'https://prodUrl.test'
      },
      webhookUrl: 'https://webhookUrl.test',
      merchants: [{ id: 'id', password: 'password', environment: 'test', dtHmacKey: 'HMAC key' }],
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
