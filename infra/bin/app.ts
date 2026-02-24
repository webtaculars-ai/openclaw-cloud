#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { NetworkStack } from '../lib/network-stack';
import { AuthStack } from '../lib/auth-stack';
import { DatabaseStack } from '../lib/database-stack';
import { AgentRuntimeStack } from '../lib/agent-runtime-stack';
import { ApiStack } from '../lib/api-stack';
import { FrontendStack } from '../lib/frontend-stack';

const app = new cdk.App();

// Independent stacks
const networkStack = new NetworkStack(app, 'OpenClawCloudNetwork', {
  description: 'OpenClaw Cloud - Network infrastructure (VPC, security groups)',
});

const authStack = new AuthStack(app, 'OpenClawCloudAuth', {
  description: 'OpenClaw Cloud - Authentication (Cognito)',
});

const databaseStack = new DatabaseStack(app, 'OpenClawCloudDatabase', {
  description: 'OpenClaw Cloud - Database layer (DynamoDB tables)',
});

// Agent runtime (depends on network + database)
const agentRuntimeStack = new AgentRuntimeStack(app, 'OpenClawCloudAgentRuntime', {
  vpc: networkStack.vpc,
  securityGroup: networkStack.ecsSecurityGroup,
  creditsTable: databaseStack.creditsTable,
  transactionsTable: databaseStack.transactionsTable,
  agentsTable: databaseStack.agentsTable,
  description: 'OpenClaw Cloud - Agent runtime (ECS, ECR, task definitions)',
});

agentRuntimeStack.addDependency(networkStack);
agentRuntimeStack.addDependency(databaseStack);

// API (depends on all above)
const apiStack = new ApiStack(app, 'OpenClawCloudApi', {
  userPool: authStack.userPool,
  usersTable: databaseStack.usersTable,
  agentsTable: databaseStack.agentsTable,
  creditsTable: databaseStack.creditsTable,
  transactionsTable: databaseStack.transactionsTable,
  promoCodesTable: databaseStack.promoCodesTable,
  cronJobsTable: databaseStack.cronJobsTable,
  cronRunsTable: databaseStack.cronRunsTable,
  cluster: agentRuntimeStack.cluster,
  taskDefinition: agentRuntimeStack.taskDefinition,
  taskExecutionRole: agentRuntimeStack.taskExecutionRole,
  taskRole: agentRuntimeStack.taskRole,
  vpc: networkStack.vpc,
  securityGroup: networkStack.ecsSecurityGroup,
  description: 'OpenClaw Cloud - API layer (Lambda functions, API Gateway)',
});

apiStack.addDependency(authStack);
apiStack.addDependency(databaseStack);
apiStack.addDependency(agentRuntimeStack);

// Frontend (depends on API + auth)
const frontendStack = new FrontendStack(app, 'OpenClawCloudFrontend', {
  apiUrl: apiStack.apiUrl,
  userPoolId: authStack.userPoolId,
  userPoolClientId: authStack.userPoolClientId,
  description: 'OpenClaw Cloud - Frontend (Amplify hosting)',
});

frontendStack.addDependency(apiStack);
frontendStack.addDependency(authStack);
