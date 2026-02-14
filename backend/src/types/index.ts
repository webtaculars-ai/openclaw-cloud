export type AgentStatus = 
  | "provisioning" 
  | "running" 
  | "stopped" 
  | "stopped_no_credits" 
  | "error";

export type TransactionType = 
  | "signup_bonus" 
  | "usage" 
  | "recharge";

export const DEFAULT_MODEL = "anthropic.claude-sonnet-4-5-20250929-v1:0";
export const SIGNUP_BONUS_CENTS = 1000; // $10

export const RECHARGE_TIERS = {
  starter: { amountCents: 500, creditsCents: 500 },   // $5 → $5
  builder: { amountCents: 1500, creditsCents: 1500 }, // $15 → $15
  pro: { amountCents: 5000, creditsCents: 5000 },     // $50 → $50
} as const;

export interface User {
  userId: string;
  email: string;
  displayName?: string;
  signupDate: string;
}

export interface Agent {
  userId: string;
  agentId: string;
  status: AgentStatus;
  taskArn?: string;
  telegramBotToken: string;
  model: string;
  createdAt: string;
  lastActiveAt: string;
}

export interface Credits {
  userId: string;
  balanceCents: number;
  totalUsedCents: number;
}

export interface Transaction {
  userId: string;
  txnId: string;
  type: TransactionType;
  amountCents: number;
  description: string;
  stripePaymentId?: string;
  createdAt: string;
}
