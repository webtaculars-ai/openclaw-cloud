// Comprehensive API endpoint mapping
const API_URL = process.env.REACT_APP_API_URL || 'https://1a6hcrf5mj.execute-api.ap-south-1.amazonaws.com/prod';

export const API_ENDPOINTS = {
  // Credits
  getCredits: `${API_URL}/credits`,
  redeemPromo: `${API_URL}/credits/redeem-promo`,
  rechargeCredits: `${API_URL}/credits/recharge`,
  
  // Agents
  listAgents: `${API_URL}/agents`,
  getAgent: (agentId: string) => `${API_URL}/agents/${agentId}`,
  provisionAgent: `${API_URL}/agents`,
  startAgent: (agentId: string) => `${API_URL}/agents/${agentId}/start`,
  stopAgent: (agentId: string) => `${API_URL}/agents/${agentId}/stop`,
  
  // Webhooks
  lemonSqueezyWebhook: `${API_URL}/webhooks/lemonsqueezy`,
  
  // Cron Jobs
  listCronJobs: (agentId: string) => `${API_URL}/agents/${agentId}/cron`,
  createCronJob: (agentId: string) => `${API_URL}/agents/${agentId}/cron`,
  updateCronJob: (agentId: string, jobId: string) => `${API_URL}/agents/${agentId}/cron/${jobId}`,
  deleteCronJob: (agentId: string, jobId: string) => `${API_URL}/agents/${agentId}/cron/${jobId}`,
  runCronJob: (agentId: string, jobId: string) => `${API_URL}/agents/${agentId}/cron/${jobId}/run`,
  getCronJobRuns: (agentId: string, jobId: string) => `${API_URL}/agents/${agentId}/cron/${jobId}/runs`,
  
  // WhatsApp
  getWhatsAppQR: (agentId: string) => `${API_URL}/agents/${agentId}/whatsapp/qr`,
  getWhatsAppStatus: (agentId: string) => `${API_URL}/agents/${agentId}/whatsapp/status`,
};

export default API_ENDPOINTS;
