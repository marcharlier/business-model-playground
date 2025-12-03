# Schema Wrappers

Modify schemas to make them optional, nullable, or provide default values.

## Optional & Nullable

```typescript { .api }
function optional<T extends ZodTypeAny>(schema: T): ZodOptional<T>;
function nullable<T extends ZodTypeAny>(schema: T): ZodNullable<T>;
function nullish<T extends ZodTypeAny>(schema: T): ZodOptional<ZodNullable<T>>;
```

**Examples:**
```typescript
z.string().optional()    // string | undefined
z.string().nullable()    // string | null
z.string().nullish()     // string | null | undefined

// Or use directly
z.optional(z.string())
z.nullable(z.string())
z.nullish(z.string())

// In objects
z.object({
  name: z.string(),
  email: z.string().optional(),
  phone: z.string().nullable(),
  bio: z.string().nullish(),
})
```

## Default Values

```typescript { .api }
function _default<T extends ZodTypeAny>(
  schema: T,
  defaultValue: z.infer<T> | (() => z.infer<T>)
): ZodDefault<T>;

// Or use method
schema.default(defaultValue);
```

**Examples:**
```typescript
z.string().default("default value")
z.number().default(0)
z.boolean().default(false)
z.array(z.string()).default([])

// Function defaults (evaluated each time)
z.date().default(() => new Date())
z.string().default(() => generateId())

// In objects
z.object({
  name: z.string(),
  createdAt: z.date().default(() => new Date()),
  status: z.enum(["pending", "active"]).default("pending"),
})
```

## Prefault

Default value applied before validation (at input level).

```typescript { .api }
function prefault<T extends ZodTypeAny>(
  schema: T,
  defaultValue: z.input<T> | (() => z.input<T>)
): ZodPrefault<T>;
```

**Examples:**
```typescript
// Apply default before transformation
z.string()
  .prefault("")
  .transform((s) => s.toUpperCase())

// Difference: default vs prefault
const DefaultSchema = z.string().transform((s) => s.toUpperCase()).default("hello");
// "hello" is applied after transform, so not uppercased

const PrefaultSchema = z.string().prefault("hello").transform((s) => s.toUpperCase());
// "hello" is applied before transform, so becomes "HELLO"
```

## Catch

Provide fallback value on validation error.

```typescript { .api }
function catch<T extends ZodTypeAny>(
  schema: T,
  fallback: z.infer<T> | ((ctx: { error: ZodError; input: unknown }) => z.infer<T>)
): ZodCatch<T>;
```

**Examples:**
```typescript
// Static fallback
z.string().catch("fallback")
z.number().catch(0)
z.array(z.string()).catch([])

// Function fallback
z.string().catch((ctx) => {
  console.log("Error:", ctx.error);
  console.log("Input:", ctx.input);
  return "fallback";
})

// In objects
z.object({
  count: z.number().catch(0),
  items: z.array(z.string()).catch([]),
})

// Parsing with catch
const schema = z.string().catch("default");
schema.parse(123);  // "default" (instead of throwing)
```

## Success

Always succeeds, returns input if valid, undefined if invalid.

```typescript { .api }
function success<T extends ZodTypeAny>(schema: T): ZodSuccess<T>;
```

**Examples:**
```typescript
z.string().success()
z.number().success()

const schema = z.string().success();
schema.parse("valid");   // "valid"
schema.parse(123);       // undefined (no error thrown)
```

## Readonly

Makes schema output readonly (TypeScript only).

```typescript { .api }
function readonly<T extends ZodTypeAny>(schema: T): ZodReadonly<T>;
```

**Examples:**
```typescript
z.string().readonly()
z.array(z.string()).readonly()  // readonly string[]
z.object({ name: z.string() }).readonly()  // { readonly name: string }

// Read-only deep
const schema = z.object({
  items: z.array(z.string()).readonly(),
}).readonly();
```

## Common Patterns

```typescript
// API response with defaults
const APIResponse = z.object({
  data: z.array(z.any()).default([]),
  page: z.number().default(1),
  total: z.number().default(0),
});

// Form with optional fields
const FormSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  phone: z.string().optional(),
  newsletter: z.boolean().default(false),
});

// Config with fallbacks
const ConfigSchema = z.object({
  port: z.number().catch(3000),
  host: z.string().catch("localhost"),
  debug: z.boolean().catch(false),
});

// Optional with defaults
z.string().optional().default("value")
// type: string (always defined due to default)

// Nullable with defaults
z.string().nullable().default("value")
// type: string (always defined due to default)

// Catch with logging
const LoggedSchema = z.number().catch((ctx) => {
  console.error("Validation failed:", ctx.error);
  console.error("Input was:", ctx.input);
  return 0;
});

// User profile schema
const UserProfile = z.object({
  name: z.string(),
  email: z.string().email(),
  avatar: z.string().url().optional(),
  bio: z.string().nullable(),
  settings: z.object({
    theme: z.enum(["light", "dark"]).default("light"),
    notifications: z.boolean().default(true),
  }).default({}),
});
```

## Wrapper Combinations

```typescript
// Optional with default
z.string().optional().default("value")

// Nullable with catch
z.string().nullable().catch("fallback")

// All together
z.string()
  .optional()
  .nullable()
  .default("default")
  .catch("fallback")
```
