#!/bin/bash

CTP_PROJECT_KEY=""
CTP_CLIENT_SECRET=""
CTP_CLIENT_ID=""
CTP_AUTH_URL=""
CTP_API_URL=""
CTP_SCOPES=""

#{
#	"access_token":"XaWPOpr5lk1-ZKNXFeYbh5NhSeqnaF_u",
#	"token_type":"Bearer",
#	"expires_in":172800,
#	"scope":"manage_project:planetpayment-discovery"
#}
ACCESS_TOKEN=$(curl ${CTP_AUTH_URL}/oauth/token \
     --basic --user "${CTP_CLIENT_ID}:${CTP_CLIENT_SECRET}" \
     -X POST \
     -d "grant_type=client_credentials&scope=${CTP_SCOPES}" |\
     jq -r '.access_token')

echo "Got access token from commercetools: ${ACCESS_TOKEN}"

for filename in ./types/*.json; do
	typeKey=$(basename "$filename" .json)
	echo "Checking if ${typeKey} exists in commercetools..."

	statusCode=$(curl --write-out '%{http_code}' --silent --output /dev/null \
		-X GET ${CTP_API_URL}/${CTP_PROJECT_KEY}/types/key=${typeKey} -i \
		--header "Authorization: Bearer ${ACCESS_TOKEN}")

	if [[ $statusCode -eq 404 ]]
	then
		echo "   Type ${typeKey} does not exists in commercetools. Creating..."

		statusCode=$(curl --write-out '%{http_code}' --silent --output /dev/null \
			-X POST ${CTP_API_URL}/${CTP_PROJECT_KEY}/types -i \
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
