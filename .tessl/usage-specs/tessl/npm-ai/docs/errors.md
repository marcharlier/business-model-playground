# Error Handling

Comprehensive error handling for all failure scenarios. All errors extend `AISDKError`.

## Quick Start

```typescript
import {
  APICallError,
  InvalidPromptError,
  NoContentGeneratedError,
  InvalidToolInputError,
  LoadAPIKeyError,
} from 'ai';

try {
  const { text } = await generateText({
    model: openai('gpt-4o'),
    prompt: 'Hello',
  });
} catch (error) {
  if (error instanceof APICallError) {
    console.error('API failed:', error.statusCode);
    if (error.isRetryable) {
      // Implement retry logic
    }
  } else if (error instanceof LoadAPIKeyError) {
    console.error('Set', error.environmentVariable);
  } else if (error instanceof NoContentGeneratedError) {
    if (error.finishReason === 'content-filter') {
      // Handle filtered content
    }
  }
}
```

## Error Classes

### Base Error

```typescript
// Base class for all SDK errors
class AISDKError extends Error {
  readonly name: string;
  readonly message: string;
  readonly cause?: unknown;
  static isInstance(error: unknown): error is AISDKError;
}
```

### API Errors

```typescript
// API call failed
class APICallError extends AISDKError {
  readonly url: string;
  readonly statusCode?: number;
  readonly responseHeaders?: Record<string, string>;
  readonly responseBody?: string;
  readonly isRetryable: boolean;
  readonly data?: unknown;
  static isInstance(error: unknown): error is APICallError;
}

// Empty response body
class EmptyResponseBodyError extends AISDKError {
  readonly response?: Response;
}
```

### Input Errors

```typescript
// Invalid prompt
class InvalidPromptError extends AISDKError {
  readonly prompt: unknown;
  readonly details?: string;
}

// Invalid argument
class InvalidArgumentError extends AISDKError {
  readonly parameter: string;
  readonly value: unknown;
  static isInstance(error: unknown): error is InvalidArgumentError;
}
```

### Generation Errors

```typescript
// No content generated
class NoContentGeneratedError extends AISDKError {
  readonly modelId?: string;
  readonly finishReason?: string;
}

// No object generated
class NoObjectGeneratedError extends AISDKError {
  readonly text?: string;
  readonly response?: LanguageModelResponseMetadata;
  readonly usage?: LanguageModelUsage;
  readonly finishReason?: FinishReason;
  static isInstance(error: unknown): error is NoObjectGeneratedError;
}

// No image generated
class NoImageGeneratedError extends AISDKError {
  readonly responses?: Array<ImageModelResponseMetadata>;
  static isInstance(error: unknown): error is NoImageGeneratedError;
}
```

### Tool Errors

```typescript
// Invalid tool input
class InvalidToolInputError extends AISDKError {
  readonly toolName: string;
  readonly toolInput: string;
  static isInstance(error: unknown): error is InvalidToolInputError;
}

// Tool not found
class NoSuchToolError extends AISDKError {
  readonly toolName: string;
  readonly availableTools?: string[];
}

// Tool call repair failed
class ToolCallRepairError extends AISDKError {
  readonly toolCall: unknown;
  readonly attempts?: number;
}
```

### Configuration Errors

```typescript
// API key not loaded
class LoadAPIKeyError extends AISDKError {
  readonly keyName?: string;
  readonly environmentVariable?: string;
}

// Model not found
class NoSuchModelError extends AISDKError {
  readonly modelId: string;
  readonly modelType: 'languageModel' | 'textEmbeddingModel' | 'imageModel' | 'transcriptionModel' | 'speechModel';
  static isInstance(error: unknown): error is NoSuchModelError;
}

// Provider not found
class NoSuchProviderError extends AISDKError {
  readonly providerName: string;
  readonly availableProviders?: string[];
}
```

### Data Errors

```typescript
// Invalid response data
class InvalidResponseDataError extends AISDKError {
  readonly data: unknown;
  readonly expectedStructure?: string;
}

// JSON parse error
class JSONParseError extends AISDKError {
  readonly text: string;
  readonly cause: Error;
}

// Type validation error
class TypeValidationError extends AISDKError {
  readonly value: unknown;
  readonly expectedType: string;
}
```

### Embedding Errors

```typescript
// Too many values for embedding call
class TooManyEmbeddingValuesForCallError extends AISDKError {
  readonly provider: string;
  readonly modelId: string;
  readonly maxEmbeddingsPerCall: number;
  readonly values: Array<unknown>;
  static isInstance(error: unknown): error is TooManyEmbeddingValuesForCallError;
}
```

### Feature Errors

```typescript
// Unsupported functionality
class UnsupportedFunctionalityError extends AISDKError {
  readonly provider: string;
  readonly functionality: string;
}
```

## Error Handling Patterns

### Comprehensive Handler

