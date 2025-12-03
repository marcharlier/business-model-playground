# Middleware

Wrap models with custom behavior for logging, caching, and transformation.

## Basic Usage

```typescript
import { wrapLanguageModel } from 'ai';

const loggingMiddleware = {
  wrapGenerate: async ({ doGenerate, params, model }) => {
    console.log('Calling:', model.modelId, params);
    const result = await doGenerate();
    console.log('Result:', result.finishReason);
    return result;
  },
};

const wrappedModel = wrapLanguageModel({
  model: openai('gpt-4o'),
  middleware: loggingMiddleware,
});
```

## Built-in Middleware

### Default Settings

```typescript
import { defaultSettingsMiddleware } from 'ai';

const model = wrapLanguageModel({
  model: openai('gpt-4o'),
  middleware: defaultSettingsMiddleware({
    settings: { temperature: 0.7, maxOutputTokens: 1000 },
  }),
});
```

### Extract Reasoning

```typescript
import { extractReasoningMiddleware } from 'ai';

const model = wrapLanguageModel({
  model: openai('gpt-4o'),
  middleware: extractReasoningMiddleware({ tagName: 'thinking' }),
});
```

### Simulate Streaming

```typescript
import { simulateStreamingMiddleware } from 'ai';

const model = wrapLanguageModel({
  model: openai('gpt-4o'),
  middleware: simulateStreamingMiddleware(),
});
```

## Custom Middleware

### Caching

```typescript
const cache = new Map<string, any>();

const cachingMiddleware = {
  wrapGenerate: async ({ doGenerate, params }) => {
    const key = JSON.stringify(params);
    if (cache.has(key)) return cache.get(key);
    
    const result = await doGenerate();
    cache.set(key, result);
    return result;
  },
};
```

### Rate Limiting

```typescript
const rateLimiter = {
  maxTokens: 10,
  tokens: 10,
  refillRate: 2,
  lastRefill: Date.now(),
  
  async acquire() {
    const now = Date.now();
    const elapsed = (now - this.lastRefill) / 1000;
    this.tokens = Math.min(this.maxTokens, this.tokens + elapsed * this.refillRate);
    this.lastRefill = now;
    
    if (this.tokens < 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      this.tokens = 0;
    } else {
      this.tokens -= 1;
    }
  },
};

const rateLimitMiddleware = {
  wrapGenerate: async ({ doGenerate }) => {
    await rateLimiter.acquire();
    return doGenerate();
  },
};
```

### Retry

```typescript
const retryMiddleware = (maxRetries = 3) => ({
  wrapGenerate: async ({ doGenerate }) => {
    let lastError;
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await doGenerate();
      } catch (error) {
        lastError = error;
        if (i < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
        }
      }
    }
    throw lastError;
  },
});
```

## Wrap Provider

```typescript
import { wrapProvider } from 'ai';

const wrappedProvider = wrapProvider({
  provider: openai,
  languageModelMiddleware: loggingMiddleware,
});

// All models from this provider use middleware
const model = wrappedProvider('gpt-4o');
```

## Type Reference

```typescript
interface LanguageModelMiddleware {
  wrapGenerate?: (options: {
    doGenerate: () => ReturnType<LanguageModelV2['doGenerate']>;
    doStream: () => ReturnType<LanguageModelV2['doStream']>;
    params: LanguageModelV2CallOptions;
    model: LanguageModelV2;
  }) => Promise<Awaited<ReturnType<LanguageModelV2['doGenerate']>>>;
  
  wrapStream?: (options: {
    doGenerate: () => ReturnType<LanguageModelV2['doGenerate']>;
    doStream: () => ReturnType<LanguageModelV2['doStream']>;
    params: LanguageModelV2CallOptions;
    model: LanguageModelV2;
  }) => PromiseLike<Awaited<ReturnType<LanguageModelV2['doStream']>>>;
  
  transformParams?: (options: {
    type: 'generate' | 'stream';
    params: LanguageModelV2CallOptions;
    model: LanguageModelV2;
  }) => PromiseLike<LanguageModelV2CallOptions>;
}
```

