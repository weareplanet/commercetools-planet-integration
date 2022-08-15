#/bin/bash
#
# Planet Payment - Commerce Tools connector AWS deployment
# 2022-07 - Planet Payments
#
# deploys a CloudFormation stack using a template file
# copying it to a new file and changing some placeholders to customize stack contents
#
# The CloudFormation stack contains the Lambda function and accessory objects needed within AWS.
# It has the prefix "planetpaymentcommtool-" (can be changed within the STACKNAME variable below)
#
# The Lambda function will be created with a single code snippet that will be modified
# after the first package deployment.
#
# requires TWO user inputs
# STACKID - a simple name to identify this stack within others, 25 characters maximum
#             (if API-Gateway is going to be used this will be mandatory to identify routes)
# AWSREGION - which AWS region to use within the account credentials
# !!!! this script DOESN'T validate its inputs contents
#      but checks if the STACKID is smaller than 25 characters to avoid issues with AWS IAM (objects there are 64-characters long).
#
# Requirements:
# 1) a bash-like shell
# 2) AWS CLI installed in this shell
# 3) and valid set of AWS credentials with administrator access level,
#    as IAM objects are required
#    (credentials can be an awscli profile or env vars)
# 4) '.env' file with the required ENV vars filled
#
# To delete the stack,
# just go to the CloudFormation Dashboard at the account and region where it was created
# and delete the stack (can use AWS CLI too).
#
# a few preparations....
STACKNAME="planetpaymentcommtool"
STACKID=$(echo $1 | tr -dc '[:alnum:]\n\r')  # removes spaces and special characters... looks overkill
AWSREGION=$(echo $2 | tr '[:upper:]' '[:lower:]') # make it lowercase
ENVFILE="../../commercetools/.env"

