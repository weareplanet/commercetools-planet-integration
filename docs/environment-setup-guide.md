# Environment Setup Guide - Commercetools Connector for Planet

The guide below outlines the steps you need to take to have an environment ready to host the connector. Please read the [introduction page](../readme.md) first and understand the concept and the existing features before proceeding with the integration.

To deploy the connector, you will need either access to an on-premise environment or a cloud service running Node. We provide example scripts for Amazon Web Services (AWS) deployment, the easiest and recommended option at the moment.

Please note that the connector requires Node.js 16.0.0 to work. The application is implemented in Typescript. For the production environment, you must compile the program into JavaScript.

## Overview

The environment setup guide consists of the following sections:

* Setting up your environment variables [ [jump to section](#environment-variables) ]
* Deployment to Amazon Web Services (AWS) [ [jump to section](#deployment-to-amazon-web-services-aws) ]
* Deployment to On-Premise Environment [ [jump to section](#deployment-to-on-premise-environment) ]

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

## Deployment to Amazon Web Services (AWS)

To deploy on Amazon Web Services, you must run the script below. Make sure to copy all files from this repository to your environment first. You must pass your AWS region as an option to the script (e.g., `eu-west-1`). This script will use your environment variables to create the commercetools' custom types and API extension and deploy the connector to your AWS space.

```shell
sh ./deploy/aws/deploy-aws.sh 'eu-west-1'
```

tbd: Check with Fabio

## Deployment to On-Premise Environment

To deploy on-premise, you will need to run the script below. Make sure to copy all files from this repository to your environment first. Run the scripts in the order shown below to deploy the create the API client, do the necessary deployment of the connector, and create the commercetools' custom types and API extension.

```shell
sh ./deploy/build-script.sh

# deploy now your generated package

sh ./deploy/commercetools/ct-setup.sh 'your-package'
```

tbd: Check with Fabio

That's it for the moment. You can return to the [integration guide](integration-guide.md) once your environment is set up and come back if necessary for further configuration.
