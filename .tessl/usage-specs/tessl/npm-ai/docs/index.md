# AI SDK

TypeScript toolkit for AI applications - unified API across LLM providers (OpenAI, Anthropic, Google, etc.)

## Quick Start

```typescript
import { generateText, streamText } from 'ai';
import { openai } from '@ai-sdk/openai';

// Generate text
const { text } = await generateText({
  model: openai('gpt-4o'),
  prompt: 'Explain quantum computing',
});

// Stream response
const result = await streamText({
  model: openai('gpt-4o'),
  prompt: 'Write a poem',
});

for await (const chunk of result.textStream) {
  process.stdout.write(chunk);
}
```

## Core Imports

```typescript
// Text generation
import { generateText, streamText } from 'ai';

// Structured output
import { generateObject, streamObject } from 'ai';

// Embeddings
import { embed, embedMany } from 'ai';

// Tools
import { tool } from 'ai';

// Middleware
import { wrapLanguageModel } from 'ai';

// Registry
import { createProviderRegistry } from 'ai';

// Types
import type {
  LanguageModel,
  CoreMessage,
  GenerateTextResult,
} from 'ai';
```

## Provider Setup

```typescript
import { openai } from '@ai-sdk/openai';
import { anthropic } from '@ai-sdk/anthropic';
import { google } from '@ai-sdk/google';

// Use any provider
const model = openai('gpt-4o'); // or anthropic('claude-3-5-sonnet-20241022'), etc.
```

## Common Patterns

### Basic Generation
```typescript
const { text, usage } = await generateText({
  model: openai('gpt-4o'),
  prompt: 'Say hello',
});
```

### Streaming
```typescript
const result = await streamText({
  model: openai('gpt-4o'),
  prompt: 'Count to 10',
});

for await (const chunk of result.textStream) {
  console.log(chunk);
}

// Access final results
const text = await result.text;
const usage = await result.usage;
```

### Messages/Chat
```typescript
const { text } = await generateText({
  model: openai('gpt-4o'),
  messages: [
    { role: 'system', content: 'You are helpful' },
    { role: 'user', content: 'Hello' },
    { role: 'assistant', content: 'Hi there!' },
    { role: 'user', content: 'What is 2+2?' },
  ],
});
```

### Structured Output
```typescript
import { z } from 'zod';

const { object } = await generateObject({
  model: openai('gpt-4o'),
  schema: z.object({
    name: z.string(),
    age: z.number(),
    email: z.string().email(),
  }),
  prompt: 'Generate a user profile',
});
```

### Tools
```typescript
const result = await generateText({
  model: openai('gpt-4o'),
  prompt: 'What is the weather in SF?',
  tools: {
    getWeather: tool({
      description: 'Get weather for location',
      parameters: z.object({ location: z.string() }),
      execute: async ({ location }) => ({ temp: 72, location }),
    }),
  },
});
```

### Embeddings
```typescript
// Single
const { embedding } = await embed({
  model: openai.embedding('text-embedding-3-small'),
  value: 'Hello world',
});

// Batch
const { embeddings } = await embedMany({
  model: openai.embedding('text-embedding-3-small'),
  values: ['text1', 'text2', 'text3'],
});
```

## Key Concepts

- **LanguageModel**: Interface for all LLM providers
- **CoreMessage**: Standard message format for conversations
- **Tool**: Function the model can call during generation
- **StreamTextResult**: Streaming API with `textStream` and promise properties
- **Provider**: Abstraction over AI model providers (OpenAI, Anthropic, etc.)

## Documentation

- [Text Generation](./text-generation.md) - `generateText`, `streamText`
- [Structured Output](./object-generation.md) - `generateObject`, `streamObject`
- [Embeddings](./embeddings.md) - `embed`, `embedMany`
- [Tools](./tools.md) - Tool calling with type safety
- [Errors](./errors.md) - Error handling
- [Types](./types.md) - TypeScript types reference
- [Middleware](./middleware.md) - Model wrapping & interceptors
- [Registry](./registry.md) - Dynamic model resolution
- [Media](./media-generation.md) - Image generation, speech (experimental)
- [UI Integration](./ui-integration.md) - Chat interfaces
- [Utilities](./utilities.md) - Helpers

## Configuration

```typescript
const result = await generateText({
  model: openai('gpt-4o'),
  prompt: 'Tell me a story',
  
  // Sampling
  temperature: 0.7,
  topP: 0.9,
  maxOutputTokens: 500,
  
  // Control
  stopSequences: ['\n\n'],
  seed: 42,
  
  // Advanced
  maxRetries: 3,
  abortSignal: controller.signal,
});
```

## Framework Integration

```typescript
// React
import { useChat } from '@ai-sdk/react';

// Vue
import { useChat } from '@ai-sdk/vue';

// Svelte
import { createChatStore } from '@ai-sdk/svelte';
```

## Function Signatures

### generateText
```typescript
function generateText(options: {
  model: LanguageModel;
  prompt?: string;
  messages?: CoreMessage[];
  system?: string;
  tools?: Record<string, Tool>;
  toolChoice?: 'auto' | 'none' | 'required' | { type: 'tool'; toolName: string };
  maxSteps?: number;
  maxOutputTokens?: number;
  temperature?: number;
  topP?: number;
  topK?: number;
  stopSequences?: string[];
  seed?: number;
  maxRetries?: number;
  abortSignal?: AbortSignal;
  headers?: Record<string, string>;
  providerOptions?: Record<string, unknown>;
  experimental_telemetry?: TelemetrySettings;
}): Promise<GenerateTextResult>;
```

