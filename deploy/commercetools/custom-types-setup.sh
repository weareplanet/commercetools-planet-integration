#!/bin/bash
#
# Planet Payment - Commerce Tools connector custom types setup
# 2022-07 - Planet Payments

# It will iterate over JSON files present at script's folder and create custom types to be used in
# addition to standard types (Payment, Transaction) in commercetools.
# Each file represents one custom type.

# REQUIREMENTS:
# - "jq" and "curl" installed in the shell/os to be used
# - an env file with the variables needed to run.
#   (some of the variables come from the first API-Client created, that must have "Manage API
#   client" scope on - this isn't enabled by default even in the 'admin' profile)
#   You can get some insights about the variables semantics in README.md at this repository root.

SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
NOW=$(date +%Y-%m-%d_%Hh%Mm%Ss)
echo -e "\n########## Planet Payment commercetools connector - setup Custom Fields types in commercetools, starting now, at ${NOW}."

echo -e "\n##### Checking ENV vars..."
REQUIRED_ENV_VARS=(CT_AUTH_URL CT_API_URL CT_CLIENT_ID CT_CLIENT_SECRET CT_SCOPES CT_PROJECT_ID)
for var in "${REQUIRED_ENV_VARS[@]}"; do
    if [ -z "${!var}" ] ; then
        echo -e "\tMissed the required environmebt variable $var"
        exit 1
    fi
done

ACCESS_TOKEN=$(curl ${CT_AUTH_URL}/oauth/token --silent \
     --basic --user "${CT_CLIENT_ID}:${CT_CLIENT_SECRET}" \
     -X POST \
     -d "grant_type=client_credentials&scope=${CT_SCOPES}" |\
     jq -r '.access_token')

echo -e "   ## Got an access token from commercetools."

for filename in ${SCRIPT_DIR}/types/*.json; do
	typeKey=$(basename "$filename" .json)
	echo -e "\n##### Checking if '${typeKey}' type exists in commercetools..."

	statusCode=$(curl --write-out '%{http_code}' --silent --output /dev/null \
		-X GET ${CT_API_URL}/${CT_PROJECT_ID}/types/key=${typeKey} -i \
		--header "Authorization: Bearer ${ACCESS_TOKEN}")

	if [[ $statusCode -eq 404 ]]
	then
		echo -e "   ## Type DOES NOT exist. Creating it..."

		statusCode=$(curl --write-out '%{http_code}' --silent --output /dev/null \
			-X POST ${CT_API_URL}/${CT_PROJECT_ID}/types -i \
			--header "Authorization: Bearer ${ACCESS_TOKEN}" \
			--header 'Content-Type: application/json' \
			--data-binary "@${filename}")

		if [[ $statusCode -eq 201 ]]
		then
			echo -e "   ## Type '${typeKey}' successfully created!"
		else
			echo -e "   error: Got HTTP ${statusCode} when creating type."
			exit 1
		fi

	elif [[ $statusCode -eq 200 ]]
	then
		echo -e "   ## Type exists, skipping its creation."
	else
		echo -e "   error: HTTP ${statusCode}"
		exit 1
	fi

done

echo -e "\n##### Done."
