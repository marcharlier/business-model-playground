# Primitive Schemas

Basic JavaScript type validators: strings, numbers, booleans, dates, and special types.

## String Schema

```typescript { .api }
/**
 * Create a string validation schema
 * @param params - Optional configuration with description and error map
 * @returns ZodString schema instance
 */
function string(params?: { description?: string; errorMap?: ZodErrorMap }): ZodString;

interface ZodString extends ZodType<string, string> {
  // Length constraints
  /**
   * Enforce minimum string length
   * @param length - Minimum number of characters
   * @param msg - Custom error message or options
   */
  min(length: number, msg?: string | { message?: string }): this;

  /**
   * Enforce maximum string length
   * @param length - Maximum number of characters
   * @param msg - Custom error message or options
   */
  max(length: number, msg?: string | { message?: string }): this;

  /**
   * Enforce exact string length
   * @param length - Exact number of characters required
   * @param msg - Custom error message or options
   */
  length(length: number, msg?: string | { message?: string }): this;

  /**
   * Require non-empty string (length > 0)
   * @param msg - Custom error message or options
   */
  nonempty(msg?: string | { message?: string }): this;

  // Pattern matching
  /**
   * Match string against regular expression
   * @param pattern - RegExp pattern to match
   * @param msg - Custom error message or options
   */
  regex(pattern: RegExp, msg?: string | { message?: string }): this;

  /** Require string to include substring */
  includes(substring: string, params?: { message?: string; position?: number }): this;

  /** Require string to start with prefix */
  startsWith(prefix: string, msg?: string | { message?: string }): this;

  /** Require string to end with suffix */
  endsWith(suffix: string, msg?: string | { message?: string }): this;

  // Case validation
  /** Validate string is all lowercase */
  lowercase(msg?: string | { message?: string }): this;

  /** Validate string is all uppercase */
  uppercase(msg?: string | { message?: string }): this;

  // Transformations
  /** Remove leading and trailing whitespace */
  trim(): this;

  /** Transform string to lowercase */
  toLowerCase(): this;

  /** Transform string to uppercase */
  toUpperCase(): this;

  /**
   * Normalize string using Unicode normalization
   * @param form - Unicode normalization form
   */
  normalize(form?: "NFC" | "NFD" | "NFKC" | "NFKD"): this;

  // Format validation (deprecated - use z.email(), z.url() instead)
  email(msg?: string | { message?: string }): this;
  url(msg?: string | { message?: string }): this;
  uuid(msg?: string | { message?: string }): this;
  guid(msg?: string | { message?: string }): this;
  jwt(msg?: string | { message?: string }): this;
  emoji(msg?: string | { message?: string }): this;
}
```

**Examples:**
```typescript
// Basic string
const NameSchema = z.string();

// Length constraints
const UsernameSchema = z.string().min(3).max(20);

// Pattern matching
const SlugSchema = z.string().regex(/^[a-zA-Z0-9_]+$/);

// Transformations
const TrimmedSchema = z.string().trim().toLowerCase();

// Non-empty
const RequiredSchema = z.string().nonempty();

// Complex validation
const CodeSchema = z.string().startsWith("CODE-").length(10);

// Case validation
const UppercaseSchema = z.string().uppercase();
```

## Number Schema

