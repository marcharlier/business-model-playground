# useChat Hook

Multi-turn conversational AI with message history, streaming responses, and tool call support.

## API

```typescript { .api }
function useChat<UI_MESSAGE extends UIMessage = UIMessage>(
  options?: UseChatOptions<UI_MESSAGE>
): UseChatHelpers<UI_MESSAGE>;

interface UseChatHelpers<UI_MESSAGE extends UIMessage> {
  readonly id: string;
  messages: UI_MESSAGE[];
  setMessages: (messages: UI_MESSAGE[] | ((messages: UI_MESSAGE[]) => UI_MESSAGE[])) => void;
  sendMessage: (
    message?: CreateUIMessage<UI_MESSAGE> | { text: string; files?: FileList | FileUIPart[] },
    options?: ChatRequestOptions
  ) => Promise<void>;
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

## Basic Usage

```typescript
import { useChat } from '@ai-sdk/react';

function ChatComponent() {
  const { messages, sendMessage, status, error, stop } = useChat({
    onFinish: ({ message }) => console.log('Response finished:', message),
    onError: (error) => console.error('Error:', error),
  });

  return (
    <div>
      {messages.map((message) => (
        <div key={message.id}>
          <strong>{message.role}:</strong>
          {message.parts.map((part) =>
            part.type === 'text' && <span key={part.text}>{part.text}</span>
          )}
        </div>
      ))}

      <button onClick={() => sendMessage({ text: 'Hello!' })} disabled={status === 'streaming'}>
        Send
      </button>

      {status === 'streaming' && <button onClick={stop}>Stop</button>}
      {error && <div>{error.message}</div>}
    </div>
  );
}
```

## Production Patterns

### Error Handling with Retry

```typescript
import { useChat } from '@ai-sdk/react';
import { useState } from 'react';

function ResilientChat() {
  const [retryCount, setRetryCount] = useState(0);

  const { messages, sendMessage, error, clearError, status } = useChat({
    onError: (error) => {
      console.error('Chat error:', error);
      // Auto-retry on network errors
      if (error.message.includes('network') && retryCount < 3) {
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          clearError();
          // Resend last message
        }, 1000 * Math.pow(2, retryCount));
      }
    },
    onFinish: () => setRetryCount(0), // Reset on success
  });

  const handleSend = async (text: string) => {
    try {
      await sendMessage({ text });
    } catch (err) {
      // Handle in onError callback
    }
  };

  return (
    <div>
      {error && (
        <div className="error-banner">
          <p>Error: {error.message}</p>
          {retryCount > 0 && <p>Retry attempt {retryCount}/3...</p>}
          <button onClick={() => { clearError(); handleSend('Retry') }}>
            Retry Manually
          </button>
        </div>
      )}

      {messages.map(m => <div key={m.id}>{/* Render message */}</div>)}

      <button onClick={() => handleSend('Hello')} disabled={status === 'streaming'}>
        Send
      </button>
    </div>
  );
}
```

### File Upload Support

```typescript
import { useChat } from '@ai-sdk/react';
import { useRef } from 'react';

function ChatWithFiles() {
  const { messages, sendMessage, status } = useChat();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSendWithFiles = async () => {
    const files = fileInputRef.current?.files;
    const text = 'Analyze these images';

    if (files && files.length > 0) {
      // Send message with files
      await sendMessage({ text, files });
      // Clear file input
      if (fileInputRef.current) fileInputRef.current.value = '';
    } else {
      await sendMessage({ text });
    }
  };

  return (
    <div>
      {messages.map((message) => (
        <div key={message.id}>
          {message.parts.map((part, i) => {
            if (part.type === 'text') {
              return <p key={i}>{part.text}</p>;
            }
            if (part.type === 'file' && part.mediaType.startsWith('image/')) {
              return <img key={i} src={part.url} alt={part.filename} />;
            }
            return null;
          })}
        </div>
      ))}

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        disabled={status === 'streaming'}
      />
      <button onClick={handleSendWithFiles} disabled={status === 'streaming'}>
        Send with Files
      </button>
    </div>
  );
}
```

### Tool Call Handling

```typescript
import { useChat } from '@ai-sdk/react';

// Define your tools with proper types
type MyTools = {
  getWeather: {
    input: { location: string };
    output: { temp: number; conditions: string };
  };
  searchWeb: {
    input: { query: string };
    output: { results: string[] };
  };
};

interface MyMessage extends UIMessage<unknown, UIDataTypes, MyTools> {}

