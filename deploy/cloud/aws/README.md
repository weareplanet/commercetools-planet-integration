# AWS IaC sample deployment for Planet Payment CommerceTools connector

## Summary

This procedure helps on deploying a sample Planet Payment CommerceTools connector, which runs as a Lambda function. It's a reference and maybe isn't suitable for usage on production systems - it doesn't take into account any other existing AWS resources.
There are scripts and templates for deployment that can be used several times to create any desired number of infrastructure stacks.
Some steps are manual and others uses scripts to perform tasks. Steps 1 and 2 details aren't covered by this procedure - obtaining Datatrans credentials, and CommerceTools project setup and credentials.

## Steps Overview
| # | Step | Description |
| ---- | ---- | ----|
| 1 | [Setup Datatrans](#step-1---setup-datatrans) | Setup access and get credentials. <p> Manual procedure with outputs to use in step 3. |
| 2 | [Setup CommerceTools, <p>part 1](#step-2---setup-commercetools-part-1) | Setup access and get credentials, Setup first API-Client. <p> Manual procedure with outputs to use in step 3. |
| 3 | [ENV var file preparation](#step-3---lambda-env-vars-adjustments) | Modify `env` file with variables from steps 1 and 2. Manual procedure. <p>_**This `env` file is used by the scripts on steps 4, 5 and 6.**_ |
| 4 | [Setup CommerceTools, <p>part 2](#step-4---setup-commercetools-part-2) | Register custom field types (script + JSON files), create API Extensions. <p> Uses shell scripts and the `env` file.  |
| 5 | [Create AWS infrastructure](#step-5---create-aws-infrastructure) | Creates an AWS infrastructure stack to support the Lambda function. <p>Uses a shell script, a CloudFormation template, `env` file plus input parameters. |
| 6 | [Setup CommerceTools, <p>part 3](#step-6---setup-commercetools-part-3) | Create API Extensions. <p> Uses shell scripts and the `env` file. |
| 7 | [Package Build](#step-7---package-build) | Builds a package from the current branch. <p> Uses a shell script and outputs a .zip file to be used in the Lambda function. |
| 8 | [Package Deploy](#step-8---package-deploy) | Single-line AWS CLI command to deploy the .zip package from step 7. <p>Manual procedure. |


## Requirements

This procedure was developed and tested on Ubuntu Linux 20.04 and _should_ run ok on other Linux distros and "UNIX-like" OSs (like MacOS). The command shell used was **bash** - there's no guarantee that other shells will work (sh, zsh).

- accounts and credentials from Datatrans and CommerceTools
- an AWS account
- administrator level credentials for the target AWS account (via IAM User, via SSO integration) to support running AWS CLI commands with it
- a Bash shell
- AWS CLI properly installed for the OS/shell
- this repository cloned

## Assumptions
- No equal resources exists at the AWS account and region.
- All inputs to the scripts are valid.
- Lambda will use Node.JS v16 runtime (function uses TypeScript)

## How-to's section <p>

### STEP 1 - **Setup Datatrans** <p>

You can skip this step if you already have the Datatrans setup done and all required information below.

_This procedure doesn't cover in details how to setup Datatrans (account, credentials)._
A mild suggestion is to look [here](https://docs.datatrans.ch/docs/home).

**Details about the variables needed by Planet Payment CommerceTools connector can be found [here](https://github.com/weareplanet/commercetools-planet-integration/tree/main#enviroment-configuration).**

In tis step, from the Datatrans setup, you must get **DT_MERCHANTS**.
<br><br>

### STEP 2 - **Setup CommerceTools - part 1 - create API Client** <p>
You can skip this step if you already have the CommerceTools setup done and all required information below.

**Details about the variables needed by Planet Payment CommerceTools connector can be found [here](https://github.com/weareplanet/commercetools-planet-integration/tree/main#enviroment-configuration).**

This procedure covers _PARTIALLY_ how to setup CommerceTools. A suggestion is to look [here](https://docs.commercetools.com/getting-started/#create-an-api-client).

From this step, after creating the first API-client, you must get these variables: **CT_API_URL**, **CT_AUTH_URL**, **CT_PROJECT_ID**, **CT_CLIENT_ID**, **CT_CLIENT_SECRET** and **CT_SCOPES**.


<br>

### _**Some preparations for all the following:**_ <p>
- Get the git repository cloned.
- Get into the cloned repository with a bash shell.
- Make sure that your AWS credentials are OK (get them fresh from your AWS SSO page, or run `aws configure` for creating/changing awscli profiles. The scripts and commands used here assume usage of the _default_ awscli profile.)

<br>
### STEP 3 - **ENV var file preparation** <p>

From the two steps above you will have a set of variables. Copy the example environment file from
`deploy/env.example` to `deploy/env`, and update it with the variables and values in the form
`KEY="VALUE"`.

### STEP 4 - **Setup CommerceTools - part 2** <p>

With the `env` file above ready, proceed executing the following shell scripts:

In `deploy/commercetools/` folder, run:

> **`bash custom-types-setup.sh`** <br>
_will create a few custom fields types within the project, using JSON files within `deploy/commercetools/types` folder_

<br>

### STEP 5 - **Create AWS infrastructure** <p>

- Make sure that your AWS credenntials are OK (valid, refreshed, etc)
- The script needs the `env` file modified by the step 3.
- Define an **ID** for the new stack, with no special characters or spaces in it, like "prod01" or "Develop02" - this will be **STACKID**
- Define on which region it will be deployed, like "eu-west-1" or "us-east-2" - this will be **AWSREGION**
- At the shell run this script providing the two parameters defined above:
   > `bash aws-deploy.sh STACKID AWSREGION`

   (_an example:   **`bash aws-deploy.sh prod01 eu-west-1`**_)
- Take a look at the CloudFormation dashboard and wait for the stack creation completion, it should take a few minutes.
- The Lambda function name will be `planetpaymentcommtool-STACKID`, where STACKID is your provided value (this name can be customized within the script, read its comments before changing anything in it).

A few details about the supporting files

| File | Purpose and Details |
| ---- | ------- |
| **planetpaymentconnector-stack-template.yaml** | A CloudFormation (CF) template that creates all infrastructure resources within an user-specified AWS account and region. It is copied then customized by aws-deploy.sh to create CF stacks. <p>**Do not use as-is.** Avoid changing it if not sure on how CloudFormation works. |
| **aws-deploy.sh** | Shell script to create a CF stack, using the _planetpaymentconnector-stack-template.yaml_ file. Each run with different input parameters will render a different stack (with its own Lambda function and permissions) allowing multiple functions to work concurrently.|

>**A note about _aws-deploy.sh_** <p>After each running the customized stack template will be stored at the same folder where the script ran. Can be useful for debugging but _not versioning_, as it contains sensitive information regarding Datatrans and CommerceTools.

<br>

### STEP 6 - **Setup CommerceTools, part 3** <p>

After runnning step 5 successfully, proceed executing this shell script:

Run, in `deploy/commercetools/` folder:

> **`bash api-extension-setup.sh`** <p>
_will setup the API Extension into CommerceTools_

<br>

### STEP 7 - **Package Build** <p>

There are several methods to build a Node JS package. We're providing a shell script that will output a lean .zip package to avoid size constraints when updating the Lambda function.

_**Requisites**_
- Node.js v.16 - to have it installed, take a look [here](https://nodejs.org/en/download/package-manager/) if using a package manager, or [here](https://nodejs.org/en/download/).
- **curl** and **zip** installed for the OS to be used

Run the script **from the cloned repository root folder:**

> **`bash ./deploy/make-deploy-package.sh`**

Wait a few minutes for completion then look at the .zip filename in the output. Use this file for the next step.
<br><br>

### STEP 8 - **Package Deploy** <p>

It will deploy the .zip package above into the Lambda function created at the step 3.

Run this command at the shell, changing `AWSREGION` for the region where you had deployed the function, `STACKID` for the ID you provided before and `yourpackagename.zip` to the name from the package build in step 5:

>`aws lambda update-function-code --region=AWSREGION --function-name=planetpaymentcommtool-STACKID --zip-file=fileb://yourpackagename.zip`

_Eventually you may need to refresh your AWS credentials and try again._

After updating the Lambda function, pay attention to the `DT_CONNECTOR_WEBHOOK_URL` variable: it must contain the FunctionURL from the Lambda function itself.
