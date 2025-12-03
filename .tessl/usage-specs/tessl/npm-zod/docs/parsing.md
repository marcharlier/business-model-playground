# Parsing and Validation

Validation methods with synchronous/asynchronous and throwing/safe variants.

## Parse Methods

```typescript { .api }
interface ZodType<Output, Input> {
  /**
   * Parse and validate data (throws on error)
   * @param data - Data to validate
   * @param params - Optional parse context with custom error map
   * @returns Validated output
   * @throws ZodError if validation fails
   */
  parse(data: unknown, params?: ParseContext): Output;

  /**
   * Safe parse (returns result object instead of throwing)
   * @param data - Data to validate
   * @param params - Optional parse context
   * @returns Success or error result
   */
  safeParse(data: unknown, params?: ParseContext): SafeParseResult<Output>;

  /**
   * Async parse (throws on error)
   * @param data - Data to validate
   * @param params - Optional parse context
   * @returns Promise resolving to validated output
   * @throws ZodError if validation fails
   */
  parseAsync(data: unknown, params?: ParseContext): Promise<Output>;

  /**
   * Async safe parse (returns result object)
   * @param data - Data to validate
   * @param params - Optional parse context
   * @returns Promise resolving to success or error result
   */
  safeParseAsync(data: unknown, params?: ParseContext): Promise<SafeParseResult<Output>>;

  /**
   * Alias for safeParseAsync
   * @param data - Data to validate
   * @param params - Optional parse context
   * @returns Promise resolving to success or error result
   */
  spa(data: unknown, params?: ParseContext): Promise<SafeParseResult<Output>>;
}

interface ParseContext {
  /** Custom error map for error messages */
  error?: ZodErrorMap;
  /** Include input field in issue objects */
  reportInput?: boolean;
  /** Skip eval-based fast path optimization */
  jitless?: boolean;
}

type SafeParseResult<T> = SafeParseSuccess<T> | SafeParseError;

interface SafeParseSuccess<T> {
  success: true;
  data: T;
}

interface SafeParseError {
  success: false;
  error: ZodError;
}
```

## Parse (Throwing)

Validates and returns data, throws `ZodError` on failure.

```typescript
const UserSchema = z.object({
  name: z.string(),
  age: z.number(),
});

// Success
const user = UserSchema.parse({ name: "Alice", age: 25 });

// Failure (throws)
try {
  UserSchema.parse({ name: "Bob", age: "invalid" });
} catch (error) {
  if (error instanceof z.ZodError) {
    console.log(error.issues);
  }
}

// With custom error map
UserSchema.parse(data, {
  errorMap: (issue, ctx) => ({
    message: `Custom error: ${issue.code}`,
  }),
});
```

## Safe Parse (Non-Throwing)

Returns result object instead of throwing.

```typescript
const result = UserSchema.safeParse(data);

if (result.success) {
  console.log(result.data);  // Validated data
} else {
  console.log(result.error);  // ZodError
}

// Type narrowing
if (result.success) {
  const user: User = result.data;  // TypeScript knows this is valid
} else {
  const error: z.ZodError = result.error;
}

// API handler pattern
function handleRequest(body: unknown) {
  const result = UserSchema.safeParse(body);

  if (!result.success) {
    return { status: 400, error: result.error.format() };
  }

  return { status: 200, data: result.data };
}
```

## Async Parsing

For schemas with async refinements or transformations.

```typescript
// Async refinement
const UserSchema = z.object({
  username: z.string(),
}).refine(
  async (data) => {
    const available = await checkAvailability(data.username);
    return available;
  },
  { message: "Username taken" }
);

// Throwing async
try {
  const user = await UserSchema.parseAsync(data);
} catch (error) {
  if (error instanceof z.ZodError) {
    console.log(error.issues);
  }
}

// Safe async
const result = await UserSchema.safeParseAsync(data);
// Or use alias:
const result = await UserSchema.spa(data);

if (result.success) {
  console.log(result.data);
} else {
  console.log(result.error);
}

// Async transformation
const AsyncSchema = z.string().transform(async (val) => {
  const response = await fetch(`/api/${val}`);
  return response.json();
});

const data = await AsyncSchema.parseAsync("123");
```

