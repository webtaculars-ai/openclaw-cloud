import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, UpdateCommand, PutCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({ region: process.env.AWS_REGION || 'ap-south-1' });
const docClient = DynamoDBDocumentClient.from(client);

const PROMO_CODES_TABLE = process.env.PROMO_CODES_TABLE || 'openclaw-promo-codes';
const CREDITS_TABLE = process.env.CREDITS_TABLE || 'openclaw-credits';
const TRANSACTIONS_TABLE = process.env.TRANSACTIONS_TABLE || 'openclaw-transactions';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Allow-Methods': 'POST,OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    // Get userId from Cognito authorizer
    const userId = event.requestContext.authorizer?.claims.sub;
    if (!userId) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Unauthorized' })
      };
    }

    const body = JSON.parse(event.body || '{}');
    const { code } = body;

    if (!code || typeof code !== 'string') {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Promo code is required and must be a string' })
      };
    }

    // Sanitize and validate code format
    const sanitizedCode = code.trim().toUpperCase();
    if (!/^[A-Z0-9-]{5,50}$/.test(sanitizedCode)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid promo code format' })
      };
    }

    // 1. Get promo code from DynamoDB
    const promoResult = await docClient.send(new GetCommand({
      TableName: PROMO_CODES_TABLE,
      Key: { code: sanitizedCode }
    }));

    if (!promoResult.Item) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'Invalid promo code' })
      };
    }

    const promo = promoResult.Item;

    // 2. Validate promo code
    if (!promo.isActive) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Promo code is no longer active' })
      };
    }

    if (new Date(promo.expiresAt) < new Date()) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Promo code has expired' })
      };
    }

    if (promo.maxUses && promo.usedCount >= promo.maxUses) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Promo code has been fully redeemed' })
      };
    }

    if (promo.usedBy && promo.usedBy.includes(userId)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'You have already used this promo code' })
      };
    }

    // 3. Add credits to user
    const creditsAmount = promo.bonusAmount; // In cents
    
    // Get current balance
    const currentCredits = await docClient.send(new GetCommand({
      TableName: CREDITS_TABLE,
      Key: { userId }
    }));

    const currentBalance = currentCredits.Item?.balance || 0;
    const newBalance = currentBalance + creditsAmount;

    // Update user credits
    await docClient.send(new UpdateCommand({
      TableName: CREDITS_TABLE,
      Key: { userId },
      UpdateExpression: 'SET balance = :newBalance, updatedAt = :now',
      ExpressionAttributeValues: {
        ':newBalance': newBalance,
        ':now': new Date().toISOString()
      }
    }));

    // 4. Record transaction
    const txnId = `promo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    await docClient.send(new PutCommand({
      TableName: TRANSACTIONS_TABLE,
      Item: {
        userId,
        txnId,
        type: 'promo_code',
        amountCents: creditsAmount,
        description: `Promo code: ${sanitizedCode} - ${promo.description || 'Bonus credits'}`,
        promoCode: sanitizedCode,
        createdAt: new Date().toISOString()
      }
    }));

    // 5. Mark promo code as used (with race condition protection)
    const usedBy = promo.usedBy || [];
    usedBy.push(userId);
    
    try {
      await docClient.send(new UpdateCommand({
        TableName: PROMO_CODES_TABLE,
        Key: { code: sanitizedCode },
        UpdateExpression: 'SET usedCount = :newCount, usedBy = :usedBy',
        ConditionExpression: 'NOT contains(usedBy, :userId)', // Prevent double-redemption
        ExpressionAttributeValues: {
          ':newCount': (promo.usedCount || 0) + 1,
          ':usedBy': usedBy,
          ':userId': userId
        }
      }));
    } catch (error: any) {
      if (error.name === 'ConditionalCheckFailedException') {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'You have already used this promo code' })
        };
      }
      throw error; // Re-throw other errors
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        creditsAdded: creditsAmount,
        newBalance,
        message: `Successfully added $${(creditsAmount / 100).toFixed(2)} credits!`
      })
    };

  } catch (error: any) {
    console.error('Promo redemption error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to redeem promo code',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    };
  }
};