```typescript { .api }
/**
 * Create a number validation schema
 * @param params - Optional configuration with description and error map
 * @returns ZodNumber schema instance
 */
function number(params?: { description?: string; errorMap?: ZodErrorMap }): ZodNumber;

interface ZodNumber extends ZodType<number, number> {
  // Comparison constraints
  /**
   * Enforce minimum value
   * @param value - Minimum allowed value
   * @param params - Custom message and inclusive flag (default: true)
   */
  min(value: number, params?: string | { message?: string; inclusive?: boolean }): this;

  /**
   * Enforce maximum value
   * @param value - Maximum allowed value
   * @param params - Custom message and inclusive flag (default: true)
   */
  max(value: number, params?: string | { message?: string; inclusive?: boolean }): this;

  /** Require number less than value (exclusive) */
  lt(value: number, msg?: string | { message?: string }): this;

  /** Require number less than or equal to value */
  lte(value: number, msg?: string | { message?: string }): this;

  /** Require number greater than value (exclusive) */
  gt(value: number, msg?: string | { message?: string }): this;

  /** Require number greater than or equal to value */
  gte(value: number, msg?: string | { message?: string }): this;

  // Sign constraints
  /** Require positive number (> 0) */
  positive(msg?: string | { message?: string }): this;

  /** Require negative number (< 0) */
  negative(msg?: string | { message?: string }): this;

  /** Require non-negative number (>= 0) */
  nonnegative(msg?: string | { message?: string }): this;

  /** Require non-positive number (<= 0) */
  nonpositive(msg?: string | { message?: string }): this;

  // Type constraints
  /**
   * Require integer (no decimal places)
   * @param msg - Custom error message or options
   */
  int(msg?: string | { message?: string }): this;

  // Other constraints
  /**
   * Require number to be multiple of given value
   * @param value - Divisor that must divide evenly
   * @param msg - Custom error message or options
   */
  multipleOf(value: number, msg?: string | { message?: string }): this;

  /**
   * Require finite number (not Infinity or -Infinity)
   * @param msg - Custom error message or options
   */
  finite(msg?: string | { message?: string }): this;

  /**
   * Require safe integer (within Number.MIN_SAFE_INTEGER and Number.MAX_SAFE_INTEGER)
   * @param msg - Custom error message or options
   */
  safe(msg?: string | { message?: string }): this;
}
```

**Examples:**
```typescript
// Basic number
const AgeSchema = z.number();

// Range constraints
const PercentageSchema = z.number().min(0).max(100);

// Positive integer
const CountSchema = z.number().int().positive();

// Safe integer in range
const IDSchema = z.number().int().safe().positive();

// Multiple of constraint
const EvenSchema = z.number().multipleOf(2);

// Comparison operators
const ScoreSchema = z.number().gte(0).lt(100);
```

## Boolean Schema

```typescript { .api }
/**
 * Create a boolean validation schema
 * @param params - Optional configuration with description and error map
 * @returns ZodBoolean schema instance
 */
function boolean(params?: { description?: string; errorMap?: ZodErrorMap }): ZodBoolean;

interface ZodBoolean extends ZodType<boolean, boolean> {}
```

**Examples:**
```typescript
const IsActiveSchema = z.boolean();

const UserSchema = z.object({
  name: z.string(),
  isAdmin: z.boolean(),
  emailVerified: z.boolean(),
});
```

## BigInt Schema

```typescript { .api }
/**
 * Create a bigint validation schema for large integers
 * @param params - Optional configuration with description and error map
 * @returns ZodBigInt schema instance
 */
function bigint(params?: { description?: string; errorMap?: ZodErrorMap }): ZodBigInt;

interface ZodBigInt extends ZodType<bigint, bigint> {
  // Comparison constraints
  min(value: bigint, params?: string | { message?: string; inclusive?: boolean }): this;
  max(value: bigint, params?: string | { message?: string; inclusive?: boolean }): this;
  lt(value: bigint, msg?: string | { message?: string }): this;
  lte(value: bigint, msg?: string | { message?: string }): this;
  gt(value: bigint, msg?: string | { message?: string }): this;
  gte(value: bigint, msg?: string | { message?: string }): this;

  // Sign constraints
  positive(msg?: string | { message?: string }): this;
  negative(msg?: string | { message?: string }): this;
  nonnegative(msg?: string | { message?: string }): this;
  nonpositive(msg?: string | { message?: string }): this;

  // Multiple of constraint
  multipleOf(value: bigint, msg?: string | { message?: string }): this;
}
```

**Examples:**
```typescript
const LargeNumberSchema = z.bigint();

const PositiveBigIntSchema = z.bigint().positive();

const RangeBigIntSchema = z.bigint().min(0n).max(1000000000n);
```

## Date Schema

