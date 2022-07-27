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
# Also, it needs some variables to be populated after deployment. # TO-DO: review of this process
#
# requires TWO user inputs
# STACKID - a simple name to identify this stack within others
#             (if API-Gateway is going to be used this will be mandatory to identify routes)
# AWSREGION - which AWS region to use within the account credentials
# !!!! this script DOESN'T validate its inputs contents !!!!
#
# system requirements:
# 1) a bash-like shell
# 2) AWS CLI installed in this shell 
# 3) and valid set of AWS credentials with administrator access level,
#    as IAM objects are required
#    (credentials can be an awscli profile or env vars)
#
# To delete the stack, 
# just go to the CloudFormation Dashboard at the account and region where it was created
# and delete the stack (can use AWS CLI too).
#
echo "##### performing checks ..."
echo " "
if [ $# -ne 2 ]; then
   echo "!!!!! Provided parameters aren't correct. Need just 2: a name for the stack and an AWS region, no spaces within them."
   echo "!!!!! Usage: cf-deploy.sh STACKID AWSREGION"
   echo "!!!!!  like: cf-deploy.sh Prod-01 eu-west-1"
   exit 3
fi

# checks if the AWS credentials are ok
CHECKAWS=$(aws sts get-caller-identity)
if [ $? != 0 ]; then
    echo "!!!!! Oh no, something went wrong with your AWS credentials."
    echo "!!!!! If using SSO, try to refresh then copy the NEW env vars from the account SSO landing page."
    exit 0
fi

# a few preparations....
STACKNAME="planetpaymentcommtool"
STACKID=$(echo $1 | tr -dc '[:alnum:]\n\r')  # removes spaces and special characters... looks overkill
AWSREGION=$(echo $2 | tr '[:upper:]' '[:lower:]') # make it lowercase
NOW=$(date +%Y-%m-%d_%Hh%Mm%Ss)

echo "########## deploying $STACKNAME-$STACKID in AWS region $AWSREGION"
echo " "
echo "##### Creating CF template file: $STACKNAME-$STACKID_$AWSREGION_$NOW.yaml"
echo "##### (this file will be kept after stack creation)"
cp planetpaymentconnector-stack-template.yaml $STACKNAME-$STACKID_$AWSREGION_$NOW.yaml
echo " "

echo "##### personalizing the template file"
sed -i -e "s/STACKNAME/$STACKNAME/g" $STACKNAME-$STACKID_$AWSREGION_$NOW.yaml
sed -i -e "s/STACKID/$STACKID/g" $STACKNAME-$STACKID_$AWSREGION_$NOW.yaml
sed -i "1s/^/# stack name on $NOW: $STACKNAME-$STACKID\n/" $STACKNAME-$STACKID_$AWSREGION_$NOW.yaml
echo " "

echo "##### Starting CF deploy for $STACKNAME-$STACKID stack in $AWSREGION region...."
echo " "
aws cloudformation deploy --region $AWSREGION --stack-name $STACKNAME-$STACKID --template-file $STACKNAME-$STACKID_$AWSREGION_$NOW.yaml --capabilities CAPABILITY_IAM
echo " "

# it's the end
echo "##### supposedly, we're done"
echo "##### check the cli output here and CloudFormation stack Events output in $AWSREGION"
echo " "
echo "##### at the stack Outputs there's the FunctionURL for the Lambda function"
exit 0
