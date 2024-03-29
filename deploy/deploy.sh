#!/usr/bin/env bash

set -euo pipefail

NOW=$(date +%Y-%m-%d_%Hh%Mm%Ss)

DEPLOY_SCRIPT_DIR=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &> /dev/null && pwd)

SUPPORTED_ENVS="aws"
SUPPORTED_EXTENSION_TYPES="AwsLambda"
DEFAULT_STACK_ID="connector"

ENV="${ENV:-""}"
ENV_FILE="${ENV_FILE:-${DEPLOY_SCRIPT_DIR}/env}"
STACK_ID="${STACK_ID:-${DEFAULT_STACK_ID}}"
AWS_REGION="${AWS_REGION:-eu-west-1}"

function deploy_aws {
  source ${ENV_FILE}

  source ${DEPLOY_SCRIPT_DIR}/commercetools/custom-types-setup.sh
  source ${DEPLOY_SCRIPT_DIR}/cloud/aws/aws-deploy.sh ${EXTENSION_TYPE} ${STACK_ID} ${AWS_REGION}
  source ${DEPLOY_SCRIPT_DIR}/commercetools/api-extension-setup.sh
  source ${DEPLOY_SCRIPT_DIR}/make-deploy-package.sh
  aws lambda update-function-code --region=${AWS_REGION} \
    --function-name=commercetools-planet-${STACK_ID} --zip-file=fileb://${PKGFILENAME}.zip
}

function usage {
  cat << EOF

Deploys the Planet Payment commercetools connector.

Usage: $(basename $0) -e environment -t extension_type [-s stack_id]

Required:
-e Target environment, one of: '${SUPPORTED_ENVS}'
-t Type of API extension to create, one of '${SUPPORTED_EXTENSION_TYPES}'

Optional:
-s Name of the infra stack created. Default: '${DEFAULT_STACK_ID}'
EOF
}

while getopts "e:s:t:" OPTION; do
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
    t)
      EXTENSION_TYPE=$OPTARG
      if [[ ! $EXTENSION_TYPE =~ ${SUPPORTED_EXTENSION_TYPES[@]} ]]; then
        usage
        exit 1
      fi
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
    echo "########## Planet Payment commercetools connector - deployment finished successfully at ${NOW}."
    ;;

  *)
    usage
    exit 1
    ;;
esac
