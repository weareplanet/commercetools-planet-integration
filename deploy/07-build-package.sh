#!/bin/bash
#
# 07-build-package.sh
#
# Planet Payment - Commerce Tools - building package for Lambda function
# 2022-07 - Planet Payments
#
# - run this script at the root folder of the cloned repo
#   (using "bash deploy/07-build-package.sh")
#
# REQUIREMENTS:
# - Planet Payment Connector GIT repo cloned locally
# - Node.js v16.x installed
#   instructions here: https://nodejs.org/en/download/package-manager/
#   or here: https://nodejs.org/en/download/
# - "zip" and "jq" installed in the bash shell to be used

NOW=$(date +%Y-%m-%d_%Hh%Mm%Ss)
CURRENTVERSION=$(jq -r .version < package.json)
echo "\n########## Planet Payment CommerceTools connector - building package v${CURRENTVERSION} for Lambda function, starting now, at ${NOW}."

echo "\n##### Install DEV dependencies."
npm ci

echo "\n##### Run build."
npm run build

echo "\n##### Install PRODUCTION dependencies."
npm ci --production

# Create the deploy artifact (zip file with the program)
PKGFILENAME="planetpayment-commercetools-connector-v${CURRENTVERSION}-${NOW}"
echo "\n##### Creating a temporary folder."
mkdir ${PKGFILENAME}
echo "\n##### Copying necessary files to folder."
cp -fr ./node_modules ${PKGFILENAME}/
cp -fr dist/* ${PKGFILENAME}/
cp -fr package.json ${PKGFILENAME}/
echo "\n##### Zipping folder contents."
cd ${PKGFILENAME}
zip -r9q ../${PKGFILENAME}.zip *
echo "##### Zipped package '${PKGFILENAME}.zip'"
echo "##### Update the lambda function using this package.\n"
