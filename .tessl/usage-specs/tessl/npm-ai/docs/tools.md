# Tools

Define and execute tools with type safety for multi-step AI workflows.

## Basic Tool Definition

```typescript
import { tool } from 'ai';
import { z } from 'zod';

const getWeather = tool({
  description: 'Get weather for a location',
  inputSchema: z.object({
    location: z.string().describe('City name'),
  }),
  execute: async ({ location }) => ({
    temperature: 72,
    condition: 'sunny',
    location,
  }),
});
```

## Using Tools

```typescript
const result = await generateText({
  model: openai('gpt-4o'),
  prompt: 'What is the weather in San Francisco?',
  tools: {
    getWeather,
  },
});

console.log(result.toolCalls); // Tools model called
console.log(result.toolResults); // Tool execution results
console.log(result.text); // Final response
```

## Tool Choice Control

```typescript
// Auto: Model decides (default)
await generateText({
  model: openai('gpt-4o'),
  prompt: 'Calculate 5 + 3',
  tools: { calculator },
  toolChoice: 'auto',
});

// Required: Must use a tool
await generateText({
  model: openai('gpt-4o'),
  prompt: 'Calculate 5 + 3',
  tools: { calculator },
  toolChoice: 'required',
});

// Specific tool
await generateText({
  model: openai('gpt-4o'),
  prompt: 'Calculate 5 + 3',
  tools: { calculator },
  toolChoice: { type: 'tool', toolName: 'calculator' },
});

// None: Don't use tools
await generateText({
  model: openai('gpt-4o'),
  prompt: 'Just say hello',
  tools: { calculator },
  toolChoice: 'none',
});
```

## Multi-Step Workflows

```typescript
const result = await generateText({
  model: openai('gpt-4o'),
  prompt: 'Research and summarize quantum computing',
  tools: {
    search: tool({
      description: 'Search the web',
      inputSchema: z.object({ query: z.string() }),
      execute: async ({ query }) => ({ results: [] }),
    }),
    readArticle: tool({
      description: 'Read article content',
      inputSchema: z.object({ url: z.string() }),
      execute: async ({ url }) => ({ content: '' }),
    }),
  },
  maxSteps: 10, // Allow multiple rounds of tool calls
});
```

## Type Reference

```typescript
interface Tool<INPUT = unknown, OUTPUT = unknown> {
  description?: string;
  inputSchema: ZodSchema<INPUT>;
  outputSchema?: ZodSchema<OUTPUT>;
  execute: (input: INPUT, options: ToolCallOptions) => Promise<OUTPUT> | OUTPUT;
}

interface ToolCall {
  toolCallId: string;
  toolName: string;
  args: JSONValue;
}

interface ToolResult {
  toolCallId: string;
  toolName: string;
  args: JSONValue;
  result: JSONValue;
}

type ToolChoice =
  | 'auto'
  | 'none'
  | 'required'
  | { type: 'tool'; toolName: string };
```

## Tool Examples

### Database Query

```typescript
const queryDB = tool({
  description: 'Query the database',
  inputSchema: z.object({
    table: z.enum(['users', 'products', 'orders']),
    filters: z.record(z.any()).optional(),
    limit: z.number().default(10),
  }),
  execute: async ({ table, filters, limit }) => {
    // Execute query
    return { results: [] };
  },
});
```

### API Call

```typescript
const callAPI = tool({
  description: 'Call an external API',
  inputSchema: z.object({
    endpoint: z.string().url(),
    method: z.enum(['GET', 'POST', 'PUT', 'DELETE']),
    body: z.record(z.any()).optional(),
  }),
  execute: async ({ endpoint, method, body }) => {
    const response = await fetch(endpoint, { method, body: JSON.stringify(body) });
    return await response.json();
  },
});
```

### Code Execution

```typescript
const executeCode = tool({
  description: 'Execute JavaScript code',
  inputSchema: z.object({
    code: z.string(),
    timeout: z.number().default(1000),
  }),
  execute: async ({ code, timeout }) => {
    // Use VM sandbox
    return { result: 'executed' };
  },
});
```

## Streaming with Tools

