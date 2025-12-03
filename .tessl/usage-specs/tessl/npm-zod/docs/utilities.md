# Type Inference and Utilities

Extract TypeScript types from schemas and utilities for schema manipulation.

## Type Inference

```typescript { .api }
// Output type (after transformations)
type infer<T extends ZodType> = T["_output"];
type output<T extends ZodType> = T["_output"];

// Input type (before transformations)
type input<T extends ZodType> = T["_input"];
```

**Examples:**
```typescript
const UserSchema = z.object({
  name: z.string(),
  age: z.number(),
});

type User = z.infer<typeof UserSchema>;
// { name: string; age: number }

type UserInput = z.input<typeof UserSchema>;
// Same as output for simple schemas

// With transformation
const TransformSchema = z.string().transform((s) => s.length);

type Input = z.input<typeof TransformSchema>;   // string
type Output = z.output<typeof TransformSchema>; // number
type Inferred = z.infer<typeof TransformSchema>; // number (same as output)
```

## Schema Cloning

```typescript { .api }
function clone<T extends ZodTypeAny>(
  schema: T,
  def?: Partial<T["_def"]>,
  params?: { parent?: boolean }
): T;
```

**Examples:**
```typescript
const original = z.string();
const cloned = z.clone(original);

// Clone with modifications
const modified = z.clone(original, {
  description: "New description",
});
```

## Configuration

```typescript { .api }
function config(options?: Partial<ZodConfig>): ZodConfig;

interface ZodConfig {
  locale?: Locale;
  errorMap?: ZodErrorMap;
}
```

**Examples:**
```typescript
// Global error map
z.config({
  errorMap: (issue, ctx) => {
    if (issue.code === z.ZodIssueCode.invalid_type) {
      return { message: "Custom type error message" };
    }
    return { message: ctx.defaultError };
  },
});

// Global locale
z.config({
  locale: z.locales.es(),
});

// Combined
z.config({
  locale: z.locales.fr(),
  errorMap: customErrorMap,
});
```

## Schema Utilities

```typescript
// Check schema type
schema instanceof z.ZodString
schema instanceof z.ZodNumber
schema instanceof z.ZodObject

// Get schema _def
schema._def

// Schema methods available on all types
schema.optional()
schema.nullable()
schema.default(value)
schema.catch(fallback)
schema.refine(fn, msg)
schema.transform(fn)
schema.parse(data)
schema.safeParse(data)
```

## Type Guards and Helpers

```typescript
// Type narrowing with safeParse
const result = schema.safeParse(data);

if (result.success) {
  // result.data is typed correctly
  const validData: OutputType = result.data;
} else {
  // result.error is ZodError
  const error: z.ZodError = result.error;
}

// Extract object shape
const UserSchema = z.object({
  name: z.string(),
  age: z.number(),
});

type UserShape = typeof UserSchema.shape;
// { name: ZodString; age: ZodNumber }

// Extract enum options
const StatusSchema = z.enum(["pending", "active", "completed"]);
type StatusOptions = typeof StatusSchema.options;
// ["pending", "active", "completed"]

const statusEnum = StatusSchema.enum;
// { pending: "pending", active: "active", completed: "completed" }
```

## Common Patterns

```typescript
// Reusable type inference
const createSchema = () => z.object({
  id: z.string(),
  name: z.string(),
});

type InferredType = z.infer<ReturnType<typeof createSchema>>;

// Generic schema function
function createAPISchema<T extends z.ZodTypeAny>(dataSchema: T) {
  return z.object({
    success: z.boolean(),
    data: dataSchema,
    error: z.string().optional(),
  });
}

const UserAPISchema = createAPISchema(UserSchema);
type UserAPIResponse = z.infer<typeof UserAPISchema>;

// Extract nested types
const NestedSchema = z.object({
  user: z.object({
    profile: z.object({
      name: z.string(),
    }),
  }),
});

type Nested = z.infer<typeof NestedSchema>;
type User = Nested["user"];
type Profile = Nested["user"]["profile"];

// Conditional schema creation
function createSchemaWithOptional<T extends boolean>(
  includeOptional: T
): T extends true
  ? z.ZodObject<{ name: z.ZodString; email: z.ZodOptional<z.ZodString> }>
  : z.ZodObject<{ name: z.ZodString }> {
  // Implementation
}

// Branded types
type UserId = z.infer<typeof z.string()> & { readonly __brand: unique symbol };

const UserIdSchema = z.string().refine(
  (val): val is UserId => /^user_/.test(val)
);
```

## Advanced Type Inference

```typescript
// Infer from pipe
const PipeSchema = z.pipe(z.string(), z.number());
type PipeInput = z.input<typeof PipeSchema>;   // string
type PipeOutput = z.output<typeof PipeSchema>; // number

// Infer from union
const UnionSchema = z.union([
  z.object({ type: z.literal("a"), value: z.string() }),
  z.object({ type: z.literal("b"), value: z.number() }),
]);

type Union = z.infer<typeof UnionSchema>;
// { type: "a"; value: string } | { type: "b"; value: number }

// Infer from discriminated union
const DiscriminatedSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("success"), data: z.any() }),
  z.object({ type: z.literal("error"), error: z.string() }),
]);

type Result = z.infer<typeof DiscriminatedSchema>;

// Recursive type inference
interface Category {
  name: string;
  children: Category[];
}

const CategorySchema: z.ZodType<Category> = z.lazy(() =>
  z.object({
    name: z.string(),
    children: z.array(CategorySchema),
  })
);

type InferredCategory = z.infer<typeof CategorySchema>; // Category
```

## Utility Types

```typescript
// Partial object schema
type PartialUser = z.infer<typeof UserSchema.partial()>;

// Pick from object
type UserNameEmail = z.infer<typeof UserSchema.pick({ name: true, email: true })>;

// Omit from object
type UserWithoutPassword = z.infer<typeof UserSchema.omit({ password: true })>;

// Extended schema
type ExtendedUser = z.infer<typeof UserSchema.extend({ role: z.string() })>;

// Merged schema
type MergedUser = z.infer<typeof UserSchema.merge(ProfileSchema)>;

// Array element type
const ArraySchema = z.array(z.string());
type Element = z.infer<typeof ArraySchema>[number]; // string

// Object key type
const ObjSchema = z.object({ a: z.string(), b: z.number() });
type Keys = keyof z.infer<typeof ObjSchema>; // "a" | "b"
```
