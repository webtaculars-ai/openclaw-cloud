import { fetchAuthSession } from 'aws-amplify/auth';
import API_ENDPOINTS from '../config/endpoints';

async function getAuthHeaders(): Promise<Record<string, string>> {
  const session = await fetchAuthSession();
  const idToken = session.tokens?.idToken?.toString();
  
  return {
    'Content-Type': 'application/json',
    ...(idToken && { Authorization: `Bearer ${idToken}` }),
  };
}

async function apiRequest<T>(url: string, method: string, body?: any): Promise<T> {
  const headers = await getAuthHeaders();
  
  const response = await fetch(url, {
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
  name?: string;
  status: 'provisioning' | 'running' | 'stopped' | 'stopped_no_credits' | 'error';
  taskArn?: string;
  telegramBotToken?: string;
  telegramEnabled?: boolean;
  model: string;
  createdAt: string;
  lastActiveAt: string;
  whatsappEnabled?: boolean;
  whatsappLinked?: boolean;
}

export interface Credits {
  balance: number;
  transactions: Transaction[];
}

export interface Transaction {
  txnId: string;
  type: 'signup_bonus' | 'usage' | 'recharge' | 'PROMO_REDEEM';
  amount: number;
  promoCode?: string;
  timestamp: string;
  balanceAfter: number;
}

export async function provisionAgent(telegramBotToken: string, whatsappEnabled?: boolean, model?: string, name?: string, telegramEnabled?: boolean): Promise<{ agentId: string; status: string; taskArn: string }> {
  return apiRequest(API_ENDPOINTS.provisionAgent, 'POST', { telegramBotToken, whatsappEnabled, model, name, telegramEnabled });
}

export async function getAgent(agentId: string): Promise<Agent> {
  return apiRequest(API_ENDPOINTS.getAgent(agentId), 'GET');
}

export async function listAgents(): Promise<{ agents: Agent[] }> {
  return apiRequest(API_ENDPOINTS.listAgents, 'GET');
}

export async function startAgent(agentId: string): Promise<{ status: string; taskArn: string }> {
  return apiRequest(API_ENDPOINTS.startAgent(agentId), 'POST');
}

export async function stopAgent(agentId: string): Promise<{ status: string }> {
  return apiRequest(API_ENDPOINTS.stopAgent(agentId), 'POST');
}

export async function getCredits(): Promise<Credits> {
  return apiRequest(API_ENDPOINTS.getCredits, 'GET');
}

export async function rechargeCredits(tier: 'starter' | 'builder' | 'pro'): Promise<{ url: string }> {
  return apiRequest(API_ENDPOINTS.rechargeCredits, 'POST', { tier });
}

export async function getWhatsAppStatus(agentId: string): Promise<{ linked: boolean; status: string; message: string }> {
  return apiRequest(API_ENDPOINTS.getWhatsAppStatus(agentId), 'GET');
}
