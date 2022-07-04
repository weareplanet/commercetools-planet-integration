#!/bin/bash

# This script is just an example, the final real-life implementation may be quite different.

# You can get some insights about the variables semantics in README.md at the repository root.
CT_PROJECT_ID=""
CT_CLIENT_SECRET=""
CT_CLIENT_ID=""
CT_AUTH_URL=""
CT_API_URL=""
CTP_SCOPES=""

#{
#	"access_token":"XaWPOpr5lk1-ZKNXFeYbh5NhSeqnaF_u",
#	"token_type":"Bearer",
#	"expires_in":172800,
#	"scope":"manage_project:planetpayment-discovery"
#}
ACCESS_TOKEN=$(curl ${CT_AUTH_URL}/oauth/token \
     --basic --user "${CT_CLIENT_ID}:${CT_CLIENT_SECRET}" \
     -X POST \
     -d "grant_type=client_credentials&scope=${CTP_SCOPES}" |\
     jq -r '.access_token')

echo "Got access token from commercetools: ${ACCESS_TOKEN}"

for filename in ./types/*.json; do
	typeKey=$(basename "$filename" .json)
	echo "Checking if ${typeKey} exists in commercetools..."

	statusCode=$(curl --write-out '%{http_code}' --silent --output /dev/null \
		-X GET ${CT_API_URL}/${CT_PROJECT_ID}/types/key=${typeKey} -i \
		--header "Authorization: Bearer ${ACCESS_TOKEN}")

	if [[ $statusCode -eq 404 ]]
	then
		echo "   Type ${typeKey} does not exists in commercetools. Creating..."

		statusCode=$(curl --write-out '%{http_code}' --silent --output /dev/null \
			-X POST ${CT_API_URL}/${CTP_PROJECT_KEY}/types -i \
			--header "Authorization: Bearer ${ACCESS_TOKEN}" \
			--header 'Content-Type: application/json' \
			--data-binary "@${filename}")

		if [[ $statusCode -eq 201 ]]
		then
			echo "      Type ${typeKey} successfully created!"
		else
			echo "      Got HTTP ${statusCode}. Not expected!"
		fi

	elif [[ $statusCode -eq 200 ]]
	then
		echo "   Type ${typeKey} does exists in commercetools. Skip it."
	else
		echo "   Got HTTP ${statusCode}. Not expected."
	fi

done