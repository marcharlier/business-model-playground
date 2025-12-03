# Type Coercion

Coerce values to target types before validation. Useful for parsing form data, query parameters, and environment variables.

## Coerce Namespace

```typescript { .api }
namespace coerce {
  function string(params?: { description?: string; errorMap?: ZodErrorMap }): ZodString;
  function number(params?: { description?: string; errorMap?: ZodErrorMap }): ZodNumber;
  function boolean(params?: { description?: string; errorMap?: ZodErrorMap }): ZodBoolean;
  function bigint(params?: { description?: string; errorMap?: ZodErrorMap }): ZodBigInt;
  function date(params?: { description?: string; errorMap?: ZodErrorMap }): ZodDate;
}
```

## String Coercion

```typescript
z.coerce.string()
// Converts any value to string using String()

z.coerce.string().parse(42);        // "42"
z.coerce.string().parse(true);      // "true"
z.coerce.string().parse(null);      // "null"
z.coerce.string().parse(undefined); // "undefined"

// With validation
z.coerce.string().email()
z.coerce.string().min(3).max(20)
```

## Number Coercion

```typescript
z.coerce.number()
// Converts values to number using Number()

z.coerce.number().parse("42");      // 42
z.coerce.number().parse("3.14");    // 3.14
z.coerce.number().parse(true);      // 1
z.coerce.number().parse(false);     // 0
z.coerce.number().parse("invalid"); // NaN (fails validation)

// With validation
z.coerce.number().int().positive()
z.coerce.number().min(0).max(100)
```

## Boolean Coercion

```typescript
z.coerce.boolean()
// Converts values to boolean using Boolean()

z.coerce.boolean().parse("true");   // true
z.coerce.boolean().parse("false");  // true (any non-empty string is truthy)
z.coerce.boolean().parse(1);        // true
z.coerce.boolean().parse(0);        // false
z.coerce.boolean().parse("");       // false
```

## BigInt Coercion

```typescript
z.coerce.bigint()
// Converts values to bigint using BigInt()

z.coerce.bigint().parse("42");      // 42n
z.coerce.bigint().parse(42);        // 42n
z.coerce.bigint().parse("123456789012345678901234567890"); // 123456789012345678901234567890n

// With validation
z.coerce.bigint().positive()
z.coerce.bigint().min(0n).max(1000000000n)
```

## Date Coercion

```typescript
z.coerce.date()
// Converts values to Date using new Date()

z.coerce.date().parse("2024-01-01");           // Date object
z.coerce.date().parse(1704067200000);          // Date from timestamp
z.coerce.date().parse(new Date());             // Already a Date

// With validation
z.coerce.date().min(new Date("2020-01-01"))
z.coerce.date().max(new Date())
```

## Common Patterns

```typescript
// Form data parsing
const FormSchema = z.object({
  name: z.string(),
  age: z.coerce.number().int().positive(),
  subscribe: z.coerce.boolean(),
  createdAt: z.coerce.date(),
});

// Query parameters
const QuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  sort: z.string().optional(),
});

// Environment variables
const EnvSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3000),
  DEBUG: z.coerce.boolean().default(false),
  DATABASE_URL: z.string().url(),
  MAX_CONNECTIONS: z.coerce.number().int().positive().default(10),
});

const env = EnvSchema.parse(process.env);

// API with coercion
const APIParamsSchema = z.object({
  id: z.coerce.number().int(),
  includeDeleted: z.coerce.boolean().default(false),
  since: z.coerce.date().optional(),
});

// URL search params
const searchParams = new URLSearchParams(window.location.search);
const params = QuerySchema.parse(Object.fromEntries(searchParams));

// CSV parsing
const CSVRowSchema = z.object({
  id: z.coerce.number(),
  name: z.string(),
  price: z.coerce.number(),
  inStock: z.coerce.boolean(),
  date: z.coerce.date(),
});
```

## Coercion vs Transformation

```typescript
// Coercion (before validation)
z.coerce.number().min(10)
// Input "5" -> Coerce to 5 -> Validate min(10) -> Fail

// Transformation (after validation)
z.string().transform((s) => Number(s)).min(10)
// Input "5" -> Validate as string -> Transform to 5 -> Fail at min(10)

// Preprocess (custom coercion)
z.preprocess((val) => Number(val), z.number().min(10))
// Similar to coerce but with custom logic
```

## When to Use Coercion

- **Form data**: All form inputs are strings
- **Query parameters**: URL params are strings
- **Environment variables**: All env vars are strings
- **CSV/TSV parsing**: All values are strings
- **API params**: Numeric IDs passed as strings

**Note**: Be careful with boolean coercion - any truthy value becomes `true`. For form checkboxes, consider custom validation:

```typescript
const CheckboxSchema = z.preprocess(
  (val) => val === "true" || val === true,
  z.boolean()
);
```
