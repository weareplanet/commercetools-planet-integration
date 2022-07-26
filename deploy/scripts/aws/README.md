# AWS IaC sample deployment for Planet Payment CommerceTools connector

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

- accounts and credentials from Datatrans and CommerceTools
- an AWS account
- administrator level credentials for the target AWS account (via IAM User, via SSO integration) to support running AWS CLI commands with it
- a Bash shell (others can do the trick although this wasn't throughly tested here)
- AWS CLI properly installed for the OS/shell
- this repository cloned

## Assumptions
- No equal resources exists at the AWS account and region.
- All inputs to the scripts are valid.
- Lambda will use Node.JS v16 runtime (function uses TypeScript)

## How-to's section
---
### STEP 1 - **Setup Datatrans**

You can skip this step if you already have the Datatrans information below.

Details on the needed information regarding the needed ENV vars can be found [here](https://github.com/weareplanet/commercetools-planet-integration/tree/main#enviroment-configuration) altogether with links for how to get them. This procedure doesn't cover in details how to setup Datatrans (account, credentials). 
A mild suggestion is to look [here](https://docs.datatrans.ch/docs/home).

From the setup, you must get the following pieces of information:

| Item | Type | At Lambda |
|---|---|---|
|`id, password, environment and HMAC key`| a stringfied JSON | **DT_MERCHANTS** ENV var |
|`Datatrans PRODUCTION API URL`| URL | **DT_PROD_API_URL** ENV var |
|`Datatrans TEST API URL` | URL | **DT_TEST_API_URL** ENV var |

- _DT_MERCHANTS will look like this:_

>```[{"id": "0123456789", "password": "AasecretPassw0rd", "environment": "test", "dtHmacKey": "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz98765432100123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrst"}]```

### STEP 2 - **Setup CommerceTools**

Again, details on the needed information regarding the needed ENV vars can be found [here](https://github.com/weareplanet/commercetools-planet-integration/tree/main#enviroment-configuration) altogether with links for how to get them. This procedure covers _**PARTIALLY**_ how to setup CommerceTools. A suggestion is to look [here](https://docs.commercetools.com/getting-started/#create-an-api-client).

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

_**Second**_, with all the information above, you should run the `deploy/commercetools/ct-setup.sh` script (from inside the `deploy/commercetools folder`)to create all the custom fields regading payment, interaction, methods, etc types within the chosen CommerceTools project.
> This script has a few variables like the ones above that must be filled before running it. Edit the file to do that.

### _**Some preparations for all the following:**_
- Get the git repository cloned.
- Get into the cloned repository with a shell (bash, zsh).
- Make sure that your AWS credentials are OK (get them fresh from your AWS SSO page, or run `aws configure` for the awscli profiles.)

### STEP 3 - **Create AWS infrastructure**
#### A few details about the supporting files

| File | Purpose and Details |
| ---- | ------- |
| **planetpaymentconnector-stack-template.yaml** | A CloudFormation (CF) template that creates all infrastructure resources within an user-specified AWS account and region. It is copied then customized by cf-deploy.sh to create CF stacks. Do not use as-is. Avoid changing it if not sure on how CloudFormation works. |
| **cf-deploy.sh** | Shell script to create a CF stack, using the planetpaymentconnector-stack-template.yaml. Each run with different input parameters will render a different stack (with its own Lambda function and permissions) allowing multiple functions to work.|
| Notes about _cf-deploy.sh_ | 1. After each running the customized stack template will be stored at the same folder where the script ran. Can be useful for debugging or versioning, for example. |
| | 2. Inside cf-deploy.sh there are a few pre-filled ENV vars for the Lambda function, but you should verify if they're correct to your project, location etc. **These ENV vars can be inserted in the script prior to running it, using the information from steps 1 and 2. This can save time on the step 6 ahead.**|

- Again, make sure that your AWS credenntials are OK (valid, refreshed, etc)
- Define an ID for the new stack, with no special characters or spaces in it, like "prod01" or "Develop02" - this will be **STACKID**
- Define on which region it will be deployed, like "eu-west-1" or "us-east-2" - this will be **AWSREGION**
- At the shell run this script providing the two parameters defined above:
   > `bash cf-deploy.sh STACKID AWSREGION`

   (_an example: `bash cf-deploy.sh paymentconnector fabiocarvalho-planet`_)
- Take a look at the CloudFormation dashboard and wait for stack creation completion
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

It will deploy the package above into the Lambda function created at the step 3. At the shell, run this command, changing `AWSREGION` for the region where you had deployed the function, `STACKID` for the name you provided before and `yourpackagename.zip` to the name fo the package build in step 4:

> `aws lambda update-function-code --region=AWSREGION --function-name=planetpaymentcommtool-STACKID --zip-file=yourpackagename.zip`

Eventually you may need to refresh your credentials and try again.

### STEP 6 - **Lambda ENV vars adjustments**

In the deployed Lambda function configurations, you need to fill the ENV vars values using data from steps 1 and 2. (As mentioned before, you can do it on step 3 modifying the ct-deploy.sh script prior to run it).

Pay attention to the DT_CONNECTOR_WEBHOOK_URL variable: it must contain the FunctionURL from the Lambda function itself. 

### **Extras**
### _Calling your Lambda function with FunctionURL_

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
- Integrate the script and JSON files for creation of payment types within CommerceTools, as created by Oleksandr
- include links to Datatrans and CommerceTools help pages regarding signing up and project setup.