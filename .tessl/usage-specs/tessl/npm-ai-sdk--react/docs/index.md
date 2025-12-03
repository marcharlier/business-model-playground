# AI SDK React

React hooks for building AI-powered chat interfaces, text completions, and structured object streaming. Part of the Vercel AI SDK ecosystem, this package provides optimized state management, real-time streaming, and type-safe APIs for integrating AI capabilities into React applications.

## Package Information

- **Package Name**: @ai-sdk/react
- **Installation**: `npm install @ai-sdk/react`

## Imports

```typescript
import { useChat, useCompletion, experimental_useObject } from '@ai-sdk/react';
```

## Core Hooks

- **useChat**: Multi-turn conversational AI with message history, streaming, and tool calls
- **useCompletion**: Single-turn text completion with streaming and form helpers
- **experimental_useObject**: Streams structured objects validated with Zod schemas

All hooks use React's `useSyncExternalStore` for state management and SWR for caching, enabling state sharing across components with the same ID.

## Quick Start

```typescript
import { useChat } from '@ai-sdk/react';

function ChatComponent() {
  const { messages, sendMessage, status, stop, error } = useChat();

  return (
    <div>
      {messages.map((message) => (
        <div key={message.id}>
          {message.parts.map((part) =>
            part.type === 'text' && <span key={part.text}>{part.text}</span>
          )}
        </div>
      ))}
      <button
        onClick={() => sendMessage({ parts: [{ type: 'text', text: 'Hello!' }] })}
        disabled={status === 'streaming'}
      >
        Send
      </button>
      {status === 'streaming' && <button onClick={stop}>Stop</button>}
      {error && <div>Error: {error.message}</div>}
    </div>
  );
}
```

## API Reference

### useChat

```typescript { .api }
function useChat<UI_MESSAGE extends UIMessage = UIMessage>(
  options?: UseChatOptions<UI_MESSAGE>
): UseChatHelpers<UI_MESSAGE>;

type UseChatOptions<UI_MESSAGE extends UIMessage> = (
  | { chat: Chat<UI_MESSAGE> }
  | ChatInit<UI_MESSAGE>
) & {
  experimental_throttle?: number;
  resume?: boolean;
};

interface UseChatHelpers<UI_MESSAGE extends UIMessage> {
  readonly id: string;
  messages: UI_MESSAGE[];
  setMessages: (messages: UI_MESSAGE[] | ((messages: UI_MESSAGE[]) => UI_MESSAGE[])) => void;
  sendMessage: (message?: CreateUIMessage<UI_MESSAGE> | { text: string; files?: FileList | FileUIPart[] }, options?: ChatRequestOptions) => Promise<void>;
  regenerate: (options?: { messageId?: string } & ChatRequestOptions) => Promise<void>;
  stop: () => Promise<void>;
  resumeStream: (options?: ChatRequestOptions) => Promise<void>;
  addToolResult: <TOOL extends keyof InferUIMessageTools<UI_MESSAGE>>(
    options: { tool: TOOL; toolCallId: string; output: InferUIMessageTools<UI_MESSAGE>[TOOL]['output'] }
            | { state: 'output-error'; tool: TOOL; toolCallId: string; errorText: string }
  ) => Promise<void>;
  status: 'submitted' | 'streaming' | 'ready' | 'error';
  error: Error | undefined;
  clearError: () => void;
}
```

[Complete useChat documentation](./use-chat.md)

### useCompletion

```typescript { .api }
function useCompletion(
  options?: UseCompletionOptions & { experimental_throttle?: number }
): UseCompletionHelpers;

interface UseCompletionHelpers {
  completion: string;
  complete: (prompt: string, options?: CompletionRequestOptions) => Promise<string | null | undefined>;
  error: undefined | Error;
  stop: () => void;
  setCompletion: (completion: string) => void;
  input: string;
  setInput: React.Dispatch<React.SetStateAction<string>>;
  handleInputChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSubmit: (event?: { preventDefault?: () => void }) => void;
  isLoading: boolean;
}
```

[Complete useCompletion documentation](./use-completion.md)

### experimental_useObject

```typescript { .api }
function experimental_useObject<
  SCHEMA extends ZodType | Schema,
  RESULT = InferSchema<SCHEMA>,
  INPUT = any
>(
  options: Experimental_UseObjectOptions<SCHEMA, RESULT>
): Experimental_UseObjectHelpers<RESULT, INPUT>;

interface Experimental_UseObjectHelpers<RESULT, INPUT> {
  submit: (input: INPUT) => void;
  object: DeepPartial<RESULT> | undefined;
  error: Error | undefined;
  isLoading: boolean;
  stop: () => void;
  clear: () => void;
}
```

