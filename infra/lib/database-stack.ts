import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';

export class DatabaseStack extends cdk.Stack {
  public readonly usersTable: dynamodb.Table;
  public readonly agentsTable: dynamodb.Table;
  public readonly creditsTable: dynamodb.Table;
  public readonly transactionsTable: dynamodb.Table;

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
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    // Transactions table (composite key: userId + txnId)
    this.transactionsTable = new dynamodb.Table(this, 'TransactionsTable', {
      tableName: 'openclaw-transactions',
      partitionKey: { name: 'userId', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'txnId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      encryption: dynamodb.TableEncryption.AWS_MANAGED,
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
  }
}
