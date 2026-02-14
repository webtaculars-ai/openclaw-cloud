import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as dynamo from '../services/dynamo';
import * as ecs from '../services/ecs';

function response(statusCode: number, body: any): APIGatewayProxyResult {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  };
}

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  try {
    const userId = event.requestContext.authorizer?.claims?.sub;
    if (!userId) {
      return response(401, { error: 'Unauthorized' });
    }

    const agentId = event.pathParameters?.agentId;
    if (!agentId) {
      return response(400, { error: 'agentId is required' });
    }

    // Get agent
    const agent = await dynamo.getAgent(userId, agentId);
    if (!agent) {
      return response(404, { error: 'Agent not found' });
    }

    // Check if already running
    if (agent.status === 'running') {
      return response(409, { error: 'Agent is already running', status: agent.status });
    }

    // Check credits
    const credits = await dynamo.getCredits(userId);
    if (!credits || credits.balanceCents <= 0) {
      return response(402, { error: 'Insufficient credits. Please recharge to continue.' });
    }

    // Start ECS task
    const taskArn = await ecs.runAgentTask({
      agentId,
      userId,
      telegramBotToken: agent.telegramBotToken,
      model: agent.model,
    });

    // Update status
    await dynamo.updateAgentStatus(userId, agentId, 'running', taskArn);

    return response(200, {
      status: 'running',
      taskArn,
    });
  } catch (error: any) {
    console.error('Error starting agent:', error);
    return response(500, { error: 'Internal server error', message: error.message });
  }
}
