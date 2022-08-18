#!/usr/bin/env bash

set -euo pipefail

DEPLOY_SCRIPT_DIR=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &> /dev/null && pwd)

SUPPORTED_ENVS="aws"
DEFAULT_STACK_ID="connector"

ENV="${ENV:-""}"
ENV_FILE="${ENV_FILE:-${DEPLOY_SCRIPT_DIR}/env}"
STACK_ID="${STACK_ID:-${DEFAULT_STACK_ID}}"
AWS_REGION="${AWS_REGION:-eu-west-1}"

function deploy_aws {
  source ${ENV_FILE}
  source ${DEPLOY_SCRIPT_DIR}/commercetools/custom-types-setup.sh
  source ${DEPLOY_SCRIPT_DIR}/cloud/aws/aws-deploy.sh ${STACK_ID} ${AWS_REGION}
  source ${DEPLOY_SCRIPT_DIR}/commercetools/api-extension-setup.sh
  source ${DEPLOY_SCRIPT_DIR}/make-deploy-package.sh
  aws lambda update-function-code --region=${AWS_REGION} \
    --function-name=planetpaymentcommtool-${STACK_ID} --zip-file=fileb://${PKGFILENAME}.zip
}

function usage {
  cat << EOF

Deploys the Planet Payment commercetools connector.

Usage: $0 -e environment [-s stack_id]

Arguments:
-e Target environment, one of: '${SUPPORTED_ENVS}'
-s (Optional) Name of the infra stack created. Default: '${DEFAULT_STACK_ID}'
EOF
}

while getopts "e:s:" OPTION; do
  case $OPTION in
    e)
      ENV=$OPTARG
      if [[ ! $ENV =~ ${SUPPORTED_ENVS[@]} ]]; then
        usage
        exit 1
      fi
      ;;
    s)
      STACK_ID=$OPTARG
      ;;
    *)
      usage
      exit 1
      ;;
  esac
done

case $ENV in
  aws)
    deploy_aws
    ;;

  *)
    usage
    exit 1
    ;;
esac
