#!/usr/bin/env bash

set -euo pipefail

DEPLOY_SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )

ENV="${ENV:-aws}"
STACK_ID="${STACK_ID:-mystack}"
AWS_REGION="${AWS_REGION:-eu-west-1}"

function deploy_aws {
  source ${DEPLOY_SCRIPT_DIR}/commercetools/custom-types-setup.sh
  source ${DEPLOY_SCRIPT_DIR}/cloud/aws/aws-deploy.sh ${STACK_ID} ${AWS_REGION}
  source ${DEPLOY_SCRIPT_DIR}/commercetools/api-extension-setup.sh
  source ${DEPLOY_SCRIPT_DIR}/make-deploy-package.sh
  aws lambda update-function-code --region=${AWS_REGION} \
    --function-name=planetpaymentcommtool-${STACK_ID} --zip-file=fileb://${PKGFILENAME}.zip
}

case $ENV in
  aws)
    deploy_aws
    ;;

  *)
    echo "error: Target environment ${ENV} is not supported. Check value for ENV is correct."
    exit 1
    ;;
esac
