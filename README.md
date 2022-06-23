# Planet Payment to CommerceTools connector

## Summary

This repository provides a "connector" function which acts as a CommerceTools extension which performs communication with Planet Payment (Datatrans) hiding that from a consumer.

A consumer just creates, updates and reads objetcs in/from CommerceTools - this extension communicates with Planet Payment being called by CommerceTools on specific events.

## Target environments

**The connector is designed to be usable in different [Node.js](https://nodejs.org/en/) environments (AWS, GCP, on-premise etc.).**

In order to do this it is implemented with the environment-agnostic interface (see `app/handlers/environment-agnostic`).

`app/environment-specific-handlers` subfolders wrap functions exported from `app/handlers/environment-agnostic` to make them deployable to specific environments.
For example, `app/environment-specific-handlers/aws-http` provides a Lambda function behind AWS API Gateway.

Also functions from `app/handlers/environment-agnostic` can be used directly in your own node.js application of any structure (maybe using some your own framework etc.) which you deploy on-premise or somehow else.

## Repository structure

Basic parts of the repository:

```
app
  domain
    environment-agnostic-handlers     # functions with abstract (environment-agnostic) request/response shapes
    services                          # most of business logic (and some auxiliary facilities like logging) is here
  environment-specific-handlers       # wrappers which make environment-agnostic handlers be deployable to specific environments (AWS, GCP etc.)
    aws-http
    gcp-http
  interfaces                          # some declarations to be used in a few sibling branches (whenever in app)
deploy                                # all deployment/infrastructure stuff is here
test                                  # some global test setup or integration tests which it's hard to relate to sime specific branch
```

The most interesting part is `app/domain`.

#### Environment-agnostic handlers

`app/domain/environment-agnostic-handlers` subfolder provides functions, every of which is implemented in the environment-agnostic manner - it takes `AbstractRequest` and returns `AbstractResponse` (see `app/interfaces`).

Every such function is **aware of the expected request body structure** (specific for its use case), but is not adapted to any execution environment (particularly, is not aware of where exactly the body of `AbstractRequest` is taken from - it should be done somewhere outside).

#### Environment-specific adapters

For a few most popular execution environments (AWS Lambda, GCP function etc.) environment-specific adapters are implemented (see `app/environment-specific-handlers`).

Every such adapter is, vise versa, **aware of the environment-specific request/response format** (for example, the adapter implemented in `app/environment-specific-handlers/aws-http` is aware of the shape of AWS API Gateway event for AWS Lambda and the shape of the expected response for AWS API Gateway),
but is not aware of the request body structure specific for every use case.

##### More details

Every subfolder of `app/domain/environment-agnostic-handlers/per-operation-handlers` implements a handler for **one specific business operation** (one use case of the Connector).

`app/domain/environment-agnostic-handlers/all-operations-handler` provides a higher-level handler for all possible cases - **it combines all lower-level handlers into a single function** which knows criteria when to use which of them for every real request processing.
In the initial design (at least for MVP) this single `all-operations-handler` function is considered enough and reasonable (taking into account the mupti-environment deploy target) for the outer consumption - and thus it is the only function exported from `app/domain/environment-agnostic-handlers/index.ts` (the standart Nodejs directory root).

> This approach allows to drastically simplify the deployment (only one function should be deployed for everything).
Pay attention - if you need a separate scaling for different use cases - you can just deploy the same function into different AWS Lambdas etc. (with some codebase overhead, but still with a simplified deployment scenario).
In case of necessity, any usecase-specific handler from `app/domain/environment-agnostic-handlers` can be used for an individual deploy. At the moment of the initial design it was considered redundant.


## Programming language

The application is implemented on [Typescript](https://www.typescriptlang.org/) in order to increzase the reliability.

It means that, at least for production environment, the program must be compiled into Javascript (see "Deployment" section).

## Code quality control

The quality check is performed with [ESLint](https://eslint.org/) and typescript-specific plugins.

`npm run lint`

## Building

The program is written in Typescript which is a "virtual language". **To be executable the program must be compiled to Javascript:**

`npm run build`

The buiuld result is saved into `dist` directory at the repository root.
After the building the same structure as was before in `app` directory (but already compiled to Javascript) will appear in `dist` directory. That will be the deployable program code.

> You can take some extra insights from `serverless.yml` file...

### Enviroment configuration

The program is using `process.env` for set up enviroment configuration. We have following enviroment veriables:

#### Required fields
```
CT_CLIENT_ID - CommerceTools client id
CT_CLIENT_SECRET - CommerceTools client secret
CT_PROJECT_ID - CommerceTools project ID
CT_AUTH_URL - CommerceTools authentication URL
CT_API_URL - CommerceTools API URL
CT_MERCHANTS - array of objects which containes merchant `id`, `password` and `enviroment`
# TODO: maybe need add info about where it get
```

#### Optional fields

```
LOG_LEVEL - fatal, error, warn, info, debug, trace or silent. Default: debug
```

## Deployment

> TODO: deploy script should execute `npm install`, `npm run build` commands and then use the `dist` content (together with `node_modules` and maybe `serverless.yml`) to produce a deployment package.

This repository uses [Serverless Framework](https://www.serverless.com/) at least for local development.

It is also a good choice as a multi-cloud deployment tool. If you like - you can use it (see `serverless.yml`).
> TODO: discuss, if we're really going to provide ready-for-use deploy scripts (there will be some challenge for DevOps)...

If you prefer to use another deployment tool - you are free to ignore `serverless.yml` and deploy functions from `app/handlers/cloud/index` via your favorite tool.

## Running

### In a local development environment

In a local development environment the connector can be running with use of Serverless Framework and [Serverless Offline plugin](serverless.com/plugins/serverless-offline)

#### Steps for running local development

1. Befor run the project you need provide all enviroment veriables into app. For making it, you need create `.env` and provide all necessary values from [Enviroment configuration](#enviroment-configuration) or you can simply rename `.env.example` to `.env` and fill with correct values.
2. Run the app.

`npm run start:local-dev`

This npm script runs the connector without the explicit building - with use of `ts-node-dev` (on-fly complilation + hot reload).

### In a target environment

When this connector is deployed to a Cloud (FaaS) - it will be used according to the target environment rules (for example, AWS Lambda function behind AWS API Gateway will be running according to AWS Lambda rules and accessible via HTTP(S)).

When this connector is used inside some monolith application - it will be running/accessible according to the rules of that application (for example, called within an express endpoint handler).

## Testing

The repository contains unit and integration tests which are implemented with [Jest](https://jestjs.io/) as a tool (Test Runner, mocking and assertion library).


The command to run them:
`npm run test`s

## Input validation

[Yup](https://github.com/jquense/yup) is used as a tool for the request shape validation.

### Validation of requests in handlers

Every subfolder of `app/domain/environment-agnostic-handlers/per-operation-handlers` has the following structure:

```
request-schema.ts
handler.ts
index.ts
<aspect-1>.spec.ts
<aspect-2>.spec.ts
...
```

- `request-schema.ts` exports the expected **request body schema** (declared in the [Yup schema format](https://github.com/jquense/yup#object)) for this handler.
- `handler.ts` exports the handler function (`AbstractRequestHandlerWithTypedInput`). The handler is provided the request schema, thus it relies on the scheme to access the request body internals. But it does not know how to validate the input against that schema.
- `index.ts` takes the exports of both `request-schema.ts` and `handler.ts` and wraps the imported `AbstractRequestHandlerWithTypedInput` handler into `AbstractRequestHandler` which **internally** cares about request shape validation.
- `<aspect-1>.spec.ts`, `<aspect-2>.spec.ts` etc. files contain unit tests which check any aspects of the handler exported from `index.ts` (i.e. which has the request validation facility).

Eventually every subfolder of `app/domain/environment-agnostic-handlers/per-operation-handlers` exports **`AbstractRequestHandler` which allows the consumer to not carry about the input validation.**


`app/domain/environment-agnostic-handlers/all-operations-handler` is a kind of such consumer - it just orchestrates lower-level handlers (exported from `app/domain/environment-agnostic-handlers/per-operation-handlers`) and does not carry about the input validation - thus it does not need its own request schema declaration.
