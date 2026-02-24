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

    // Query agents table for this user
    const result = await dynamo.send(new QueryCommand({
      TableName: process.env.AGENTS_TABLE || 'openclaw-agents',
      KeyConditionExpression: 'userId = :uid',
      ExpressionAttributeValues: {
        ':uid': userId,
      },
    }));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        agents: result.Items || [],
      }),
    };

  } catch (error: any) {
    console.error('Error listing agents:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Failed to list agents',
        message: error.message,
      }),
    };
  }
}
