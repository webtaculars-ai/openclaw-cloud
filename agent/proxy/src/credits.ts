import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { ECSClient, StopTaskCommand } from '@aws-sdk/client-ecs';
import { UsageRecord, BALANCE_REFRESH_MS } from './types';

const dynamoClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dynamoClient);
const ecsClient = new ECSClient({});

const AGENT_ID = process.env.AGENT_ID!;
const USER_ID = process.env.USER_ID!;
const CREDITS_TABLE = process.env.CREDITS_TABLE!;
const TRANSACTIONS_TABLE = process.env.TRANSACTIONS_TABLE!;
const AGENTS_TABLE = process.env.AGENTS_TABLE!;
const ECS_CLUSTER = process.env.ECS_CLUSTER!;

// In-memory state
let cachedBalanceCents = 0;
let lastBalanceRefresh = 0;
let pendingUsageCents = 0;
let pendingInputTokens = 0;
let pendingOutputTokens = 0;
let flushIntervalHandle: NodeJS.Timeout | null = null;

export async function refreshBalance(): Promise<void> {
  const result = await docClient.send(new GetCommand({
    TableName: CREDITS_TABLE,
    Key: { userId: USER_ID },
  }));

  if (result.Item) {
    cachedBalanceCents = result.Item.balanceCents || 0;
    lastBalanceRefresh = Date.now();
  }
}

export function getBalance(): number {
  return cachedBalanceCents - pendingUsageCents;
}

export async function checkBalance(): Promise<boolean> {
  // Refresh if stale
  if (Date.now() - lastBalanceRefresh > BALANCE_REFRESH_MS) {
    await refreshBalance();
  }

  return getBalance() > 0;
}

export function accumulateUsage(usage: UsageRecord): void {
  pendingUsageCents += usage.costCents;
  pendingInputTokens += usage.inputTokens;
  pendingOutputTokens += usage.outputTokens;
}

export async function flushUsage(): Promise<void> {
  if (pendingUsageCents <= 0) return;

  // Snapshot and reset
  const costToFlush = pendingUsageCents;
  const inputTokens = pendingInputTokens;
  const outputTokens = pendingOutputTokens;
  
  pendingUsageCents = 0;
  pendingInputTokens = 0;
  pendingOutputTokens = 0;

  try {
    // Update credits
    const updateResult = await docClient.send(new UpdateCommand({
      TableName: CREDITS_TABLE,
      Key: { userId: USER_ID },
      UpdateExpression: 'SET balanceCents = balanceCents - :cost, totalUsedCents = if_not_exists(totalUsedCents, :zero) + :cost',
      ExpressionAttributeValues: {
        ':cost': costToFlush,
        ':zero': 0,
      },
      ReturnValues: 'ALL_NEW',
    }));

    if (updateResult.Attributes) {
      cachedBalanceCents = updateResult.Attributes.balanceCents;
      lastBalanceRefresh = Date.now();
    }

    // Record transaction
    const txnId = `${Date.now()}-${AGENT_ID}`;
    await docClient.send(new UpdateCommand({
      TableName: TRANSACTIONS_TABLE,
      Key: { userId: USER_ID, txnId },
      UpdateExpression: 'SET #type = :type, amountCents = :amount, description = :desc, createdAt = :now',
      ExpressionAttributeNames: {
        '#type': 'type',
      },
      ExpressionAttributeValues: {
        ':type': 'usage',
        ':amount': -costToFlush,
        ':desc': `Agent usage: ${inputTokens} input + ${outputTokens} output tokens`,
        ':now': new Date().toISOString(),
      },
    }));
  } catch (error) {
    console.error('Failed to flush usage:', error);
    // Re-add to pending on failure
    pendingUsageCents += costToFlush;
    pendingInputTokens += inputTokens;
    pendingOutputTokens += outputTokens;
  }
}

export async function stopSelf(reason: string): Promise<void> {
  console.log(`Stopping self: ${reason}`);

  // Flush any remaining usage
  await flushUsage();

  // Update agent status
  const newStatus = reason === 'no_credits' ? 'stopped_no_credits' : 'stopped';
  
  try {
    await docClient.send(new UpdateCommand({
      TableName: AGENTS_TABLE,
      Key: { userId: USER_ID, agentId: AGENT_ID },
      UpdateExpression: 'SET #status = :status, taskArn = :null, lastActiveAt = :now',
      ExpressionAttributeNames: {
        '#status': 'status',
      },
      ExpressionAttributeValues: {
        ':status': newStatus,
        ':null': null,
        ':now': new Date().toISOString(),
      },
    }));
  } catch (error) {
    console.error('Failed to update agent status:', error);
  }

  // Get own task ARN and stop
  try {
    const metadataResponse = await fetch(`${process.env.ECS_CONTAINER_METADATA_URI_V4}/task`);
    const metadata = await metadataResponse.json();
    const taskArn = metadata.TaskARN;

    await ecsClient.send(new StopTaskCommand({
      cluster: ECS_CLUSTER,
      task: taskArn,
      reason,
    }));
  } catch (error) {
    console.error('Failed to stop ECS task, falling back to process exit:', error);
    process.exit(0);
  }
}

export function startFlushInterval(): void {
  flushIntervalHandle = setInterval(() => {
    flushUsage().catch(err => console.error('Flush interval error:', err));
  }, 30_000); // 30 seconds
}

export function stopFlushInterval(): void {
  if (flushIntervalHandle) {
    clearInterval(flushIntervalHandle);
    flushIntervalHandle = null;
  }
}
