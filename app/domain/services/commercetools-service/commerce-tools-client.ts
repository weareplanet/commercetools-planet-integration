// To use fetch with TS currently configured to produce commonjs,
// we have to use node-fetch of version 2.
// (see nore here https://stackoverflow.com/questions/69383514/node-fetch-3-0-0-and-jest-gives-syntaxerror-cannot-use-import-statement-outside)
import fetch from 'node-fetch';

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

import { ConfigService } from '../config-service';

const appConfig = new ConfigService().getConfig();
const projectKey = appConfig.commerceTools.projectId;

// see: https://planet.atlassian.net/browse/INC-151
const scopes = [ 'manage_project:' + projectKey ];
const authMiddlewareOptions: AuthMiddlewareOptions = {
  host: appConfig.commerceTools.authUrl,
  projectKey: projectKey,
  credentials: {
    clientId: appConfig.commerceTools.clientId,
    clientSecret: appConfig.commerceTools.clientSecret,
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

// Create apiRoot from ClientBuilder
// In the official tutorial (https://docs.commercetools.com/sdk/js-sdk-getting-started#create-the-client)
// this is done in a separate file - I don't see a reason,
// but I leave this comment for a caution.
export const ctApiRoot = createApiBuilderFromCtpClient(ctpClient);
