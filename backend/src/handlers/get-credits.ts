import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as dynamo from '../services/dynamo';

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

    // Get credits
    const credits = await dynamo.getCredits(userId);
    
    // Get recent transactions
    const transactions = await dynamo.getTransactions(userId, 50);

    return response(200, {
      balance: credits?.balanceCents || 0,
      totalUsed: credits?.totalUsedCents || 0,
      transactions,
    });
  } catch (error: any) {
    console.error('Error getting credits:', error);
    return response(500, { error: 'Internal server error', message: error.message });
  }
}