[Complete useObject documentation](./use-object.md)

## Essential Types

### UIMessage

Core message type used throughout the package.

```typescript { .api }
interface UIMessage<METADATA = unknown, DATA_PARTS extends UIDataTypes = UIDataTypes, TOOLS extends UITools = UITools> {
  id: string;
  role: 'system' | 'user' | 'assistant';
  metadata?: METADATA;
  parts: Array<UIMessagePart<DATA_PARTS, TOOLS>>;
}

// Common part types
type UIMessagePart<DATA_TYPES, TOOLS> =
  | TextUIPart      // { type: 'text'; text: string; state?: 'streaming' | 'done' }
  | ReasoningUIPart // { type: 'reasoning'; text: string; state?: 'streaming' | 'done' }
  | ToolUIPart<TOOLS>
  | FileUIPart      // { type: 'file'; mediaType: string; url: string; filename?: string }
  | DataUIPart<DATA_TYPES>
  | DynamicToolUIPart | SourceUrlUIPart | SourceDocumentUIPart | StepStartUIPart;

interface ToolUIPart<TOOLS extends UITools = UITools> {
  type: `tool-${string}`;
  toolCallId: string;
  state: 'input-streaming' | 'input-available' | 'output-available' | 'output-error';
  input?: unknown;
  output?: unknown;
  errorText?: string;
  providerExecuted?: boolean;
}
```

### CreateUIMessage

Type for creating new messages without requiring all fields.

```typescript { .api }
type CreateUIMessage<UI_MESSAGE extends UIMessage> = Omit<UI_MESSAGE, 'id' | 'role'> & {
  id?: UI_MESSAGE['id'];
  role?: UI_MESSAGE['role'];
};
```

### ChatInit & Options

```typescript { .api }
interface ChatInit<UI_MESSAGE extends UIMessage> {
  id?: string;
  messages?: UI_MESSAGE[];
  transport?: ChatTransport<UI_MESSAGE>;
  onError?: (error: Error) => void;
  onToolCall?: (options: { toolCall: InferUIMessageToolCall<UI_MESSAGE> }) => void | PromiseLike<void>;
  onFinish?: (options: { message: UI_MESSAGE; messages: UI_MESSAGE[]; isAbort: boolean; isDisconnect: boolean; isError: boolean }) => void;
  sendAutomaticallyWhen?: (options: { messages: UI_MESSAGE[] }) => boolean | PromiseLike<boolean>;
}

interface ChatRequestOptions {
  headers?: Record<string, string> | Headers;
  body?: object;
  metadata?: unknown;
}

interface UseCompletionOptions {
  api?: string;
  id?: string;
  initialInput?: string;
  initialCompletion?: string;
  onFinish?: (prompt: string, completion: string) => void;
  onError?: (error: Error) => void;
  credentials?: RequestCredentials;
  headers?: Record<string, string> | Headers;
  body?: object;
  streamProtocol?: 'data' | 'text';
  fetch?: FetchFunction;
}
```

### Utility Types

```typescript { .api }
// Deeply partial type for streaming objects
type DeepPartial<T> = T extends object ? { [P in keyof T]?: DeepPartial<T[P]> } : T;

// Inference helpers
type InferUIMessageMetadata<T extends UIMessage> = T extends UIMessage<infer METADATA, any, any> ? METADATA : unknown;
type InferUIMessageTools<T extends UIMessage> = T extends UIMessage<any, any, infer TOOLS> ? TOOLS : UITools;
type InferUIMessageToolCall<UI_MESSAGE extends UIMessage> = { toolName: string; args: unknown; toolCallId: string };

type UITools = Record<string, { input: unknown; output: unknown }>;
type UIDataTypes = Record<string, unknown>;
```

## Common Patterns

### Error Boundary Wrapper

Production-ready error handling for AI components.

```typescript
import { Component, ReactNode } from 'react';

interface Props { children: ReactNode; fallback?: ReactNode }
interface State { error: Error | null }

class AIErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('AI Component Error:', error, errorInfo);
    // Log to error tracking service
  }

  render() {
    if (this.state.error) {
      return this.props.fallback || (
        <div role="alert">
          <p>Something went wrong with the AI component.</p>
          <button onClick={() => this.setState({ error: null })}>Try again</button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Usage
<AIErrorBoundary>
  <ChatComponent />
</AIErrorBoundary>
```

### Retry Logic

Implement exponential backoff for failed requests.