function ChatWithTools() {
  const { messages, sendMessage, addToolResult } = useChat<MyMessage>({
    // IMPORTANT: onToolCall returns void, not the result
    // Use it for logging or triggering side effects
    onToolCall: ({ toolCall }) => {
      console.log('Tool called:', toolCall.toolName, toolCall.args);
    },

    // Auto-retry tool calls that fail
    onFinish: async ({ message }) => {
      const failedTools = message.parts.filter(
        p => (p.type.startsWith('tool-') || p.type === 'dynamic-tool') && p.state === 'output-error'
      );

      if (failedTools.length > 0) {
        console.log('Some tools failed, consider retry logic');
      }
    },
  });

  // Execute tool calls manually with proper error handling
  const executeToolCall = async (toolName: keyof MyTools, toolCallId: string, args: any) => {
    try {
      let output;

      if (toolName === 'getWeather') {
        const response = await fetch(`/api/weather?location=${args.location}`);
        if (!response.ok) throw new Error('Weather API failed');
        output = await response.json();
      } else if (toolName === 'searchWeb') {
        const response = await fetch('/api/search', {
          method: 'POST',
          body: JSON.stringify({ query: args.query }),
        });
        if (!response.ok) throw new Error('Search API failed');
        output = await response.json();
      }

      // Add successful result
      await addToolResult({
        tool: toolName,
        toolCallId,
        output,
      });
    } catch (error) {
      // Add error result
      await addToolResult({
        tool: toolName,
        toolCallId,
        state: 'output-error',
        errorText: error instanceof Error ? error.message : 'Tool execution failed',
      });
    }
  };

  // Render tool calls in UI
  const renderToolCall = (part: ToolUIPart<MyTools>) => {
    const toolName = part.type.slice(5); // Remove 'tool-' prefix

    return (
      <div className="tool-call">
        <strong>🔧 {toolName}</strong>
        {part.state === 'input-available' && (
          <>
            <pre>Input: {JSON.stringify(part.input, null, 2)}</pre>
            <button onClick={() => executeToolCall(toolName as keyof MyTools, part.toolCallId, part.input)}>
              Execute
            </button>
          </>
        )}
        {part.state === 'output-available' && (
          <pre>Output: {JSON.stringify(part.output, null, 2)}</pre>
        )}
        {part.state === 'output-error' && (
          <div className="error">
            Error: {part.errorText}
            <button onClick={() => executeToolCall(toolName as keyof MyTools, part.toolCallId, part.input)}>
              Retry
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      {messages.map((message) => (
        <div key={message.id}>
          {message.parts.map((part, i) => {
            if (part.type === 'text') return <p key={i}>{part.text}</p>;
            if (part.type.startsWith('tool-')) return <div key={i}>{renderToolCall(part)}</div>;
            return null;
          })}
        </div>
      ))}

      <button onClick={() => sendMessage({ text: 'What is the weather in London?' })}>
        Ask about weather
      </button>
    </div>
  );
}
```

### Automatic Tool Execution

```typescript
function AutoToolChat() {
  const { messages, sendMessage, addToolResult } = useChat({
    // Automatically execute tool calls
    onToolCall: async ({ toolCall }) => {
      console.log('Auto-executing tool:', toolCall.toolName);

      try {
        // Execute the tool
        const result = await executeToolFunction(toolCall.toolName, toolCall.args);

        // Add the result
        await addToolResult({
          tool: toolCall.toolName,
          toolCallId: toolCall.toolCallId,
          output: result,
        });
      } catch (error) {
        // Add error result
        await addToolResult({
          tool: toolCall.toolName,
          toolCallId: toolCall.toolCallId,
          state: 'output-error',
          errorText: error.message,
        });
      }
    },

    // Auto-continue conversation after tool results
    sendAutomaticallyWhen: ({ messages }) => {
      const lastMessage = messages[messages.length - 1];
      return lastMessage?.parts.some(
        part => (part.type.startsWith('tool-') || part.type === 'dynamic-tool') &&
                part.state === 'output-available'
      ) || false;
    },
  });

  async function executeToolFunction(toolName: string, args: any) {
    // Your tool execution logic
    if (toolName === 'getWeather') {
      const response = await fetch(`/api/weather?location=${args.location}`);
      return response.json();
    }
    throw new Error(`Unknown tool: ${toolName}`);
  }

  return (
    <div>
      {messages.map(m => <div key={m.id}>{/* Render */}</div>)}
      <button onClick={() => sendMessage({ text: 'What is the weather?' })}>
        Send
      </button>
    </div>
  );
}
```

### Message Editing

```typescript
function EditableChat() {
  const { messages, setMessages, regenerate, status } = useChat();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  const startEdit = (messageId: string, currentText: string) => {
    setEditingId(messageId);
    setEditText(currentText);
  };

  const saveEdit = () => {
    if (!editingId) return;

    setMessages(messages.map(msg =>
      msg.id === editingId
        ? { ...msg, parts: [{ type: 'text', text: editText }] }
        : msg
    ));
    setEditingId(null);
    setEditText('');
  };

  const regenerateFromEdit = async (messageId: string) => {
    await regenerate({ messageId });
  };

  return (
    <div>
      {messages.map((message) => {
        const textPart = message.parts.find(p => p.type === 'text');
        const isEditing = editingId === message.id;

        return (
          <div key={message.id}>
            {isEditing ? (
              <>
                <textarea value={editText} onChange={e => setEditText(e.target.value)} />
                <button onClick={saveEdit}>Save</button>
                <button onClick={() => setEditingId(null)}>Cancel</button>
              </>
            ) : (
              <>
                <p>{textPart?.text}</p>
                {message.role === 'user' && (
                  <button onClick={() => startEdit(message.id, textPart?.text || '')}>
                    Edit
                  </button>
                )}
                {message.role === 'assistant' && (
                  <button onClick={() => regenerateFromEdit(message.id)} disabled={status === 'streaming'}>
                    Regenerate
                  </button>
                )}
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
```

### Streaming State Management

```typescript
function StreamingChat() {
  const { messages, sendMessage, status, stop } = useChat({
    experimental_throttle: 100, // Update every 100ms for smoother rendering
  });

  // Track streaming state for last message
  const lastMessage = messages[messages.length - 1];
  const isStreaming = status === 'streaming';
  const streamingText = lastMessage?.parts.find(
    p => p.type === 'text' && p.state === 'streaming'
  );

  return (
    <div>
      {messages.map((message) => (
        <div key={message.id} className={message.role}>
          {message.parts.map((part, i) => {
            if (part.type === 'text') {
              return (
                <p key={i}>
                  {part.text}
                  {part.state === 'streaming' && <span className="cursor">▊</span>}
                </p>
              );
            }
            return null;
          })}
        </div>
      ))}

      {isStreaming && (
        <div className="streaming-indicator">
          <span>AI is typing...</span>
          <button onClick={stop}>Stop</button>
        </div>
      )}

      <button onClick={() => sendMessage({ text: 'Hello' })} disabled={isStreaming}>
        Send Message
      </button>
    </div>
  );
}
```

### Advanced Configuration

```typescript
import { useChat } from '@ai-sdk/react';

function AdvancedChat() {
  const chat = useChat({
    id: 'my-chat',
    experimental_throttle: 100,
    resume: true, // Auto-resume interrupted streams on mount

    messages: [
      {
        id: 'welcome',
        role: 'system',
        parts: [{ type: 'text', text: 'You are a helpful assistant.' }],
      },
    ],

    onToolCall: ({ toolCall }) => {
      console.log('Tool called:', toolCall);
    },

    onFinish: ({ message, isAbort, isDisconnect, isError }) => {
      if (isError) console.error('Response error');
      else if (isAbort) console.log('Response aborted');
      else if (isDisconnect) console.log('Stream disconnected');
      else console.log('Response complete:', message);
    },

    onError: (error) => {
      console.error('Chat error:', error);
      // Send to error tracking
    },
  });

  return (
    <div>
      {chat.messages.map(m => <div key={m.id}>{/* Render */}</div>)}
      <button onClick={() => chat.sendMessage({ text: 'Hello' })}>Send</button>
    </div>
  );
}
```

## Message Part Types

```typescript
// Text content
interface TextUIPart {
  type: 'text';
  text: string;
  state?: 'streaming' | 'done';
}

// AI reasoning (e.g., from models with extended thinking)
interface ReasoningUIPart {
  type: 'reasoning';
  text: string;
  state?: 'streaming' | 'done';
}

// File attachments
interface FileUIPart {
  type: 'file';
  mediaType: string; // MIME type
  filename?: string;
  url: string;
}

// External sources
interface SourceUrlUIPart {
  type: 'source-url';
  sourceId: string;
  url: string;
  title?: string;
}

// Tool calls
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

## Best Practices

1. **Type your messages**: Define custom `UIMessage` types with specific metadata, data, and tool types
2. **Handle all states**: Show appropriate UI for 'submitted', 'streaming', 'ready', and 'error' states
3. **Implement retry logic**: Add exponential backoff for failed requests
4. **Use error boundaries**: Wrap chat components in error boundaries
5. **Throttle updates**: Use `experimental_throttle` for large responses
6. **Tool call errors**: Always handle tool execution failures gracefully
7. **Optimize rendering**: Memoize message components to prevent unnecessary re-renders
8. **File validation**: Validate file types and sizes before sending
9. **Clear user feedback**: Show loading states, errors, and streaming indicators
10. **Test edge cases**: Test network failures, tool errors, and stream interruptions
