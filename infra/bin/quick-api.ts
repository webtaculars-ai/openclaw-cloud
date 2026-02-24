#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as cognito from 'aws-cdk-lib/aws-cognito';

const app = new cdk.App();

const stack = new cdk.Stack(app, 'OpenPawApiQuick', {
  env: { region: 'ap-south-1', account: '851725418250' }
});

// Import existing resources
const userPool = cognito.UserPool.fromUserPoolArn(
  stack,
  'UserPool',
  'arn:aws:cognito-idp:ap-south-1:851725418250:userpool/ap-south-1_df2Xgk8QR'
);

const redeemPromoFn = lambda.Function.fromFunctionArn(
  stack,
  'RedeemPromo',
  'arn:aws:lambda:ap-south-1:851725418250:function:openpaw-redeem-promo'
);

// Create API Gateway
const api = new apigateway.RestApi(stack, 'Api', {
  restApiName: 'OpenPawAPI',
  defaultCorsPreflightOptions: {
    allowOrigins: ['https://openpaw.co', 'https://www.openpaw.co'],
    allowMethods: ['POST', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    allowCredentials: true,
  },
  deployOptions: {
    throttlingRateLimit: 100,
    throttlingBurstLimit: 200,
  },
});

// Cognito authorizer
const authorizer = new apigateway.CognitoUserPoolsAuthorizer(stack, 'Authorizer', {
  cognitoUserPools: [userPool],
});

// /credits resource
const credits = api.root.addResource('credits');

// /credits/redeem-promo
const redeemPromo = credits.addResource('redeem-promo');

redeemPromo.addMethod('POST', new apigateway.LambdaIntegration(redeemPromoFn), {
  authorizer,
  authorizationType: apigateway.AuthorizationType.COGNITO,
});

// Output
new cdk.CfnOutput(stack, 'ApiUrl', {
  value: api.url,
  description: 'API Gateway URL',
});

app.synth();
