export default {
  commerceTools: {
    clientId: 'Test clientId',
    clientSercet: 'Test clientSercet',
    projectId: 'Test projectId',
    authUrl: 'https://authUrl.fake',
    apiUrl: 'https://apiUrl.fake',
  },
  datatrans: {
    apiUrls: {
      test: 'https://apiUrl.test.fake',
      prod: 'https://apiUrl.prod.fake'
    },
    webhookUrl: 'https://webhookUrl.fake',
    merchants: [
      {
        id: 'Test_merchant_id',
        password: 'Test_merchant_password',
        environment: 'test',
        dtHmacKey: 'Test_merchant_dtHmacKey'
      }
    ]
  }
};
