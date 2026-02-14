import {
  BedrockRuntimeClient,
  ConverseCommand,
  ConverseStreamCommand,
  ContentBlock as BedrockContentBlock,
  Message as BedrockMessage,
  Tool as BedrockTool,
  ToolConfiguration,
} from '@aws-sdk/client-bedrock-runtime';
import { AnthropicRequest, UsageRecord, MODEL_PRICING, MARKUP_MULTIPLIER, ContentBlock } from './types';

const client = new BedrockRuntimeClient({});

function calculateCost(inputTokens: number, outputTokens: number, model: string): number {
  const pricing = MODEL_PRICING[model];
  if (!pricing) {
    throw new Error(`Unknown model: ${model}`);
  }

  const inputCost = (inputTokens / 1_000_000) * pricing.inputPerM;
  const outputCost = (outputTokens / 1_000_000) * pricing.outputPerM;
  
  // Convert to cents and apply markup
  return Math.ceil((inputCost + outputCost) * 100 * MARKUP_MULTIPLIER);
}

function translateContentToBedrock(content: any): BedrockContentBlock[] {
  if (typeof content === 'string') {
    return [{ text: content }];
  }

  const blocks: BedrockContentBlock[] = [];
  
  for (const block of content) {
    if (block.type === 'text') {
      blocks.push({ text: block.text });
    } else if (block.type === 'image') {
      blocks.push({
        image: {
          format: block.source.media_type.split('/')[1] as any,
          source: { bytes: Buffer.from(block.source.data, 'base64') },
        },
      });
    } else if (block.type === 'tool_use') {
      blocks.push({
        toolUse: {
          toolUseId: block.id,
          name: block.name,
          input: block.input,
        },
      });
    } else if (block.type === 'tool_result') {
      const resultContent = typeof block.content === 'string' 
        ? [{ text: block.content }] 
        : translateContentToBedrock(block.content);
      
      blocks.push({
        toolResult: {
          toolUseId: block.tool_use_id,
          content: resultContent as any, // Type assertion for AWS SDK compatibility
        },
      });
    }
  }

  return blocks;
}

function translateMessagesToBedrock(messages: any[]): BedrockMessage[] {
  return messages.map(msg => ({
    role: msg.role,
    content: translateContentToBedrock(msg.content),
  }));
}

function translateToolsToBedrock(tools?: any[]): ToolConfiguration | undefined {
  if (!tools || tools.length === 0) return undefined;

  return {
    tools: tools.map(tool => ({
      toolSpec: {
        name: tool.name,
        description: tool.description,
        inputSchema: {
          json: tool.input_schema,
        },
      },
    })),
  };
}

function translateSystemPrompt(system?: string | any[]): any[] | undefined {
  if (!system) return undefined;
  if (typeof system === 'string') return [{ text: system }];
  return system;
}

function translateBedrockToAnthropic(bedrockContent: BedrockContentBlock[]): ContentBlock[] {
  const anthropicContent: ContentBlock[] = [];

  for (const block of bedrockContent) {
    if (block.text) {
      anthropicContent.push({ type: 'text', text: block.text });
    } else if (block.toolUse) {
      anthropicContent.push({
        type: 'tool_use',
        id: block.toolUse.toolUseId!,
        name: block.toolUse.name!,
        input: block.toolUse.input as Record<string, any>,
      });
    }
  }

  return anthropicContent;
}

export async function callBedrock(request: AnthropicRequest): Promise<any> {
  const command = new ConverseCommand({
    modelId: request.model,
    messages: translateMessagesToBedrock(request.messages),
    system: translateSystemPrompt(request.system),
    inferenceConfig: {
      maxTokens: request.max_tokens,
      temperature: request.temperature,
      topP: request.top_p,
    },
    toolConfig: translateToolsToBedrock(request.tools),
  });

  const response = await client.send(command);

  const inputTokens = response.usage?.inputTokens || 0;
  const outputTokens = response.usage?.outputTokens || 0;
  const costCents = calculateCost(inputTokens, outputTokens, request.model);

  const stopReason = response.stopReason === 'end_turn' ? 'end_turn'
    : response.stopReason === 'tool_use' ? 'tool_use'
    : response.stopReason === 'max_tokens' ? 'max_tokens'
    : response.stopReason === 'stop_sequence' ? 'stop_sequence'
    : 'end_turn';

  return {
    usage: { inputTokens, outputTokens, costCents },
    response: {
      id: `msg_${Date.now()}`,
      type: 'message',
      role: 'assistant',
      content: translateBedrockToAnthropic(response.output?.message?.content || []),
      model: request.model,
      stop_reason: stopReason,
      usage: {
        input_tokens: inputTokens,
        output_tokens: outputTokens,
      },
    },
  };
}

export async function* callBedrockStream(request: AnthropicRequest): AsyncGenerator<any, UsageRecord, undefined> {
  const command = new ConverseStreamCommand({
    modelId: request.model,
    messages: translateMessagesToBedrock(request.messages),
    system: translateSystemPrompt(request.system),
    inferenceConfig: {
      maxTokens: request.max_tokens,
      temperature: request.temperature,
      topP: request.top_p,
    },
    toolConfig: translateToolsToBedrock(request.tools),
  });

  const response = await client.send(command);
  
  let inputTokens = 0;
  let outputTokens = 0;
  let currentBlockIndex = 0;

  yield { type: 'message_start', message: { id: `msg_${Date.now()}`, type: 'message', role: 'assistant', content: [], model: request.model } };

  if (response.stream) {
    for await (const event of response.stream) {
      if (event.contentBlockStart) {
        if (event.contentBlockStart.start?.toolUse) {
          yield {
            type: 'content_block_start',
            index: currentBlockIndex,
            content_block: {
              type: 'tool_use',
              id: event.contentBlockStart.start.toolUse.toolUseId,
              name: event.contentBlockStart.start.toolUse.name,
            },
          };
        } else {
          yield { type: 'content_block_start', index: currentBlockIndex, content_block: { type: 'text', text: '' } };
        }
      } else if (event.contentBlockDelta) {
        if (event.contentBlockDelta.delta?.text) {
          yield {
            type: 'content_block_delta',
            index: currentBlockIndex,
            delta: { type: 'text_delta', text: event.contentBlockDelta.delta.text },
          };
        } else if (event.contentBlockDelta.delta?.toolUse) {
          yield {
            type: 'content_block_delta',
            index: currentBlockIndex,
            delta: { type: 'input_json_delta', partial_json: event.contentBlockDelta.delta.toolUse.input },
          };
        }
      } else if (event.contentBlockStop) {
        yield { type: 'content_block_stop', index: currentBlockIndex };
        currentBlockIndex++;
      } else if (event.metadata) {
        inputTokens = event.metadata.usage?.inputTokens || 0;
        outputTokens = event.metadata.usage?.outputTokens || 0;
        
        const metadata = event.metadata as any;
        const stopReason = metadata.stopReason === 'end_turn' ? 'end_turn'
          : metadata.stopReason === 'tool_use' ? 'tool_use'
          : metadata.stopReason === 'max_tokens' ? 'max_tokens'
          : 'end_turn';

        yield {
          type: 'message_delta',
          delta: { stop_reason: stopReason },
          usage: { output_tokens: outputTokens },
        };
      }
    }
  }

  const costCents = calculateCost(inputTokens, outputTokens, request.model);
  
  return { inputTokens, outputTokens, costCents };
}