NOW=$(date +%Y-%m-%d_%Hh%Mm%Ss)
echo "\n########## Planet Payment CommerceTools connector - deployment AWS infrastructure, starting now, at ${NOW}.\n"
echo "##### performing parameter input checks ..."
if [ $# -ne 2 ]; then
   echo "   !! Provided parameters aren't correct. Need just 2: a name for the stack and an AWS region, no spaces within them."
   echo "   !! Usage: 05-aws-deploy.sh STACKID AWSREGION"
   echo "   !!  like: 05-aws-deploy.sh Prod-01 eu-west-1"
   exit 3
fi
if [[ ${#STACKID} -gt 25 ]]; then
   echo "   !! The STACKID cannot be bigger than 25 characters. Try to shorten it."
   echo "   !! Usage: 05-aws-deploy.sh STACKID AWSREGION"
   echo "   !!  like: 05-aws-deploy.sh lessThan25characters eu-west-1"
   exit 3
fi
echo "   ## done.\n"

echo "##### performing file checks ..."
if [ ! -f ${ENVFILE} ]; then
   echo "   !! '.env' file was not found - it must be filled and present at 'deploy/commercetools/' folder."
   exit 3
fi
echo "   ## done.\n"

echo "##### importing and checking ENV vars"
set -a
source <(cat ${ENVFILE} | sed -e '/^#/d;/^\s*$/d;')
set +a
#env | grep "^CT.*" # uncomment for debugging
for var in "${!CT@}"; do
    #echo "var is ${var} with value '${!var}'" # uncomment for debugging
    if [ -z "${!var}" ] ; then
        echo "      $var is null or maybe not set properly, get value '${!var}'"
        exit 1
    fi
done
for var in "${!DT@}"; do
    #echo "var is ${var} with value '${!var}'" # uncomment for debugging
    if [ -z "${!var}" ] ; then
        echo "      $var is null or maybe not set properly, get value '${!var}'"
        exit 1
    fi
done
echo "   ## done.\n"

# checks if the AWS credentials are ok
echo "##### getting AWS credentials"
CHECKAWS=$(aws sts get-caller-identity)
if [ $? != 0 ]; then
    echo "   !! Oh no, something went wrong with your AWS credentials."
    echo "   !! If using SSO, try to refresh then copy the NEW env vars from the account SSO landing page."
    exit 0
fi
echo "   ## done.\n"

echo "########## deploying $STACKNAME-$STACKID in AWS region $AWSREGION"
echo "\n##### Creating CF template file: ${STACKNAME}-${STACKID}_${AWSREGION}_${NOW}.yaml"
echo "   ## (this file will be kept after stack creation)"
cp planetpaymentconnector-stack-template.yaml ${STACKNAME}-${STACKID}_${AWSREGION}_${NOW}.yaml

echo "\n   ## personalizing the template file"
sed -i -e "s/STACKNAME/$STACKNAME/g" ${STACKNAME}-${STACKID}_${AWSREGION}_${NOW}.yaml
sed -i -e "s/STACKID/$STACKID/g" ${STACKNAME}-${STACKID}_${AWSREGION}_${NOW}.yaml
sed -i "1s/^/# stack name on $NOW: $STACKNAME-$STACKID\n/" ${STACKNAME}-${STACKID}_${AWSREGION}_${NOW}.yaml
echo "   ## done."
echo "\n   ## updating template variables with '.env' contents"
#env | grep "^CT.*" # uncomment for debugging
for var in "${!CT@}"; do
    #echo "var is ${var} with value '${!var}'" # uncomment for debugging
    sed -i -e "s~${var}_PLACEHOLDER~${!var}~g" ${STACKNAME}-${STACKID}_${AWSREGION}_${NOW}.yaml
done
#env | grep "^DT.*" # uncomment for debugging
for var in "${!DT@}"; do
    #echo "var is ${var} with value '${!var}'" # uncomment for debugging
    sed -i -e "s~${var}_PLACEHOLDER~${!var}~g" ${STACKNAME}-${STACKID}_${AWSREGION}_${NOW}.yaml
done
echo "   ## done.\n"

echo "##### Starting CF deploy for $STACKNAME-$STACKID stack in $AWSREGION region...."
aws cloudformation deploy --region $AWSREGION --stack-name $STACKNAME-$STACKID --template-file ${STACKNAME}-${STACKID}_${AWSREGION}_${NOW}.yaml --capabilities CAPABILITY_IAM CAPABILITY_NAMED_IAM
echo "   ## done.\n"

echo "##### Updating Lambda Function ENV var configuation for DT_CONNECTOR_WEBHOOK_URL ..."
echo "   ## getting info..."
LAMBDAFUNCTIONNAME=$(aws cloudformation --region ${AWSREGION} describe-stacks --stack-name ${STACKNAME}-${STACKID} \
                     --query "Stacks[0].Outputs[?OutputKey=='LambdaFunctionName'].OutputValue" --output text)
LAMBDAFUNCTIONURL=$(aws cloudformation --region ${AWSREGION} describe-stacks --stack-name ${STACKNAME}-${STACKID} \
                    --query "Stacks[0].Outputs[?OutputKey=='LambdaFunctionURL'].OutputValue" --output text)
# yes, awscli cannot update a SINGLE variable, it changes the entire set, so to add or change one, you must have all others...
#echo "LAMBDAFUNCTIONNAME: ${LAMBDAFUNCTIONNAME}" #uncomment for debugging
#echo "LAMBDAFUNCTIONURL: ${LAMBDAFUNCTIONURL}" #uncomment for debugging
ALLLAMBDAENVVARS=$(aws lambda get-function-configuration --region ${AWSREGION} --function-name ${LAMBDAFUNCTIONNAME} | \
    jq --compact-output ".Environment + {\"Variables\": (.Environment.Variables + {\"DT_CONNECTOR_WEBHOOK_URL\": \"${LAMBDAFUNCTIONURL}v1/dt-webhook\"})}")
echo "   ## changing Lambda ENV var..."
UPDATELAMBDA=$(aws lambda update-function-configuration --region ${AWSREGION} --function-name ${LAMBDAFUNCTIONNAME} --environment="${ALLLAMBDAENVVARS}")
echo "   ## done with this ENV var.\n"

echo "##### Updating .env file with needed Access Key, Secret and Lambda ARN for CommerceTools API-Extension ..."
echo "   ## getting info..."
AKID=$(aws cloudformation --region ${AWSREGION} describe-stacks --stack-name ${STACKNAME}-${STACKID} \
                     --query "Stacks[0].Outputs[?OutputKey=='AccessKeyforAPIExtensionIAMUserAccessKey'].OutputValue" --output text)
AKSEC=$(aws cloudformation --region ${AWSREGION} describe-stacks --stack-name ${STACKNAME}-${STACKID} \
                    --query "Stacks[0].Outputs[?OutputKey=='SecretKeyforAPIExtensionIAMUserAccessKey'].OutputValue" --output text)
LAMBDAARN=$(aws lambda get-function --region ${AWSREGION} --function-name ${STACKNAME}-${STACKID} | jq -r .Configuration.FunctionArn)
echo "   ## changing .env file..."
sed -i "/^AWS_API_EXTENSION_ACCESS_KEY/c\AWS_API_EXTENSION_ACCESS_KEY=\"${AKID}\"" ${ENVFILE}
sed -i "/^AWS_API_EXTENSION_SECRET/c\AWS_API_EXTENSION_SECRET=\"${AKSEC}\"" ${ENVFILE}
sed -i "/^AWS_LAMBDA_ARN/c\AWS_LAMBDA_ARN=\"${LAMBDAARN}\"" ${ENVFILE}
echo "   ## done with this .env file.\n"

# it's the end
echo "##### supposedly, we're all done"
echo "##### check the cli output here and CloudFormation stack Events output in $AWSREGION\n"
echo "##### at the stack Outputs there's the FunctionURL for the Lambda function"
exit 0
