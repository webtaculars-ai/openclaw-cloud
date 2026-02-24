import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { EventBridgeClient, PutRuleCommand, PutTargetsCommand, RemoveTargetsCommand, ListTargetsByRuleCommand, DeleteRuleCommand } from '@aws-sdk/client-eventbridge';
import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

const dynamoClient = new DynamoDBClient({ region: process.env.AWS_REGION || 'ap-south-1' });
const dynamo = DynamoDBDocumentClient.from(dynamoClient);
const eventBridge = new EventBridgeClient({ region: process.env.AWS_REGION || 'ap-south-1' });

interface CronSchedule {
  type: 'daily' | 'hourly' | 'weekly' | 'custom';
  time?: string;
  dayOfWeek?: string;
  timezone?: string;
  cronExpression?: string;
}

function scheduleToEventBridgeCron(schedule: CronSchedule): string {
  switch (schedule.type) {
    case 'hourly':
      return 'rate(1 hour)';
    
    case 'daily': {
      if (!schedule.time) throw new Error('time is required for daily schedule');
      const [hour, minute] = schedule.time.split(':');
      return `cron(${minute} ${hour} * * ? *)`;
    }
    
    case 'weekly': {
      if (!schedule.time || !schedule.dayOfWeek) {
        throw new Error('time and dayOfWeek are required for weekly schedule');
      }
      const [hour, minute] = schedule.time.split(':');
      const dayMap: Record<string, string> = {
        'MON': '2', 'TUE': '3', 'WED': '4', 'THU': '5', 
        'FRI': '6', 'SAT': '7', 'SUN': '1'
      };
      const day = dayMap[schedule.dayOfWeek.toUpperCase()] || '2';
      return `cron(${minute} ${hour} ? * ${day} *)`;
    }
    
    case 'custom': {
      if (!schedule.cronExpression) {
        throw new Error('cronExpression is required for custom schedule');
      }
      return schedule.cronExpression;
    }
    
    default:
      throw new Error(`Unsupported schedule type: ${schedule.type}`);
  }
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

    // Parse input
    const body = JSON.parse(event.body || '{}');
    const { name, schedule, message, enabled } = body;

    // Get existing job
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

    // Build update expression
    const updates: string[] = [];
    const expressionAttributeNames: Record<string, string> = {};
    const expressionAttributeValues: Record<string, any> = {};

    if (name !== undefined) {
      updates.push('#name = :name');
      expressionAttributeNames['#name'] = 'name';
      expressionAttributeValues[':name'] = name;
    }

    if (message !== undefined) {
      updates.push('message = :message');
      expressionAttributeValues[':message'] = message;
    }

    if (enabled !== undefined) {
      updates.push('enabled = :enabled');
      expressionAttributeValues[':enabled'] = enabled;
    }

    // Handle schedule update (requires EventBridge rule update)
    let scheduleChanged = false;
    if (schedule) {
      updates.push('schedule = :schedule');
      expressionAttributeValues[':schedule'] = schedule;
      scheduleChanged = true;
    }

    if (updates.length === 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'No fields to update' }),
      };
    }

    // Update EventBridge rule if schedule changed or enabled state changed
    if (scheduleChanged || enabled !== undefined) {
      const ruleName = job.eventBridgeRuleName;
      const newSchedule = schedule || job.schedule;
      const isEnabled = enabled !== undefined ? enabled : job.enabled;
      
      try {
        const cronExpression = scheduleToEventBridgeCron(newSchedule);

        // Update the rule
        await eventBridge.send(new PutRuleCommand({
          Name: ruleName,
          Description: `Cron job: ${name || job.name}`,
          ScheduleExpression: cronExpression,
          State: isEnabled ? 'ENABLED' : 'DISABLED',
        }));

        // Re-add targets (required after rule update)
        const executeLambdaArn = process.env.EXECUTE_CRON_LAMBDA_ARN;
        if (executeLambdaArn) {
          // Remove existing targets
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

          // Add target
          await eventBridge.send(new PutTargetsCommand({
            Rule: ruleName,
            Targets: [{
              Id: '1',
              Arn: executeLambdaArn,
              Input: JSON.stringify({ jobId }),
            }],
          }));
        }
      } catch (error: any) {
        console.error('Error updating EventBridge rule:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({
            error: 'Failed to update EventBridge rule',
            message: error.message,
          }),
        };
      }
    }

    // Update DynamoDB
    await dynamo.send(new UpdateCommand({
      TableName: process.env.CRON_JOBS_TABLE || 'openclaw-cron-jobs',
      Key: { userId, jobId },
      UpdateExpression: `SET ${updates.join(', ')}`,
      ExpressionAttributeNames: Object.keys(expressionAttributeNames).length > 0 
        ? expressionAttributeNames 
        : undefined,
      ExpressionAttributeValues: expressionAttributeValues,
    }));

    // Get updated job
    const updatedResult = await dynamo.send(new GetCommand({
      TableName: process.env.CRON_JOBS_TABLE || 'openclaw-cron-jobs',
      Key: { userId, jobId },
    }));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        job: {
          jobId: updatedResult.Item?.jobId,
          agentId: updatedResult.Item?.agentId,
          name: updatedResult.Item?.name,
          schedule: updatedResult.Item?.schedule,
          message: updatedResult.Item?.message,
          enabled: updatedResult.Item?.enabled,
          lastRun: updatedResult.Item?.lastRun,
          createdAt: updatedResult.Item?.createdAt,
        },
      }),
    };

  } catch (error: any) {
    console.error('Error updating cron job:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Failed to update cron job',
        message: error.message,
      }),
    };
  }
}
