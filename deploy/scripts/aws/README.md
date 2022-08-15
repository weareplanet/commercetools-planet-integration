# AWS IaC sample deployment for Planet Payment CommerceTools connector

<<<<<<< HEAD
>### WIP, have a few TO DO's yet

## Summary

This procedure helps on deploying a sample Planet Payment CommerceTools connector, which runs as a Lambda function. It's a reference and maybe isn't suitable for usage on production systems - it doesn't take into account any other existing AWS resources.
This folder contains scripts and templates for deployment and can be used several times to create any desired number of infrastructure stacks.
Some steps' details aren't covered by this procedure, like obtaining Datatrans credentials and CommerceTools project setup and credentials.

## Procedure overview
| # | Step | Description or Details |
| ---- | ---- | ----|
| 1 | [Setup Datatrans](#step-1---setup-datatrans) | Setup access and get credentials |
| 2 | [Setup CommerceTools](#step-2---setup-commercetools) | Setup access and get credentials, Setup Project, register custom fields (script + JSON files) |
| 3 | [Create AWS infrastructure](#step-3---create-aws-infrastructure) | Uses shell script + CloudFormation template plus input parameters |
| 4 | [Package Build](#step-4---package-build) | Manual steps for building the NodeJS package |
| 5 | [Package Deploy](#step-5---package-deploy) | Manual steps for deploying the ZIP package into Lmabda |
| 6 | [Lambda ENV vars adjustments](#step-6---lambda-env-vars-adjustments) | Change a few ENV vars at the Lambda configuration using data from steps 1 and 2. _(You may want to change the script file with these informations on step 3 **before running it**, saving time on step 6.)_ |

## Requirements

This procedure was developed and tested on Ubuntu Linux 20.04 and _should_ run ok on other Linux distros and "UNIX-like" OSs (like MacOS).
=======
## Summary

This procedure helps on deploying a sample Planet Payment CommerceTools connector, which runs as a Lambda function. It's a reference and maybe isn't suitable for usage on production systems - it doesn't take into account any other existing AWS resources.
There are scripts and templates for deployment that can be used several times to create any desired number of infrastructure stacks.
Some steps are manual and others uses scripts to perform tasks. Steps 1 and 2 details aren't covered by this procedure - obtaining Datatrans credentials, and CommerceTools project setup and credentials.

## Steps Overview
| # | Step | Description |
| ---- | ---- | ----|
| 1 | [Setup Datatrans](#step-1---setup-datatrans) | Setup access and get credentials. <p> Manual procedure with outputs to use in step 3. |
| 2 | [Setup CommerceTools, <p>part 1](#step-2---setup-commercetools-part-1) | Setup access and get credentials, Setup first API-Client. <p> Manual procedure with outputs to use in step 3. |
| 3 | [ENV var file preparation](#step-3---lambda-env-vars-adjustments) | Modify `.env` file with variables from steps 1 and 2. Manual procedure. <p>_**This `.env` file is used by the scripts on steps 4, 5 and 6.**_ |
| 4 | [Setup CommerceTools, <p>part 2](#step-4---setup-commercetools-part-2) | Register custom field types (script + JSON files), create API Extensions. <p> Uses shell scripts and the `.env` file.  |
| 5 | [Create AWS infrastructure](#step-5---create-aws-infrastructure) | Creates an AWS infrastructure stack to support the Lambda function. <p>Uses a shell script, a CloudFormation template, `.env` file plus input parameters. |
| 6 | [Setup CommerceTools, <p>part 3](#step-6---setup-commercetools-part-3) | Create API Extensions. <p> Uses shell scripts and the `.env` file. |
| 7 | [Package Build](#step-7---package-build) | Builds a package from the current branch. <p> Uses a shell script and outputs a .zip file to be used in the Lambda function. |
| 8 | [Package Deploy](#step-8---package-deploy) | Single-line AWS CLI command to deploy the .zip package from step 7. <p>Manual procedure. |


## Requirements

This procedure was developed and tested on Ubuntu Linux 20.04 and _should_ run ok on other Linux distros and "UNIX-like" OSs (like MacOS). The command shell used was **bash** - there's no guarantee that other shells will work (sh, zsh).
>>>>>>> ef7f739 (INC-5 - major refactor)

- accounts and credentials from Datatrans and CommerceTools
- an AWS account
- administrator level credentials for the target AWS account (via IAM User, via SSO integration) to support running AWS CLI commands with it
<<<<<<< HEAD
- a Bash shell (others can do the trick although this wasn't throughly tested here)
=======
- a Bash shell
>>>>>>> ef7f739 (INC-5 - major refactor)
- AWS CLI properly installed for the OS/shell
- this repository cloned

## Assumptions
- No equal resources exists at the AWS account and region.
- All inputs to the scripts are valid.
- Lambda will use Node.JS v16 runtime (function uses TypeScript)

<<<<<<< HEAD
## How-to's section

### STEP 1 - **Setup Datatrans**

You can skip this step if you already have the Datatrans setup done and all information below.

Details on the needed information regarding the needed ENV vars can be found [here](https://github.com/weareplanet/commercetools-planet-integration/tree/main#enviroment-configuration) altogether with links for how to get them. This procedure doesn't cover in details how to setup Datatrans (account, credentials).
A mild suggestion is to look [here](https://docs.datatrans.ch/docs/home).

From the setup, you must get the following pieces of information:

| Item | Type | Usage at Lambda ENV Var |
|---|---|---|
|`id, password, environment and HMAC key`| a stringfied JSON | **DT_MERCHANTS** |
|`Datatrans PRODUCTION API URL`| URL | **DT_PROD_API_URL** |
|`Datatrans TEST API URL` | URL | **DT_TEST_API_URL** |

- _DT_MERCHANTS will look like this:_

>```[{"id": "0123456789", "password": "AasecretPassw0rd", "environment": "test", "dtHmacKey": "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz98765432100123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrst"}]```

### STEP 2 - **Setup CommerceTools**

You can skip this step if you already have the CommerceTools setup done and all information below.

Again, details on the needed information regarding the needed ENV vars can be found [here](https://github.com/weareplanet/commercetools-planet-integration/tree/main#enviroment-configuration) altogether with links for how to get them. This procedure covers _PARTIALLY_ how to setup CommerceTools. A suggestion is to look [here](https://docs.commercetools.com/getting-started/#create-an-api-client).

_**First**_, you must setup your access in CommerceTools (account, credentials, projects).

From this setup, when creating the API client, you must get the following pieces of information:

| Item | Type | Usage at Lambda ENV var | Usage at `ct-setup.sh` ENV var|
|---|---|---|---|
|`CommerceTools API URL`| URL | **CT_API_URL** | **CT_API_URL**
|`CommerceTools AUTH URL`| URL | **CT_AUTH_URL** | **CT_AUTH_URL** |
|`CommerceTools PROJECT ID/KEY`| string | **CT_PROJECT_ID** |**CT_PROJECT_ID** |
|`CommerceTools CLIENT ID`| string | **CT_CLIENT_ID** | **CT_CLIENT_ID** |
|`CommerceTools CLIENT SECRET`| string | **CT_CLIENT_SECRET** | **CT_CLIENT_SECRET** |
|`CommerceTools SCOPES`| string | _not used_ | **CT_SCOPES** |

_**Second**_, with all the information above, you should modify and run the `deploy/commercetools/ct-setup.sh` script (from inside the `deploy/commercetools folder`) to create all the custom field types regading payment, interaction, methods, etc within the chosen CommerceTools project.
> This script has a few variables like the ones above that must be filled _**before**_ running it. Edit the file to do that.

### _**Some preparations for all the following:**_
- Get the git repository cloned.
- Get into the cloned repository with a shell (bash, zsh).
- Make sure that your AWS credentials are OK (get them fresh from your AWS SSO page, or run `aws configure` for the awscli profiles. The scripts and commands used here assume usage of the _default_ awscli profile.)

### STEP 3 - **Create AWS infrastructure**
=======
## How-to's section <p>

### STEP 1 - **Setup Datatrans** <p>

You can skip this step if you already have the Datatrans setup done and all required information below.

_This procedure doesn't cover in details how to setup Datatrans (account, credentials)._
A mild suggestion is to look [here](https://docs.datatrans.ch/docs/home).

**Details about the variables needed by Planet Payment CommerceTools connector can be found [here](https://github.com/weareplanet/commercetools-planet-integration/tree/main#enviroment-configuration).**

In tis step, from the Datatrans setup, you must get these variables: **DT_MERCHANTS**, **DT_PROD_API_URL** and **DT_TEST_API_URL**.
<br><br>

### STEP 2 - **Setup CommerceTools, part 1** <p>
You can skip this step if you already have the CommerceTools setup done and all required information below.

**Details about the variables needed by Planet Payment CommerceTools connector can be found [here](https://github.com/weareplanet/commercetools-planet-integration/tree/main#enviroment-configuration).**

This procedure covers _PARTIALLY_ how to setup CommerceTools. A suggestion is to look [here](https://docs.commercetools.com/getting-started/#create-an-api-client).

From this step, after creating the first API-client, you must get these variables: **CT_API_URL**, **CT_AUTH_URL**, **CT_PROJECT_ID**, **CT_CLIENT_ID**, **CT_CLIENT_SECRET** and **CTP_SCOPES**.


<br>

### _**Some preparations for all the following:**_ <p>
- Get the git repository cloned.
- Get into the cloned repository with a bash shell.
- Make sure that your AWS credentials are OK (get them fresh from your AWS SSO page, or run `aws configure` for creating/changing awscli profiles. The scripts and commands used here assume usage of the _default_ awscli profile.)

<br>
### STEP 3 - **ENV var file preparation** <p>

From the two steps above you will have a set of variables, modify the file `deploy/commercetools/.env` and include the variables and values as `KEY="VALUE"` pairs in it.

The .env file will look like this:
```
# Variables for Planet Payment CommerceTools Connector
#
# for more details over the variables:
# https://github.com/weareplanet/commercetools-planet-integration/tree/main#enviroment-configuration
#
#
##### CommerceTools - API Operations
# (API-Client creation, API Extension creation and Custom Fields Types creation)
#
# all variables must belong to a single project, declared below in CT_PROJECT_ID (from CommerceTools CTP_PROJECT_KEY)
#
CT_PROJECT_ID="planetpayment-connector"
#
# new API-Extension name - to be used on step 6
CT_NEW_API_EXTENSION_NAME="prod01apiext"
#
# new API-Extension AWS credentials - to be used in Step 6
AWS_API_EXTENSION_ACCESS_KEY="to be filled by 05-aws-deploy.sh in step 5"
AWS_API_EXTENSION_SECRET="to be filled by 05-aws-deploy.sh in step 5"
AWS_LAMBDA_ARN="to be filled by 05-aws-deploy.sh in step 5"
#
#
# these credentials and scopes relate to the FIRST API-Client within CommerceTools project,
# as mentioned here: https://docs.commercetools.com/api/authorization#creating-an-api-client
# !!!!! DO NOT USE THIS FOR YOUR NEW API-CLIENT, use it just for its creation !!!!!
CT_CLIENT_ID="clientIDhash to be filled up by merchant"
CT_CLIENT_SECRET="clientSECREThash to be filled up by merchant"
CT_API_URL="https://api.us-central1.gcp.commercetools.com"
CT_AUTH_URL="https://auth.us-central1.gcp.commercetools.com"
CTP_SCOPES="manage_project:${CT_PROJECT_ID}"
#
##### Datatrans Variables
DT_CONNECTOR_WEBHOOK_URL="https://url.for.webhook/v1/dt-webhook"
DT_MERCHANTS='[{"id": "0123456789", "password": "AasecretPassw0rd", "environment": "test", "dtHmacKey": "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz98765432100123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrst"}]'
DT_PROD_API_URL="https://api.PROD.datatrans.com/v1"
DT_TEST_API_URL="https://api.sandbox.datatrans.com/v1"

```

### STEP 4 - **Setup CommerceTools, part 2** <p>

With the `.env` file above ready, proceed executing the following shell scripts:

Run, in `deploy/commercetools/` folder:

> **`bash 02-custom-types-setup.sh`** <br>
_will create a few custom fields types within the project, using JSON files within `deploy/commercetools/types` folder_

<br>

### STEP 5 - **Create AWS infrastructure** <p>

- Make sure that your AWS credenntials are OK (valid, refreshed, etc)
- The script needs the `.env` file modified by the step 3.
- Define an **ID** for the new stack, with no special characters or spaces in it, like "prod01" or "Develop02" - this will be **STACKID**
- Define on which region it will be deployed, like "eu-west-1" or "us-east-2" - this will be **AWSREGION**
- At the shell run this script providing the two parameters defined above:
   > `bash 05-aws-deploy.sh STACKID AWSREGION`

   (_an example:   **`bash 05-aws-deploy.sh prod01 eu-west-1`**_)
- Take a look at the CloudFormation dashboard and wait for the stack creation completion, it should take a few minutes.
- The Lambda function name will be `planetpaymentcommtool-STACKID`, where STACKID is your provided value (this name can be customized within the script, read its comments before changing anything in it).
>>>>>>> ef7f739 (INC-5 - major refactor)

A few details about the supporting files

| File | Purpose and Details |
| ---- | ------- |
<<<<<<< HEAD
| **planetpaymentconnector-stack-template.yaml** | A CloudFormation (CF) template that creates all infrastructure resources within an user-specified AWS account and region. It is copied then customized by cf-deploy.sh to create CF stacks. Do not use as-is. Avoid changing it if not sure on how CloudFormation works. |
| **cf-deploy.sh** | Shell script to create a CF stack, using the planetpaymentconnector-stack-template.yaml. Each run with different input parameters will render a different stack (with its own Lambda function and permissions) allowing multiple functions to work.|

**Notes about _cf-deploy.sh**
1. After each running the customized stack template will be stored at the same folder where the script ran. Can be useful for debugging or versioning, for example.
2. Inside `cf-deploy.sh` there are a few pre-filled ENV vars for the Lambda function. **These ENV vars values can be modified in the script prior to running it, using the information from steps 1 and 2. This can save time on the step 6 ahead.**

Then:
- Again, make sure that your AWS credenntials are OK (valid, refreshed, etc)
- Define an ID for the new stack, with no special characters or spaces in it, like "prod01" or "Develop02" - this will be **STACKID**
- Define on which region it will be deployed, like "eu-west-1" or "us-east-2" - this will be **AWSREGION**
- At the shell run this script providing the two parameters defined above:
   > `bash cf-deploy.sh STACKID AWSREGION`

   (_an example: `bash cf-deploy.sh prod01 eu-west-1`_)
- Take a look at the CloudFormation dashboard and wait for the stack creation completion, it should take a few minutes
- The Lambda function name will be `planetpaymentcommtool-STACKID`, where STACKID is your provided value (this name can be customized within the script, read its comments).

### STEP 4 - **Package Build**

There are several methods to build a Node JS package. We're providing one method hoping that it will build a lean .zip package to avoid size constraints when updating the Lambda function.

> We will not cover setting up the environment to run the following commands. Be advised.

| Task | Command |
| ---- | ------- |
| Checkout the repo for Planet Payment Connector  | _Ok, it should be a 'git clone' or 'git pull', it's up to you._ |
| Install DEV dependencies | `npm ci` |
| Checking code quality | `npm run lint` |
| Run tests | `npm run test` |
| Run build | `npm run build` |
| Install PRODUCTION dependencies | `npm ci --production` |
| Create a temp folder | `mkdir newpackage` |
| Copy only required files to the new folder | `cp -fr ./node_modules newpackage/` |
|  | `cp -fr dist/* newpackage/` |
|  | `cp -fr package.json newpackage/` |
| Get into to the new folder | `cd newpackage` |
| Zipping all contents to a file | `zip -r9q yournewpackage.zip *` |

### STEP 5 - **Package Deploy**

It will deploy the .zip package above into the Lambda function created at the step 3.

Run this command at the shell, changing `AWSREGION` for the region where you had deployed the function, `STACKID` for the name you provided before and `yourpackagename.zip` to the name fo the package build in step 4:

> `aws lambda update-function-code --region=AWSREGION --function-name=planetpaymentcommtool-STACKID --zip-file=yourpackagename.zip`

_Eventually you may need to refresh your AWS credentials and try again._

### STEP 6 - **Lambda ENV vars adjustments**

In the deployed Lambda function configurations, you need to fill the ENV vars values using data from steps 1 and 2. (As mentioned before, you can do it on step 3 modifying the ct-deploy.sh script prior to run it).

Pay attention to the `DT_CONNECTOR_WEBHOOK_URL` variable: it must contain the FunctionURL from the Lambda function itself.

### **Extras**
#### _Calling your Lambda function with FunctionURL_

After your individual stack is deployed you can get its FunctionURL directly from the Lambda function dashboard. This allows you to call the Lambda function without the need of an API-Gateway.

With the actual configuration using AWS_IAM setting, to call a function you need to provide credentials. It is strongly recommended usin Postman for this, as it handles all the creation of the "AWS Signature v4" using your credentials.

In Postman, after adding the copied Function URL,
within the **Authorization* tab:
- choose type as **AWS Signature**
- then insert your **AccessKey** and **SecretKey** - get it from your AWS SSO page
- expand "Advanced" then also insert:
  - the AWS Region where the function resides **eu-west-1**
  - Service Name as **lambda**
  - Session Token - get it from you AWS SSO page

Then proceed with any additional parameter, header, etc required for your needs.

# TO DO's

- Verify if API-Gateway is really needed for the lambdas.
- include routine in cf-deploy.sh to get FunctionURL and insert it on Lambda's ENV var, reducing one operation at step 6.
=======
| **planetpaymentconnector-stack-template.yaml** | A CloudFormation (CF) template that creates all infrastructure resources within an user-specified AWS account and region. It is copied then customized by 05-aws-deploy.sh to create CF stacks. <p>**Do not use as-is.** Avoid changing it if not sure on how CloudFormation works. |
| **05-aws-deploy.sh** | Shell script to create a CF stack, using the _planetpaymentconnector-stack-template.yaml_ file. Each run with different input parameters will render a different stack (with its own Lambda function and permissions) allowing multiple functions to work concurrently.|

>**A note about _05-aws-deploy.sh_** <p>After each running the customized stack template will be stored at the same folder where the script ran. Can be useful for debugging but _not versioning_, as it contains sensitive information regarding Datatrans and CommerceTools.

<br>

### STEP 6 - **Setup CommerceTools, part 3** <p>

After runnning step 5 successfully, proceed executing this shell script:

Run, in `deploy/commercetools/` folder:

> **`bash 06-api-extension-setup.sh`** <p>
_will setup the API Extension into CommerceTools_

<br>

### STEP 7 - **Package Build** <p>

There are several methods to build a Node JS package. We're providing a shell script that will output a lean .zip package to avoid size constraints when updating the Lambda function.

_**Requisites**_
- Node.js v.16 - to have it installed, take a look [here](https://nodejs.org/en/download/package-manager/) if using a package manager, or [here](https://nodejs.org/en/download/).
- **curl** and **zip** installed for the OS to be used

Run the script **from the cloned repository root folder:**

> **`bash ./deploy/07-build-package.sh`**

Wait a few minutes for completion then look at the .zip filename in the output. Use this file for the next step.
<br><br>

### STEP 8 - **Package Deploy** <p>

It will deploy the .zip package above into the Lambda function created at the step 3.

Run this command at the shell, changing `AWSREGION` for the region where you had deployed the function, `STACKID` for the ID you provided before and `yourpackagename.zip` to the name from the package build in step 5:

>`aws lambda update-function-code --region=AWSREGION --function-name=planetpaymentcommtool-STACKID --zip-file=fileb://yourpackagename.zip`

_Eventually you may need to refresh your AWS credentials and try again._

After updating the Lambda function, pay attention to the `DT_CONNECTOR_WEBHOOK_URL` variable: it must contain the FunctionURL from the Lambda function itself.
>>>>>>> ef7f739 (INC-5 - major refactor)
