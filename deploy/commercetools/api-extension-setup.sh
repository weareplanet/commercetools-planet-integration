#!/bin/bash
#
# api-extension-setup.sh
#
# Planet Payment - Commerce Tools api-extension setup
# 2022-07 - Planet Payments

SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
NOW=$(date +%Y-%m-%d_%Hh%Mm%Ss)
echo -e "\n########## Planet Payment CommerceTools connector - setup API-Extension on CommerceTools, started at ${NOW}."

#####
echo -e "\n##### Importing and checking ENV vars"
REQUIRED_ENV_VARS=(CT_AUTH_URL CT_API_URL CT_CLIENT_ID CT_CLIENT_SECRET CT_SCOPES CT_PROJECT_ID CT_API_EXTENSION_NAME)
for var in "${REQUIRED_ENV_VARS[@]}"; do
    # echo -e "var is ${var} with value '${!var}'" # uncomment for debugging
    if [ -z "${!var}" ] ; then
        echo -e "\tMissed the required environmebt variable $var"
        exit 1
    fi
done

#####
# https://docs.commercetools.com/getting-started/make-first-api-call#example-request-and-response
echo -e "\n##### Getting an access token from CommerceTools"
ACCESS_TOKEN=$(curl ${CT_AUTH_URL}/oauth/token --silent \
    --basic --user "${CT_CLIENT_ID}:${CT_CLIENT_SECRET}" \
    -X POST \
    -d "grant_type=client_credentials&scope=${CT_SCOPES}" |\
    jq -r '.access_token')
if [ -z "${ACCESS_TOKEN}" ] ; then
    echo -e "\tAccess token was not obtained from CommerceTools."
    exit 1
fi
echo -e "\n##### Got an access token from CommerceTools: '${ACCESS_TOKEN}'"

#####
# Create a new API-Extension
#
# CommerceTools API docs: https://docs.commercetools.com/api/projects/api-extensions#create-extension
# CommerceTools API-Extension can be one of two types: HTTP and AwsLambda.
# If CT_API_EXTENSION_URL environment variable is provided - the extension of HTTP destination type will be created.
# Otherwise - if  CT_API_EXTENSION_AWS_LAMBDA_ARN and CT_API_EXTENSION_AWS_LAMBDA_ACCESS_KEY and CT_API_EXTENSION_AWS_LAMBDA_SECRET
# environment variables are provided - the extension of AwsLambda destination type will be created.
if [[ ! -z "$CT_API_EXTENSION_URL" ]]; then
  echo -e "\n##### Creating the new API Extension '${CT_API_EXTENSION_NAME}' with destination type 'HTTP'..."
  # TODO(pbourke): the following is not idempotent, add a check
  statusCode=$(curl --write-out '%{http_code}' --silent -o ${SCRIPT_DIR}/commercetools-api-extension_${CT_API_EXTENSION_NAME}_${NOW}.json \
  -X POST ${CT_API_URL}/${CT_PROJECT_ID}/extensions \
  --header "Authorization: Bearer ${ACCESS_TOKEN}" \
  --header 'Content-Type: application/json' \
  --data-binary @- << DATA
  {
    "destination": {
      "type": "HTTP",
      "url": "${CT_API_EXTENSION_URL}"
    },
    "triggers" : [
      {
        "resourceTypeId": "payment",
        "actions": ["Create", "Update"]
      }
    ],
    "key" : "${CT_API_EXTENSION_NAME}"
  }
DATA
)
elif [[ ! -z "$CT_API_EXTENSION_AWS_LAMBDA_ARN" && ! -z "$CT_API_EXTENSION_AWS_LAMBDA_ACCESS_KEY" && ! -z "$CT_API_EXTENSION_AWS_LAMBDA_SECRET" ]]; then
  echo -e "\n##### Creating the new API Extension '${CT_API_EXTENSION_NAME}' with destination type 'AWSLambda'..."
  # TODO(pbourke): the following is not idempotent, add a check
  statusCode=$(curl --write-out '%{http_code}' --silent -o ${SCRIPT_DIR}/commercetools-api-extension_${CT_API_EXTENSION_NAME}_${NOW}.json \
  -X POST ${CT_API_URL}/${CT_PROJECT_ID}/extensions \
  --header "Authorization: Bearer ${ACCESS_TOKEN}" \
  --header 'Content-Type: application/json' \
  --data-binary @- << DATA
  {
    "destination": {
      "type": "AWSLambda",
      "arn": "${CT_API_EXTENSION_AWS_LAMBDA_ARN}",
      "accessKey": "${CT_API_EXTENSION_AWS_LAMBDA_ACCESS_KEY}",
      "accessSecret": "${CT_API_EXTENSION_AWS_LAMBDA_SECRET}"
    },
    "triggers" : [
      {
        "resourceTypeId": "payment",
        "actions": ["Create", "Update"]
      }
    ],
    "key" : "${CT_API_EXTENSION_NAME}"
  }
DATA
)
else
  echo -e "Either CT_API_EXTENSION_URL or CT_API_EXTENSION_AWS_LAMBDA_ARN+CT_API_EXTENSION_AWS_LAMBDA_ACCESS_KEY+CT_API_EXTENSION_AWS_LAMBDA_SECRET must be present in the environment"
  exit 1
fi

if [[ $statusCode -eq 201 ]]
	then
		echo -e "\t## New api-extension '${CT_API_EXTENSION_NAME}' successfully created!"
	else
		echo -e "\t!! Oh no... got HTTP status '${statusCode}' when creating the api-extension. Not expected!"
		exit 1
fi

# evidences... uncomment for debugging
echo -e "\t## All done.\n"
