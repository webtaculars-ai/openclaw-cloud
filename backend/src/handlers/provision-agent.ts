import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { ulid } from 'ulid';
import * as dynamo from '../services/dynamo';
import * as ecs from '../services/ecs';
import { DEFAULT_MODEL } from '../types';

function response(statusCode: number, body: any): APIGatewayProxyResult {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  };
}

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  try {
    // Extract userId from Cognito claims
    const userId = event.requestContext.authorizer?.claims?.sub;
    if (!userId) {
      return response(401, { error: 'Unauthorized' });
    }

    // Parse request body
    const body = JSON.parse(event.body || '{}');
    const { telegramBotToken, model = DEFAULT_MODEL } = body;

    // Validate token
    if (!telegramBotToken || typeof telegramBotToken !== 'string') {
      return response(400, { error: 'telegramBotToken is required' });
    }

    // Check MVP limit: max 1 agent per user
    const existingAgents = await dynamo.getAgentsByUser(userId);
    if (existingAgents.length > 0) {
      return response(409, { error: 'User already has an agent (MVP limit: 1 agent per user)' });
    }

    // Check credits
    const credits = await dynamo.getCredits(userId);
    if (!credits || credits.balanceCents <= 0) {
      return response(402, { error: 'Insufficient credits. Please recharge to continue.' });
    }

    // Generate agent ID
    const agentId = ulid();
    const now = new Date().toISOString();

    // Create agent record with provisioning status
    await dynamo.createAgent({
      userId,
      agentId,
      status: 'provisioning',
      telegramBotToken,
      model,
      createdAt: now,
      lastActiveAt: now,
    });

    // Start ECS task
    const taskArn = await ecs.runAgentTask({
      agentId,
      userId,
      telegramBotToken,
      model,
    });

    // Update agent status to running
    await dynamo.updateAgentStatus(userId, agentId, 'running', taskArn);

    return response(201, {
      agentId,
      status: 'running',
      taskArn,
    });
  } catch (error: any) {
    console.error('Error provisioning agent:', error);
    return response(500, { error: 'Internal server error', message: error.message });
  }
}
