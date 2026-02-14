import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  UpdateCommand,
  QueryCommand,
} from '@aws-sdk/lib-dynamodb';
import { User, Agent, Credits, Transaction, AgentStatus } from '../types';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const USERS_TABLE = process.env.USERS_TABLE!;
const AGENTS_TABLE = process.env.AGENTS_TABLE!;
const CREDITS_TABLE = process.env.CREDITS_TABLE!;
const TRANSACTIONS_TABLE = process.env.TRANSACTIONS_TABLE!;

// Users
export async function createUser(user: User): Promise<void> {
  await docClient.send(new PutCommand({
    TableName: USERS_TABLE,
    Item: user,
  }));
}

export async function getUser(userId: string): Promise<User | null> {
  const result = await docClient.send(new GetCommand({
    TableName: USERS_TABLE,
    Key: { userId },
  }));
  return result.Item as User | null;
}

// Agents
export async function createAgent(agent: Agent): Promise<void> {
  await docClient.send(new PutCommand({
    TableName: AGENTS_TABLE,
    Item: agent,
  }));
}

export async function getAgent(userId: string, agentId: string): Promise<Agent | null> {
  const result = await docClient.send(new GetCommand({
    TableName: AGENTS_TABLE,
    Key: { userId, agentId },
  }));
  return result.Item as Agent | null;
}

export async function updateAgentStatus(
  userId: string,
  agentId: string,
  status: AgentStatus,
  taskArn: string | null
): Promise<void> {
  await docClient.send(new UpdateCommand({
    TableName: AGENTS_TABLE,
    Key: { userId, agentId },
    UpdateExpression: 'SET #status = :status, taskArn = :taskArn, lastActiveAt = :now',
    ExpressionAttributeNames: {
      '#status': 'status',
    },
    ExpressionAttributeValues: {
      ':status': status,
      ':taskArn': taskArn,
      ':now': new Date().toISOString(),
    },
  }));
}

export async function updateAgentToken(
  userId: string,
  agentId: string,
  token: string
): Promise<void> {
  await docClient.send(new UpdateCommand({
    TableName: AGENTS_TABLE,
    Key: { userId, agentId },
    UpdateExpression: 'SET telegramBotToken = :token, lastActiveAt = :now',
    ExpressionAttributeValues: {
      ':token': token,
      ':now': new Date().toISOString(),
    },
  }));
}

export async function getAgentsByUser(userId: string): Promise<Agent[]> {
  const result = await docClient.send(new QueryCommand({
    TableName: AGENTS_TABLE,
    KeyConditionExpression: 'userId = :userId',
    ExpressionAttributeValues: {
      ':userId': userId,
    },
  }));
  return (result.Items || []) as Agent[];
}

// Credits
export async function getCredits(userId: string): Promise<Credits | null> {
  const result = await docClient.send(new GetCommand({
    TableName: CREDITS_TABLE,
    Key: { userId },
  }));
  return result.Item as Credits | null;
}

export async function initializeCredits(userId: string, balanceCents: number): Promise<void> {
  await docClient.send(new PutCommand({
    TableName: CREDITS_TABLE,
    Item: {
      userId,
      balanceCents,
      totalUsedCents: 0,
    },
  }));
}

export async function addCredits(userId: string, amountCents: number): Promise<void> {
  await docClient.send(new UpdateCommand({
    TableName: CREDITS_TABLE,
    Key: { userId },
    UpdateExpression: 'SET balanceCents = if_not_exists(balanceCents, :zero) + :amount',
    ExpressionAttributeValues: {
      ':zero': 0,
      ':amount': amountCents,
    },
  }));
}

// Transactions
export async function createTransaction(txn: Transaction): Promise<void> {
  await docClient.send(new PutCommand({
    TableName: TRANSACTIONS_TABLE,
    Item: txn,
  }));
}

export async function getTransactions(userId: string, limit: number = 50): Promise<Transaction[]> {
  const result = await docClient.send(new QueryCommand({
    TableName: TRANSACTIONS_TABLE,
    KeyConditionExpression: 'userId = :userId',
    ExpressionAttributeValues: {
      ':userId': userId,
    },
    Limit: limit,
    ScanIndexForward: false, // Most recent first
  }));
  return (result.Items || []) as Transaction[];
}