### streamText
```typescript
function streamText(options: {
  // Same as generateText plus:
  onChunk?: (chunk: TextStreamPart) => void;
  onFinish?: (result: OnFinishResult) => void;
  onStepFinish?: (step: StepResult) => void;
}): Promise<StreamTextResult>;
```

### GenerateTextResult
```typescript
interface GenerateTextResult {
  text: string;
  finishReason: 'stop' | 'length' | 'content-filter' | 'tool-calls' | 'error' | 'other';
  usage: { inputTokens: number; outputTokens: number; totalTokens: number };
  warnings?: CallWarning[];
  toolCalls?: ToolCall[];
  toolResults?: ToolResult[];
  stepCount: number;
  responseMessages: ResponseMessage[];
}
```

### StreamTextResult
```typescript
interface StreamTextResult {
  textStream: AsyncIterableStream<string>;
  fullStream: AsyncIterableStream<TextStreamPart>;
  text: Promise<string>;
  usage: Promise<LanguageModelUsage>;
  finishReason: Promise<FinishReason>;
  toolCalls: Promise<ToolCall[]>;
  toolResults: Promise<ToolResult[]>;
  toTextStreamResponse(): Response;
  toUIMessageStreamResponse(): Response;
}
```

### CoreMessage
```typescript
type CoreMessage =
  | { role: 'user'; content: string | Array<{ type: 'text' | 'image' | 'file'; text?: string; image?: string; data?: Uint8Array }> }
  | { role: 'assistant'; content: string | Array<{ type: 'text' | 'tool-call'; text?: string; toolCallId?: string; toolName?: string; args?: unknown }> }
  | { role: 'tool'; content: Array<{ type: 'tool-result'; toolCallId: string; toolName: string; result: unknown }> }
  | { role: 'system'; content: string };
```

## Installation

```bash
npm install ai
npm install @ai-sdk/openai  # or @ai-sdk/anthropic, @ai-sdk/google, etc.
```

## Environment

```bash
export OPENAI_API_KEY="sk-..."
export ANTHROPIC_API_KEY="sk-ant-..."
```

## Function Signatures

### Core Functions

```typescript
// Text generation
function generateText<TOOLS, OUTPUT = never>(options: GenerateTextOptions<TOOLS, OUTPUT>): Promise<GenerateTextResult<TOOLS, OUTPUT>>;
function streamText<TOOLS, PARTIAL_OUTPUT = never>(options: StreamTextOptions<TOOLS, PARTIAL_OUTPUT>): Promise<StreamTextResult<TOOLS, PARTIAL_OUTPUT>>;

// Structured output
function generateObject<T>(options: GenerateObjectOptions<T>): Promise<GenerateObjectResult<T>>;
function streamObject<T>(options: StreamObjectOptions<T>): Promise<StreamObjectResult<T>>;

// Embeddings
function embed<VALUE = string>(options: EmbedOptions<VALUE>): Promise<EmbedResult<VALUE>>;
function embedMany<VALUE = string>(options: EmbedManyOptions<VALUE>): Promise<EmbedManyResult<VALUE>>;

// Tools
function tool<INPUT, OUTPUT>(options: ToolOptions<INPUT, OUTPUT>): Tool<INPUT, OUTPUT>;
function dynamicTool(options: DynamicToolOptions): Tool<unknown, unknown>;

// Middleware
function wrapLanguageModel(options: { model: LanguageModel; middleware: LanguageModelMiddleware }): LanguageModel;

// Registry
function createProviderRegistry(providers: Record<string, Provider>): ProviderRegistry;
```

### Key Options Types

```typescript
interface GenerateTextOptions<TOOLS, OUTPUT> {
  model: LanguageModel;
  prompt?: string;
  messages?: CoreMessage[];
  system?: string;
  tools?: TOOLS;
  toolChoice?: ToolChoice<TOOLS>;
  maxSteps?: number;
  maxOutputTokens?: number;
  temperature?: number;
  topP?: number;
  topK?: number;
  stopSequences?: string[];
  seed?: number;
  maxRetries?: number;
  abortSignal?: AbortSignal;
  experimental_output?: Output<OUTPUT>;
  experimental_telemetry?: TelemetrySettings;
  onStepFinish?: (step: StepResult<TOOLS>) => void | Promise<void>;
}

interface GenerateObjectOptions<T> {
  model: LanguageModel;
  schema: FlexibleSchema<T>;
  schemaName?: string;
  schemaDescription?: string;
  mode?: 'auto' | 'json' | 'tool';
  prompt?: string;
  messages?: CoreMessage[];
  system?: string;
  maxOutputTokens?: number;
  temperature?: number;
  maxRetries?: number;
  abortSignal?: AbortSignal;
}

interface ToolOptions<INPUT, OUTPUT> {
  description?: string;
  inputSchema: FlexibleSchema<INPUT>;
  outputSchema?: FlexibleSchema<OUTPUT>;
  execute?: (input: INPUT, options: ToolCallOptions) => Promise<OUTPUT> | OUTPUT;
}
```

## Next Steps

- See [Text Generation](./text-generation.md) for detailed examples
- See [Tools](./tools.md) for multi-step workflows
- See [Embeddings](./embeddings.md) for semantic search patterns
