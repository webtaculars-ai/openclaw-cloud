import * as cdk from 'aws-cdk-lib';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';

export interface ApiStackProps extends cdk.StackProps {
  userPool: cognito.IUserPool;
  usersTable: dynamodb.Table;
  agentsTable: dynamodb.Table;
  creditsTable: dynamodb.Table;
  transactionsTable: dynamodb.Table;
  cluster: ecs.Cluster;
  taskDefinition: ecs.FargateTaskDefinition;
  taskExecutionRole: iam.Role;
  taskRole: iam.Role;
  vpc: ec2.IVpc;
  securityGroup: ec2.SecurityGroup;
}

export class ApiStack extends cdk.Stack {
  public readonly api: apigateway.RestApi;
  public readonly apiUrl: string;

  constructor(scope: Construct, id: string, props: ApiStackProps) {
    super(scope, id, props);

    // Shared Lambda execution role
    const lambdaRole = new iam.Role(this, 'LambdaExecutionRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'),
      ],
    });

    // DynamoDB permissions
    props.usersTable.grantReadWriteData(lambdaRole);
    props.agentsTable.grantReadWriteData(lambdaRole);
    props.creditsTable.grantReadWriteData(lambdaRole);
    props.transactionsTable.grantReadWriteData(lambdaRole);

    // ECS permissions
    lambdaRole.addToPolicy(new iam.PolicyStatement({
      actions: ['ecs:RunTask', 'ecs:StopTask', 'ecs:DescribeTasks'],
      resources: ['*'],
      conditions: {
        ArnEquals: {
          'ecs:cluster': props.cluster.clusterArn,
        },
      },
    }));

    // IAM PassRole for ECS task roles
    lambdaRole.addToPolicy(new iam.PolicyStatement({
      actions: ['iam:PassRole'],
      resources: [
        props.taskExecutionRole.roleArn,
        props.taskRole.roleArn,
      ],
    }));

    // Shared environment variables
    const sharedEnv = {
      USERS_TABLE: props.usersTable.tableName,
      AGENTS_TABLE: props.agentsTable.tableName,
      CREDITS_TABLE: props.creditsTable.tableName,
      TRANSACTIONS_TABLE: props.transactionsTable.tableName,
      ECS_CLUSTER: props.cluster.clusterName,
      TASK_DEFINITION: props.taskDefinition.taskDefinitionArn,
      VPC_SUBNETS: props.vpc.selectSubnets({ subnetType: ec2.SubnetType.PUBLIC }).subnetIds.join(','),
      SECURITY_GROUP: props.securityGroup.securityGroupId,
      LEMONSQUEEZY_API_KEY: 'ls_placeholder', // Replace with actual key
      LEMONSQUEEZY_WEBHOOK_SECRET: 'webhook_placeholder', // Replace with actual secret
      LEMONSQUEEZY_STORE_ID: 'store_placeholder', // Replace with your store ID
      LEMONSQUEEZY_VARIANT_STARTER: 'variant_placeholder', // Replace with variant ID
      LEMONSQUEEZY_VARIANT_PRO: 'variant_placeholder', // Replace with variant ID
      LEMONSQUEEZY_VARIANT_ENTERPRISE: 'variant_placeholder', // Replace with variant ID
      FRONTEND_URL: 'https://placeholder.amplifyapp.com', // Replace after Amplify deploy
    };

    // Lambda functions
    const provisionAgentFn = new lambda.Function(this, 'ProvisionAgentFn', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'handlers/provision-agent.handler',
      code: lambda.Code.fromAsset('../backend/dist'),
      role: lambdaRole,
      environment: sharedEnv,
      timeout: cdk.Duration.seconds(30),
      memorySize: 256,
    });

    const getAgentFn = new lambda.Function(this, 'GetAgentFn', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'handlers/get-agent.handler',
      code: lambda.Code.fromAsset('../backend/dist'),
      role: lambdaRole,
      environment: sharedEnv,
      timeout: cdk.Duration.seconds(30),
      memorySize: 256,
    });

    const startAgentFn = new lambda.Function(this, 'StartAgentFn', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'handlers/start-agent.handler',
      code: lambda.Code.fromAsset('../backend/dist'),
      role: lambdaRole,
      environment: sharedEnv,
      timeout: cdk.Duration.seconds(30),
      memorySize: 256,
    });

    const stopAgentFn = new lambda.Function(this, 'StopAgentFn', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'handlers/stop-agent.handler',
      code: lambda.Code.fromAsset('../backend/dist'),
      role: lambdaRole,
      environment: sharedEnv,
      timeout: cdk.Duration.seconds(30),
      memorySize: 256,
    });

    const updateChannelsFn = new lambda.Function(this, 'UpdateChannelsFn', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'handlers/update-channels.handler',
      code: lambda.Code.fromAsset('../backend/dist'),
      role: lambdaRole,
      environment: sharedEnv,
      timeout: cdk.Duration.seconds(30),
      memorySize: 256,
    });

    const getCreditsFn = new lambda.Function(this, 'GetCreditsFn', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'handlers/get-credits.handler',
      code: lambda.Code.fromAsset('../backend/dist'),
      role: lambdaRole,
      environment: sharedEnv,
      timeout: cdk.Duration.seconds(30),
      memorySize: 256,
    });

    const rechargeCreditsFn = new lambda.Function(this, 'RechargeCreditsFn', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'handlers/recharge-credits.handler',
      code: lambda.Code.fromAsset('../backend/dist'),
      role: lambdaRole,
      environment: sharedEnv,
      timeout: cdk.Duration.seconds(30),
      memorySize: 256,
    });

    const lemonSqueezyWebhookFn = new lambda.Function(this, 'LemonSqueezyWebhookFn', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'handlers/lemonsqueezy-webhook.handler',
      code: lambda.Code.fromAsset('../backend/dist'),
      role: lambdaRole,
      environment: sharedEnv,
      timeout: cdk.Duration.seconds(30),
      memorySize: 256,
    });

    // API Gateway
    this.api = new apigateway.RestApi(this, 'OpenClawApi', {
      restApiName: 'OpenClaw Cloud API',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: ['Content-Type', 'Authorization'],
      },
      deployOptions: {
        throttlingRateLimit: 10,
        throttlingBurstLimit: 20,
      },
    });

    // Cognito Authorizer
    const authorizer = new apigateway.CognitoUserPoolsAuthorizer(this, 'CognitoAuthorizer', {
      cognitoUserPools: [props.userPool],
    });

    // Routes
    const agents = this.api.root.addResource('agents');
    agents.addMethod('POST', new apigateway.LambdaIntegration(provisionAgentFn), {
      authorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO,
    });

    const agentById = agents.addResource('{agentId}');
    agentById.addMethod('GET', new apigateway.LambdaIntegration(getAgentFn), {
      authorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO,
    });

    const startAgent = agentById.addResource('start');
    startAgent.addMethod('POST', new apigateway.LambdaIntegration(startAgentFn), {
      authorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO,
    });

    const stopAgent = agentById.addResource('stop');
    stopAgent.addMethod('POST', new apigateway.LambdaIntegration(stopAgentFn), {
      authorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO,
    });

    const channels = agentById.addResource('channels');
    channels.addMethod('PUT', new apigateway.LambdaIntegration(updateChannelsFn), {
      authorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO,
    });

    const credits = this.api.root.addResource('credits');
    credits.addMethod('GET', new apigateway.LambdaIntegration(getCreditsFn), {
      authorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO,
    });

    const recharge = credits.addResource('recharge');
    recharge.addMethod('POST', new apigateway.LambdaIntegration(rechargeCreditsFn), {
      authorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO,
    });

    const webhooks = this.api.root.addResource('webhooks');
    const lemonsqueezy = webhooks.addResource('lemonsqueezy');
    lemonsqueezy.addMethod('POST', new apigateway.LambdaIntegration(lemonSqueezyWebhookFn)); // No auth

    this.apiUrl = this.api.url;

    // Exports
    new cdk.CfnOutput(this, 'ApiUrl', {
      value: this.apiUrl,
      exportName: 'OpenClawApiUrl',
    });
  }
}
