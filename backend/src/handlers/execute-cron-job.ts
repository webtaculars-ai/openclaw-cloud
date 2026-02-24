import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, UpdateCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import fetch from 'node-fetch';

const dynamoClient = new DynamoDBClient({ region: process.env.AWS_REGION || 'ap-south-1' });
const dynamo = DynamoDBDocumentClient.from(dynamoClient);

/**
 * EventBridge-triggered Lambda that executes scheduled cron jobs
 */

interface EventBridgeEvent {
  jobId: string;
}

/**
 * Send message to Telegram bot
 * In production, this should use OpenClaw's native cron or messaging API
 */
async function sendTelegramMessage(botToken: string, chatId: string, message: string): Promise<void> {
  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Telegram API error: ${error}`);
  }
}

export async function handler(event: EventBridgeEvent): Promise<void> {
  const startTime = Date.now();
  const { jobId } = event;

  console.log(`[CRON EXECUTION] Starting job ${jobId}`);

  try {
    // Get job details from DynamoDB
    // We need to query by jobId, but table is keyed by userId + jobId
    // This requires a GSI or we need to store userId in the event
    
    // For now, we'll use a scan (not efficient, but works for MVP)
    // TODO: Add GSI on jobId for efficient lookups
    
    // Alternative: Store userId in EventBridge event input
    const tableName = process.env.CRON_JOBS_TABLE || 'openclaw-cron-jobs';
    
    // This is a placeholder - we need the userId to get the job
    // In production, include userId in EventBridge target input:
    // Input: JSON.stringify({ jobId, userId })
    
    console.error('[ERROR] Cannot query job without userId - EventBridge event needs userId');
    console.error('[WORKAROUND] Need to add GSI on jobId or include userId in event');
    
    // For MVP, we'll just log this limitation
    console.log(`[CRON EXECUTION] Job ${jobId} execution skipped - userId not available`);
    
    return;

    /* 
    // This is what the code would look like with userId:
    
    const result = await dynamo.send(new GetCommand({
      TableName: tableName,
      Key: { userId, jobId },
    }));

    if (!result.Item) {
      console.error(`[ERROR] Job ${jobId} not found`);
      return;
    }

    const job = result.Item;

    // Check if job is still enabled
    if (!job.enabled) {
      console.log(`[SKIP] Job ${jobId} is disabled`);
      return;
    }

    // Send message to agent
    try {
      // Option A: Use Telegram API directly
      if (job.botToken && job.chatId) {
        await sendTelegramMessage(job.botToken, job.chatId, job.message);
      }
      
      // Option B: Use OpenClaw API (preferred)
      // await sendToOpenClawAgent(job.agentId, job.message);

      const duration = Date.now() - startTime;

      // Record successful run
      await dynamo.send(new PutCommand({
        TableName: process.env.CRON_RUNS_TABLE || 'openclaw-cron-runs',
        Item: {
          jobId,
          runTimestamp: startTime,
          status: 'success',
          duration,
        },
      }));

      // Update lastRun
      await dynamo.send(new UpdateCommand({
        TableName: tableName,
        Key: { userId, jobId },
        UpdateExpression: 'SET lastRun = :now',
        ExpressionAttributeValues: {
          ':now': startTime,
        },
      }));

      console.log(`[SUCCESS] Job ${jobId} completed in ${duration}ms`);

    } catch (error: any) {
      const duration = Date.now() - startTime;

      // Record failed run
      await dynamo.send(new PutCommand({
        TableName: process.env.CRON_RUNS_TABLE || 'openclaw-cron-runs',
        Item: {
          jobId,
          runTimestamp: startTime,
          status: 'failed',
          duration,
          error: error.message,
        },
      }));

      console.error(`[FAILED] Job ${jobId} failed:`, error);
      throw error;
    }
    */

  } catch (error: any) {
    console.error(`[ERROR] Job ${jobId} execution error:`, error);
    throw error;
  }
}
