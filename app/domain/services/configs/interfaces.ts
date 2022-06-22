// NOTE: could be changed if it need
export enum ConnectorEnvironment {
  PROD = 'prod',
  STAGE = 'stage',
  TEST = 'test'
}

export interface ICommerceToolsConfig {
  clientId: string;
  clientSercet: string;
  projectId: string;
  authUrl: string;
  apiUrl: string;
  merchants: Array<{ id: string; password: string; environment: ConnectorEnvironment | string }>
}
