#/bin/bash

#
# deploys a CF stack, copying a fixed file as template then changing a few
# placeholders within the copied file to personalize the stack contents
#
# requires TWO inputs
# STACKNAME - name to the CF stack to be created (and lambda function), no spaces and special characters
# DEVELOPER - a simple name to identify this stack within others
#             (if API-Gateway is going to be used this will be mandatory to identify routes)
#
# system requirements:
# 1) AWS CLI installed
# 2) and valid set of AWS credentials (as a profile or ENV vars)
#
echo -e "##### performing checks ..."
echo -e " "
if [ $# -ne 2 ]; then
   echo -e "!!!!! Not enough parameters (in fact, needs TWO, with no spaces within the parameter)."
   echo -e "!!!!! Usage: cf-deploy.sh STACKNAME GITHUBUSERNAME"
   exit 3
fi

# checks if the AWS credentials are ok
CHECKAWS=$(aws sts get-caller-identity)
if [[ $? != 0 ]]; then
    echo -e "!!!!! Oh no, something went wrong with your AWS credentials."
    echo -e "!!!!! If using SSO, try to renew them, then copy the ENV vars from the account SSO landing page."
    exit 0
fi

# a few preparations....
STACKNAME=$1
DEVELOPER=$2
NOW=$(date +%Y-%m-%d_%Hh%Mm%Ss)

echo -e "########## deploying $STACKNAME-$DEVELOPER in AWS"
echo -e " "
echo -e "##### Creating CF template file: $STACKNAME-$DEVELOPER-$NOW.yaml"
echo -e "##### (this file will be kept after stack creation)"
cp paymentconnector-devstack-template.yaml $STACKNAME-$DEVELOPER-$NOW.yaml
echo -e " "

echo -e "##### personalizing the template file"
sed -i -e "s/STACKNAME/$STACKNAME/g" $STACKNAME-$DEVELOPER-$NOW.yaml
sed -i -e "s/DEVELOPER/$DEVELOPER/g" $STACKNAME-$DEVELOPER-$NOW.yaml
sed -i "1s/^/# stack name on $NOW: $STACKNAME-$DEVELOPER\n/" $STACKNAME-$DEVELOPER-$NOW.yaml
echo -e " "

echo -e "##### Starting CF deploy for $STACKNAME stack...."
echo -e " "
aws cloudformation deploy --stack-name $STACKNAME-$DEVELOPER --template-file $STACKNAME-$DEVELOPER-$NOW.yaml --capabilities CAPABILITY_IAM
echo -e " "

# it's the end
echo -e "##### supposedly, we're done"
echo -e "##### check the cli output here and CloudFormation stack Events output"
exit 0
