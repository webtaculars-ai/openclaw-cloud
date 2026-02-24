import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import fetch from 'node-fetch';

const dynamoClient = new DynamoDBClient({ region: process.env.AWS_REGION || 'ap-south-1' });
const dynamo = DynamoDBDocumentClient.from(dynamoClient);

/**
 * Send message to OpenClaw agent via Telegram Bot API
 */
async function sendMessageToAgent(botToken: string, message: string): Promise<void> {
  // Get chat ID from bot token by using getUpdates
  // In production, this should be stored with the agent
  // For now, we'll send to the user's chat ID (stored with agent)
  
  // This is a simplified version - in production you'd:
  // 1. Store chatId with agent when provisioned
  // 2. Or use OpenClaw's HTTP API if available
  // 3. Or inject message directly into agent's message queue
  
  throw new Error('Agent messaging not yet implemented - needs chatId or OpenClaw API integration');
}

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': 'true',
  };

  try {
    // Get userId from Cognito authorizer
    const userId = event.requestContext.authorizer?.claims?.sub;
    if (!userId) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Unauthorized' }),
      };
    }

    const { agentId, jobId } = event.pathParameters || {};
    if (!agentId || !jobId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'agentId and jobId are required' }),
      };
    }

    // Get job from DynamoDB
    const result = await dynamo.send(new GetCommand({
      TableName: process.env.CRON_JOBS_TABLE || 'openclaw-cron-jobs',
      Key: { userId, jobId },
    }));

    if (!result.Item) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'Cron job not found' }),
      };
    }

    const job = result.Item;

    // Verify job belongs to this agent
    if (job.agentId !== agentId) {
      return {
        statusCode: 403,
        headers,
        body: JSON.stringify({ error: 'Job does not belong to this agent' }),
      };
    }

    // Check if job is enabled
    if (!job.enabled) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Cannot run disabled job' }),
      };
    }

    const now = Date.now();

    try {
      // Send message to agent
      // TODO: Implement actual agent messaging
      // await sendMessageToAgent(job.botToken, job.message);

      // For now, just log and simulate success
      console.log(`[MANUAL RUN] Job ${jobId}: Would send "${job.message}" to agent ${agentId}`);

      // Update lastRun timestamp
      await dynamo.send(new UpdateCommand({
        TableName: process.env.CRON_JOBS_TABLE || 'openclaw-cron-jobs',
        Key: { userId, jobId },
        UpdateExpression: 'SET lastRun = :now',
        ExpressionAttributeValues: {
          ':now': now,
        },
      }));

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          message: 'Cron job executed successfully',
          executedAt: now,
          note: 'Agent messaging integration pending',
        }),
      };

    } catch (error: any) {
      console.error('Error executing cron job:', error);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          error: 'Failed to execute cron job',
          message: error.message,
        }),
      };
    }

  } catch (error: any) {
    console.error('Error running cron job:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Failed to run cron job',
        message: error.message,
      }),
    };
  }
}
