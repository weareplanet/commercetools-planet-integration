#!/bin/bash

# Planet Payment - Commerce Tools connector custom fields setup
# 2022-07 - Planet Payments
# This script is just an example, the final real-life implementation may be quite different.

# It will iterate over JSON files present at script's folder and create the
# custom field types into CommerceTools project accordingly.
# Each file represents a custom field type.

# REQUIREMENTS:
# - "jq" installed in the shell/os to be used
# - The following variables must be obtained from CommerceTools project API client setup
#   You can get some insights about the variables semantics in README.md at this repository root.
#
CT_API_URL="" # !!! remove any trailing slash
CT_AUTH_URL="" # !!! remove any trailing slash
CT_PROJECT_ID=""
CT_CLIENT_ID=""
CT_CLIENT_SECRET=""
CTP_SCOPES=""
#
echo "##### Starting...."
#
ACCESS_TOKEN=$(curl ${CT_AUTH_URL}/oauth/token --silent \
     --basic --user "${CT_CLIENT_ID}:${CT_CLIENT_SECRET}" \
     -X POST \
     -d "grant_type=client_credentials&scope=${CTP_SCOPES}" |\
     jq -r '.access_token')

# An access token example
#{
#	"access_token":"XaWPOpr5lk1-ZKNXFeYbh5NhSeqnaF_u",
#	"token_type":"Bearer",
#	"expires_in":172800,
#	"scope":"manage_project:planetpayment-discovery"
#}

echo "   ## Got an access token from CommerceTools: ${ACCESS_TOKEN}"

for filename in ./types/*.json; do
	typeKey=$(basename "$filename" .json)
	echo "\n##### Checking if '${typeKey}' type exists in CommerceTools..."

	statusCode=$(curl --write-out '%{http_code}' --silent --output /dev/null \
		-X GET ${CT_API_URL}/${CT_PROJECT_ID}/types/key=${typeKey} -i \
		--header "Authorization: Bearer ${ACCESS_TOKEN}")

	if [[ $statusCode -eq 404 ]]
	then
		echo "   ## Type DOES NOT exists. Creating it..."

		statusCode=$(curl --write-out '%{http_code}' --silent --output /dev/null \
			-X POST ${CT_API_URL}/${CT_PROJECT_ID}/types -i \
			--header "Authorization: Bearer ${ACCESS_TOKEN}" \
			--header 'Content-Type: application/json' \
			--data-binary "@${filename}")

		if [[ $statusCode -eq 201 ]]
		then
			echo "   ## Type '${typeKey}' successfully created!"
		else
			echo "   !! Got HTTP ${statusCode} when creating type. Not expected!"
			exit 1
		fi

	elif [[ $statusCode -eq 200 ]]
	then
		echo "   ## Type does exists, skipping its creation."
	else
		echo "   !! Oh no, got an HTTP ${statusCode}. Not expected."
		exit 1
	fi

done

echo "\n##### Done."

exit 0
