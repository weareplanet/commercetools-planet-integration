#!/bin/bash
#
# 06-api-extension-setup.sh
#
# Planet Payment - Commerce Tools api-extension setup
# 2022-07 - Planet Payments

# REQUIREMENTS:
# - an .env file (at the same folder as this script) with the variables needed to run.
#   (some of the variables come from the first API-Client created, that must have "Manage API client" scope on - this isn't enabled by default
#    even in the 'admin' profile)
#   You can get some insights about the variables semantics in README.md at this repository root.
#
NOW=$(date +%Y-%m-%d_%Hh%Mm%Ss)
echo "\n########## Planet Payment CommerceTools connector - setup API-Extension on CommerceTools, started at ${NOW}."
#
#####
# get ENV VARS from local static file
# (yes, having sensitive information within a static file isn't a best practice)
echo "\n##### importing and checking ENV vars"
set -a
source <(cat .env | sed -e '/^#/d;/^\s*$/d')
set +a
#env | grep "^CT.*" # uncomment for debugging
for var in "${!CT@}"; do
    #echo "var is ${var} with value '${!var}'" # uncomment for debugging
    if [ -z "${!var}" ] ; then
        echo "      $var is null or not set properly, get value '${!var}'"
        exit 1
    fi
done
echo "   ## done."
#
#####
# Get a bearer token from CommerceTools
#
#https://docs.commercetools.com/getting-started/make-first-api-call#example-request-and-response
#curl -X POST https://{clientID}:{clientSecret}@auth.{region}.commercetools.com/oauth/token?grant_type=client_credentials&scope={scope}
ACCESS_TOKEN=$(curl ${CT_AUTH_URL}/oauth/token --silent \
     --basic --user "${CT_CLIENT_ID}:${CT_CLIENT_SECRET}" \
     -X POST \
     -d "grant_type=client_credentials&scope=${CTP_SCOPES}" |\
     jq -r '.access_token')
echo "\n##### Got an access token from CommerceTools: ${ACCESS_TOKEN}"
#
#####
# Creating a new API-Extension
#
# CommerceTools API docs: https://docs.commercetools.com/api/projects/api-extensions#create-extension
# each project can have up to 25 API-Extensions
#
echo "\n##### Creating the new API-Extension '${CT_NEW_API_EXTENSION_NAME}'..."
statusCode=$(curl --write-out '%{http_code}' --silent -o commercetools-api-extension_${CT_NEW_API_EXTENSION_NAME}_${NOW}.json \
-X POST ${CT_API_URL}/${CT_PROJECT_ID}/extensions \
--header "Authorization: Bearer ${ACCESS_TOKEN}" \
--header 'Content-Type: application/json' \
--data-binary @- << DATA
{
  "destination": {
    "type": "AWSLambda",
    "arn": "${AWS_LAMBDA_ARN}",
    "accessKey": "${AWS_API_EXTENSION_ACCESS_KEY}",
    "accessSecret": "${AWS_API_EXTENSION_SECRET}"
  },
  "triggers" : [
    {
      "resourceTypeId": "payment",
      "actions": ["Create", "Update"]
    }
  ],
  "key" : "${CT_NEW_API_EXTENSION_NAME}"
}
DATA
)
if [[ $statusCode -eq 201 ]]
	then
		echo "   ## New api-extension '${CT_NEW_API_EXTENSION_NAME}' successfully created!"
	else
		echo "   !! Oh no... got HTTP ${statusCode} when creating the api-extension. Not expected!"
		exit 1
fi
# evidences... uncomment for debugging
echo "   ## All done.\n"

exit 0
