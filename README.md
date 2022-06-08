# Planet Payment to CommerceTools connector

## Summary

This repository provides a "connector" function which acts as a CommerceTools extension which performs communication with Planet Payment (Datatrans) hiding that from a consumer.

A consumer just creates, updates and reads objetcs in/from CommerceTools - this extension communicates with Planet Payment being called by CommerceTools on specific events.

## Target environments

**The connector is designed to be usable in any environment.**

In order to do this it is implemented with the environment-agnostic interface (see `src/handlers/environment-agnostic`).

**The repository contains a few ready-for-use adapters for some popular Cloud Providers - AWS, GCP.**
If you provide (to the process running the connector) `TARGET_ENVIRONMENT` environment variable, the connector will act as a handler for the specified environment.
Possible values for `TARGET_ENVIRONMENT` variable:
- `AWS_LAMBDA_BEHIND_API_GATEWAY` - the connector will be adapted to the event structure and response format AWS API Gateway uses for AWS Lambda.
- TODO: `AWS_LAMBDA_DIRECTLY` - the connector will be adapted to the event structure and response format of a direct AWS Lambda function invocation.
- TODO: `GCP_FUNCTION_BEHIND_CLOUD_ENDPOINTS` - the connector will be adapted to the request/response structures Google Cloud Endpoints uses for a Google Cloud function.
- TODO: `GCP_FUNCTION_DIRECTLY` - the connector will be adapted to the request/response structures of a Google Cloud function.

Also functions from `src/handlers/environment-agnostic` can be used directly in some monolith application (express etc.) which can be deployed on-premise.

## Repository structure

Basic parts of the repository

```
deploy
src
  handlers
    cloud   # adapters which make environment-agnostic function be deployable to specific environments (AWS, GCP etc.)
    environment-agnostic  # functions which act as HTTP handlers (controllers) with a general (environment-agnostic) request/response format
  interfaces
  services  # all business logic is here
test
```

## Testing

The repository contains unit and integration tests.

The command to run them:
`npm run test`

[Jest](https://jestjs.io/) is used as a tool (Test Runner, mocking and assertion library).

## Building

`npm run build`

The buiuld result is saved into `dist` directory at the repository root.

> TODO: deploy scripts should run this command and then use the `dist` content (together with `node_modules` and `serverless.yml`) to produce a deployment package.

## Deployment

This repository uses [Serverless Framework](https://www.serverless.com/) as a multi-cloud deployment tool.
If you like - you can use it (see `serverless.yml`).
> TODO: discuss, if we're really going to provide ready-for-use deploy scripts (there will be some challenge for DevOps)...

If you prefer to use another deployment tool - you are free to ignore `serverless.yml` and deploy functions from `src/handlers/cloud/index` via your favorite tool.

## Running

### In a local development environment

In a local development environment the connector can be running with use of Serverless Framework and [Serverless Offline plugin](serverless.com/plugins/serverless-offline):

`start:local-dev`

This npm script runs the connector without the explicit building - with use of `ts-node-dev` (on-fly complilation + hot reload).

### In a target environment

When this connector is deployed to a Cloud (FaaS) - it will be used according to the target environment rules (for example, AWS Lambda function behind AWS API Gateway will be running according to AWS Lambda rules and accessible via HTTP(S)).

When this connector is used inside some monolith application - it will be running/accessible according to the rules of that application (for example, called within an express endpoint handler).
