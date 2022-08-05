# Environment Setup Guide - Commercetools Connector for Planet

The guide below outlines the steps you need to take to have an environment ready to host the connector. Please read the [introduction page](../readme.md) first and understand the concept and the existing features before proceeding with the integration.

To deploy the connector, you will need either access to an on-premise environment or a cloud service running Node. We provide example scripts for Amazon Web Services (AWS) deployment, the easiest and recommended option at the moment.

Please note that the connector requires Node.js 16.0.0 to work. The application is implemented in Typescript. For the production environment, you must compile the program into JavaScript.

## Overview

The environment setup guide consists of the following sections:

* Setting up your environment variables [ [jump to section](#environment-variables) ]
* Deployment [ [jump to section](#environment-setup) ]
* Setting Up commercetools [ [jump to section](#setting-up-commercetools) ]

## Environment Variables

The connector uses environment variables as the application configuration. The environment variables are responsible for your Datatrans merchant configurations and access credentials to commercetools. You will need to define these properly for the connector to connect to commercetools and Datatrans. See the [integration guide](integration-guide.md) for more information about the relevant commercetools and Datatrans credentials.

An example for your environment variables (`.env.example`) is provided at the root of our repository. Copy that file, rename it to `.env` and change the values of the variables.

Environment Variable | Format | Description
-----------|-----------|-----------
`CT_CLIENT_ID` | String | The API Client's `Client ID` is required to communicate with commercetools. Example: `4XmKDlB_Vb4jU7a93EcJwsHj`.
`CT_CLIENT_SECRET` | String | The API Client's `Client Secret` is required to communicate with commercetools. Example: `sUEvUKiJ-LQGGj3P6uvmrbk8UV4Odrtc`.
`CT_AUTH_URL` | String | The API Client's `Auth URL` is required to communicate with commercetools. Example: `https://auth.us-central1.gcp.commercetools.com`.
`CT_API_URL` | String | The API Client's `API URL` is required to communicate with commercetools. Example: `https://api.us-central1.gcp.commercetools.com`.
`CT_PROJECT_ID` | String | Your commercetools `Project Key` is required to communicate with commercetools. The project key is also your commercetools' project name.
`DT_MERCHANTS` | String | Each object in this array contains the credentials and configuration for one Datatrans merchantId. Expected is a stringified JSON array of objects, each containing a Datatrans merchantId as `id`, a password as `password`, an environment identifier as `environment`, and the sign key as `dtHmacKey`. The environment identifier should either be `test` or `prod`.
`DT_CONNECTOR_WEBHOOK_URL` | String | The webhook URL that Datatrans will call after a transaction has been completed.
`LOG_LEVEL` | String | Log level of which the application will show. It must be one of the following: `trace, debug, info, warn, error, fatal, silent`. It defaults to `debug`.

## Deployment

To deploy on your on-premise environment, refer to the documentation [here](tbd). To deploy on Amazon Web Services, refer to the documentation [here](tbd).

tbd: explaining various procedures, maybe grouping the deploy docs here

## Setting Up Commercetools

To correctly set up everything required on commercetools' end, the following scripts will create an API client, custom types, and an API extension. You will have to set up your tbd:xyz environment variable in `.env` for the scripts to work correctly.

tbd: add 3 scripts for ct

```shell
command for script1
command for script2
command for script3
```

That's it for the moment. You can return to the [integration guide](integration-guide.md) once your environment is set up and come back if necessary for further configuration.
