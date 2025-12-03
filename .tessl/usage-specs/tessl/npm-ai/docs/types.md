# Types Reference

Key TypeScript types for the AI SDK with full type safety.

## Quick Reference

```typescript
import type {
  // Models
  LanguageModel, EmbeddingModel, ImageModel,

  // Messages
  CoreMessage, CoreUserMessage, CoreAssistantMessage,

  // Results
  GenerateTextResult, StreamTextResult,
  GenerateObjectResult, StreamObjectResult,

  // Tools
  Tool, ToolCall, ToolResult, ToolChoice,

  // Types
  FinishReason, LanguageModelUsage, CallWarning,
} from 'ai';
```

## Core Model Types

```typescript
// Language model (string ID or instance)
type LanguageModel = string | LanguageModelV2;

interface LanguageModelV2 {
  readonly modelId: string;
  readonly provider: string;
  readonly defaultObjectGenerationMode?: 'json' | 'tool';
  doGenerate(options: LanguageModelGenerateOptions): Promise<LanguageModelGenerateResult>;
  doStream(options: LanguageModelStreamOptions): Promise<LanguageModelStreamResult>;
}

// Embedding model
type EmbeddingModel<VALUE = string> = EmbeddingModelV2<VALUE>;

interface EmbeddingModelV2<VALUE> {
  readonly modelId: string;
  readonly maxEmbeddingsPerCall?: number;
  readonly dimensions?: number;
  doEmbed(options: EmbeddingModelEmbedOptions<VALUE>): Promise<EmbeddingModelEmbedResult>;
}

// Image model
type ImageModel = ImageModelV2;

// Speech model
type SpeechModel = SpeechModelV2;

// Transcription model
type TranscriptionModel = TranscriptionModelV2;
```

## Message Types

```typescript
// Core message (union of all message types)
type CoreMessage =
  | CoreUserMessage
  | CoreAssistantMessage
  | CoreToolMessage
  | CoreSystemMessage;

// User message
interface CoreUserMessage {
  role: 'user';
  content: string | Array<TextPart | ImagePart | FilePart>;
}

// Assistant message
interface CoreAssistantMessage {
  role: 'assistant';
  content: string | Array<TextPart | ToolCallPart>;
}

// Tool message (tool execution results)
interface CoreToolMessage {
  role: 'tool';
  content: Array<ToolResultPart>;
}

// System message
interface CoreSystemMessage {
  role: 'system';
  content: string;
}
```

## Content Part Types

```typescript
// Text content
interface TextPart {
  type: 'text';
  text: string;
}

// Image content
interface ImagePart {
  type: 'image';
  image: string | Uint8Array;
  mediaType?: string;
}

// File content
interface FilePart {
  type: 'file';
  data: Uint8Array;
  mediaType: string;
}

// Tool call
interface ToolCallPart {
  type: 'tool-call';
  toolCallId: string;
  toolName: string;
  args: JSONValue;
}

// Tool result
interface ToolResultPart {
  type: 'tool-result';
  toolCallId: string;
  toolName: string;
  result: JSONValue;
  isError?: boolean;
}
```

## Result Types

