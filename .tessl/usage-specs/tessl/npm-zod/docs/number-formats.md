# Number Format Schemas

Integer and float validators with specific bit-width constraints.

## Number Formats

```typescript { .api }
// Integer formats
function int(params?: { description?: string; errorMap?: ZodErrorMap }): ZodInt;
function int32(params?: { description?: string; errorMap?: ZodErrorMap }): ZodInt32;
function uint32(params?: { description?: string; errorMap?: ZodErrorMap }): ZodUInt32;
function int64(params?: { description?: string; errorMap?: ZodErrorMap }): ZodBigIntFormat;
function uint64(params?: { description?: string; errorMap?: ZodErrorMap }): ZodBigIntFormat;

// Float formats
function float32(params?: { description?: string; errorMap?: ZodErrorMap }): ZodFloat32;
function float64(params?: { description?: string; errorMap?: ZodErrorMap }): ZodFloat64;
```

## Integer Formats

```typescript
// Generic integer
z.int()
// Any integer (safe JavaScript integer range)

// 32-bit signed integer
z.int32()
// Range: -2,147,483,648 to 2,147,483,647

// 32-bit unsigned integer
z.uint32()
// Range: 0 to 4,294,967,295

// 64-bit signed integer (BigInt)
z.int64()
// Range: -9,223,372,036,854,775,808 to 9,223,372,036,854,775,807

// 64-bit unsigned integer (BigInt)
z.uint64()
// Range: 0 to 18,446,744,073,709,551,615
```

**Examples:**
```typescript
z.int().parse(42);           // Valid
z.int().parse(3.14);         // Invalid (not an integer)

z.int32().parse(1000000);    // Valid
z.int32().parse(3000000000); // Invalid (out of range)

z.uint32().parse(1000000);   // Valid
z.uint32().parse(-1);        // Invalid (must be non-negative)

z.int64().parse(9007199254740991n);  // Valid (BigInt)
z.uint64().parse(18446744073709551615n); // Valid (BigInt)
```

## Float Formats

```typescript
// 32-bit float
z.float32()
// Single precision floating point

// 64-bit float
z.float64()
// Double precision floating point
```

**Examples:**
```typescript
z.float32().parse(3.14);     // Valid
z.float64().parse(3.14);     // Valid
```

## Common Patterns

```typescript
// API with specific number types
const APISchema = z.object({
  id: z.int32(),
  userId: z.int64(),
  count: z.uint32(),
  score: z.float32(),
});

// Database schema
const UserSchema = z.object({
  id: z.int64(),                    // BIGINT
  age: z.int32().positive(),        // INT
  balance: z.float64(),             // DOUBLE
  loginCount: z.uint32(),           // UNSIGNED INT
});

// Protocol buffers style
const MessageSchema = z.object({
  messageId: z.uint64(),
  timestamp: z.int64(),
  flags: z.uint32(),
  payload: z.string(),
});

// Game state
const PlayerSchema = z.object({
  playerId: z.uint32(),
  score: z.int32(),
  health: z.uint32().max(100),
  position: z.object({
    x: z.float32(),
    y: z.float32(),
    z: z.float32(),
  }),
});

// Financial data
const TransactionSchema = z.object({
  id: z.int64(),
  amount: z.float64().positive(),
  timestamp: z.int64(),
  accountId: z.uint32(),
});
```

## With Additional Constraints

```typescript
// Integer with range
z.int32().min(0).max(1000)
z.uint32().max(100)

// Integer with multipleOf
z.int().multipleOf(10)        // Multiples of 10
z.int32().multipleOf(5)       // Multiples of 5

// Float with precision
z.float32().multipleOf(0.01)  // 2 decimal places
z.float64().multipleOf(0.001) // 3 decimal places

// Combined
z.uint32()
  .min(1)
  .max(1000)
  .multipleOf(10)
```

## Type Inference

```typescript
const Int32Schema = z.int32();
type Int32Type = z.infer<typeof Int32Schema>;  // number

const Int64Schema = z.int64();
type Int64Type = z.infer<typeof Int64Schema>;  // bigint

const Float32Schema = z.float32();
type Float32Type = z.infer<typeof Float32Schema>;  // number
```

## Comparison

```typescript
// Generic number (any finite number)
z.number()

// Generic integer (any safe integer)
z.int()

// Specific bit-width integers
z.int32()   // 32-bit signed
z.uint32()  // 32-bit unsigned
z.int64()   // 64-bit signed (BigInt)
z.uint64()  // 64-bit unsigned (BigInt)

// Specific precision floats
z.float32() // Single precision
z.float64() // Double precision
```

## When to Use

- **z.number()**: General numeric validation
- **z.int()**: Integer validation without size constraints
- **z.int32()**: 32-bit integers (database INT columns, most APIs)
- **z.uint32()**: Non-negative 32-bit integers (counts, IDs)
- **z.int64()**: Large integers (database BIGINT columns, timestamps)
- **z.uint64()**: Large non-negative integers (large IDs, hashes)
- **z.float32()**: Single precision (graphics, compact storage)
- **z.float64()**: Double precision (financial calculations, precision required)
