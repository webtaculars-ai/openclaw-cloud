import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { EventBridgeClient, DeleteRuleCommand, RemoveTargetsCommand, ListTargetsByRuleCommand } from '@aws-sdk/client-eventbridge';
import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

const dynamoClient = new DynamoDBClient({ region: process.env.AWS_REGION || 'ap-south-1' });
const dynamo = DynamoDBDocumentClient.from(dynamoClient);
const eventBridge = new EventBridgeClient({ region: process.env.AWS_REGION || 'ap-south-1' });

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

    // Delete EventBridge rule
    const ruleName = job.eventBridgeRuleName;
    if (ruleName) {
      try {
        // First, remove all targets from the rule
        const targetsResult = await eventBridge.send(new ListTargetsByRuleCommand({
          Rule: ruleName,
        }));

        if (targetsResult.Targets && targetsResult.Targets.length > 0) {
          const targetIds = targetsResult.Targets.map(t => t.Id!);
          await eventBridge.send(new RemoveTargetsCommand({
            Rule: ruleName,
            Ids: targetIds,
          }));
        }

        // Then delete the rule
        await eventBridge.send(new DeleteRuleCommand({
          Name: ruleName,
        }));
      } catch (error: any) {
        console.error('Error deleting EventBridge rule:', error);
        // Continue with DynamoDB deletion even if EventBridge fails
      }
    }

    // Delete from DynamoDB
    await dynamo.send(new DeleteCommand({
      TableName: process.env.CRON_JOBS_TABLE || 'openclaw-cron-jobs',
      Key: { userId, jobId },
    }));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Cron job deleted successfully',
      }),
    };

  } catch (error: any) {
    console.error('Error deleting cron job:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Failed to delete cron job',
        message: error.message,
      }),
    };
  }
}
