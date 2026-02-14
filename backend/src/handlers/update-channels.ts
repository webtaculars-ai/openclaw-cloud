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

    // Parse body
    const body = JSON.parse(event.body || '{}');
    const { telegramBotToken } = body;

    // Validate token
    if (!telegramBotToken || typeof telegramBotToken !== 'string') {
      return response(400, { error: 'telegramBotToken is required' });
    }

    // Validate token format (basic check)
    if (!/^\d+:[A-Za-z0-9_-]+$/.test(telegramBotToken)) {
      return response(400, { error: 'Invalid token format' });
    }

    // Get agent
    const agent = await dynamo.getAgent(userId, agentId);
    if (!agent) {
      return response(404, { error: 'Agent not found' });
    }

    // Update token
    await dynamo.updateAgentToken(userId, agentId, telegramBotToken);

    let restarted = false;

    // If agent is running, restart it with new token
    if (agent.status === 'running' && agent.taskArn) {
      try {
        // Stop old task
        await ecs.stopAgentTask(agent.taskArn);
        
        // Start new task with updated token
        const newTaskArn = await ecs.runAgentTask({
          agentId,
          userId,
          telegramBotToken,
          model: agent.model,
        });

        await dynamo.updateAgentStatus(userId, agentId, 'running', newTaskArn);
        restarted = true;
      } catch (error) {
        console.error('Failed to restart agent:', error);
        await dynamo.updateAgentStatus(userId, agentId, 'error', null);
        return response(500, { error: 'Failed to restart agent with new token' });
      }
    }

    return response(200, {
      status: agent.status,
      restarted,
    });
  } catch (error: any) {
    console.error('Error updating channels:', error);
    return response(500, { error: 'Internal server error', message: error.message });
  }
}
