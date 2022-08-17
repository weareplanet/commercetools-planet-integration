# Environment Setup Guide - Commercetools Connector for Planet

The guide below outlines the steps you need to take to have an environment ready to host the connector. Please read the [introduction page](https://github.com/weareplanet/commercetools-planet-integration) first and understand the concept and the existing features before proceeding with the integration.

To deploy the connector, you will need either access to an on-premise environment or a cloud service running Node. We provide example scripts for Amazon Web Services (AWS) deployment, the easiest and recommended option at the moment.

Please note that the connector requires Node.js 16.0.0 to work. The application is implemented in Typescript. For the production environment, you must compile the program into JavaScript.

## Overview

The environment setup guide consists of the following sections:

* Setting up your environment variables [ [jump to section](#environment-variables) ]
* Deploying the connector to Amazon Web Services (AWS) [ [jump to section](#deployment-to-amazon-web-services-aws) ]

## Environment Variables

The connector uses environment variables as the application configuration. The environment variables are responsible for your Datatrans merchant configurations and access credentials to commercetools. You will need to define these properly for the connector to connect to commercetools and Datatrans. See the [integration guide](integration-guide.md) for more information about the relevant commercetools and Datatrans credentials.

To get started, clone this repository to your desired environment. An example for your environment variables (`.env.example`) is provided at the root of our repository. Copy that file to `deploy/.env`,  and change the values of the variables.

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

If you are deploying the connector to Amazon Web Services, you also need to configure the environment variables below.

Environment Variable | Format | Description
-----------|-----------|-----------
`CT_API_EXTENSION_AWS_LAMBDA_ARN` | String | ARN of the connector deployed as an AWS Lambda.
`CT_API_EXTENSION_AWS_LAMBDA_ACCESS_KEY` | String | Key to access the connector deployed as an AWS Lambda via ARN.
`CT_API_EXTENSION_AWS_LAMBDA_SECRET` | String | Secret to access the connector deployed as an AWS Lambda via ARN.

## Deployment to Amazon Web Services (AWS)

There are several shell scripts in /deploy that you need to call to deploy the connector into AWS correctly and create the commercetools required custom types and API extension. While we only have examples for AWS, the connector should, in theory, also be deployable on GCP. Only proceed with this chapter after defining your [environment variables](#environment-variables). Follow the order below to ensure the correct creation of the connector's prerequisites.

### Setting up commercetools Custom Types

Run the following script to create the custom types required by the connector.

```shell
sh ./deploy/commercetools/custom-types-setup.sh
```

This script will take the various required types defined in `deploy/commercetools/types`.

### Creating your AWS CloudFormation Stack

Run the script below to create the AWS CloudFormation Stack. This script will use your environment variables to deploy the connector to your AWS ARN. When running this script, you will need to pass a stack ID (e.g., prod01, develop01) and an AWS region (e.g., eu-west-1).

```shell
sh ./deploy/cloud/aws/aws-deploy.sh STACKID REGION
```

After a few minutes, AWS CloudFormation should show your newly created stack. The Lambda function's name will be `planetpaymentcommtool-STACKID`. If you need to customize the stack template, you may check our CloudFormation template located at `/deploy/cloud/aws/planetpaymentconnector-stack-template.yaml`. We do recommend leaving this file as is.

### Setting up the commercetools API Extension

After deploying the connector successfully to AWS or an on-premise environment, you can proceed with setting up commercetools' API extension with the script below.

```shell
sh ./deploy/commercetools/api-extension-setup.sh
```

### Creating the Package Build

To build the Node.js package, you can now run the script below. The script will create a lean .zip package to avoid size constraints when updating the Lambda function. Don't forget that Node.js 16 is required.

```shell
sh ./deploy/make-deploy-package.sh
```

After a few minutes, a .zip file will be available that you can use for the next and final step.

### Deploying the Package

Run the command below to deploy the .zip package into the Lambda function created within your AWS CloudFormation Stack. Set `AWSREGION`, `STACKID` and `yourpackagename.zip` properly.

```shell
aws lambda update-function-code --region=AWSREGION --function-name=planetpaymentcommtool-STACKID --zip-file=fileb://package.zip
```

After updating the Lambda function, don't forget to update the `DT_CONNECTOR_WEBHOOK_URL` environment variable. This variable must be equal to `FunctionURL` from your Lambda function.

That's it for the moment. You can return to the [integration guide](integration-guide.md) once your environment is set up and return if necessary for further environment configuration.
