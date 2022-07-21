#!/bin/bash 
#
# 02-custom-types-setup.sh
#
# Planet Payment - Commerce Tools connector custom fields setup
# 2022-07 - Planet Payments

# It will iterate over JSON files present at script's folder and create the 
# custom field types into CommerceTools project accordingly. 
# Each file represents a custom field type.

# REQUIREMENTS:
# - "jq" and "curl" installed in the shell/os to be used
# - a .env file (at the same folder as this script) with the variables needed to run.
#   (some of the variables come from the first API-Client created, that must have "Manage API client" scope on - this isn't enabled by default 
#    even in the 'admin' profile)
#   You can get some insights about the variables semantics in README.md at this repository root.
#
NOW=$(date +%Y-%m-%d_%Hh%Mm%Ss)
echo " "
echo "########## Planet Payment CommerceTools connector - setup Custom Fields Types in CommerceTools, starting now, at ${NOW}."
#####
# get ENV VARS from local static file
# (yes, having sensitive information within a static file isn't a best practice)
echo " "
echo "##### importing and checking ENV vars"
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

echo "##### Got an access token from CommerceTools: ${ACCESS_TOKEN}"

for filename in ./types/*.json; do
	echo " "
	typeKey=$(basename "$filename" .json)
	echo "##### Checking if '${typeKey}' type exists in CommerceTools..."

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
echo " "
echo "##### Done."

exit 0