```typescript
import { generateText } from 'ai';
import {
  APICallError,
  InvalidPromptError,
  NoContentGeneratedError,
  LoadAPIKeyError,
  UnsupportedFunctionalityError,
} from 'ai';

async function safeGenerateText(prompt: string) {
  try {
    return await generateText({
      model: openai('gpt-4o'),
      prompt,
    });
  } catch (error) {
    // API errors (retryable)
    if (error instanceof APICallError) {
      if (error.isRetryable) {
        console.log('Retrying after API error...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        return safeGenerateText(prompt);
      }
      console.error('API error:', error.statusCode, error.message);
      throw error;
    }

    // Configuration errors
    if (error instanceof LoadAPIKeyError) {
      console.error('Set', error.environmentVariable);
      throw new Error(`Please set ${error.environmentVariable}`);
    }

    // Input errors
    if (error instanceof InvalidPromptError) {
      console.error('Invalid prompt:', error.details);
      throw new Error('Please provide a valid prompt');
    }

    // Generation errors
    if (error instanceof NoContentGeneratedError) {
      if (error.finishReason === 'content-filter') {
        console.log('Content was filtered');
        return null;
      }
      console.error('No content generated');
      throw error;
    }

    // Feature support
    if (error instanceof UnsupportedFunctionalityError) {
      console.error(`${error.functionality} not supported by ${error.provider}`);
      throw new Error('Use a different model or provider');
    }

    // Unknown errors
    console.error('Unexpected error:', error);
    throw error;
  }
}
```

### Retry with Exponential Backoff

```typescript
async function generateWithRetry(prompt: string, maxRetries = 3) {
  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await generateText({
        model: openai('gpt-4o'),
        prompt,
      });
      return result.text;
    } catch (error) {
      lastError = error as Error;

      // Only retry on retryable errors
      if (error instanceof APICallError && error.isRetryable) {
        const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
        console.log(`Attempt ${attempt} failed, retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        // Non-retryable error
        throw error;
      }
    }
  }

  throw new Error(`Failed after ${maxRetries} attempts: ${lastError?.message}`);
}
```

### Graceful Degradation

```typescript
async function generateWithFallback(prompt: string): Promise<string> {
  const models = [
    openai('gpt-4o'),
    openai('gpt-3.5-turbo'),
    anthropic('claude-3-5-sonnet-20241022'),
  ];

  const errors: Error[] = [];

  for (const model of models) {
    try {
      const result = await generateText({ model, prompt });
      return result.text;
    } catch (error) {
      errors.push(error as Error);
      console.log('Model failed, trying next...');
    }
  }

  // All models failed
  throw new Error(`All models failed: ${errors.map(e => e.message).join(', ')}`);
}
```

### Type-Safe Error Handling

```typescript
type ErrorHandler = (error: Error) => void | Promise<void>;

interface ErrorHandlers {
  onAPIError?: ErrorHandler;
  onValidationError?: ErrorHandler;
  onGenerationError?: ErrorHandler;
  onConfigError?: ErrorHandler;
  onUnknownError?: ErrorHandler;
}

async function generateWithHandlers(
  prompt: string,
  handlers: ErrorHandlers = {}
) {
  try {
    return await generateText({
      model: openai('gpt-4o'),
      prompt,
    });
  } catch (error) {
    if (error instanceof APICallError) {
      await handlers.onAPIError?.(error);
    } else if (
      error instanceof InvalidPromptError ||
      error instanceof TypeValidationError
    ) {
      await handlers.onValidationError?.(error);
    } else if (
      error instanceof NoContentGeneratedError ||
      error instanceof NoObjectGeneratedError
    ) {
      await handlers.onGenerationError?.(error);
    } else if (
      error instanceof LoadAPIKeyError ||
      error instanceof NoSuchModelError
    ) {
      await handlers.onConfigError?.(error);
    } else {
      await handlers.onUnknownError?.(error as Error);
    }

    throw error;
  }
}
```

## Common Scenarios

### Content Filtering

```typescript
try {
  const { text } = await generateText({
    model: openai('gpt-4o'),
    prompt: userPrompt,
  });
} catch (error) {
  if (error instanceof NoContentGeneratedError && error.finishReason === 'content-filter') {
    return 'Content was filtered. Please rephrase your request.';
  }
  throw error;
}
```

### Tool Errors

```typescript
try {
  const result = await generateText({
    model: openai('gpt-4o'),
    prompt: 'Calculate 5 + 3',
    tools: { calculator },
  });
} catch (error) {
  if (error instanceof InvalidToolInputError) {
    console.error('Invalid input for', error.toolName);
  } else if (error instanceof NoSuchToolError) {
    console.error('Tool not found:', error.toolName);
    console.error('Available:', error.availableTools);
  }
}
```

### Embedding Batch Errors

```typescript
try {
  const { embeddings } = await embedMany({
    model: openai.embedding('text-embedding-3-small'),
    values: largeArray,
  });
} catch (error) {
  if (error instanceof TooManyEmbeddingValuesForCallError) {
    console.log('Splitting into batches of', error.maxEmbeddingsPerCall);
    // Implement batching
  }
}
```

