import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as dynamo from '../services/dynamo';
import * as ecs from '../services/ecs';

function response(statusCode: number, body: any): APIGatewayProxyResult {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
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

    // If already stopped, return current status (idempotent)
    if (agent.status === 'stopped' || agent.status === 'stopped_no_credits') {
      return response(200, { status: agent.status });
    }

    // Stop ECS task if it exists
    if (agent.taskArn) {
      try {
        await ecs.stopAgentTask(agent.taskArn);
      } catch (error) {
        console.warn('Failed to stop ECS task, continuing:', error);
      }
    }

    // Update status
    await dynamo.updateAgentStatus(userId, agentId, 'stopped', null);

    return response(200, { status: 'stopped' });
  } catch (error: any) {
    console.error('Error stopping agent:', error);
    return response(500, { error: 'Internal server error', message: error.message });
  }
}
