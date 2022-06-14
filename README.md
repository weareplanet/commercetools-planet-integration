# Planet Payment to CommerceTools connector

## Summary

This repository provides a "connector" function which acts as a CommerceTools extension which performs communication with Planet Payment (Datatrans) hiding that from a consumer.

A consumer just creates, updates and reads objetcs in/from CommerceTools - this extension communicates with Planet Payment being called by CommerceTools on specific events.

## Target environments

**The connector is designed to be usable in different Node.js environments (AWS, GCP, on-premise etc.).**

In order to do this it is implemented with the environment-agnostic interface (see `app/handlers/environment-agnostic`).

`app/handlers/execution-environment` subfolders wrap functions exported from `app/handlers/environment-agnostic` to make them deployable to specific environments.
For example, `app/handlers/execution-environment/aws-http` provides a Lambda function behind AWS API Gateway.

Also functions from `app/handlers/environment-agnostic` can be used directly in youe own application of any nature (express etc.) which you deploy on-premise.

## Repository structure

Basic parts of the repository:

```
deploy                                # all deployment/infrastructure stuff is here
app
  domain
    environment-agnostic-handlers     # functions which act as HTTP handlers (controllers) with abstract (environment-agnostic) request/response shapes
    services                          # all business logic is here
  environment-specific-handlers       # wrappers which make environment-agnostic functions be deployable to specific environments (AWS, GCP etc.)
    aws-http
    gcp-http
  interfaces
test                                  # some global test setup or integration tests which it's hard to relate to sime specific branch
```

## Programming language

The application is implemented on Typescript.

## Checking the test quality

The quality chack is performed with ESLint and typescript specific pluging.

`npm run lint`

## Testing

The repository contains unit and integration tests.

The command to run them:
`npm run test`

[Jest](https://jestjs.io/) is used as a tool (Test Runner, mocking and assertion library).

## Building

The program is written in Typescript which is a "virtual language". **To be executable the program must be compiled to Javascript:**

`npm run build`

The buiuld result is saved into `dist` directory at the repository root.
After the building the same structure as was before in `app` directory (already compiled to Javascript) will appear in `dist` directory. That will be the deployable program code.

## Deployment

> TODO: deploy script should execute `npm install`, `npm run build` commands and then use the `dist` content (together with `node_modules` and maybe `serverless.yml`) to produce a deployment package.

This repository uses [Serverless Framework](https://www.serverless.com/) at least for local development.

It is also a good choice as a multi-cloud deployment tool. If you like - you can use it (see `serverless.yml`).
> TODO: discuss, if we're really going to provide ready-for-use deploy scripts (there will be some challenge for DevOps)...

If you prefer to use another deployment tool - you are free to ignore `serverless.yml` and deploy functions from `app/handlers/cloud/index` via your favorite tool.

## Running

### In a local development environment

In a local development environment the connector can be running with use of Serverless Framework and [Serverless Offline plugin](serverless.com/plugins/serverless-offline):

`start:local-dev`

This npm script runs the connector without the explicit building - with use of `ts-node-dev` (on-fly complilation + hot reload).

### In a target environment

When this connector is deployed to a Cloud (FaaS) - it will be used according to the target environment rules (for example, AWS Lambda function behind AWS API Gateway will be running according to AWS Lambda rules and accessible via HTTP(S)).

When this connector is used inside some monolith application - it will be running/accessible according to the rules of that application (for example, called within an express endpoint handler).
