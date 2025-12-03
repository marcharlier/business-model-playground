# UI Integration

Build chat interfaces with streaming support.

## Basic Usage

### Server (Next.js)

```typescript
export async function POST(req: Request) {
  const { messages } = await req.json();
  
  const result = await streamText({
    model: openai('gpt-4o'),
    messages,
  });
  
  return result.toUIMessageStreamResponse();
}
```

### Client

```typescript
import { callCompletionApi, readUIMessageStream } from 'ai';

const response = await callCompletionApi({
  url: '/api/chat',
  messages: [
    { id: '1', role: 'user', content: [{ type: 'text', text: 'Hello' }] },
  ],
  streamMode: 'ui-message-stream',
});

const stream = readUIMessageStream({ stream: response.body! });

for await (const chunk of stream) {
  if (chunk.type === 'text-delta') {
    console.log('Text:', chunk.textDelta);
  }
}
```

## Type Reference

```typescript
interface UIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: UIMessagePart[];
  createdAt?: Date;
}

type UIMessagePart =
  | { type: 'text'; text: string }
  | { type: 'tool-call'; toolCallId: string; toolName: string; args: JSONValue; result?: JSONValue }
  | { type: 'file'; name?: string; mimeType: string; data?: Uint8Array; url?: string }
  | { type: 'data'; name: string; data: unknown };

type UIMessageChunk =
  | { type: 'text-delta'; textDelta: string }
  | { type: 'tool-call'; toolCallId: string; toolName: string; args: JSONValue }
  | { type: 'tool-result'; toolCallId: string; result: JSONValue }
  | { type: 'message-start'; id: string; role: 'user' | 'assistant' }
  | { type: 'message-end'; id: string }
  | { type: 'finish'; finishReason: string }
  | { type: 'error'; error: string };

function callCompletionApi(options: {
  url: string;
  messages: UIMessage[];
  body?: Record<string, unknown>;
  streamMode?: 'text' | 'ui-message-stream';
}): Promise<Response>;
```

## React Hook (useChat)

```typescript
import { useChat } from '@ai-sdk/react';

function ChatComponent() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat();
  
  return (
    <div>
      {messages.map(msg => (
        <div key={msg.id}>
          {msg.role}: {msg.content.map(c => c.type === 'text' && c.text)}
        </div>
      ))}
      <form onSubmit={handleSubmit}>
        <input value={input} onChange={handleInputChange} />
        <button disabled={isLoading}>Send</button>
      </form>
    </div>
  );
}
```

