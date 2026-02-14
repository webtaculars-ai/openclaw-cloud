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
    
    // If no agentId, list all agents
    if (!agentId) {
      const agents = await dynamo.getAgentsByUser(userId);
      // Mask tokens
      const maskedAgents = agents.map(agent => ({
        ...agent,
        telegramBotToken: '***masked***',
      }));
      return response(200, { agents: maskedAgents });
    }

    // Get specific agent
    const agent = await dynamo.getAgent(userId, agentId);
    if (!agent) {
      return response(404, { error: 'Agent not found' });
    }

    // Sync with ECS if running
    if (agent.status === 'running' && agent.taskArn) {
      const ecsStatus = await ecs.describeTask(agent.taskArn);
      
      if (ecsStatus === 'STOPPED') {
        await dynamo.updateAgentStatus(userId, agentId, 'stopped', null);
        agent.status = 'stopped';
        agent.taskArn = undefined;
      }
    }

    // Mask token in response
    const maskedAgent = {
      ...agent,
      telegramBotToken: '***masked***',
    };

    return response(200, maskedAgent);
  } catch (error: any) {
    console.error('Error getting agent:', error);
    return response(500, { error: 'Internal server error', message: error.message });
  }
}
