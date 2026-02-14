import { z } from 'zod';

// Pricing constants
export const MARKUP_MULTIPLIER = 2.0;
export const MAX_OUTPUT_TOKENS = 8192;
export const IDLE_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes
export const FLUSH_INTERVAL_MS = 30 * 1000; // 30 seconds
export const BALANCE_REFRESH_MS = 30 * 1000; // 30 seconds

export const MODEL_PRICING: Record<string, { inputPerM: number; outputPerM: number }> = {
  'anthropic.claude-sonnet-4-5-20250929-v1:0': {
    inputPerM: 3.0,
    outputPerM: 15.0,
  },
  'anthropic.claude-haiku-3-5-20241022-v1:0': {
    inputPerM: 0.8,
    outputPerM: 4.0,
  },
};

// Anthropic API schemas
export const ContentBlockSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('text'),
    text: z.string(),
  }),
  z.object({
    type: z.literal('image'),
    source: z.object({
      type: z.literal('base64'),
      media_type: z.string(),
      data: z.string(),
    }),
  }),
  z.object({
    type: z.literal('tool_use'),
    id: z.string(),
    name: z.string(),
    input: z.record(z.any()),
  }),
  z.object({
    type: z.literal('tool_result'),
    tool_use_id: z.string(),
    content: z.union([z.string(), z.array(z.any())]),
  }),
]);

export const MessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.union([z.string(), z.array(ContentBlockSchema)]),
});

export const AnthropicRequestSchema = z.object({
  model: z.string(),
  max_tokens: z.number().max(MAX_OUTPUT_TOKENS),
  messages: z.array(MessageSchema),
  system: z.union([z.string(), z.array(z.any())]).optional(),
  temperature: z.number().optional(),
  top_p: z.number().optional(),
  stream: z.boolean().optional(),
  tools: z.array(z.any()).optional(),
  tool_choice: z.any().optional(),
});

export type ContentBlock = z.infer<typeof ContentBlockSchema>;
export type Message = z.infer<typeof MessageSchema>;
export type AnthropicRequest = z.infer<typeof AnthropicRequestSchema>;

export interface UsageRecord {
  inputTokens: number;
  outputTokens: number;
  costCents: number;
}
