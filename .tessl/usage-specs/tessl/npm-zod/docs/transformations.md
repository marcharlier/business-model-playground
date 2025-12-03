# Transformations and Pipelines

Transform validated data or chain schemas together with type safety.

## Transform Method

```typescript { .api }
interface ZodType<Output, Input> {
  transform<T>(fn: (val: Output) => T | Promise<T>): ZodEffects<this, T>;
}
```

**Examples:**
```typescript
// Basic transformation
z.string().transform((val) => val.toUpperCase())
z.string().transform((val) => val.length)
z.string().transform((val) => parseInt(val))

// Async transformation
z.string().transform(async (val) => {
  const response = await fetch(`/api/${val}`);
  return response.json();
})
// Requires: await schema.parseAsync(data);

// Transformation with validation
z.string()
  .min(1)
  .transform((val) => val.trim())
  .transform((val) => val.toUpperCase())

// Object transformation
z.object({
  firstName: z.string(),
  lastName: z.string(),
}).transform((data) => ({
  fullName: `${data.firstName} ${data.lastName}`,
}))
```

## Pipe

Chain schemas together: validate with first schema, then second.

```typescript { .api }
function pipe<A extends ZodTypeAny, B extends ZodTypeAny>(a: A, b: B): ZodPipeline<A, B>;
```

**Examples:**
```typescript
// String to number pipeline
z.pipe(z.string(), z.number())
// Parses "42" as string, then coerces to number

// Custom pipeline
const StringToDatePipeline = z.pipe(
  z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  z.string().transform((s) => new Date(s))
)

// Multi-stage pipeline
z.pipe(
  z.string(),
  z.string().transform((s) => s.trim()),
  z.string().transform((s) => s.toLowerCase()),
  z.string().email()
)
```

## Codec

Bidirectional encoding/decoding with custom logic.

```typescript { .api }
function codec<A extends ZodTypeAny, B extends ZodTypeAny = ZodTypeAny>(
  in_: A,
  out: B,
  params: {
    decode: (value: z.output<A>, payload: ParsePayload<z.output<A>>) => z.input<B> | Promise<z.input<B>>;
    encode: (value: z.input<B>, payload: ParsePayload<z.input<B>>) => z.output<A> | Promise<z.output<A>>;
  }
): ZodCodec<A, B>;
```

**Examples:**
```typescript
// Date codec
const DateCodec = z.codec(
  z.string().transform((s) => new Date(s)),
  z.date().transform((d) => d.toISOString())
);

DateCodec.decode("2024-01-01");  // Date object
DateCodec.encode(new Date());     // ISO string

// Custom codec
const Base64Codec = z.codec(
  z.string(),
  z.string(),
  {
    decode: (str) => Buffer.from(str, "base64").toString("utf8"),
    encode: (str) => Buffer.from(str, "utf8").toString("base64"),
  }
);
```

## Preprocess

Transform input before validation.

```typescript { .api }
function preprocess<T extends ZodTypeAny>(
  preprocessor: (arg: unknown) => unknown,
  schema: T
): ZodEffects<T>;
```

**Examples:**
```typescript
// Trim before validation
z.preprocess((val) => String(val).trim(), z.string().min(1))

// Coerce to number
z.preprocess((val) => Number(val), z.number())

// Parse JSON
z.preprocess(
  (val) => typeof val === "string" ? JSON.parse(val) : val,
  z.object({ name: z.string() })
)

// Form data preprocessing
z.preprocess(
  (val) => val === "" ? undefined : val,
  z.string().optional()
)
```

## Common Patterns

```typescript
// Parse and format dates
const DateSchema = z.string().transform((s) => new Date(s));
const FormattedDateSchema = z.date().transform((d) => d.toISOString());

// Parse JSON strings
const JSONSchema = z.string().transform((s) => JSON.parse(s));
const ParsedJSONSchema = z.preprocess(
  (val) => typeof val === "string" ? JSON.parse(val) : val,
  z.object({ data: z.any() })
);

// Normalize input
const NormalizedEmailSchema = z
  .string()
  .transform((s) => s.trim().toLowerCase())
  .email();

// Chain transformations
const ProcessedSchema = z
  .string()
  .transform((s) => s.trim())
  .transform((s) => s.toLowerCase())
  .transform((s) => s.replace(/\s+/g, "-"))
  .refine((s) => s.length > 0);

// Form data transformation
const FormSchema = z.object({
  name: z.preprocess((val) => String(val).trim(), z.string()),
  age: z.preprocess((val) => Number(val), z.number()),
  active: z.preprocess((val) => val === "true", z.boolean()),
});

// Pipeline for multi-step validation
const UsernamePipeline = z.pipe(
  z.string(),
  z.string().min(3).max(20),
  z.string().regex(/^[a-z0-9_]+$/),
  z.string().transform((s) => s.toLowerCase())
);
```

## Type Inference

```typescript
const TransformSchema = z.string().transform((s) => s.length);

type Input = z.input<typeof TransformSchema>;   // string
type Output = z.output<typeof TransformSchema>; // number

const PipelineSchema = z.pipe(z.string(), z.number());
type In = z.input<typeof PipelineSchema>;    // string
type Out = z.output<typeof PipelineSchema>;  // number
```
