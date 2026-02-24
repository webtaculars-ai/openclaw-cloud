import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';

export class DatabaseStack extends cdk.Stack {
  public readonly usersTable: dynamodb.Table;
  public readonly agentsTable: dynamodb.Table;
  public readonly creditsTable: dynamodb.Table;
  public readonly transactionsTable: dynamodb.Table;
  public readonly promoCodesTable: dynamodb.Table;
  public readonly cronJobsTable: dynamodb.Table;
  public readonly cronRunsTable: dynamodb.Table;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Users table
    this.usersTable = new dynamodb.Table(this, 'UsersTable', {
      tableName: 'openclaw-users',
      partitionKey: { name: 'userId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      encryption: dynamodb.TableEncryption.AWS_MANAGED,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    // Agents table (composite key: userId + agentId)
    this.agentsTable = new dynamodb.Table(this, 'AgentsTable', {
      tableName: 'openclaw-agents',
      partitionKey: { name: 'userId', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'agentId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      encryption: dynamodb.TableEncryption.AWS_MANAGED,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    // Credits table
    this.creditsTable = new dynamodb.Table(this, 'CreditsTable', {
      tableName: 'openclaw-credits',
      partitionKey: { name: 'userId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      encryption: dynamodb.TableEncryption.AWS_MANAGED,
      pointInTimeRecovery: true, // Enable backup
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    // Transactions table (composite key: userId + txnId)
    this.transactionsTable = new dynamodb.Table(this, 'TransactionsTable', {
      tableName: 'openclaw-transactions',
      partitionKey: { name: 'userId', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'txnId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      encryption: dynamodb.TableEncryption.AWS_MANAGED,
      pointInTimeRecovery: true, // Enable backup
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    // Promo Codes table
    this.promoCodesTable = new dynamodb.Table(this, 'PromoCodesTable', {
      tableName: 'openclaw-promo-codes',
      partitionKey: { name: 'code', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      encryption: dynamodb.TableEncryption.AWS_MANAGED,
      pointInTimeRecovery: true, // Enable backup
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    // Cron Jobs table (composite key: userId + jobId)
    this.cronJobsTable = new dynamodb.Table(this, 'CronJobsTable', {
      tableName: 'openclaw-cron-jobs',
      partitionKey: { name: 'userId', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'jobId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      encryption: dynamodb.TableEncryption.AWS_MANAGED,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    // Add GSI for querying by agentId
    this.cronJobsTable.addGlobalSecondaryIndex({
      indexName: 'agentId-index',
      partitionKey: { name: 'agentId', type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // Add GSI for querying by jobId (for EventBridge executions)
    this.cronJobsTable.addGlobalSecondaryIndex({
      indexName: 'jobId-index',
      partitionKey: { name: 'jobId', type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // Cron Runs table (composite key: jobId + runTimestamp)
    this.cronRunsTable = new dynamodb.Table(this, 'CronRunsTable', {
      tableName: 'openclaw-cron-runs',
      partitionKey: { name: 'jobId', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'runTimestamp', type: dynamodb.AttributeType.NUMBER },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      encryption: dynamodb.TableEncryption.AWS_MANAGED,
      timeToLiveAttribute: 'ttl', // Auto-delete old runs after 30 days
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    // Exports
    new cdk.CfnOutput(this, 'UsersTableName', {
      value: this.usersTable.tableName,
      exportName: 'OpenClawUsersTableName',
    });

    new cdk.CfnOutput(this, 'AgentsTableName', {
      value: this.agentsTable.tableName,
      exportName: 'OpenClawAgentsTableName',
    });

    new cdk.CfnOutput(this, 'CreditsTableName', {
      value: this.creditsTable.tableName,
      exportName: 'OpenClawCreditsTableName',
    });

    new cdk.CfnOutput(this, 'TransactionsTableName', {
      value: this.transactionsTable.tableName,
      exportName: 'OpenClawTransactionsTableName',
    });

    new cdk.CfnOutput(this, 'PromoCodesTableName', {
      value: this.promoCodesTable.tableName,
      exportName: 'OpenClawPromoCodesTableName',
    });

    new cdk.CfnOutput(this, 'CronJobsTableName', {
      value: this.cronJobsTable.tableName,
      exportName: 'OpenClawCronJobsTableName',
    });

    new cdk.CfnOutput(this, 'CronRunsTableName', {
      value: this.cronRunsTable.tableName,
      exportName: 'OpenClawCronRunsTableName',
    });
  }
}
