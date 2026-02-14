import { fetchAuthSession } from 'aws-amplify/auth';

const API_URL = process.env.REACT_APP_API_URL || '';
const MOCK_MODE = !API_URL || process.env.REACT_APP_MOCK_MODE === 'true';

// Mock data for demo mode
const MOCK_AGENT = {
  userId: 'demo-user',
  agentId: 'demo-agent-123',
  status: 'stopped' as const,
  telegramBotToken: '***masked***',
  model: 'anthropic.claude-sonnet-4-5-20250929-v1:0',
  createdAt: new Date().toISOString(),
  lastActiveAt: new Date().toISOString(),
};

const MOCK_CREDITS = {
  balance: 1000,
  totalUsed: 500,
  transactions: [
    {
      txnId: 'txn-1',
      type: 'signup_bonus' as const,
      amountCents: 1000,
      description: 'Welcome bonus: $5 payment → $10 credits (2x match)',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      txnId: 'txn-2',
      type: 'usage' as const,
      amountCents: -500,
      description: 'Agent usage: 50000 input + 10000 output tokens',
      createdAt: new Date().toISOString(),
    },
  ],
};

async function getAuthHeaders(): Promise<Record<string, string>> {
  if (MOCK_MODE) return { 'Content-Type': 'application/json' };
  
  const session = await fetchAuthSession();
  const idToken = session.tokens?.idToken?.toString();
  
  return {
    'Content-Type': 'application/json',
    ...(idToken && { Authorization: `Bearer ${idToken}` }),
  };
}

async function apiRequest<T>(method: string, path: string, body?: any): Promise<T> {
  if (MOCK_MODE) {
    // Return mock data based on endpoint
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
    
    if (path.includes('/agents') && method === 'GET') {
      return { agents: [MOCK_AGENT] } as T;
    }
    if (path.includes('/credits')) {
      return MOCK_CREDITS as T;
    }
    if (path.includes('/agents') && method === 'POST') {
      return { agentId: 'new-agent-123', status: 'provisioning', taskArn: 'mock-arn' } as T;
    }
    if (path.includes('/start')) {
      return { status: 'running', taskArn: 'mock-arn' } as T;
    }
    if (path.includes('/stop')) {
      return { status: 'stopped' } as T;
    }
    if (path.includes('/recharge')) {
      return { url: 'https://checkout.stripe.com/demo' } as T;
    }
    
    return {} as T;
  }

  const headers = await getAuthHeaders();
  
  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    ...(body && { body: JSON.stringify(body) }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

export interface Agent {
  userId: string;
  agentId: string;
  status: 'provisioning' | 'running' | 'stopped' | 'stopped_no_credits' | 'error';
  taskArn?: string;
  telegramBotToken: string;
  model: string;
  createdAt: string;
  lastActiveAt: string;
}

export interface Credits {
  balance: number;
  totalUsed: number;
  transactions: Transaction[];
}

export interface Transaction {
  txnId: string;
  type: 'signup_bonus' | 'usage' | 'recharge';
  amountCents: number;
  description: string;
  createdAt: string;
}

export async function provisionAgent(telegramBotToken: string, model?: string): Promise<{ agentId: string; status: string; taskArn: string }> {
  return apiRequest('POST', '/agents', { telegramBotToken, model });
}

export async function getAgent(agentId: string): Promise<Agent> {
  return apiRequest('GET', `/agents/${agentId}`);
}

export async function listAgents(): Promise<{ agents: Agent[] }> {
  return apiRequest('GET', '/agents');
}

export async function startAgent(agentId: string): Promise<{ status: string; taskArn: string }> {
  return apiRequest('POST', `/agents/${agentId}/start`);
}

export async function stopAgent(agentId: string): Promise<{ status: string }> {
  return apiRequest('POST', `/agents/${agentId}/stop`);
}

export async function updateChannels(agentId: string, telegramBotToken: string): Promise<{ status: string; restarted: boolean }> {
  return apiRequest('PUT', `/agents/${agentId}/channels`, { telegramBotToken });
}

export async function getCredits(): Promise<Credits> {
  return apiRequest('GET', '/credits');
}

export async function rechargeCredits(tier: 'starter' | 'builder' | 'pro'): Promise<{ url: string }> {
  return apiRequest('POST', '/credits/recharge', { tier });
}

// Helper to check if running in mock mode
export function isMockMode(): boolean {
  return MOCK_MODE;
}
