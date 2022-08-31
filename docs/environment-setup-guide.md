# Environment Setup Guide - Commercetools Connector for Planet

The guide below outlines the steps you need to take to have an environment ready to host the connector. Please read the [introduction page](https://github.com/weareplanet/commercetools-planet-integration) first and understand the concept and the existing features before proceeding with the integration.

To deploy the connector, you will need either access to an on-premise environment or a cloud service running Node. We provide example scripts for Amazon Web Services (AWS) deployment, the easiest and recommended option at the moment.

Please note that the connector requires Node.js 16.0.0 to work. The application is implemented in Typescript. For the production environment, you must compile the program into JavaScript.

## Overview

The environment setup guide consists of the following sections:

* Setting up your environment variables [ [jump to section](#environment-variables) ]
* Quick Setup [ [jump to section](#quick-setup) ]
* Manually deploying the connector [ [jump to section](#manual-deployment) ]

## Environment Variables

The connector uses environment variables as the application configuration. The environment variables are responsible for your Datatrans merchant configurations and access credentials to commercetools. You will need to define these properly for the connector to connect to commercetools and Datatrans. See the [integration guide](integration-guide.md) for more information about the relevant commercetools and Datatrans credentials.

To get started, clone this repository to your desired environment. Copy the file `deploy/env.example` to `deploy/env` and change the values of the variables in your newly added file. This file will be required to deploy the connector successfully. For security reasons, remove this file after deployment is complete.

Environment Variable | Format | Description
:-----------|:-----------|:-----------
`CT_CLIENT_ID` | String | The API Client's `Client ID` is required to communicate with commercetools.
`CT_CLIENT_SECRET` | String | The API Client's `Client Secret` is required to communicate with commercetools.
`CT_AUTH_URL` | String | The API Client's `Auth URL` is required to communicate with commercetools (e.g., `https://auth.us-central1.gcp.commercetools.com`).
`CT_API_URL` | String | The API Client's `API URL` is required to communicate with commercetools (e.g., `https://api.us-central1.gcp.commercetools.com`).
`CT_PROJECT_ID` | String | Your commercetools `Project Key` is required to communicate with commercetools. The project key is also your commercetools' project name.
`DT_MERCHANTS` | String | Each object in this array contains the credentials and configuration for one Datatrans merchantId. Expected is a stringified JSON array of objects, each containing a Datatrans merchantId as `id`, a password as `password`, an environment identifier as `environment`, and the sign key as `dtHmacKey`. The environment identifier should either be `test` or `prod`.
`LOG_LEVEL` | String | Log level of which the application will show. It must be one of the following: `trace, debug, info, warn, error, fatal, silent`. It defaults to `debug`.

## Quick Setup

To quickly set up everything, run the command below. Check the following chapters if you need details about the individual deployment steps. Only proceed with this command after defining your [environment variables](#environment-variables).

```shell
bash ./deploy/deploy.sh -e AWS -t HTTP
```

The master script supports the arguments below.

Argument | Accepted Values | Description
:-----------|:-----------|:-----------
`-e` | `AWS` | The environment you will deploy the connector to.
`-t` | `HTTP`, `AWSLAMBDA` | The commercetools API extension type you would like to use. We recommend HTTP.

## Manual Deployment

Read this chapter if you wish to manually deploy the connector (e.g., to Amazon Web Services). There are several shell scripts in /deploy that you need to call to deploy the connector into AWS correctly and create the commercetools required custom types and API extension. Follow the order below to ensure the correct creation of the connector's prerequisites.

### Preparing your Environment Variables

Only proceed with the command below after defining your [environment variables](#environment-variables), especially the extra variables needed for a manual deployment to AWS. Run the following command to export the variables from your prepared `env` file to your environment.

```shell
source ./deploy/env
```

### Creating the commercetools Custom Types

Run the following script to create the custom types required by the connector.

```shell
bash ./deploy/commercetools/custom-types-setup.sh
```

This script will take the various required types defined in `deploy/commercetools/types`.

### Creating the AWS CloudFormation Stack

Run the script below to create the AWS CloudFormation Stack. This script will use your environment variables to deploy the connector to your AWS ARN. When running this script, you must pass a stack id (e.g., prod01, develop01) and an AWS region (e.g., eu-west-1).

```shell

bash ./deploy/cloud/aws/aws-deploy.sh STACKID REGION

```

After a few minutes, AWS CloudFormation should show your newly created stack. The Lambda function's name will be ct-planet-connector-{STACKID}. If you need to customize the stack template, you may check our CloudFormation template located at `/deploy/cloud/aws/stack-template.yaml`. We do recommend leaving this file as is.

### Creating the commercetools API Extension

After deploying the connector successfully to AWS or an on-premise environment, you can proceed with creating commercetools' API extension with the script below.

```shell
bash ./deploy/commercetools/api-extension-setup.sh
```

### Creating the Package Build

To build the Node.js package, you can now run the script below. The script will create a lean .zip package to avoid size constraints when updating the Lambda function. Don't forget that Node.js 16 is required.

```shell
bash ./deploy/make-deploy-package.sh
```

After a few minutes, a .zip file will be available that you can use for the next and final step.

### Deploying the Package

Run the command below to deploy the .zip package into the Lambda function created within your AWS CloudFormation Stack. Set `AWSREGION`, `STACKID` and `yourpackagename.zip` properly.

```shell
aws lambda update-function-code --region=AWSREGION --function-name=ct-planet-connector-STACKID --zip-file=fileb://package.zip
```

That's it for the moment. You can return to the [integration guide](integration-guide.md) and return to this page if necessary for further environment configuration.
