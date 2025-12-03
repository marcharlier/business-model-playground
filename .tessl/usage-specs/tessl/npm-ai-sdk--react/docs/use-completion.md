# useCompletion Hook

Single-turn text completion with streaming, built-in form helpers, and state management.

## API

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

interface UseCompletionOptions {
  api?: string; // Default: '/api/completion'
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

## Basic Usage

```typescript
import { useCompletion } from '@ai-sdk/react';

function CompletionComponent() {
  const {
    completion,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
  } = useCompletion({
    api: '/api/completion',
    onFinish: (prompt, completion) => console.log('Done:', completion),
    onError: (error) => console.error('Error:', error),
  });

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          value={input}
          onChange={handleInputChange}
          placeholder="Enter your prompt..."
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Generating...' : 'Generate'}
        </button>
      </form>

      {error && <div className="error">{error.message}</div>}
      {completion && <div className="completion">{completion}</div>}
    </div>
  );
}
```

## Production Patterns

### Debounced Autocomplete

```typescript
import { useCompletion } from '@ai-sdk/react';
import { useEffect, useRef } from 'react';

function DebouncedCompletion() {
  const { completion, complete, isLoading, stop } = useCompletion({
    api: '/api/autocomplete',
    experimental_throttle: 50,
  });

  const debounceTimer = useRef<NodeJS.Timeout>();
  const [input, setInput] = useState('');

  useEffect(() => {
    // Clear existing timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Don't trigger on empty input
    if (!input.trim()) {
      stop();
      return;
    }

    // Debounce the completion request
    debounceTimer.current = setTimeout(() => {
      complete(input);
    }, 500); // Wait 500ms after user stops typing

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [input]);

  return (
    <div>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type to autocomplete..."
      />
      {isLoading && <span className="loading">Generating...</span>}
      {completion && (
        <div className="suggestion">
          <span className="user-text">{input}</span>
          <span className="completion">{completion}</span>
        </div>
      )}
    </div>
  );
}
```

### Retry with Exponential Backoff

```typescript
import { useCompletion } from '@ai-sdk/react';
import { useState } from 'react';

function ResilientCompletion() {
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  const { completion, complete, error, isLoading } = useCompletion({
    api: '/api/completion',
    onError: async (error) => {
      console.error('Completion error:', error);

      // Retry on network errors
      if (
        (error.message.includes('network') || error.message.includes('fetch')) &&
        retryCount < maxRetries
      ) {
        const delay = 1000 * Math.pow(2, retryCount); // 1s, 2s, 4s
        console.log(`Retrying in ${delay}ms... (attempt ${retryCount + 1}/${maxRetries})`);

        await new Promise(resolve => setTimeout(resolve, delay));
        setRetryCount(prev => prev + 1);
        // complete will be called again by user
      }
    },
    onFinish: () => {
      setRetryCount(0); // Reset on success
    },
  });

  const handleGenerate = async (prompt: string) => {
    try {
      await complete(prompt);
    } catch (err) {
      // Error handled in onError
    }
  };

  return (
    <div>
      {error && (
        <div className="error">
          Error: {error.message}
          {retryCount > 0 && <span> (Retry {retryCount}/{maxRetries})</span>}
          <button onClick={() => handleGenerate('Retry this')}>Retry Now</button>
        </div>
      )}

      <button onClick={() => handleGenerate('Write a poem')} disabled={isLoading}>
        Generate
      </button>

      {isLoading && <div>Loading...</div>}
      {completion && <p>{completion}</p>}
    </div>
  );
}
```

### Result Caching

```typescript
import { useCompletion } from '@ai-sdk/react';
import { useState, useEffect } from 'react';

// Simple in-memory cache
const completionCache = new Map<string, string>();

function CachedCompletion() {
  const [prompt, setPrompt] = useState('');
  const { completion, setCompletion, complete, isLoading } = useCompletion();

  const handleGenerate = async () => {
    const cacheKey = prompt.toLowerCase().trim();

    // Check cache first
    if (completionCache.has(cacheKey)) {
      console.log('Cache hit');
      setCompletion(completionCache.get(cacheKey)!);
      return;
    }

    // Generate new completion
    const result = await complete(prompt);

    // Cache the result
    if (result) {
      completionCache.set(cacheKey, result);
    }
  };

  return (
    <div>
      <input value={prompt} onChange={(e) => setPrompt(e.target.value)} />
      <button onClick={handleGenerate} disabled={isLoading}>
        Generate
      </button>

      {completion && (
        <div>
          <p>{completion}</p>
          <button onClick={() => completionCache.delete(prompt.toLowerCase().trim())}>
            Clear Cache
          </button>
        </div>
      )}
    </div>
  );
}
```

### Streaming with Cancel

```typescript
import { useCompletion } from '@ai-sdk/react';

function StreamingCompletion() {
  const { completion, complete, stop, isLoading, setCompletion } = useCompletion({
    api: '/api/completion',
    experimental_throttle: 50,
  });

  const [showCancel, setShowCancel] = useState(false);

  const handleStart = async () => {
    setShowCancel(true);
    setCompletion(''); // Clear previous completion
    await complete('Write a long story about space exploration');
    setShowCancel(false);
  };

  const handleCancel = () => {
    stop(); // Stops streaming but keeps current text
    setShowCancel(false);
  };

  return (
    <div>
      <button onClick={handleStart} disabled={isLoading}>
        Start Generation
      </button>

      {showCancel && (
        <button onClick={handleCancel} className="cancel">
          Cancel
        </button>
      )}

      <div className="streaming-output">
        {completion}
        {isLoading && <span className="cursor">▊</span>}
      </div>

      {!isLoading && completion && (
        <div className="stats">
          <small>{completion.length} characters</small>
        </div>
      )}
    </div>
  );
}
```

### Custom Headers and Body

```typescript
import { useCompletion } from '@ai-sdk/react';

function CustomCompletion() {
  const { completion, complete, isLoading } = useCompletion({
    api: '/api/completion',
    headers: {
      'X-API-Key': process.env.NEXT_PUBLIC_API_KEY || '',
      'X-User-ID': 'user-123',
    },
    body: {
      model: 'gpt-4',
      temperature: 0.7,
      max_tokens: 500,
    },
    credentials: 'include',
  });

  const handleGenerate = async (prompt: string, options?: { temperature?: number }) => {
    // Override options for this specific request
    await complete(prompt, {
      body: {
        temperature: options?.temperature || 0.7,
        max_tokens: 500,
      },
      headers: {
        'X-Priority': 'high',
      },
    });
  };

  return (
    <div>
      <button onClick={() => handleGenerate('Be creative', { temperature: 0.9 })}>
        Creative (temp 0.9)
      </button>
      <button onClick={() => handleGenerate('Be precise', { temperature: 0.3 })}>
        Precise (temp 0.3)
      </button>

      {isLoading && <div>Generating...</div>}
      {completion && <p>{completion}</p>}
    </div>
  );
}
```

### State Management with History

```typescript
import { useCompletion } from '@ai-sdk/react';
import { useState } from 'react';

interface CompletionHistory {
  prompt: string;
  completion: string;
  timestamp: number;
}

function CompletionWithHistory() {
  const { completion, setCompletion, complete, input, setInput, isLoading } = useCompletion();
  const [history, setHistory] = useState<CompletionHistory[]>([]);

  const handleSave = () => {
    if (completion && input) {
      const entry: CompletionHistory = {
        prompt: input,
        completion,
        timestamp: Date.now(),
      };
      setHistory(prev => [entry, ...prev]);
      setCompletion('');
      setInput('');
    }
  };

  const handleRestore = (entry: CompletionHistory) => {
    setInput(entry.prompt);
    setCompletion(entry.completion);
  };

  const handleRegenerate = async (prompt: string) => {
    setInput(prompt);
    await complete(prompt);
  };

  return (
    <div>
      <div className="editor">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter prompt..."
          rows={3}
        />
        <button onClick={() => complete(input)} disabled={isLoading || !input}>
          Generate
        </button>
      </div>

      {completion && (
        <div className="result">
          <p>{completion}</p>
          <button onClick={handleSave}>Save to History</button>
          <button onClick={() => setCompletion('')}>Clear</button>
        </div>
      )}

      <div className="history">
        <h3>History</h3>
        {history.map((entry, i) => (
          <div key={i} className="history-entry">
            <div className="prompt">{entry.prompt}</div>
            <div className="completion">{entry.completion.slice(0, 100)}...</div>
            <div className="actions">
              <button onClick={() => handleRestore(entry)}>Restore</button>
              <button onClick={() => handleRegenerate(entry.prompt)}>Regenerate</button>
              <button onClick={() => setHistory(prev => prev.filter((_, idx) => idx !== i))}>
                Delete
              </button>
            </div>
            <small>{new Date(entry.timestamp).toLocaleString()}</small>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Shared State Across Components

```typescript
// components/CompletionDisplay.tsx
import { useCompletion } from '@ai-sdk/react';

export function CompletionDisplay() {
  const { completion, isLoading } = useCompletion({ id: 'shared-completion' });

  return (
    <div className="display">
      {isLoading && <div className="loading">Generating...</div>}
      <div className="completion-text">{completion}</div>
    </div>
  );
}

// components/CompletionInput.tsx
export function CompletionInput() {
  const { input, handleInputChange, handleSubmit, isLoading } = useCompletion({
    id: 'shared-completion',
  });

  return (
    <form onSubmit={handleSubmit}>
      <input value={input} onChange={handleInputChange} disabled={isLoading} />
      <button type="submit" disabled={isLoading}>
        Generate
      </button>
    </form>
  );
}

// components/CompletionControls.tsx
export function CompletionControls() {
  const { stop, setCompletion, isLoading } = useCompletion({ id: 'shared-completion' });

  return (
    <div className="controls">
      {isLoading && <button onClick={stop}>Stop</button>}
      <button onClick={() => setCompletion('')}>Clear</button>
    </div>
  );
}

// app/page.tsx
export default function App() {
  return (
    <div>
      <CompletionInput />
      <CompletionControls />
      <CompletionDisplay />
    </div>
  );
}
```

### Custom Fetch with Middleware

```typescript
import { useCompletion } from '@ai-sdk/react';

function CompletionWithMiddleware() {
  const { completion, complete } = useCompletion({
    api: '/api/completion',
    fetch: async (url, options) => {
      // Add logging
      console.log('Fetching:', url, options);

      // Add authentication
      const token = localStorage.getItem('auth_token');

      // Add request timing
      const startTime = Date.now();

      try {
        const response = await fetch(url, {
          ...options,
          headers: {
            ...options?.headers,
            Authorization: token ? `Bearer ${token}` : '',
          },
        });

        // Log response time
        console.log(`Request took ${Date.now() - startTime}ms`);

        // Handle errors
        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new Error(errorData?.message || `HTTP ${response.status}`);
        }

        return response;
      } catch (error) {
        // Log to error tracking service
        console.error('Fetch error:', error);
        throw error;
      }
    },
  });

