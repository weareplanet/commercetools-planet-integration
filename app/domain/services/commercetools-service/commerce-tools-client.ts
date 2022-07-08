// import fetch from 'node-fetch';
const fetch = {};  // TODO: repair fetch or find an alternative
import {
  ClientBuilder,
  // Import middlewares
  type AuthMiddlewareOptions, // Required for auth
  type HttpMiddlewareOptions // Required for sending HTTP requests
} from '@commercetools/sdk-client-v2';
import {
  // ApiRoot,
  createApiBuilderFromCtpClient,
} from '@commercetools/platform-sdk';

import configService from '../config-service';

const appConfig = configService.getConfig();
const projectKey = appConfig.commerceTools.projectId;

const scopes = [ 'view_payments:' + projectKey ];
const authMiddlewareOptions: AuthMiddlewareOptions = {
  host: appConfig.commerceTools.authUrl,
  projectKey: projectKey,
  credentials: {
    clientId: appConfig.commerceTools.clientId,
    clientSecret: appConfig.commerceTools.clientSercet,
  },
  scopes,
  fetch,
};

const httpMiddlewareOptions: HttpMiddlewareOptions = {
  host: appConfig.commerceTools.apiUrl,
  fetch,
};

const ctpClient = new ClientBuilder()
  .withProjectKey(projectKey) // .withProjectKey() is not required if the projectKey is included in authMiddlewareOptions
  .withClientCredentialsFlow(authMiddlewareOptions)
  .withHttpMiddleware(httpMiddlewareOptions)
  // .withLoggerMiddleware()
  .build();


// Create apiRoot from the imported ClientBuilder
export const ctApiRoot = createApiBuilderFromCtpClient(ctpClient);
