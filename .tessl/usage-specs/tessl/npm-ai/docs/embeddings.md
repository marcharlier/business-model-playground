# Embeddings

Generate vector embeddings for semantic search and similarity.

## Basic Usage

```typescript
import { embed, embedMany } from 'ai';
import { openai } from '@ai-sdk/openai';

// Single embedding
const { embedding, usage } = await embed({
  model: openai.embedding('text-embedding-3-small'),
  value: 'Hello world',
});

console.log('Dimensions:', embedding.length); // 1536

// Batch embeddings
const { embeddings, usage } = await embedMany({
  model: openai.embedding('text-embedding-3-small'),
  values: ['text1', 'text2', 'text3'],
});
```

## Semantic Search

```typescript
import { cosineSimilarity } from 'ai';

// 1. Create document embeddings
const documents = [
  'Machine learning is a subset of AI',
  'Python is used for data science',
  'The weather is sunny today',
];

const { embeddings: docEmbeddings } = await embedMany({
  model: openai.embedding('text-embedding-3-small'),
  values: documents,
});

// 2. Embed query
const query = 'Tell me about AI';
const { embedding: queryEmbedding } = await embed({
  model: openai.embedding('text-embedding-3-small'),
  value: query,
});

// 3. Calculate similarities
const results = docEmbeddings.map((embed, idx) => ({
  text: documents[idx],
  score: cosineSimilarity(queryEmbedding, embed),
}));

// 4. Sort by relevance
results.sort((a, b) => b.score - a.score);
console.log('Most relevant:', results[0]);
```

## Type Reference

```typescript
interface EmbedResult<VALUE> {
  embedding: number[];
  value: VALUE;
  usage?: { tokens: number };
  providerMetadata?: Record<string, Record<string, JSONValue>>;
}

interface EmbedManyResult<VALUE> {
  embeddings: number[][];
  values: VALUE[];
  usage?: { tokens: number };
}

function embed<VALUE = string>(options: {
  model: EmbeddingModel<VALUE>;
  value: VALUE;
  maxRetries?: number;
  abortSignal?: AbortSignal;
  headers?: Record<string, string>;
}): Promise<EmbedResult<VALUE>>;

function embedMany<VALUE = string>(options: {
  model: EmbeddingModel<VALUE>;
  values: VALUE[];
  maxParallelCalls?: number;
}): Promise<EmbedManyResult<VALUE>>;
```

## Common Patterns

### Chunking Large Documents

```typescript
function chunkText(text: string, maxSize: number): string[] {
  const chunks: string[] = [];
  const sentences = text.split(/[.!?]+\s+/);
  let current = '';

  for (const sentence of sentences) {
    if (current.length + sentence.length > maxSize) {
      if (current) chunks.push(current.trim());
      current = sentence;
    } else {
      current += (current ? ' ' : '') + sentence;
    }
  }
  if (current) chunks.push(current.trim());
  return chunks;
}

const largeDoc = '...';
const chunks = chunkText(largeDoc, 1000);
const { embeddings } = await embedMany({
  model: openai.embedding('text-embedding-3-small'),
  values: chunks,
});
```

### Batch Processing

```typescript
async function embedInBatches<T>(
  values: T[],
  model: EmbeddingModel<T>,
  batchSize: number = 100
): Promise<number[][]> {
  const allEmbeddings: number[][] = [];

  for (let i = 0; i < values.length; i += batchSize) {
    const batch = values.slice(i, i + batchSize);
    const { embeddings } = await embedMany({ model, values: batch });
    allEmbeddings.push(...embeddings);
    
    // Rate limiting
    if (i + batchSize < values.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  return allEmbeddings;
}
```

### Caching

```typescript
class EmbeddingCache {
  private cache = new Map<string, number[]>();

  async getEmbedding(text: string): Promise<number[]> {
    if (this.cache.has(text)) {
      return this.cache.get(text)!;
    }

    const { embedding } = await embed({
      model: openai.embedding('text-embedding-3-small'),
      value: text,
    });

    this.cache.set(text, embedding);
    return embedding;
  }
}
```

