#/bin/bash
#
# Planet Payment - Commerce Tools connector AWS deployment
# 2022-07 - Planet Payments
#
# Deploys a CloudFormation stack using a template file copying it to a new file and changing some
# placeholders to customize stack contents
#
# The CloudFormation stack contains the Lambda function and accessory objects needed within AWS. It
# has the prefix "planetpaymentcommtool-" (can be changed within the STACKNAME variable below)
#
# The Lambda function will be created with a single code snippet that will be modified after the
# first package deployment.
#
# Requires TWO user inputs:
# STACKID - a simple name to identify this stack within others, 25 characters maximum
#             (if API-Gateway is going to be used this will be mandatory to identify routes)
# AWSREGION - which AWS region to use within the account credentials
# !!!! this script DOESN'T validate its inputs contents
#      but checks if the STACKID is smaller than 25 characters to avoid issues with AWS IAM (objects
#      there are 64-characters long).
#
# Requirements:
# 1) a bash-like shell
# 2) AWS CLI installed in this shell
# 3) A valid set of AWS credentials with administrator access level, as IAM objects are required
#    (credentials can be an awscli profile or env vars)
# 4) 'env' file with the required ENV vars filled
#
# To delete the stack, go to the CloudFormation Dashboard at the account and region where it was
# created and delete the stack (can use AWS CLI too).

SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
STACKNAME="planetpaymentcommtool"
STACKID=$(echo $1 | tr -dc '[:alnum:]\n\r')  # removes spaces and special characters... looks overkill
AWSREGION=$(echo $2 | tr '[:upper:]' '[:lower:]') # make it lowercase
ENVFILE="${SCRIPT_DIR}/../../env"

