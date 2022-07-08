# AWS IaC for Planet Payment to CommerceTools connector development

## Summary

This will create a few infrastructure resources in an AWS account, to allow development of the payment connector as lambda functions. This is the base for the deployment pipeline in GitHub Actions.

## A few details

Two CloudFormation templates and one shell script were created:

| File | Purpose and Details |
| ---- | ------- |
| **paymentconnector-common.yaml** | CloudFormation template that creates all common or shared infrastructure, like GitHub IAM user, S3 bucket for holding packages, a dummy lambda function together with an API Gateway |
| **cf-deploy.sh** | Shell script to create an individual stack for each developer, using the paymentconnector-devstack-template.yaml. Each run with different input parameters will render a different stack (with its own Lambda function and permissions) allowing each developer to have it's own lambda function to work with.|
| **paymentconnector-devstack-template.yaml** | CloudFormation template that is copied then customized by cf-deploy.sh to create individual stacks. Do not use as-is.|

After deploying the CloudFormation stacks and the GitHub Actions is in place, this should happen:

## Requirements

These were developed and tested under Ubuntu Linux and should run ok within other distros and "UNIX-like" OSs (like MacOS).

- an AWS account
- admin-like credentials for the target AWS account (via IAM User, via SSO integration) to support running AWS CLI commands with it
- a bash shell (others can do the trick although this wasn't throughly tested here)
- AWS CLI properly installed
- the aforementioned files

## Assumptions
- Everything will be in AWS Ireland region (**`eu-west-1`**)
- No equal resources exists at the AWS account and region.
- Lambdas will use Node.JS v16 runtime (function being developed in TypeScript)
- Packages will be stored in S3 then updated to the function. S3 buckets have a folder structure to organize code by developer's **GitHub username**, also have versioning enabled.

## How-to's

Some preparations for all that follows:
- Get all three files into a folder.
- Get into this folder with a shell (bash, zsh).
- Make sure that your AWS credentials are OK (get them fresh from your AWS SSO page, or run `aws configure` for the awscli profiles.)

### Creating the "common" stack

- At the shell, run this AWS CLI command:
   > `aws cloudformation deploy --stack-name paymentconnector-common --template-file paymentconnector-common.yaml --capabilities CAPABILITY_NAMED_IAM CAPABILITY_IAM` 
- Wait for its completion - and take a look at the CloudFormation dashboard to see some action about the stack, eventually errors also. A "**paymentconnector-common**" stack will be created.
- One output from this stack creation is the AWS Access+Secret keys to be inserted on GitHub repository Secrets, so the GitHub Actions' workslows can interact with AWS. Look at the "Outputs" tab at the paymentconnector-common stack.
- This GitHub Secrets insertion is a manual step, perform it as soon as possible - 

### Create an individual stack
- You must complete FIRST the creation of the "**paymentconnector-common**" stack
- Again, make sure that your AWS credenntials are OK (valid, refreshed, etc)
- Get your GitHub username used at the Payment Connector repository, it's needed for the following step.
- At the shell, run this shell script _changing "your-github-username" for your actual GitHub username:
   > `bash cf-deploy.sh paymentconnector your-github-username`

   (*an example: bash cf-deploy.sh paymentconnector fabiocarvalho-planet*)
- Take a look on CloudFormation dashboard and wait for completion

### Calling your Lambda function with FunctionURL

After your individual stack is deployed you can get its FunctionURL directly from the Lambda function dashboard. This allows you to call the Lambda function without the need of an API-Gateway.

With the actual configuration using AWS_IAM setting, to call a function you need to provide credentials. It is strongly recommended usin Postman for this, as it handles all the creation of the "AWS Signature v4" using your credentials.

In Postman, after adding the copied Function URL,
within the **Authorization* tab:
- choose type as **AWS Signature**
- then insert your **AccessKey** and **SecretKey** - get it from you AWS SSO page
- expand "Advanced" then also insert:
  - AWS Region as **eu-west-1**
  - Service Name as **lambda**
  - Session Token - get it from you AWS SSO page

Then proceed with any additional parameter, header, etc required for your needs.

## TO DO's

- Verify if API-Gateway is really needed for testing the lambdas.
- Verify other ways to authenticate against Lambda or API Gateway - or to get rid of it as it will be public to call _(this is a questionable assumption but thinking on dealing with additional credentials just for calling the API worths the thought exercise)_
- Check with DEVs 
  - the effort on having code to read Secrets Manager secrets instead of - having sensitive information as ENV vars for the lambdas
  - if there's need for one lambda function built from master that can be accessed by everyone (or something like that)
- Discuss a best way to populate ENV vars - by default, insert them directly at the function's configuration