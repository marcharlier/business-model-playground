# Provider Registry

Dynamically resolve models using `provider:model-id` format.

## Basic Usage

```typescript
import { createProviderRegistry } from 'ai';

const registry = createProviderRegistry({
  openai,
  anthropic,
  google,
});

// Use with provider:model-id
const result = await generateText({
  model: registry.languageModel('openai:gpt-4o'),
  prompt: 'Hello',
});

const result2 = await generateText({
  model: registry.languageModel('anthropic:claude-3-5-sonnet-20241022'),
  prompt: 'Hello',
});
```

## Custom Provider

```typescript
import { customProvider } from 'ai';

const myProvider = customProvider({
  languageModels: {
    'fast': openai('gpt-3.5-turbo'),
    'quality': openai('gpt-4o'),
    'creative': wrapLanguageModel({
      model: openai('gpt-4o'),
      middleware: defaultSettingsMiddleware({ settings: { temperature: 0.9 } }),
    }),
  },
  textEmbeddingModels: {
    'default': openai.embedding('text-embedding-3-small'),
  },
});

const registry = createProviderRegistry({
  my: myProvider,
  openai,
});
```

## Dynamic Model Selection

```typescript
function selectModel(task: 'fast' | 'quality'): LanguageModel {
  const modelMap = {
    fast: 'openai:gpt-3.5-turbo',
    quality: 'openai:gpt-4o',
  };
  return registry.languageModel(modelMap[task]);
}

const result = await generateText({
  model: selectModel('quality'),
  prompt: 'Analyze this',
});
```

## Fallback Strategy

```typescript
async function generateWithFallback(prompt: string) {
  const providers = ['openai:gpt-4o', 'anthropic:claude-3-5-sonnet-20241022'];
  
  for (const modelId of providers) {
    try {
      return await generateText({
        model: registry.languageModel(modelId),
        prompt,
      });
    } catch (error) {
      console.log(`Failed with ${modelId}, trying next...`);
    }
  }
  
  throw new Error('All providers failed');
}
```

## Type Reference

```typescript
interface ProviderRegistry {
  languageModel(id: string): LanguageModel;
  textEmbeddingModel(id: string): EmbeddingModel<string>;
  imageModel(id: string): ImageModel;
  speechModel(id: string): SpeechModel;
}

function createProviderRegistry(
  providers: Record<string, Provider>,
  options?: {
    separator?: string;
    languageModelMiddleware?: LanguageModelMiddleware[];
  }
): ProviderRegistry;
```