```typescript
// generateText() result
interface GenerateTextResult<TOOLS = unknown, OUTPUT = never> {
  text: string;
  finishReason: FinishReason;
  usage: LanguageModelUsage;
  totalUsage: LanguageModelUsage;
  warnings?: CallWarning[];
  toolCalls?: TypedToolCall<TOOLS>[];
  toolResults?: TypedToolResult<TOOLS>[];
  steps: StepResult<TOOLS>[];
  stepCount: number;
  responseMessages: ResponseMessage[];
  providerMetadata?: ProviderMetadata;
  experimental_output?: OUTPUT;
}

// streamText() result
interface StreamTextResult<TOOLS = unknown, OUTPUT = never> {
  textStream: AsyncIterableStream<string>;
  fullStream: AsyncIterableStream<TextStreamPart<TOOLS>>;
  text: Promise<string>;
  usage: Promise<LanguageModelUsage>;
  totalUsage: Promise<LanguageModelUsage>;
  finishReason: Promise<FinishReason>;
  toolCalls: Promise<TypedToolCall<TOOLS>[]>;
  toolResults: Promise<TypedToolResult<TOOLS>[]>;
  steps: Promise<StepResult<TOOLS>[]>;
  warnings: Promise<CallWarning[] | undefined>;
  responseMessages: Promise<ResponseMessage[]>;
  providerMetadata: Promise<ProviderMetadata | undefined>;
  toTextStreamResponse(init?: ResponseInit): Response;
  toUIMessageStreamResponse<UI_MESSAGE extends UIMessage>(options?: UIMessageStreamOptions<UI_MESSAGE>): Response;
}

// generateObject() result
interface GenerateObjectResult<T> {
  object: T;
  finishReason: FinishReason;
  usage: LanguageModelUsage;
  warnings?: CallWarning[];
  responseMessages: ResponseMessage[];
  providerMetadata?: ProviderMetadata;
  toJsonResponse(init?: ResponseInit): Response;
}

// streamObject() result
interface StreamObjectResult<T> {
  partialObjectStream: AsyncIterableStream<DeepPartial<T>>;
  elementStream: AsyncIterableStream<T>; // For arrays only
  textStream: AsyncIterableStream<string>;
  fullStream: AsyncIterableStream<ObjectStreamPart<T>>;
  object: Promise<T>;
  usage: Promise<LanguageModelUsage>;
  finishReason: Promise<FinishReason>;
  warnings: Promise<CallWarning[] | undefined>;
  providerMetadata: Promise<ProviderMetadata | undefined>;
  toTextStreamResponse(init?: ResponseInit): Response;
}
```

## Tool Types

```typescript
// Tool definition
interface Tool<INPUT = unknown, OUTPUT = unknown> {
  description?: string;
  inputSchema: FlexibleSchema<INPUT>;
  outputSchema?: FlexibleSchema<OUTPUT>;
  execute?: (input: INPUT, options: ToolCallOptions) => AsyncIterable<OUTPUT> | PromiseLike<OUTPUT> | OUTPUT;
  providerOptions?: Record<string, unknown>;
}

// Tool call options
interface ToolCallOptions {
  toolCallId: string;
  messages: ModelMessage[];
  abortSignal?: AbortSignal;
  experimental_context?: unknown;
}

// Tool call made by model
interface ToolCall {
  toolCallId: string;
  toolName: string;
  args: JSONValue;
}

// Tool execution result
interface ToolResult {
  toolCallId: string;
  toolName: string;
  args: JSONValue;
  result: JSONValue;
}

// Typed tool call (with inferred types)
type TypedToolCall<TTools extends Record<string, Tool>> = {
  [K in keyof TTools]: {
    toolCallId: string;
    toolName: K;
    args: InferToolInput<TTools[K]>;
  };
}[keyof TTools];

// Typed tool result (with inferred types)
type TypedToolResult<TTools extends Record<string, Tool>> = {
  [K in keyof TTools]: {
    toolCallId: string;
    toolName: K;
    args: InferToolInput<TTools[K]>;
    result: InferToolOutput<TTools[K]>;
  };
}[keyof TTools];

// Tool choice
type ToolChoice =
  | 'auto'
  | 'none'
  | 'required'
  | { type: 'tool'; toolName: string };
```

## Streaming Types

