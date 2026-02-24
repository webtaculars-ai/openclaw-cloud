#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as cognito from 'aws-cdk-lib/aws-cognito';

const app = new cdk.App();

const stack = new cdk.Stack(app, 'OpenPawApiComplete', {
  env: { region: 'ap-south-1', account: '851725418250' }
});

// Import existing resources
const userPool = cognito.UserPool.fromUserPoolArn(
  stack,
  'UserPool',
  'arn:aws:cognito-idp:ap-south-1:851725418250:userpool/ap-south-1_df2Xgk8QR'
);

// Import Lambda functions (will be deployed separately)
const lambdaArn = (name: string) => 
  `arn:aws:lambda:ap-south-1:851725418250:function:openpaw-${name}`;

const provisionAgentFn = lambda.Function.fromFunctionArn(stack, 'ProvisionAgent', lambdaArn('provision-agent'));
const listAgentsFn = lambda.Function.fromFunctionArn(stack, 'ListAgents', lambdaArn('list-agents'));
const getAgentFn = lambda.Function.fromFunctionArn(stack, 'GetAgent', lambdaArn('get-agent'));
const startAgentFn = lambda.Function.fromFunctionArn(stack, 'StartAgent', lambdaArn('start-agent'));
const stopAgentFn = lambda.Function.fromFunctionArn(stack, 'StopAgent', lambdaArn('stop-agent'));
const getCreditsFn = lambda.Function.fromFunctionArn(stack, 'GetCredits', lambdaArn('get-credits'));
const redeemPromoFn = lambda.Function.fromFunctionArn(stack, 'RedeemPromo', lambdaArn('redeem-promo'));
const rechargeFn = lambda.Function.fromFunctionArn(stack, 'Recharge', lambdaArn('recharge-credits'));
const webhookFn = lambda.Function.fromFunctionArn(stack, 'Webhook', lambdaArn('lemonsqueezy-webhook'));

// Create API Gateway
const api = new apigateway.RestApi(stack, 'Api', {
  restApiName: 'OpenPawAPI',
  description: 'OpenPaw Backend API - Full Stack',
  defaultCorsPreflightOptions: {
    allowOrigins: ['https://openpaw.co', 'https://www.openpaw.co'],
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
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

const authMethodOptions = {
  authorizer,
  authorizationType: apigateway.AuthorizationType.COGNITO,
};

// /agents endpoints
const agents = api.root.addResource('agents');
agents.addMethod('POST', new apigateway.LambdaIntegration(provisionAgentFn), authMethodOptions);
agents.addMethod('GET', new apigateway.LambdaIntegration(listAgentsFn), authMethodOptions);

const agent = agents.addResource('{agentId}');
agent.addMethod('GET', new apigateway.LambdaIntegration(getAgentFn), authMethodOptions);

const agentStart = agent.addResource('start');
agentStart.addMethod('POST', new apigateway.LambdaIntegration(startAgentFn), authMethodOptions);

const agentStop = agent.addResource('stop');
agentStop.addMethod('POST', new apigateway.LambdaIntegration(stopAgentFn), authMethodOptions);

// /credits endpoints
const credits = api.root.addResource('credits');
credits.addMethod('GET', new apigateway.LambdaIntegration(getCreditsFn), authMethodOptions);

const redeemPromo = credits.addResource('redeem-promo');
redeemPromo.addMethod('POST', new apigateway.LambdaIntegration(redeemPromoFn), authMethodOptions);

const recharge = credits.addResource('recharge');
recharge.addMethod('POST', new apigateway.LambdaIntegration(rechargeFn), authMethodOptions);

// /webhooks endpoint (NO auth - uses signature verification)
const webhooks = api.root.addResource('webhooks');
const lemonSqueezy = webhooks.addResource('lemonsqueezy');
lemonSqueezy.addMethod('POST', new apigateway.LambdaIntegration(webhookFn));

// Outputs
new cdk.CfnOutput(stack, 'ApiUrl', {
  value: api.url,
  description: 'API Gateway URL',
  exportName: 'OpenPawApiUrl',
});

new cdk.CfnOutput(stack, 'ApiId', {
  value: api.restApiId,
  description: 'API Gateway ID',
});

app.synth();
