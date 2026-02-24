import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand } from '@aws-sdk/lib-dynamodb';
import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

const client = new DynamoDBClient({ region: process.env.AWS_REGION || 'ap-south-1' });
const dynamo = DynamoDBDocumentClient.from(client);

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

    const agentId = event.pathParameters?.agentId;
    if (!agentId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'agentId is required' }),
      };
    }

    // Verify agent belongs to user
    const agentResult = await dynamo.send(new QueryCommand({
      TableName: process.env.AGENTS_TABLE || 'openclaw-agents',
      KeyConditionExpression: 'userId = :uid AND agentId = :aid',
      ExpressionAttributeValues: {
        ':uid': userId,
        ':aid': agentId,
      },
    }));

    if (!agentResult.Items || agentResult.Items.length === 0) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'Agent not found' }),
      };
    }

    // Query cron jobs for this user
    const result = await dynamo.send(new QueryCommand({
      TableName: process.env.CRON_JOBS_TABLE || 'openclaw-cron-jobs',
      KeyConditionExpression: 'userId = :uid',
      ExpressionAttributeValues: {
        ':uid': userId,
      },
    }));

    // Filter by agentId if needed (or use GSI)
    const jobs = (result.Items || []).filter(job => job.agentId === agentId);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        jobs: jobs.map(job => ({
          jobId: job.jobId,
          agentId: job.agentId,
          name: job.name,
          schedule: job.schedule,
          message: job.message,
          enabled: job.enabled,
          lastRun: job.lastRun,
          createdAt: job.createdAt,
        })),
      }),
    };

  } catch (error: any) {
    console.error('Error listing cron jobs:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Failed to list cron jobs',
        message: error.message,
      }),
    };
  }
}
