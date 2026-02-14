import express from 'express';
import { AnthropicRequestSchema, IDLE_TIMEOUT_MS, MAX_OUTPUT_TOKENS } from './types';
import { callBedrock, callBedrockStream } from './bedrock-client';
import * as credits from './credits';

const app = express();
const PORT = 8080;

app.use(express.json());

let lastActivityTime = Date.now();

// Health check
app.get('/health', async (req, res) => {
  const balance = credits.getBalance();
  res.json({ status: 'ok', balance });
});

// Anthropic Messages API endpoint
app.post('/v1/messages', async (req, res) => {
  lastActivityTime = Date.now();

  try {
    // Validate request
    const validation = AnthropicRequestSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: 'Invalid request', details: validation.error });
    }

    const request = validation.data;

    // Enforce max tokens
    request.max_tokens = Math.min(request.max_tokens, MAX_OUTPUT_TOKENS);

    // Per-request sanity check: reject if max possible cost > $1
    const maxPossibleCost = (request.max_tokens / 1_000_000) * 15 * 100 * 2; // Worst case: all output tokens at highest rate
    if (maxPossibleCost > 100) {
      return res.status(400).json({ error: 'Request too expensive (max tokens too high)' });
    }

    // Check balance
    const hasBalance = await credits.checkBalance();
    if (!hasBalance) {
      res.status(402).json({ error: 'Insufficient credits' });
      // Async stop self
      setImmediate(() => credits.stopSelf('no_credits'));
      return;
    }

    // Handle streaming
    if (request.stream) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      try {
        const generator = callBedrockStream(request);
        
        // Manual iteration to capture the return value (usage record)
        let result = await generator.next();
        while (!result.done) {
          const event = result.value;
          res.write(`event: ${event.type}\n`);
          res.write(`data: ${JSON.stringify(event)}\n\n`);
          result = await generator.next();
        }

        // result.value is now the UsageRecord from the generator's return
        if (result.value) {
          credits.accumulateUsage(result.value);
        }

        res.write('event: message_stop\n');
        res.write('data: {}\n\n');
        res.end();
      } catch (error: any) {
        console.error('Stream error:', error);
        res.write(`event: error\n`);
        res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
        res.end();
      }
    } else {
      // Non-streaming
      const result = await callBedrock(request);
      credits.accumulateUsage(result.usage);
      res.json(result.response);
    }

    // Check if balance depleted after request
    if (credits.getBalance() <= 0) {
      setImmediate(() => credits.stopSelf('no_credits'));
    }
  } catch (error: any) {
    console.error('Request error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// Idle timeout check
setInterval(() => {
  const idleTime = Date.now() - lastActivityTime;
  if (idleTime > IDLE_TIMEOUT_MS) {
    console.log(`Idle timeout reached (${idleTime}ms), stopping...`);
    credits.stopSelf('idle_timeout');
  }
}, 60_000); // Check every minute

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, flushing usage and shutting down...');
  credits.stopFlushInterval();
  await credits.flushUsage();
  process.exit(0);
});

// Startup
async function main() {
  await credits.refreshBalance();
  credits.startFlushInterval();
  
  app.listen(PORT, () => {
    console.log(`OpenClaw metering proxy listening on port ${PORT}`);
    console.log(`Agent ID: ${process.env.AGENT_ID}`);
    console.log(`User ID: ${process.env.USER_ID}`);
    console.log(`Model: ${process.env.MODEL}`);
    console.log(`Initial balance: ${credits.getBalance()} cents`);
  });
}

main().catch(err => {
  console.error('Failed to start proxy:', err);
  process.exit(1);
});