## Codec Methods

For bidirectional encoding/decoding with codec schemas.

```typescript { .api }
interface ZodType<Output, Input> {
  // Decode: Input -> Output
  /**
   * Decode input to output (throws on error)
   * @param data - Input data to decode
   * @param params - Optional parse context
   * @returns Decoded output
   * @throws ZodError if decoding fails
   */
  decode(data: unknown, params?: ParseContext): Output;

  /**
   * Safe decode (returns result object)
   * @param data - Input data to decode
   * @param params - Optional parse context
   * @returns Success or error result
   */
  safeDecode(data: unknown, params?: ParseContext): SafeParseResult<Output>;

  /**
   * Async decode (throws on error)
   * @param data - Input data to decode
   * @param params - Optional parse context
   * @returns Promise resolving to decoded output
   * @throws ZodError if decoding fails
   */
  decodeAsync(data: unknown, params?: ParseContext): Promise<Output>;

  /**
   * Async safe decode (returns result object)
   * @param data - Input data to decode
   * @param params - Optional parse context
   * @returns Promise resolving to success or error result
   */
  safeDecodeAsync(data: unknown, params?: ParseContext): Promise<SafeParseResult<Output>>;

  // Encode: Output -> Input
  /**
   * Encode output to input (throws on error)
   * @param data - Output data to encode
   * @param params - Optional parse context
   * @returns Encoded input
   * @throws ZodError if encoding fails
   */
  encode(data: Output, params?: ParseContext): Input;

  /**
   * Safe encode (returns result object)
   * @param data - Output data to encode
   * @param params - Optional parse context
   * @returns Success or error result
   */
  safeEncode(data: Output, params?: ParseContext): SafeParseResult<Input>;

  /**
   * Async encode (throws on error)
   * @param data - Output data to encode
   * @param params - Optional parse context
   * @returns Promise resolving to encoded input
   * @throws ZodError if encoding fails
   */
  encodeAsync(data: Output, params?: ParseContext): Promise<Input>;

  /**
   * Async safe encode (returns result object)
   * @param data - Output data to encode
   * @param params - Optional parse context
   * @returns Promise resolving to success or error result
   */
  safeEncodeAsync(data: Output, params?: ParseContext): Promise<SafeParseResult<Input>>;
}
```

**Examples:**
```typescript
// Date codec
const DateCodec = z.codec(
  z.string().transform((s) => new Date(s)),
  z.date().transform((d) => d.toISOString())
);

const decoded = DateCodec.decode("2024-01-01");  // Date object
const encoded = DateCodec.encode(new Date());     // ISO string

// Safe decode/encode
const result = DateCodec.safeDecode("2024-01-01");
if (result.success) {
  console.log(result.data);  // Date object
}
```

## Method Comparison

```typescript
const schema = z.string().email();

// Synchronous
schema.parse(data);          // Throws on error
schema.safeParse(data);      // Returns result object

// Asynchronous
await schema.parseAsync(data);       // Throws on error
await schema.safeParseAsync(data);   // Returns result object
await schema.spa(data);              // Alias for safeParseAsync

// Codec
schema.decode(data);         // Input -> Output
schema.encode(data);         // Output -> Input
```

## Common Patterns

```typescript
// Express middleware
function validateBody(schema: z.ZodSchema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        errors: result.error.flatten().fieldErrors,
      });
    }
    req.validatedBody = result.data;
    next();
  };
}

// Form validation
function validateForm(formData: FormData) {
  const result = FormSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!result.success) {
    return { success: false, errors: result.error.flatten() };
  }

  return { success: true, data: result.data };
}

// Async API validation
async function validateAsync(input: unknown) {
  const result = await schema.safeParseAsync(input);

  if (!result.success) {
    return {
      status: 400,
      errors: result.error.format(),
    };
  }

  return {
    status: 200,
    data: result.data,
  };
}
```
