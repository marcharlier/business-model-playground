# Text Generation

Generate text from language models with support for streaming, multi-turn conversations, and tool calling.

## Basic Usage

### Generate

```typescript
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';

const { text, usage, finishReason } = await generateText({
  model: openai('gpt-4o'),
  prompt: 'Explain TypeScript',
});
```

### Stream

```typescript
import { streamText } from 'ai';

const result = await streamText({
  model: openai('gpt-4o'),
  prompt: 'Count to 10',
});

for await (const chunk of result.textStream) {
  process.stdout.write(chunk);
}

// Access promises for final values
const text = await result.text;
const usage = await result.usage;
const toolCalls = await result.toolCalls;
```

### Messages

```typescript
const { text } = await generateText({
  model: openai('gpt-4o'),
  messages: [
    { role: 'user', content: 'Hello' },
    { role: 'assistant', content: 'Hi' },
    { role: 'user', content: 'What is 2+2?' },
  ],
});
```

## Configuration

```typescript
await generateText({
  model: openai('gpt-4o'),
  prompt: 'Write a story',
  
  // Model selection
  system: 'You are a creative writer',
  
  // Sampling parameters
  temperature: 0.7,
  topP: 0.9,
  topK: 50,
  maxOutputTokens: 500,
  frequencyPenalty: 0.0,
  presencePenalty: 0.0,
  
  // Control
  stopSequences: ['\n\n', '###'],
  seed: 123,
  
  // Retry and cancellation
  maxRetries: 3,
  abortSignal: controller.signal,
  headers: { 'X-Custom': 'value' },
});
```

## Multi-Step with Tools

```typescript
import { tool } from 'ai';
import { z } from 'zod';

const result = await generateText({
  model: openai('gpt-4o'),
  prompt: 'Research quantum computing and summarize',
  tools: {
    search: tool({
      description: 'Search the web',
      parameters: z.object({ query: z.string() }),
      execute: async ({ query }) => ({ results: [] }),
    }),
    readArticle: tool({
      description: 'Read article content',
      parameters: z.object({ url: z.string() }),
      execute: async ({ url }) => ({ content: '' }),
    }),
  },
  maxSteps: 10, // Allow multiple rounds
});
```

## Streaming Callbacks

```typescript
const result = await streamText({
  model: openai('gpt-4o'),
  prompt: 'Tell a story',
  onChunk: ({ chunk }) => {
    if (chunk.type === 'text-delta') {
      console.log('Text:', chunk.textDelta);
    }
  },
  onFinish: ({ text, finishReason, usage }) => {
    console.log('Finished:', finishReason, usage);
  },
});
```

## Type Reference

```typescript
interface GenerateTextResult {
  text: string;
  finishReason: 'stop' | 'length' | 'content-filter' | 'tool-calls' | 'error' | 'other';
  usage: { inputTokens: number; outputTokens: number; totalTokens: number; reasoningTokens?: number };
  warnings?: CallWarning[];
  toolCalls?: Array<{ toolCallId: string; toolName: string; args: JSONValue }>;
  toolResults?: Array<{ toolCallId: string; toolName: string; result: JSONValue }>;
  stepCount: number;
  responseMessages: ResponseMessage[];
}

interface StreamTextResult {
  textStream: ReadableStream<string>;
  fullStream: ReadableStream<TextStreamPart>;
  text: Promise<string>;
  usage: Promise<LanguageModelUsage>;
  finishReason: Promise<FinishReason>;
  toolCalls: Promise<ToolCall[]>;
  toolResults: Promise<ToolResult[]>;
  warnings: Promise<CallWarning[] | undefined>;
}

type TextStreamPart =
  | { type: 'text-delta'; textDelta: string }
  | { type: 'tool-call'; toolCallId: string; toolName: string; args: JSONValue }
  | { type: 'tool-result'; toolCallId: string; toolName: string; args: JSONValue; result: JSONValue }
  | { type: 'finish'; finishReason: FinishReason; usage: LanguageModelUsage }
  | { type: 'error'; error: unknown };
```

## Common Patterns

### Next.js API Route

```typescript
export async function POST(req: Request) {
  const { messages } = await req.json();
  
  const result = await streamText({
    model: openai('gpt-4o'),
    messages,
  });
  
  return result.toTextStreamResponse();
}
```

### Error Handling

```typescript
try {
  const { text } = await generateText({
    model: openai('gpt-4o'),
    prompt: 'Hello',
  });
} catch (error) {
  if (error instanceof APICallError) {
    console.error('API error:', error.statusCode, error.message);
  } else if (error instanceof InvalidPromptError) {
    console.error('Invalid prompt');
  }
}
```

### Abort

