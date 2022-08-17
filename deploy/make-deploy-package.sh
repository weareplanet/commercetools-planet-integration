#!/bin/bash
#
# make-deploy-package.sh
#
# Planet Payment - Commerce Tools - building package for Lambda function
# 2022-07 - Planet Payments
#
# - run this script at the root folder of the cloned repo
#   (using "bash deploy/make-deploy-package.sh")
#
# REQUIREMENTS:
# - Planet Payment Connector GIT repo cloned locally
# - Node.js v16.x installed
#   instructions here: https://nodejs.org/en/download/package-manager/
#   or here: https://nodejs.org/en/download/
# - "zip" and "jq" installed in the bash shell to be used

SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
NOW=$(date +%Y-%m-%d_%Hh%Mm%Ss)
CURRENTVERSION=$(jq -r .version < ${SCRIPT_DIR}/../package.json)
echo -e "\n########## Planet Payment CommerceTools connector - building package v${CURRENTVERSION} for Lambda function, starting now, at ${NOW}."

echo -e "\n##### Install DEV dependencies."
npm ci

echo -e "\n##### Run build."
npm run build

echo -e "\n##### Install PRODUCTION dependencies."
npm ci --production

# Create the deploy artifact (zip file with the program)
PKGFILENAME="planetpayment-commercetools-connector-v${CURRENTVERSION}-${NOW}"
echo -e "\n##### Creating a temporary folder."
mkdir ${PKGFILENAME}
echo -e "\n##### Copying necessary files to folder."
cp -fr ${SCRIPT_DIR}/../node_modules ${PKGFILENAME}/
cp -fr ${SCRIPT_DIR}/../dist/* ${PKGFILENAME}/
cp -fr ${SCRIPT_DIR}/../package.json ${PKGFILENAME}/
echo -e "\n##### Zipping folder contents."
pushd ${PKGFILENAME}
zip -r9q ../${PKGFILENAME}.zip *
popd
echo -e "##### Zipped package '${PKGFILENAME}.zip'"
echo -e "##### Update the lambda function using this package.\n"
