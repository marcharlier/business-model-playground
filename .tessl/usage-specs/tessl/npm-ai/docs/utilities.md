# Utilities

Helper functions for common operations.

## Stream Consumption

```typescript
import { consumeStream } from 'ai';

await consumeStream({ stream: result.textStream });
```

## JSON Parsing

```typescript
import { parsePartialJson } from 'ai';

const { value, state } = await parsePartialJson('{"name": "John", "age": 30');
console.log(value); // { name: "John", age: 30 }
console.log(state); // "repaired-parse"
```

## Similarity

```typescript
import { cosineSimilarity } from 'ai';

const score = cosineSimilarity(vector1, vector2);
console.log(score); // -1 to 1
```

## Deep Equality

```typescript
import { isDeepEqualData } from 'ai';

const equal = isDeepEqualData(obj1, obj2);
```

## Type Reference

```typescript
function consumeStream(options: {
  stream: ReadableStream;
  onError?: (error: unknown) => void;
}): Promise<void>;

function parsePartialJson(text: string | undefined): Promise<{
  value: JSONValue | undefined;
  state: 'undefined-input' | 'successful-parse' | 'repaired-parse' | 'failed-parse';
}>;

function cosineSimilarity(a: number[], b: number[]): number;

function isDeepEqualData(a: unknown, b: unknown): boolean;

function getTextFromDataUrl(dataUrl: string): string;
```