```typescript { .api }
/**
 * Create a Date object validation schema
 * @param params - Optional configuration with description and error map
 * @returns ZodDate schema instance
 */
function date(params?: { description?: string; errorMap?: ZodErrorMap }): ZodDate;

interface ZodDate extends ZodType<Date, Date> {
  min(date: Date, msg?: string | { message?: string }): this;
  max(date: Date, msg?: string | { message?: string }): this;
}
```

**Examples:**
```typescript
const BirthdateSchema = z.date();

const FutureDateSchema = z.date().min(new Date());

const DateRangeSchema = z.date()
  .min(new Date("2020-01-01"))
  .max(new Date("2025-12-31"));
```

## Special Type Schemas

```typescript { .api }
/**
 * Create an undefined validation schema
 * @returns ZodUndefined schema that only accepts undefined
 */
function undefined(): ZodUndefined;

/**
 * Create a null validation schema
 * @returns ZodNull schema that only accepts null
 */
function null(): ZodNull;

/**
 * Create an any schema (accepts any value without validation)
 * @returns ZodAny schema
 */
function any(): ZodAny;

/**
 * Create an unknown schema (accepts any value but requires type narrowing)
 * @returns ZodUnknown schema
 */
function unknown(): ZodUnknown;

/**
 * Create a never schema (rejects all values)
 * @param params - Optional configuration with description and error map
 * @returns ZodNever schema
 */
function never(params?: { description?: string; errorMap?: ZodErrorMap }): ZodNever;

/**
 * Create a void schema (accepts only undefined)
 * @returns ZodVoid schema
 */
function void(): ZodVoid;

/**
 * Create a NaN schema (accepts only NaN)
 * @param params - Optional configuration with description and error map
 * @returns ZodNaN schema
 */
function nan(params?: { description?: string; errorMap?: ZodErrorMap }): ZodNaN;

/**
 * Create a symbol validation schema
 * @param params - Optional configuration with description and error map
 * @returns ZodSymbol schema instance
 */
function symbol(params?: { description?: string; errorMap?: ZodErrorMap }): ZodSymbol;

interface ZodUndefined extends ZodType<undefined, undefined> {}
interface ZodNull extends ZodType<null, null> {}
interface ZodAny extends ZodType<any, any> {}
interface ZodUnknown extends ZodType<unknown, unknown> {}
interface ZodNever extends ZodType<never, never> {}
interface ZodVoid extends ZodType<void, undefined> {}
interface ZodNaN extends ZodType<number, number> {}
interface ZodSymbol extends ZodType<symbol, symbol> {}
```

**Examples:**
```typescript
// Symbol
const SymbolSchema = z.symbol();

// Undefined type
const UndefinedSchema = z.undefined();

// Null type
const NullSchema = z.null();

// Any (no validation)
const AnySchema = z.any();

// Unknown (validation required later)
const UnknownSchema = z.unknown();

// Never (always fails)
const NeverSchema = z.never();

// Void (undefined)
const VoidSchema = z.void();

// NaN check
const NaNSchema = z.nan();

// Symbol
const SymbolSchema = z.symbol();

// Nullable/optional patterns
const NullableStringSchema = z.union([z.string(), z.null()]);
// Or use built-in:
const NullableString2 = z.string().nullable();
const OptionalString = z.string().optional();
```

## Type Interfaces

Complete interface definitions with internal properties:

```typescript { .api }
interface ZodString extends ZodType<string, string> {
  minLength: number | null;
  maxLength: number | null;
  format: string | null;
}

interface ZodNumber extends ZodType<number, number> {}
interface ZodBoolean extends ZodType<boolean, boolean> {}
interface ZodBigInt extends ZodType<bigint, bigint> {}
interface ZodDate extends ZodType<Date, Date> {}
interface ZodSymbol extends ZodType<symbol, symbol> {}
interface ZodUndefined extends ZodType<undefined, undefined> {}
interface ZodNull extends ZodType<null, null> {}
interface ZodAny extends ZodType<any, any> {}
interface ZodUnknown extends ZodType<unknown, unknown> {}
interface ZodNever extends ZodType<never, never> {}
interface ZodVoid extends ZodType<void, undefined> {}
interface ZodNaN extends ZodType<number, number> {}
```
