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

// Types
export interface CronSchedule {
  kind: 'at' | 'every' | 'cron';
  at?: string; // ISO timestamp for 'at'
  everyMs?: number; // milliseconds for 'every'
  anchorMs?: number; // optional start time for 'every'
  expr?: string; // cron expression for 'cron'
  tz?: string; // timezone for 'cron'
}

export interface CronPayload {
  kind: 'systemEvent' | 'agentTurn';
  text?: string; // for systemEvent
  message?: string; // for agentTurn
  model?: string; // optional model override
  thinking?: string; // optional thinking mode
  timeoutSeconds?: number;
}

export interface CronDelivery {
  mode: 'none' | 'announce';
  channel?: string;
  to?: string;
  bestEffort?: boolean;
}

export interface CronJob {
  jobId: string;
  userId: string;
  agentId: string;
  name?: string;
  schedule: CronSchedule;
  payload: CronPayload;
  sessionTarget: 'main' | 'isolated';
  delivery?: CronDelivery;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
  lastRun?: {
    timestamp: string;
    status: 'success' | 'failed';
    error?: string;
  };
  nextRun?: string; // ISO timestamp
}

export interface CreateCronJobRequest {
  name?: string;
  schedule: CronSchedule;
  payload: CronPayload;
  sessionTarget: 'main' | 'isolated';
  delivery?: CronDelivery;
  enabled?: boolean;
}

export interface ListCronJobsResponse {
  jobs: CronJob[];
}

export interface CronJobRunResponse {
  runId: string;
  status: string;
  startedAt: string;
}

// API Functions
export async function listCronJobs(agentId: string): Promise<ListCronJobsResponse> {
  return apiRequest(API_ENDPOINTS.listCronJobs(agentId), 'GET');
}

export async function createCronJob(
  agentId: string,
  jobData: CreateCronJobRequest
): Promise<CronJob> {
  return apiRequest(API_ENDPOINTS.createCronJob(agentId), 'POST', jobData);
}

export async function updateCronJob(
  agentId: string,
  jobId: string,
  updates: Partial<CronJob>
): Promise<CronJob> {
  return apiRequest(API_ENDPOINTS.updateCronJob(agentId, jobId), 'PUT', updates);
}

export async function deleteCronJob(agentId: string, jobId: string): Promise<void> {
  return apiRequest(API_ENDPOINTS.deleteCronJob(agentId, jobId), 'DELETE');
}

export async function runCronJob(agentId: string, jobId: string): Promise<CronJobRunResponse> {
  return apiRequest(API_ENDPOINTS.runCronJob(agentId, jobId), 'POST');
}

export async function getCronJobRuns(
  agentId: string,
  jobId: string,
  limit?: number
): Promise<{ runs: any[] }> {
  const url = limit
    ? `${API_ENDPOINTS.getCronJobRuns(agentId, jobId)}?limit=${limit}`
    : API_ENDPOINTS.getCronJobRuns(agentId, jobId);
  return apiRequest(url, 'GET');
}
