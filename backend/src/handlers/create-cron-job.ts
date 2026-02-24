import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { EventBridgeClient, PutRuleCommand, PutTargetsCommand } from '@aws-sdk/client-eventbridge';
import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { randomUUID } from 'crypto';

const dynamoClient = new DynamoDBClient({ region: process.env.AWS_REGION || 'ap-south-1' });
const dynamo = DynamoDBDocumentClient.from(dynamoClient);
const eventBridge = new EventBridgeClient({ region: process.env.AWS_REGION || 'ap-south-1' });

interface CronSchedule {
  type: 'daily' | 'hourly' | 'weekly' | 'custom';
  time?: string; // HH:MM for daily/weekly
  dayOfWeek?: string; // For weekly (MON, TUE, etc)
  timezone?: string;
  cronExpression?: string; // For custom
}

function scheduleToEventBridgeCron(schedule: CronSchedule): string {
  switch (schedule.type) {
    case 'hourly':
      return 'rate(1 hour)';
    
    case 'daily': {
      if (!schedule.time) throw new Error('time is required for daily schedule');
      const [hour, minute] = schedule.time.split(':');
      // EventBridge uses UTC, so this is a simplified version
      // TODO: Handle timezone conversion properly
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

    const agentId = event.pathParameters?.agentId;
    if (!agentId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'agentId is required' }),
      };
    }

    // Parse and validate input
    const body = JSON.parse(event.body || '{}');
    const { name, schedule, message } = body;

    if (!name || !schedule || !message) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'name, schedule, and message are required' 
        }),
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

    const agent = agentResult.Items[0];

    // Generate job ID
    const jobId = `job-${randomUUID()}`;
    const eventBridgeRuleName = `openpaw-cron-${jobId}`;
    const now = Date.now();

    // Convert schedule to EventBridge cron expression
    const cronExpression = scheduleToEventBridgeCron(schedule);

    // Create EventBridge rule
    await eventBridge.send(new PutRuleCommand({
      Name: eventBridgeRuleName,
      Description: `Cron job: ${name}`,
      ScheduleExpression: cronExpression,
      State: 'ENABLED',
    }));

    // Add target to rule (Lambda that executes cron jobs)
    const executeLambdaArn = process.env.EXECUTE_CRON_LAMBDA_ARN;
    if (executeLambdaArn) {
      await eventBridge.send(new PutTargetsCommand({
        Rule: eventBridgeRuleName,
        Targets: [{
          Id: '1',
          Arn: executeLambdaArn,
          Input: JSON.stringify({ jobId }),
        }],
      }));
    }

    // Store in DynamoDB
    const jobItem = {
      userId,
      jobId,
      agentId,
      name,
      schedule,
      message,
      enabled: true,
      lastRun: null,
      createdAt: now,
      eventBridgeRuleName,
      botToken: agent.botToken, // Store for execution
    };

    await dynamo.send(new PutCommand({
      TableName: process.env.CRON_JOBS_TABLE || 'openclaw-cron-jobs',
      Item: jobItem,
    }));

    return {
      statusCode: 201,
      headers,
      body: JSON.stringify({
        job: {
          jobId,
          agentId,
          name,
          schedule,
          message,
          enabled: true,
          lastRun: null,
          createdAt: now,
        },
      }),
    };

  } catch (error: any) {
    console.error('Error creating cron job:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Failed to create cron job',
        message: error.message,
      }),
    };
  }
}