```typescript
function useRetry() {
  const retry = async <T,>(
    fn: () => Promise<T>,
    maxAttempts = 3,
    delay = 1000
  ): Promise<T> => {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await fn();
      } catch (error) {
        if (attempt === maxAttempts) throw error;
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, attempt - 1)));
      }
    }
    throw new Error('Max retries exceeded');
  };
  return { retry };
}

// Usage with useChat
const { sendMessage } = useChat({ onError: (error) => console.error(error) });
const { retry } = useRetry();

const handleSendWithRetry = () =>
  retry(() => sendMessage({ text: 'Hello!' }));
```

### Optimistic Updates

Update UI immediately before server response.

```typescript
function OptimisticChat() {
  const { messages, setMessages, sendMessage, status } = useChat();

  const handleOptimisticSend = async (text: string) => {
    const optimisticMsg: UIMessage = {
      id: `temp-${Date.now()}`,
      role: 'user',
      parts: [{ type: 'text', text }],
    };

    setMessages(prev => [...prev, optimisticMsg]);

    try {
      await sendMessage({ text });
    } catch (error) {
      // Rollback on error
      setMessages(prev => prev.filter(m => m.id !== optimisticMsg.id));
      throw error;
    }
  };

  return (
    <div>
      {messages.map(m => (
        <div key={m.id} className={m.id.startsWith('temp-') ? 'optimistic' : ''}>
          {m.parts.find(p => p.type === 'text')?.text}
        </div>
      ))}
      <button onClick={() => handleOptimisticSend('Hello')} disabled={status === 'streaming'}>
        Send
      </button>
    </div>
  );
}
```

### Shared State Pattern

Multiple components sharing the same chat state.

```typescript
// components/ChatMessages.tsx
function ChatMessages() {
  const { messages } = useChat({ id: 'shared-chat' });
  return <div>{messages.map(m => <div key={m.id}>{/* Render */}</div>)}</div>;
}

// components/ChatInput.tsx
function ChatInput() {
  const { sendMessage, status } = useChat({ id: 'shared-chat' });
  return (
    <button onClick={() => sendMessage({ text: 'Hello' })} disabled={status === 'streaming'}>
      Send
    </button>
  );
}

// app/page.tsx
function App() {
  return (
    <>
      <ChatMessages />
      <ChatInput />
    </>
  );
}
```

## Production Considerations

### Performance Optimization

```typescript
// Throttle updates for better performance
const chat = useChat({
  experimental_throttle: 100, // Update UI every 100ms max
});

// Memoize message rendering
const MemoizedMessage = React.memo(({ message }) => (
  <div>{message.parts.find(p => p.type === 'text')?.text}</div>
));
```

### Type Safety

```typescript
// Define custom message types for type safety
interface MyMessage extends UIMessage<
  { userId: string },           // metadata type
  { 'custom-data': string },    // data parts type
  { getWeather: { input: { location: string }, output: { temp: number } } } // tools type
> {}

const chat = useChat<MyMessage>({
  onToolCall: ({ toolCall }) => {
    // toolCall.args is properly typed as { location: string }
  },
});
```

### Error Handling

```typescript
const chat = useChat({
  onError: (error) => {
    // Log to error tracking
    console.error('Chat error:', error);

    // Show user-friendly message
    if (error.message.includes('rate limit')) {
      toast.error('Too many requests. Please wait a moment.');
    } else {
      toast.error('An error occurred. Please try again.');
    }
  },
});
```

### Loading States

```typescript
function ChatWithLoadingStates() {
  const { status, messages } = useChat();

  return (
    <div>
      {status === 'submitted' && <div>Sending message...</div>}
      {status === 'streaming' && <div>AI is typing...</div>}
      {status === 'error' && <div>Error occurred</div>}
      {status === 'ready' && messages.length === 0 && <div>Start a conversation</div>}
    </div>
  );
}
```

## Best Practices

1. **Always handle errors**: Implement `onError` callback and show user-friendly messages
2. **Use error boundaries**: Wrap AI components in error boundaries for resilience
3. **Throttle updates**: Use `experimental_throttle` for large responses to improve performance
4. **Implement retry logic**: Add exponential backoff for transient failures
5. **Type your messages**: Define custom message types for better type safety
6. **Share state wisely**: Use the `id` option to share state across components
7. **Handle loading states**: Show appropriate UI for each status
8. **Optimize rendering**: Memoize message components to prevent unnecessary re-renders
9. **Clean up subscriptions**: Hooks handle cleanup automatically, but be aware of component lifecycle
10. **Test error scenarios**: Test network failures, rate limits, and validation errors

## Advanced Topics

See individual hook documentation for:
- Tool call handling and automatic execution ([useChat](./use-chat.md))
- File uploads and multimodal messages ([useChat](./use-chat.md))
- Streaming optimization and debouncing ([useCompletion](./use-completion.md))
- Schema validation and error recovery ([experimental_useObject](./use-object.md))
- Custom transports and fetch implementations (all hooks)