NOW=$(date +%Y-%m-%d_%Hh%Mm%Ss)
echo -e "\n########## Planet Payment CommerceTools connector - deployment AWS infrastructure, starting now, at ${NOW}.\n"
echo -e "##### performing parameter input checks ..."
if [ $# -ne 2 ]; then
   echo -e "   !! Provided parameters aren't correct. Need just 2: a name for the stack and an AWS region, no spaces within them."
   echo -e "   !! Usage: aws-deploy.sh STACKID AWSREGION"
   echo -e "   !!  like: aws-deploy.sh Prod-01 eu-west-1"
   exit 3
fi
if [[ ${#STACKID} -gt 25 ]]; then
   echo -e "   !! The STACKID cannot be bigger than 25 characters. Try to shorten it."
   echo -e "   !! Usage: aws-deploy.sh STACKID AWSREGION"
   echo -e "   !!  like: aws-deploy.sh lessThan25characters eu-west-1"
   exit 3
fi
echo -e "   ## done.\n"

echo -e "##### performing file checks ..."
if [ ! -f ${ENVFILE} ]; then
   echo -e "   !! 'env' file was not found - it must be filled and present under ${ENVFILE}."
   exit 3
fi
echo -e "   ## done.\n"

echo -e "\n##### Setting ENV vars"
set -a
source <(cat ${ENVFILE} | sed -e '/^#/d;/^\s*$/d;')
set +a

echo -e "\n##### Checking ENV vars"
for var in "${REQUIRED_CT_VARS[@]}"; do
REQUIRED_ENV_VARS=(CT_AUTH_URL CT_CLIENT_ID CT_CLIENT_SECRET CT_PROJECT_ID DT_MERCHANTS)
    if [ -z "${!var}" ] ; then
        echo -e "\tMissed the required environmebt variable $var"
        exit 1
    fi
done

# checks if the AWS credentials are ok
echo -e "##### getting AWS credentials"
CHECKAWS=$(aws sts get-caller-identity)
if [ $? != 0 ]; then
    echo -e "   !! error: something went wrong with your AWS credentials."
    echo -e "   !! If using SSO, try to refresh then copy the NEW env vars from the account SSO landing page."
    exit 0
fi
echo -e "   ## done.\n"

echo -e "########## deploying $STACKNAME-$STACKID in AWS region $AWSREGION"
echo -e "\n##### Creating CF template file: ${STACKNAME}-${STACKID}_${AWSREGION}_${NOW}.yaml"
echo -e "   ## (this file will be kept after stack creation)"
OUTPUT_YAML="${SCRIPT_DIR}/${STACKNAME}-${STACKID}_${AWSREGION}_${NOW}.yaml"
cp ${SCRIPT_DIR}/planetpaymentconnector-stack-template.yaml ${OUTPUT_YAML}

echo -e "\n   ## personalizing the template file: ${OUTPUT_YAML}"
sed -i -e "s/STACKNAME/$STACKNAME/g" ${OUTPUT_YAML}
sed -i -e "s/STACKID/$STACKID/g" ${OUTPUT_YAML}
sed -i "1s/^/# stack name on $NOW: $STACKNAME-$STACKID\n/" ${OUTPUT_YAML}
echo -e "   ## done."
echo -e "\n   ## updating template variables with 'env' contents"
for var in "${!CT@}"; do
    sed -i -e "s~${var}_PLACEHOLDER~${!var}~g" ${OUTPUT_YAML}
done
for var in "${!DT@}"; do
	value=$(echo "${!var}" | sed -z "s/\n/ /g") # compacting potential multi-line json to single line
    sed -i -e "s~${var}_PLACEHOLDER~${value}~g" ${OUTPUT_YAML}
done
echo -e "   ## done.\n"

echo -e "##### Starting CF deploy for $STACKNAME-$STACKID stack in $AWSREGION region...."
set +e
aws cloudformation describe-stacks --region ${AWSREGION} --stack-name ${STACKNAME}-${STACKID} &> /dev/null
# TODO(pbourke): support stack updates
if [[ $? != 0 ]]; then
    aws cloudformation deploy --region $AWSREGION --stack-name $STACKNAME-$STACKID --template-file ${OUTPUT_YAML} --capabilities CAPABILITY_IAM CAPABILITY_NAMED_IAM
fi
set -e
echo -e "   ## done.\n"

echo -e "##### Updating Lambda Function ENV var configuation for DT_CONNECTOR_WEBHOOK_URL ..."
echo -e "   ## getting info..."
LAMBDAFUNCTIONNAME=$(aws cloudformation --region ${AWSREGION} describe-stacks --stack-name ${STACKNAME}-${STACKID} \
                     --query "Stacks[0].Outputs[?OutputKey=='LambdaFunctionName'].OutputValue" --output text)
LAMBDAFUNCTIONURL=$(aws cloudformation --region ${AWSREGION} describe-stacks --stack-name ${STACKNAME}-${STACKID} \
                    --query "Stacks[0].Outputs[?OutputKey=='LambdaFunctionURL'].OutputValue" --output text)
# yes, awscli cannot update a SINGLE variable, it changes the entire set, so to add or change one, you must have all others...
ALLLAMBDAENVVARS=$(aws lambda get-function-configuration --region ${AWSREGION} --function-name ${LAMBDAFUNCTIONNAME} | \
    jq --compact-output ".Environment + {\"Variables\": (.Environment.Variables + {\"DT_CONNECTOR_WEBHOOK_URL\": \"${LAMBDAFUNCTIONURL}v1/dt-webhook\"})}")
echo -e "   ## changing Lambda ENV var..."
UPDATELAMBDA=$(aws lambda update-function-configuration --region ${AWSREGION} --function-name ${LAMBDAFUNCTIONNAME} --environment="${ALLLAMBDAENVVARS}")
echo -e "   ## done with this ENV var.\n"

echo -e "##### Updating .env file with needed Access Key, Secret and Lambda ARN for CommerceTools API-Extension ..."
echo -e "   ## getting info..."
AKID=$(aws cloudformation --region ${AWSREGION} describe-stacks --stack-name ${STACKNAME}-${STACKID} \
                     --query "Stacks[0].Outputs[?OutputKey=='AccessKeyforAPIExtensionIAMUserAccessKey'].OutputValue" --output text)
AKSEC=$(aws cloudformation --region ${AWSREGION} describe-stacks --stack-name ${STACKNAME}-${STACKID} \
                    --query "Stacks[0].Outputs[?OutputKey=='SecretKeyforAPIExtensionIAMUserAccessKey'].OutputValue" --output text)
LAMBDAARN=$(aws lambda get-function --region ${AWSREGION} --function-name ${STACKNAME}-${STACKID} | jq -r .Configuration.FunctionArn)
echo -e "   ## changing .env file..."
sed -i "/^export CT_API_EXTENSION_AWS_LAMBDA_ACCESS_KEY/cexport CT_API_EXTENSION_AWS_LAMBDA_ACCESS_KEY=\"${AKID}\"" ${ENVFILE}
sed -i "/^export CT_API_EXTENSION_AWS_LAMBDA_SECRET/cexport CT_API_EXTENSION_AWS_LAMBDA_SECRET=\"${AKSEC}\"" ${ENVFILE}
sed -i "/^export CT_API_EXTENSION_AWS_LAMBDA_ARN/cexport CT_API_EXTENSION_AWS_LAMBDA_ARN=\"${LAMBDAARN}\"" ${ENVFILE}
echo -e "   ## done with this .env file.\n"

echo -e "##### Done"
echo -e "##### check the cli output here and CloudFormation stack Events output in $AWSREGION\n"
echo -e "##### at the stack Outputs there's the FunctionURL for the Lambda function"
