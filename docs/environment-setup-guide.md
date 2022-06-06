# Environment Setup Guide - Commercetools Connector for Planet

The guide below outlines the steps you need to take to have an environment ready to host the connector. Please read the [introduction page](https://github.com/weareplanet/commercetools-planet-integration) first and understand the concept and the existing features before proceeding with the integration.

To deploy the connector, you will need either access to an on-premise environment or a cloud service running Node. We provide quick deploy scripts for Amazon Web Services (AWS), the easiest and recommended environment at the moment.

Please note that the connector requires Node.js 16.0.0 to work. The application is implemented in Typescript and will be compiled into JavaScript.

## Overview

The environment setup guide consists of the following sections:

* Setting up your environment variables [ [jump to section](#environment-variables) ]
* Quick Deploy [ [jump to section](#quick-deploy) ]
* Sanity Check [ [jump to section](#sanity-check) ]

## Environment Variables

The connector uses environment variables as the application configuration. The environment variables are responsible for your Datatrans merchant configurations and access credentials to commercetools. You will need to define these properly for the connector to connect to commercetools and Datatrans. See the [integration guide](integration-guide.md) for more information about the relevant commercetools and Datatrans credentials.

To get started, clone this repository to your desired environment. Copy the file `deploy/env.example` to `deploy/env` and change the values of the variables in your newly added file. This file will be required to deploy the connector successfully. For security reasons, remove this file after deployment is complete.

Environment Variable | Format | Description
:-----------|:-----------|:-----------
`CT_PROJECT_ID` | String | Your commercetools `Project Key` is required to communicate with commercetools. The project key is also your commercetools' project name.
`CT_CLIENT_ID` | String | The API Client's `Client ID` is required to communicate with commercetools.
`CT_CLIENT_SECRET` | String | The API Client's `Client Secret` is required to communicate with commercetools.
`CT_AUTH_URL` | String | The API Client's `Auth URL` is required to communicate with commercetools (e.g., `https://auth.us-central1.gcp.commercetools.com`).
`CT_API_URL` | String | The API Client's `API URL` is required to communicate with commercetools (e.g., `https://api.us-central1.gcp.commercetools.com`).
`DT_MERCHANTS` | String | Each object in this array contains the credentials and configuration for one Datatrans merchantId. Expected is a stringified JSON array of objects, each containing a Datatrans merchantId as `id`, a password as `password`, an environment identifier as `environment`, and the sign key as `dtHmacKey`. The environment identifier should either be `test` or `prod`.
`LOG_LEVEL` | String | Log level of which the application will show. It must be one of the following: `trace, debug, info, warn, error, fatal, silent`. It defaults to `debug`.

## Quick Deploy

To quickly set up everything and deploy the connector, run the commands below. Only proceed with this chapter after defining your [environment variables](#environment-variables) and when logged in to your AWS account via [aws cli](https://aws.amazon.com/cli/). This script will create the commercetools Custom Types and API extension, the AWS CloudFormation Stack, generate the package build, and deploy the package to your environment. macOS users will require to have `jq` and `gnu-sed` to run the script correctly.

```shell
bash ./deploy/deploy.sh -e aws -t AwsLambda
```

The master script supports the arguments below.

Argument | Accepted Values | Description
:-----------|:-----------|:-----------
`-e` | `aws` | The environment you will deploy the connector to.
`-t` | `AwsLambda` | The commercetools API extension type you would like to use.

## Sanity Check

To make sure that the connector is working properly, open the commercetools playground when logged into your account, and create a new payment with a payload similar to the one listed below.

```json
{
    "key": "my-reference-1234",
    "amountPlanned": {
        "centAmount": 100,
        "currencyCode": "EUR"
    },
    "paymentMethodInfo": {
        "paymentInterface": "pp-datatrans-redirect-integration",
        "method": "ECA, VIS"
    },
    "custom": {
        "type": {
            "typeId": "type",
            "id": "{commercetoolsTypeId}"
        },
        "fields": {
            "merchantId": "{datatransMerchantId}",
            "successUrl": "{shopUrl}/purchase/1234?s=success",
            "errorUrl": "{shopUrl}/checkout?s=error",
            "cancelUrl": "{shopUrl}/checkout?s=cancel"
        }
    }
}
```

If the response contains a redirectUrl, you are good to go. Time to hand over to anyone else focusing on integrating the payment flows.

[➝ Link to the Integration Guide](integration-guide.md)