```typescript
const result = await streamText({
  model: openai('gpt-4o'),
  prompt: 'Calculate and explain 5 + 3',
  tools: { calculator },
});

for await (const chunk of result.fullStream) {
  if (chunk.type === 'tool-call') {
    console.log('Calling tool:', chunk.toolName, chunk.args);
  } else if (chunk.type === 'tool-result') {
    console.log('Result:', chunk.result);
  } else if (chunk.type === 'text-delta') {
    process.stdout.write(chunk.textDelta);
  }
}
```

## Dynamic Tools

```typescript
import { dynamicTool } from 'ai';

// Tool with unknown schema at runtime
const mcpTool = dynamicTool({
  description: 'Dynamic MCP tool',
  inputSchema: z.object({
    query: z.string(),
    options: z.record(z.unknown()).optional(),
  }),
  execute: async (input) => {
    // Execute dynamic tool
    return { result: 'dynamic' };
  },
});
```

## Type-Safe Results

```typescript
const getUser = tool({
  description: 'Get user info',
  inputSchema: z.object({ userId: z.string() }),
  execute: async ({ userId }): Promise<{ id: string; name: string; email: string }> => {
    return { id: userId, name: 'John', email: 'john@example.com' };
  },
});

const result = await generateText({
  model: openai('gpt-4o'),
  prompt: 'Get user-123',
  tools: { getUser },
});

// Access typed results
result.toolResults?.forEach((toolResult) => {
  if (toolResult.toolName === 'getUser') {
    const userResult = toolResult.result as { id: string; name: string; email: string };
    console.log(userResult.name);
  }
});
```

## Complete API Reference

### tool()

```typescript
function tool<INPUT, OUTPUT>(options: {
  description?: string;
  inputSchema: FlexibleSchema<INPUT>;
  outputSchema?: FlexibleSchema<OUTPUT>;
  execute?: (input: INPUT, options: ToolCallOptions) => AsyncIterable<OUTPUT> | PromiseLike<OUTPUT> | OUTPUT;
  providerOptions?: Record<string, unknown>;
  onInputStart?: (options: ToolCallOptions) => void | PromiseLike<void>;
  onInputDelta?: (options: { inputTextDelta: string } & ToolCallOptions) => void | PromiseLike<void>;
  onInputAvailable?: (options: { input: INPUT } & ToolCallOptions) => void | PromiseLike<void>;
  toModelOutput?: (output: OUTPUT) => unknown;
}): Tool<INPUT, OUTPUT>;
```

### dynamicTool()

```typescript
function dynamicTool(options: {
  description?: string;
  inputSchema: FlexibleSchema<unknown>;
  execute: (input: unknown, options: ToolCallOptions) => AsyncIterable<unknown> | PromiseLike<unknown> | unknown;
  toModelOutput?: (output: unknown) => unknown;
  providerOptions?: Record<string, unknown>;
}): Tool<unknown, unknown> & { type: 'dynamic' };
```

### Tool Interfaces

```typescript
interface Tool<INPUT = unknown, OUTPUT = unknown> {
  description?: string;
  inputSchema: FlexibleSchema<INPUT>;
  outputSchema?: FlexibleSchema<OUTPUT>;
  execute?: (input: INPUT, options: ToolCallOptions) => AsyncIterable<OUTPUT> | PromiseLike<OUTPUT> | OUTPUT;
  providerOptions?: Record<string, unknown>;
  type?: 'function' | 'dynamic' | 'provider-defined';
}

interface ToolCallOptions {
  toolCallId: string;
  messages: ModelMessage[];
  abortSignal?: AbortSignal;
  experimental_context?: unknown;
}

interface ToolCall {
  toolCallId: string;
  toolName: string;
  args: JSONValue;
}

interface ToolResult {
  toolCallId: string;
  toolName: string;
  args: JSONValue;
  result: JSONValue;
}

type TypedToolCall<TTools extends Record<string, Tool>> = {
  [K in keyof TTools]: {
    toolCallId: string;
    toolName: K;
    args: InferToolInput<TTools[K]>;
  };
}[keyof TTools];

type TypedToolResult<TTools extends Record<string, Tool>> = {
  [K in keyof TTools]: {
    toolCallId: string;
    toolName: K;
    args: InferToolInput<TTools[K]>;
    result: InferToolOutput<TTools[K]>;
  };
}[keyof TTools];
```