```typescript
const controller = new AbortController();

setTimeout(() => controller.abort(), 5000);

try {
  const result = await generateText({
    model: openai('gpt-4o'),
    prompt: 'Very long task',
    abortSignal: controller.signal,
  });
} catch (error) {
  if (error.name === 'AbortError') {
    console.log('Cancelled');
  }
}
```

### Multi-Provider

```typescript
import { anthropic } from '@ai-sdk/anthropic';
import { google } from '@ai-sdk/google';

// Easy provider switching
const openaiResult = await generateText({
  model: openai('gpt-4o'),
  prompt: 'Hello',
});

const anthropicResult = await generateText({
  model: anthropic('claude-3-5-sonnet-20241022'),
  prompt: 'Hello',
});
```

## Stop Conditions

```typescript
import { stepCountIs, hasToolCall } from 'ai';

await streamText({
  model: openai('gpt-4o'),
  prompt: 'Do research',
  tools: { search, summarize },
  maxSteps: stepCountIs(5), // Stop after 5 steps
  // or
  maxSteps: hasToolCall({ toolName: 'finalAnswer' }), // Stop when specific tool called
});
```

## Complete API Reference

### generateText()

```typescript
function generateText<TOOLS extends Record<string, Tool>, OUTPUT = never>(options: {
  // Model
  model: LanguageModel;

  // Input (use prompt or messages)
  prompt?: string;
  messages?: CoreMessage[];
  system?: string;

  // Tools
  tools?: TOOLS;
  toolChoice?: ToolChoice<TOOLS>;
  activeTools?: Array<keyof TOOLS>;
  stopWhen?: StopCondition<TOOLS> | StopCondition<TOOLS>[];
  maxSteps?: number;

  // Sampling
  maxOutputTokens?: number;
  temperature?: number;
  topP?: number;
  topK?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;

  // Control
  stopSequences?: string[];
  seed?: number;

  // Advanced
  maxRetries?: number;
  abortSignal?: AbortSignal;
  headers?: Record<string, string>;
  providerOptions?: Record<string, unknown>;
  experimental_output?: Output<OUTPUT>;
  experimental_telemetry?: TelemetrySettings;

  // Callbacks
  onStepFinish?: (event: StepResult<TOOLS>) => void | Promise<void>;
}): Promise<GenerateTextResult<TOOLS, OUTPUT>>;
```

### streamText()

```typescript
function streamText<TOOLS extends Record<string, Tool>, PARTIAL_OUTPUT = never>(options: {
  // Same as generateText, plus:

  // Streaming callbacks
  onChunk?: (chunk: TextStreamPart<TOOLS>) => void | Promise<void>;
  onFinish?: (result: OnFinishResult<TOOLS>) => void | Promise<void>;
  onError?: (error: unknown) => void | Promise<void>;
  onStepFinish?: (step: StepResult<TOOLS>) => void | Promise<void>;

  // Transforms
  experimental_transform?: StreamTextTransform<TOOLS> | StreamTextTransform<TOOLS>[];
}): Promise<StreamTextResult<TOOLS, PARTIAL_OUTPUT>>;
```

### Result Interfaces

```typescript
interface GenerateTextResult<TOOLS, OUTPUT> {
  text: string;
  content: ContentPart<TOOLS>[];
  reasoning: ReasoningOutput[];
  reasoningText: string | undefined;
  toolCalls: TypedToolCall<TOOLS>[];
  toolResults: TypedToolResult<TOOLS>[];
  finishReason: FinishReason;
  usage: LanguageModelUsage;
  totalUsage: LanguageModelUsage;
  warnings?: CallWarning[];
  steps: StepResult<TOOLS>[];
  stepCount: number;
  responseMessages: ResponseMessage[];
  providerMetadata?: ProviderMetadata;
  experimental_output: OUTPUT;
}

interface StreamTextResult<TOOLS, PARTIAL_OUTPUT> {
  textStream: AsyncIterableStream<string>;
  fullStream: AsyncIterableStream<TextStreamPart<TOOLS>>;
  text: Promise<string>;
  usage: Promise<LanguageModelUsage>;
  totalUsage: Promise<LanguageModelUsage>;
  finishReason: Promise<FinishReason>;
  toolCalls: Promise<TypedToolCall<TOOLS>[]>;
  toolResults: Promise<TypedToolResult<TOOLS>[]>;
  warnings: Promise<CallWarning[] | undefined>;
  steps: Promise<StepResult<TOOLS>[]>;
  responseMessages: Promise<ResponseMessage[]>;
  providerMetadata: Promise<ProviderMetadata | undefined>;
  experimental_partialOutputStream: AsyncIterableStream<PARTIAL_OUTPUT>;
  toTextStreamResponse(init?: ResponseInit): Response;
  toUIMessageStreamResponse<UI_MESSAGE extends UIMessage>(options?: UIMessageStreamOptions<UI_MESSAGE>): Response;
}
```