  return (
    <div>
      <button onClick={() => complete('Generate text')}>Generate</button>
      <p>{completion}</p>
    </div>
  );
}
```

## Best Practices

1. **Debounce user input**: Use debouncing for autocomplete or real-time suggestions
2. **Implement retry logic**: Add exponential backoff for transient failures
3. **Cache results**: Cache completions to reduce API calls and costs
4. **Handle cancellation**: Allow users to stop long-running completions
5. **Show progress**: Display loading states and streaming indicators
6. **Error recovery**: Provide clear error messages and retry options
7. **Validate input**: Check input before sending to avoid unnecessary API calls
8. **Optimize throttling**: Use `experimental_throttle` for smooth streaming
9. **State management**: Save completion history for better UX
10. **Monitor performance**: Track response times and error rates

## Streaming Protocols

```typescript
// Data protocol (default) - structured streaming with metadata
const dataProtocol = useCompletion({
  api: '/api/completion',
  streamProtocol: 'data', // Default
});

// Text protocol - raw text streaming
const textProtocol = useCompletion({
  api: '/api/text-completion',
  streamProtocol: 'text',
});
```

## Performance Tips

```typescript
// 1. Throttle updates for better performance
const { completion } = useCompletion({
  experimental_throttle: 100, // Update UI every 100ms max
});

// 2. Memoize rendered output
const MemoizedCompletion = React.memo(({ text }: { text: string }) => (
  <div>{text}</div>
));

// 3. Use TextDecoder for efficient text processing (handled internally)

// 4. Implement request deduplication
let requestInFlight = false;
const handleGenerate = async () => {
  if (requestInFlight) return;
  requestInFlight = true;
  try {
    await complete('prompt');
  } finally {
    requestInFlight = false;
  }
};
```
