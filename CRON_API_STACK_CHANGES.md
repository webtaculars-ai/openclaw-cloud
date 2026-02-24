# API Stack Update for Cron Jobs

## Add to ApiStackProps interface:

```typescript
export interface ApiStackProps extends cdk.StackProps {
  // ... existing props ...
  cronJobsTable: dynamodb.Table;
  cronRunsTable: dynamodb.Table;
}
```

## Add to sharedEnv:

```typescript
const sharedEnv = {
  // ... existing env vars ...
  CRON_JOBS_TABLE: props.cronJobsTable.tableName,
  CRON_RUNS_TABLE: props.cronRunsTable.tableName,
  EXECUTE_CRON_LAMBDA_ARN: '', // Will be set after lambda creation
};
```

## Add Lambda permissions:

```typescript
// After existing DynamoDB permissions:
props.cronJobsTable.grantReadWriteData(lambdaRole);
props.cronRunsTable.grantReadWriteData(lambdaRole);

// EventBridge permissions
lambdaRole.addToPolicy(new iam.PolicyStatement({
  actions: [
    'events:PutRule',
    'events:PutTargets',
    'events:DeleteRule',
    'events:RemoveTargets',
    'events:ListTargetsByRule',
  ],
  resources: ['*'], // Scope to openpaw-cron-* rules in production
}));
```

## Add Lambda functions:

```typescript
// Cron job Lambda functions
const listCronJobsFn = new lambda.Function(this, 'ListCronJobsFn', {
  runtime: lambda.Runtime.NODEJS_20_X,
  handler: 'handlers/list-cron-jobs.handler',
  code: lambda.Code.fromAsset('../backend/dist'),
  role: lambdaRole,
  environment: sharedEnv,
  timeout: cdk.Duration.seconds(30),
  memorySize: 256,
});

const createCronJobFn = new lambda.Function(this, 'CreateCronJobFn', {
  runtime: lambda.Runtime.NODEJS_20_X,
  handler: 'handlers/create-cron-job.handler',
  code: lambda.Code.fromAsset('../backend/dist'),
  role: lambdaRole,
  environment: sharedEnv,
  timeout: cdk.Duration.seconds(30),
  memorySize: 256,
});

const updateCronJobFn = new lambda.Function(this, 'UpdateCronJobFn', {
  runtime: lambda.Runtime.NODEJS_20_X,
  handler: 'handlers/update-cron-job.handler',
  code: lambda.Code.fromAsset('../backend/dist'),
  role: lambdaRole,
  environment: sharedEnv,
  timeout: cdk.Duration.seconds(30),
  memorySize: 256,
});

const deleteCronJobFn = new lambda.Function(this, 'DeleteCronJobFn', {
  runtime: lambda.Runtime.NODEJS_20_X,
  handler: 'handlers/delete-cron-job.handler',
  code: lambda.Code.fromAsset('../backend/dist'),
  role: lambdaRole,
  environment: sharedEnv,
  timeout: cdk.Duration.seconds(30),
  memorySize: 256,
});

const runCronJobFn = new lambda.Function(this, 'RunCronJobFn', {
  runtime: lambda.Runtime.NODEJS_20_X,
  handler: 'handlers/run-cron-job.handler',
  code: lambda.Code.fromAsset('../backend/dist'),
  role: lambdaRole,
  environment: sharedEnv,
  timeout: cdk.Duration.seconds(30),
  memorySize: 256,
});

const executeCronJobFn = new lambda.Function(this, 'ExecuteCronJobFn', {
  runtime: lambda.Runtime.NODEJS_20_X,
  handler: 'handlers/execute-cron-job.handler',
  code: lambda.Code.fromAsset('../backend/dist'),
  role: lambdaRole,
  environment: {
    ...sharedEnv,
    EXECUTE_CRON_LAMBDA_ARN: '', // Self-reference, set below
  },
  timeout: cdk.Duration.seconds(60), // Longer timeout for execution
  memorySize: 256,
});

// Grant EventBridge permission to invoke execute lambda
executeCronJobFn.grantInvoke(new iam.ServicePrincipal('events.amazonaws.com'));

// Update environment with ARN
createCronJobFn.addEnvironment('EXECUTE_CRON_LAMBDA_ARN', executeCronJobFn.functionArn);
updateCronJobFn.addEnvironment('EXECUTE_CRON_LAMBDA_ARN', executeCronJobFn.functionArn);
```

## Add API routes:

```typescript
// After existing agent routes, inside agentById resource:

// Cron jobs routes: /agents/{agentId}/cron
const cron = agentById.addResource('cron');

// GET /agents/{agentId}/cron - list cron jobs
cron.addMethod('GET', new apigateway.LambdaIntegration(listCronJobsFn), {
  authorizer,
  authorizationType: apigateway.AuthorizationType.COGNITO,
});

// POST /agents/{agentId}/cron - create cron job
cron.addMethod('POST', new apigateway.LambdaIntegration(createCronJobFn), {
  authorizer,
  authorizationType: apigateway.AuthorizationType.COGNITO,
});

const cronJob = cron.addResource('{jobId}');

// PUT /agents/{agentId}/cron/{jobId} - update cron job
cronJob.addMethod('PUT', new apigateway.LambdaIntegration(updateCronJobFn), {
  authorizer,
  authorizationType: apigateway.AuthorizationType.COGNITO,
});

// DELETE /agents/{agentId}/cron/{jobId} - delete cron job
cronJob.addMethod('DELETE', new apigateway.LambdaIntegration(deleteCronJobFn), {
  authorizer,
  authorizationType: apigateway.AuthorizationType.COGNITO,
});

const runCron = cronJob.addResource('run');

// POST /agents/{agentId}/cron/{jobId}/run - run cron job now
runCron.addMethod('POST', new apigateway.LambdaIntegration(runCronJobFn), {
  authorizer,
  authorizationType: apigateway.AuthorizationType.COGNITO,
});
```

## Update bin/app.ts to pass new tables:

```typescript
const apiStack = new ApiStack(app, 'OpenClawApiStack', {
  // ... existing props ...
  cronJobsTable: databaseStack.cronJobsTable,
  cronRunsTable: databaseStack.cronRunsTable,
});
```