```typescript
// Text stream part
type TextStreamPart<TOOLS = unknown> =
  | { type: 'text-delta'; textDelta: string }
  | { type: 'tool-call'; toolCallId: string; toolName: string; args: JSONValue }
  | { type: 'tool-result'; toolCallId: string; toolName: string; args: JSONValue; result: JSONValue }
  | { type: 'tool-call-streaming-start'; toolCallId: string; toolName: string }
  | { type: 'tool-call-delta'; toolCallId: string; argsTextDelta: string }
  | { type: 'finish'; finishReason: FinishReason; usage: LanguageModelUsage }
  | { type: 'step-finish'; finishReason: FinishReason; usage: LanguageModelUsage }
  | { type: 'error'; error: unknown }
  | { type: 'response-metadata'; id?: string; modelId?: string; timestamp?: Date };

// Object stream part
type ObjectStreamPart<T> =
  | { type: 'object'; object: T }
  | { type: 'text-delta'; textDelta: string }
  | { type: 'finish'; finishReason: FinishReason; usage: LanguageModelUsage }
  | { type: 'error'; error: unknown };

// Async iterable stream
type AsyncIterableStream<T> = ReadableStream<T> & AsyncIterable<T>;
```

## Usage & Metadata Types

```typescript
// Token usage
interface LanguageModelUsage {
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
  reasoningTokens?: number;
  cachedInputTokens?: number;
}

// Embedding usage
interface EmbeddingModelUsage {
  tokens: number;
}

// Response metadata
interface LanguageModelResponseMetadata {
  id?: string;
  modelId?: string;
  timestamp?: Date;
}

// Provider metadata
interface ProviderMetadata {
  [provider: string]: {
    [key: string]: unknown;
  };
}

// Call warning
interface CallWarning {
  type: string;
  message: string;
}
```

## Configuration Types

```typescript
// Call settings
interface CallSettings {
  maxOutputTokens?: number;
  temperature?: number;
  topP?: number;
  topK?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  stopSequences?: string[];
  seed?: number;
  maxRetries?: number;
  abortSignal?: AbortSignal;
  headers?: Record<string, string>;
  providerOptions?: Record<string, unknown>;
  experimental_telemetry?: TelemetrySettings;
}

// Telemetry settings
interface TelemetrySettings {
  isEnabled?: boolean;
  functionId?: string;
  metadata?: Record<string, string | number | boolean>;
}
```

## Schema Types

```typescript
// Flexible schema (Zod, JSON Schema, or custom)
type FlexibleSchema<T> = ZodSchema<T> | JSONSchema7 | Schema<T>;

// Schema interface
interface Schema<T> {
  readonly jsonSchema: JSONSchema7;
  validate(value: unknown): { success: true; value: T } | { success: false; error: Error };
}

// Infer type from schema
type InferSchema<S> = S extends Schema<infer T>
  ? T
  : S extends ZodSchema<infer T>
  ? T
  : unknown;
```

## Enum Types

```typescript
// Finish reason
type FinishReason =
  | 'stop'        // Natural stop point
  | 'length'      // Max tokens reached
  | 'content-filter'  // Content filtered
  | 'tool-calls'  // Stopped for tool calls
  | 'error'       // Error occurred
  | 'other'       // Other reason
  | 'unknown';    // Unknown reason
```

## Utility Types

```typescript
// JSON value
type JSONValue =
  | null
  | string
  | number
  | boolean
  | JSONValue[]
  | { [key: string]: JSONValue };

// Deep partial
type DeepPartial<T> = T extends object
  ? { [P in keyof T]?: DeepPartial<T[P]> }
  : T;

// Infer tool input type
type InferToolInput<T extends Tool> = T extends Tool<infer P, any> ? P : never;

// Infer tool output type
type InferToolOutput<T extends Tool> = T extends Tool<any, infer R> ? R : never;
```

## Type Guard Functions

```typescript
// Check if part is text UI part
function isTextUIPart(part: UIMessagePart): part is TextUIPart;

// Check if part is tool UI part
function isToolUIPart(part: UIMessagePart): part is ToolUIPart;

// Check if part is file UI part
function isFileUIPart(part: UIMessagePart): part is FileUIPart;

// Check if part is data UI part
function isDataUIPart(part: UIMessagePart): part is DataUIPart;
```

