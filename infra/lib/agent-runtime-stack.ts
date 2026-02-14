import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';

export interface AgentRuntimeStackProps extends cdk.StackProps {
  vpc: ec2.IVpc;
  securityGroup: ec2.SecurityGroup;
  creditsTable: dynamodb.Table;
  transactionsTable: dynamodb.Table;
  agentsTable: dynamodb.Table;
}

export class AgentRuntimeStack extends cdk.Stack {
  public readonly cluster: ecs.Cluster;
  public readonly taskDefinition: ecs.FargateTaskDefinition;
  public readonly taskExecutionRole: iam.Role;
  public readonly taskRole: iam.Role;
  public readonly repository: ecr.Repository;

  constructor(scope: Construct, id: string, props: AgentRuntimeStackProps) {
    super(scope, id, props);

    // ECR Repository
    this.repository = new ecr.Repository(this, 'AgentRepository', {
      repositoryName: 'openclaw-agent',
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      lifecycleRules: [
        {
          maxImageCount: 10,
          description: 'Keep last 10 images',
        },
      ],
    });

    // ECS Cluster
    this.cluster = new ecs.Cluster(this, 'AgentCluster', {
      clusterName: 'openclaw-agents',
      vpc: props.vpc,
      containerInsights: true,
    });

    // Task Execution Role
    this.taskExecutionRole = new iam.Role(this, 'TaskExecutionRole', {
      assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AmazonECSTaskExecutionRolePolicy'),
      ],
    });

    // Task Role
    this.taskRole = new iam.Role(this, 'TaskRole', {
      assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
    });

    // Bedrock permissions (scoped to specific models)
    this.taskRole.addToPolicy(new iam.PolicyStatement({
      actions: [
        'bedrock:InvokeModel',
        'bedrock:InvokeModelWithResponseStream',
      ],
      resources: [
        `arn:aws:bedrock:*::foundation-model/anthropic.claude-sonnet-4-5-20250929-v1:0`,
        `arn:aws:bedrock:*::foundation-model/anthropic.claude-haiku-3-5-20241022-v1:0`,
      ],
    }));

    // DynamoDB permissions
    props.creditsTable.grantReadWriteData(this.taskRole);
    props.transactionsTable.grantWriteData(this.taskRole);
    props.agentsTable.grantReadWriteData(this.taskRole);

    // ECS stop task permission (self-stop)
    this.taskRole.addToPolicy(new iam.PolicyStatement({
      actions: ['ecs:StopTask'],
      resources: ['*'],
      conditions: {
        ArnEquals: {
          'ecs:cluster': this.cluster.clusterArn,
        },
      },
    }));

    // Log Group
    const logGroup = new logs.LogGroup(this, 'AgentLogGroup', {
      logGroupName: '/openclaw/agents',
      retention: logs.RetentionDays.TWO_WEEKS,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    // Fargate Task Definition
    this.taskDefinition = new ecs.FargateTaskDefinition(this, 'TaskDefinition', {
      memoryLimitMiB: 512,
      cpu: 256,
      executionRole: this.taskExecutionRole,
      taskRole: this.taskRole,
    });

    // Container Definition
    const container = this.taskDefinition.addContainer('agent', {
      image: ecs.ContainerImage.fromEcrRepository(this.repository),
      logging: ecs.LogDrivers.awsLogs({
        streamPrefix: 'openclaw-agent',
        logGroup,
      }),
      environment: {
        AWS_REGION: cdk.Stack.of(this).region,
        CREDITS_TABLE: props.creditsTable.tableName,
        TRANSACTIONS_TABLE: props.transactionsTable.tableName,
        AGENTS_TABLE: props.agentsTable.tableName,
        ECS_CLUSTER: this.cluster.clusterName,
      },
      healthCheck: {
        command: ['CMD-SHELL', 'curl -sf http://localhost:8080/health || exit 1'],
        interval: cdk.Duration.seconds(30),
        timeout: cdk.Duration.seconds(5),
        retries: 3,
      },
    });

    container.addPortMappings({
      containerPort: 8080,
      protocol: ecs.Protocol.TCP,
    });

    // Exports
    new cdk.CfnOutput(this, 'ClusterArn', {
      value: this.cluster.clusterArn,
      exportName: 'OpenClawClusterArn',
    });

    new cdk.CfnOutput(this, 'TaskDefinitionArn', {
      value: this.taskDefinition.taskDefinitionArn,
      exportName: 'OpenClawTaskDefinitionArn',
    });

    new cdk.CfnOutput(this, 'RepositoryUri', {
      value: this.repository.repositoryUri,
      exportName: 'OpenClawRepositoryUri',
    });
  }
}
