export default {
  getConfig: jest.fn().mockImplementation(() => {
    return {
      clientId: 'Test clientId',
      clientSercet: 'Test clientSercet',
      projectId: 'Test projectId',
      authUrl: 'Test authUrl',
      apiUrl: 'Test apiUrl',
      merchants: [
        { id: 'Test id', password: 'Test password', environment: 'Test environment' }
      ]
    };
  })
};
