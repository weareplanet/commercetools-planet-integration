# Environment Setup Guide - Commercetools Connector for Planet

The guide below outlines the steps you need to take to have an environment ready to host the connector. Please make sure you read the [introduction page](../readme.md) first and understand the concept and the existing features before proceeding with the integration.

To deploy the connector, you will need either access to an on-premise environment or a cloud service running Node. We provide example scripts for the deployment to Amazon Web Services (AWS). This is the easiest and recommended option at the moment.

Please note that the connector requires Node.js 16.0.0 to work. The application is implemented in Typescript. For the production environment, the program must be compiled into JavaScript. Check the section [Deployment](#Deployment) below for more details related to deployment.

## Overview

The environment setup guide consists of following sections:

* Setting up your environment variables [ [jump to section](#enviroment-variables) ]
* Deployment [ [jump to section](#environment-setup) ]
* Setting Up commercetools [ [jump to section](#setting-up-commercetools) ]

## Enviroment Variables

The connector uses environment variables as the application configuration. This is where the various Datatrans merchant configurations and access credentials to commercetools will be stored and retrieved by the connector. You will need to define these for the connector to properly connect to commercetools and Datatrans. See the [integration guide](integration-guide.md) for more information about commercetools and Datatrans credentials.

An example for your environment variables (`.env.example`) is provided at the root of our repository. Copy that file, rename it to `.env` and change the values of the variables.

Environment Variable | Format | Description
-----------|-----------|-----------
`CT_CLIENT_ID` | String | The API Client's `Client ID` which is needed for the communication with commercetools. Example: `4XmKDlB_Vb4jU7a93EcJwsHj`.
`CT_CLIENT_SECRET` | String | The API Client's `Client Secret` which is needed for the communication with commercetools. Example: `sUEvUKiJ-LQGGj3P6uvmrbk8UV4Odrtc`.
`CT_AUTH_URL` | String | The API Client's `Auth URL` which is needed for the communication with commercetools. Example: `https://auth.us-central1.gcp.commercetools.com`.
`CT_API_URL` | String | The API Client's `API URL` which is needed for the communication with commercetools. Example: `https://api.us-central1.gcp.commercetools.com`.
`CT_PROJECT_ID` | String | Your commercetools `Project Key` which is needed for the communication with commercetools. This is also your commercetools's project name.
`DT_MERCHANTS` | String | Each object in this array contains the credentials and configuration for one Datatrans merchanId. Expected is a stringified JSON array of objects, each containing a Datatrans merchantId as `id`, a password as `password`, an environment identifier as `environment` and the sign key as `dtHmacKey`. The environment should either be `test` or `prod`.
`DT_CONNECTOR_WEBHOOK_URL` | String | The webhook URL that Datatrans will call after a transaction has been completed.
`LOG_LEVEL` | String | Log level of which the application will show. Must be one of the following: `trace, debug, info, warn, error, fatal, silent`. It defaults to `debug`.

## Deployment

To deploy on your on-premise environment, refer to the documentation [here](tbd). To deploy on Amazon Web Services, refer to the documentation [here](tbd).

tbd: explaining various procedures, maybe grouping the deploy docs here

## Setting Up Commercetools

To correctly set up everything required on commercetools' end, the following scripts will create an API client, custom types and an API extension. You will have to setup your tbd:xyz environment variable first in `.env` for the scripts to work properly.

tbd: add 3 scripts for ct

```shell
command for script1
command for script2
command for script3
```

That's it for the moment. You can go back to the [integration guide](integration-guide.md) once your environment is setup and come back if necessary again for further configuration.
