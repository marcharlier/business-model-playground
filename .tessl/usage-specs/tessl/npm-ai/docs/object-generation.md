# Structured Output

Generate structured objects that conform to Zod or JSON Schema.

## Basic Usage

```typescript
import { generateObject, streamObject } from 'ai';
import { z } from 'zod';

// Generate object
const { object } = await generateObject({
  model: openai('gpt-4o'),
  schema: z.object({
    name: z.string(),
    age: z.number(),
    email: z.string().email(),
    hobbies: z.array(z.string()),
  }),
  prompt: 'Generate a person profile',
});

// Stream object (get partial updates)
const result = await streamObject({
  model: openai('gpt-4o'),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    tags: z.array(z.string()),
  }),
  prompt: 'Analyze an article',
});

// Watch partial updates
for await (const partial of result.partialObjectStream) {
  console.log('Partial:', partial);
}

// Get final object
const finalObject = await result.object;
```

## Schema Types

```typescript
import { z } from 'zod';

// Simple object
z.object({ name: z.string(), age: z.number() })

// Complex nested
z.object({
  user: z.object({
    name: z.string(),
    address: z.object({ city: z.string(), zip: z.string() }),
  }),
  preferences: z.object({ theme: z.enum(['light', 'dark']) }),
})

// Arrays with objects
z.object({
  items: z.array(z.object({ id: z.string(), value: z.number() })),
})

// Optional fields with descriptions
z.object({
  name: z.string().describe('Full name'),
  age: z.number().int().positive().describe('Age in years'),
  email: z.string().email().optional(),
})
```

## Generation Modes

```typescript
// Auto (default) - SDK chooses best approach
await generateObject({ model, schema, prompt, mode: 'auto' });

// JSON mode - Native JSON
await generateObject({ model, schema, prompt, mode: 'json' });

// Tool mode - Uses tool calling
await generateObject({ model, schema, prompt, mode: 'tool' });
```

## Type Reference

```typescript
interface GenerateObjectResult<T> {
  object: T;
  finishReason: FinishReason;
  usage: LanguageModelUsage;
  warnings?: CallWarning[];
  responseMessages: ResponseMessage[];
}

interface StreamObjectResult<T> {
  partialObjectStream: ReadableStream<DeepPartial<T>>;
  elementStream: ReadableStream<T>; // For arrays only
  textStream: ReadableStream<string>;
  object: Promise<T>;
  usage: Promise<LanguageModelUsage>;
  finishReason: Promise<FinishReason>;
}
```

## Common Patterns

### Data Extraction

```typescript
const { object } = await generateObject({
  model: openai('gpt-4o'),
  schema: z.object({
    title: z.string(),
    author: z.string(),
    summary: z.string(),
    sentiment: z.enum(['positive', 'negative', 'neutral']),
  }),
  prompt: `Extract from: ${articleText}`,
});
```

### Form Generation

```typescript
const { object } = await generateObject({
  model: openai('gpt-4o'),
  schema: z.object({
    firstName: z.string(),
    lastName: z.string(),
    email: z.string().email(),
    address: z.object({
      street: z.string(),
      city: z.string(),
      state: z.string(),
    }),
  }),
  prompt: 'Generate a user registration form',
});
```

### Classification

```typescript
const { object } = await generateObject({
  model: openai('gpt-4o'),
  schema: z.object({
    category: z.enum(['tech', 'business', 'health', 'entertainment']),
    confidence: z.number().min(0).max(1),
    reasoning: z.string(),
  }),
  prompt: `Classify: ${articleText}`,
});
```

### Streaming Progress

```typescript
const result = await streamObject({
  model: openai('gpt-4o'),
  schema: z.object({
    characters: z.array(z.object({
      name: z.string(),
      class: z.string(),
      stats: z.object({
        strength: z.number(),
        intelligence: z.number(),
      }),
    })),
  }),
  prompt: 'Generate 3 game characters',
});

// Display as parts are generated
for await (const partial of result.partialObjectStream) {
  if (partial.characters) {
    partial.characters.forEach((char, idx) => {
      console.log(`Character ${idx}: ${char.name || '...'}`);
    });
  }
}
```

## Error Handling

```typescript
import { generateObject, NoObjectGeneratedError } from 'ai';

try {
  const { object } = await generateObject({
    model: openai('gpt-4o'),
    schema: mySchema,
    prompt: 'Generate data',
  });
} catch (error) {
  if (error instanceof NoObjectGeneratedError) {
    console.error('Object not generated');
  }
}
```

## Complete API Reference

### generateObject()

```typescript
function generateObject<T>(options: {
  // Model
  model: LanguageModel;

  // Schema
  schema: FlexibleSchema<T>;
  schemaName?: string;
  schemaDescription?: string;

  // Mode
  mode?: 'auto' | 'json' | 'tool';

  // Input
  prompt?: string;
  messages?: CoreMessage[];
  system?: string;

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
  experimental_telemetry?: TelemetrySettings;
}): Promise<GenerateObjectResult<T>>;
```

### streamObject()

```typescript
function streamObject<T>(options: {
  // Same as generateObject, plus:
  onChunk?: (chunk: ObjectStreamPart<T>) => void;
}): Promise<StreamObjectResult<T>>;
```

### Result Interfaces

```typescript
interface GenerateObjectResult<T> {
  object: T;
  reasoning?: string;
  finishReason: FinishReason;
  usage: LanguageModelUsage;
  warnings?: CallWarning[];
  request: LanguageModelRequestMetadata;
  response: LanguageModelResponseMetadata & { body?: unknown };
  providerMetadata?: ProviderMetadata;
  toJsonResponse(init?: ResponseInit): Response;
}

interface StreamObjectResult<T> {
  partialObjectStream: AsyncIterableStream<DeepPartial<T>>;
  elementStream: AsyncIterableStream<T>; // For arrays
  textStream: AsyncIterableStream<string>;
  fullStream: AsyncIterableStream<ObjectStreamPart<T>>;
  object: Promise<T>;
  usage: Promise<LanguageModelUsage>;
  finishReason: Promise<FinishReason>;
  warnings: Promise<CallWarning[] | undefined>;
  providerMetadata: Promise<ProviderMetadata | undefined>;
  request: Promise<LanguageModelRequestMetadata>;
  response: Promise<LanguageModelResponseMetadata>;
  toTextStreamResponse(init?: ResponseInit): Response;
}

type ObjectStreamPart<T> =
  | { type: 'object'; object: T }
  | { type: 'text-delta'; textDelta: string }
  | { type: 'finish'; finishReason: FinishReason; usage: LanguageModelUsage }
  | { type: 'error'; error: unknown };
```
