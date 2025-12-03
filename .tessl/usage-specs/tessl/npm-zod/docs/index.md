# Zod

TypeScript-first schema validation library with static type inference and runtime validation.

## Package Information

- **Package**: `zod` (npm)
- **Installation**: `npm install zod`
- **Import**: `import { z } from "zod"`
- **Docs**: https://zod.dev/api

## Quick Reference

```typescript
// Basic schema definition and usage
import { z } from "zod";

// Define schema
const UserSchema = z.object({
  name: z.string(),
  email: z.email(),
  age: z.number().positive(),
});

// Parse (throws on error)
const user = UserSchema.parse(data);

// Safe parse (returns result object)
const result = UserSchema.safeParse(data);
if (result.success) {
  console.log(result.data);
} else {
  console.log(result.error);
}

// Type inference
type User = z.infer<typeof UserSchema>;
```

## Common Patterns

### Schema Creation
```typescript
// Primitives
z.string()
z.number()
z.boolean()
z.date()
z.bigint()
z.symbol()

// String formats
z.email()
z.url()
z.uuid()
z.ipv4() / z.ipv6()

// Collections
z.array(z.string())
z.object({ key: z.string() })
z.tuple([z.string(), z.number()])
z.record(z.string(), z.number())
z.enum(["a", "b", "c"])

// Modifiers
z.string().optional()
z.string().nullable()
z.string().default("value")
z.union([z.string(), z.number()])
```

### Validation Patterns
```typescript
// String validation
z.string().min(3).max(20).regex(/^[a-z]+$/)
z.string().email().max(255)
z.string().trim().toLowerCase()

// Number validation
z.number().int().positive().min(0).max(100)
z.number().multipleOf(5)

// Object validation
z.object({
  name: z.string(),
  age: z.number()
}).strict() // or .passthrough() or .strip()

// Custom validation
z.string().refine((val) => val.length > 0, "Required")
z.object({...}).superRefine((data, ctx) => {
  ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Error" });
})

// Transformations
z.string().transform((val) => val.toUpperCase())
z.pipe(z.string(), z.number())
```

### Error Handling
```typescript
// Try-catch
try {
  const data = schema.parse(input);
} catch (error) {
  if (error instanceof z.ZodError) {
    console.log(error.issues);
  }
}

// Safe parse (preferred)
const result = schema.safeParse(input);
if (!result.success) {
  console.log(result.error.format());   // Tree structure
  console.log(result.error.flatten());  // Flat structure
}

// Async validation
await schema.parseAsync(data);
await schema.safeParseAsync(data);
```

## Core Concepts

**Schemas** - Immutable validation objects with type inference
**Parsing** - Validation with throwing (`parse`) or safe (`safeParse`) methods
**Type Inference** - `z.infer<typeof Schema>` extracts TypeScript types
**Chainable API** - Methods return new schema instances
**Transformations** - Type-safe data transformation pipelines

## Feature Documentation

### Type Schemas

- **[Primitives](./primitives.md)** - string, number, boolean, date, bigint, symbol, null, undefined, any, unknown, never
- **[String Formats](./string-formats.md)** - email, url, uuid, ip addresses, JWT, base64, IDs (cuid, ulid, nanoid)
- **[Number Formats](./number-formats.md)** - int, int32, uint32, float32, float64, int64, uint64
- **[Collections](./collections.md)** - array, object, tuple, record, map, set, enum, literal
- **[ISO DateTime](./iso-datetime.md)** - datetime, date, time, duration validation

### Schema Operations

- **[Parsing & Validation](./parsing.md)** - parse, safeParse, parseAsync, safeParseAsync methods
- **[Refinements](./refinements.md)** - refine, superRefine, custom validation logic
- **[Transformations](./transformations.md)** - transform, pipe, preprocess, codec
- **[Wrappers](./wrappers.md)** - optional, nullable, default, catch modifiers
- **[Unions & Intersections](./unions-intersections.md)** - union, discriminatedUnion, intersection

### Advanced Features

- **[Advanced Schemas](./advanced-schemas.md)** - function, promise, lazy, custom, instanceof, file
- **[Type Coercion](./coercion.md)** - z.coerce for automatic type conversion
- **[Error Handling](./errors.md)** - ZodError, issue types, formatting utilities
- **[Utilities](./utilities.md)** - Type inference, schema cloning, configuration
- **[Internationalization](./locales.md)** - 44+ languages support
- **[JSON Schema](./json-schema.md)** - Convert Zod schemas to JSON Schema

## API Surface

All functionality is accessed through the `z` namespace object. Key methods:

```typescript { .api }
// Primitives
z.string() z.number() z.boolean() z.date() z.bigint() z.symbol()
z.undefined() z.null() z.any() z.unknown() z.never() z.void() z.nan()

// String formats
z.email() z.url() z.uuid() z.ipv4() z.ipv6() z.jwt()
z.cuid() z.ulid() z.nanoid() z.base64()

// Collections
z.array(T) z.object({...}) z.tuple([...]) z.record(K, V)
z.map(K, V) z.set(T) z.enum([...]) z.literal(value)

// Composition
z.union([...]) z.discriminatedUnion(key, [...]) z.intersection(A, B)
z.optional(T) z.nullable(T) z.default(T, val)

// Advanced
z.function() z.promise(T) z.lazy(() => T) z.custom()
z.instanceof(Class) z.file()

// Operations
schema.parse(data)              // Throws on error
schema.safeParse(data)          // Returns result object
schema.parseAsync(data)         // Async parse
schema.safeParseAsync(data)     // Async safe parse

// Refinements & Transformations
schema.refine(fn, msg)          // Add validation
schema.superRefine((val, ctx)) // Advanced validation
schema.transform(fn)            // Transform data
z.pipe(A, B)                    // Pipeline schemas

// Type inference
type T = z.infer<typeof schema>
type In = z.input<typeof schema>
type Out = z.output<typeof schema>
```

## Types

```typescript { .api }
// Base type for all Zod schemas
interface ZodType<Output = any, Input = any> {
  _output: Output;
  _input: Input;
  _def: ZodTypeDef;

  parse(data: unknown, params?: ParseContext): Output;
  safeParse(data: unknown, params?: ParseContext): SafeParseResult<Output>;
  parseAsync(data: unknown, params?: ParseContext): Promise<Output>;
  safeParseAsync(data: unknown, params?: ParseContext): Promise<SafeParseResult<Output>>;
  refine(check: (val: Output) => boolean, msg?: string): this;
  superRefine(check: (val: Output, ctx: RefinementCtx) => void): this;
  transform<T>(fn: (val: Output) => T): ZodEffects<this, T>;
}

type ZodTypeAny = ZodType<any, any>;

type SafeParseResult<T> =
  | { success: true; data: T }
  | { success: false; error: ZodError };

// Primitive type
type Primitive = string | number | bigint | boolean | null | undefined;

// Shape for object schemas
type ZodRawShape = { [k: string]: ZodTypeAny };

// Type inference helpers
type infer<T extends ZodType> = T["_output"];
type input<T extends ZodType> = T["_input"];
type output<T extends ZodType> = T["_output"];

// Error map for custom error messages
type ZodErrorMap = (issue: ZodIssueOptionalMessage, ctx: ErrorMapCtx) => { message: string };

// Parse context for customizing validation behavior
interface ParseContext {
  error?: ZodErrorMap;
  reportInput?: boolean;
  jitless?: boolean;
}

interface RefinementCtx {
  addIssue(issue: IssueData): void;
  path: (string | number)[];
}
```
