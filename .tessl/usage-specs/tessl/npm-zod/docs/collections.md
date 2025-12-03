# Collection Schemas

Validators for arrays, objects, tuples, maps, sets, records, enums, and literals with full type inference.

## Array

```typescript { .api }
/**
 * Create an array validation schema with element type validation
 * @param element - Schema for array elements
 * @param params - Optional configuration with description and error map
 * @returns ZodArray schema instance
 */
function array<T extends ZodTypeAny>(
  element: T,
  params?: { description?: string; errorMap?: ZodErrorMap }
): ZodArray<T>;

interface ZodArray<T extends ZodTypeAny> extends ZodType<
  Array<z.infer<T>>,
  Array<z.input<T>>
> {
  /** Minimum array length */
  min(size: number, msg?: string | { message?: string }): this;
  /** Maximum array length */
  max(size: number, msg?: string | { message?: string }): this;
  /** Exact array length */
  length(size: number, msg?: string | { message?: string }): this;
  /** Non-empty array (min length 1) */
  nonempty(msg?: string | { message?: string }): this;
  /** Get element schema */
  element: T;
}
```

**Examples:**
```typescript
// Basic array
const StringArraySchema = z.array(z.string());
StringArraySchema.parse(["hello", "world"]); // Valid

// Array with constraints
const LimitedArraySchema = z.array(z.number()).min(1).max(10);

// Non-empty array
const NonEmptySchema = z.array(z.string()).nonempty();

// Nested arrays
const MatrixSchema = z.array(z.array(z.number()));

// Array of objects
const UsersSchema = z.array(
  z.object({
    name: z.string(),
    age: z.number(),
  })
);
```

## Object

```typescript { .api }
/**
 * Create an object validation schema with property schemas
 * @param shape - Record of property schemas
 * @param params - Optional configuration with description and error map
 * @returns ZodObject schema instance
 */
function object<T extends ZodRawShape>(
  shape: T,
  params?: { description?: string; errorMap?: ZodErrorMap }
): ZodObject<T>;

/**
 * Create a strict object schema (rejects extra properties)
 * @param shape - Record of property schemas
 * @returns ZodObject in strict mode
 */
function strictObject<T extends ZodRawShape>(shape: T): ZodObject<T>;

/**
 * Create a loose object schema (passes through extra properties)
 * @param shape - Record of property schemas
 * @returns ZodObject in passthrough mode
 */
function looseObject<T extends ZodRawShape>(shape: T): ZodObject<T>;

interface ZodObject<T extends ZodRawShape> extends ZodType<
  { [K in keyof T]: z.infer<T[K]> },
  { [K in keyof T]: z.input<T[K]> }
> {
  /** Property schemas */
  shape: T;

  /** Get enum of object keys */
  keyof(): ZodEnum<[keyof T, ...(keyof T)[]]>;

  /** Extend schema with additional properties */
  extend<U extends ZodRawShape>(shape: U): ZodObject<T & U>;

  /** Merge with another object schema */
  merge<U extends ZodRawShape>(schema: ZodObject<U>): ZodObject<T & U>;

  /** Pick specific properties */
  pick<K extends keyof T>(keys: { [P in K]: true }): ZodObject<Pick<T, K>>;

  /** Omit specific properties */
  omit<K extends keyof T>(keys: { [P in K]: true }): ZodObject<Omit<T, K>>;

  /** Make all properties optional */
  partial(params?: { message?: string }): ZodObject<{
    [K in keyof T]: ZodOptional<T[K]>;
  }>;

  /** Make all properties required */
  required(params?: { message?: string }): ZodObject<{
    [K in keyof T]: ZodNonOptional<T[K]>;
  }>;

  /** Pass through extra properties */
  passthrough(): this;

  /** Reject extra properties (strict mode) */
  strict(): this;

  /** Strip extra properties (default) */
  strip(): this;

  /** Passthrough mode (alias) */
  loose(): this;

  /** Schema for extra properties */
  catchall(schema: ZodTypeAny): this;

  /** Set specific key schema */
  setKey(key: string, schema: ZodTypeAny): this;
}

type ZodRawShape = { [k: string]: ZodTypeAny };
```

**Examples:**
```typescript
// Basic object
const UserSchema = z.object({
  name: z.string(),
  email: z.email(),
  age: z.number().positive(),
});

type User = z.infer<typeof UserSchema>;
// => { name: string; email: string; age: number; }

// Nested objects
const AddressSchema = z.object({
  street: z.string(),
  city: z.string(),
  country: z.string(),
});

const PersonSchema = z.object({
  name: z.string(),
  address: AddressSchema,
});

// Extending objects
const BaseSchema = z.object({ id: z.string() });
const ExtendedSchema = BaseSchema.extend({
  name: z.string(),
  email: z.email(),
});

// Merging objects
const ProfileSchema = z.object({ bio: z.string() });
const FullUserSchema = UserSchema.merge(ProfileSchema);

// Picking and omitting properties
const PublicUserSchema = UserSchema.omit({ age: true });
const IdNameSchema = UserSchema.pick({ name: true });

// Partial and required
const OptionalUserSchema = UserSchema.partial();
const RequiredUserSchema = OptionalUserSchema.required();

// Handling extra properties
const StrictSchema = z.object({ name: z.string() }).strict(); // Rejects extras
const LooseSchema = z.object({ name: z.string() }).passthrough(); // Keeps extras
const CatchallSchema = z.object({ name: z.string() }).catchall(z.string()); // Validates extras
```

## Tuple

```typescript { .api }
/**
 * Create a tuple validation schema for fixed-length heterogeneous arrays
 * @param items - Array of element schemas
 * @param params - Optional configuration with description and error map
 * @returns ZodTuple schema instance
 */
function tuple<T extends [ZodTypeAny, ...ZodTypeAny[]]>(
  items: T,
  params?: { description?: string; errorMap?: ZodErrorMap }
): ZodTuple<T>;

interface ZodTuple<T extends [ZodTypeAny, ...ZodTypeAny[]]> extends ZodType<
  { [K in keyof T]: z.infer<T[K]> },
  { [K in keyof T]: z.input<T[K]> }
> {
  /** Rest element schema for variable-length tuples */
  rest<R extends ZodTypeAny>(schema: R): ZodTuple<[...T, ...Array<R>]>;

  /** Get element schemas */
  items: T;
}
```

**Examples:**
```typescript
// Basic tuple
const CoordinateSchema = z.tuple([z.number(), z.number()]);
CoordinateSchema.parse([10, 20]); // Valid
type Coordinate = z.infer<typeof CoordinateSchema>;
// => [number, number]

// Tuple with different types
const PersonTupleSchema = z.tuple([z.string(), z.number(), z.boolean()]);
PersonTupleSchema.parse(["Alice", 25, true]); // Valid

// Tuple with rest elements
const VariadicTupleSchema = z
  .tuple([z.string(), z.number()])
  .rest(z.boolean());
VariadicTupleSchema.parse(["hello", 42, true, false, true]); // Valid
```

## Record

```typescript { .api }
/**
 * Create a record validation schema with typed keys
 * @param keySchema - Schema for record keys
 * @param valueSchema - Schema for record values
 * @returns ZodRecord schema instance
 */
function record<
  K extends ZodType<string | number | symbol>,
  V extends ZodTypeAny
>(keySchema: K, valueSchema: V): ZodRecord<K, V>;

/**
 * Create a record validation schema with string keys
 * @param valueSchema - Schema for record values
 * @returns ZodRecord schema instance
 */
function record<V extends ZodTypeAny>(valueSchema: V): ZodRecord<ZodString, V>;

/**
 * Create a partial record (all values optional)
 * @param keySchema - Schema for record keys
 * @param valueSchema - Schema for record values
 * @returns ZodRecord with optional values
 */
function partialRecord<
  K extends ZodType<string | number | symbol>,
  V extends ZodTypeAny
>(keySchema: K, valueSchema: V): ZodRecord<K, ZodOptional<V>>;

interface ZodRecord<
  K extends ZodType<string | number | symbol>,
  V extends ZodTypeAny
> extends ZodType<Record<z.infer<K>, z.infer<V>>, Record<z.input<K>, z.input<V>>> {
  /** Key schema */
  keySchema: K;
  /** Value schema */
  valueSchema: V;
}
```

**Examples:**
```typescript
// Record with string keys
const StringRecordSchema = z.record(z.string());
StringRecordSchema.parse({ foo: "bar", baz: "qux" }); // Valid

// Record with specific key type
const NumericKeysSchema = z.record(z.string().regex(/^\d+$/), z.number());
NumericKeysSchema.parse({ "1": 100, "2": 200 }); // Valid

// Record with enum keys
const StatusRecordSchema = z.record(
  z.enum(["pending", "active", "completed"]),
  z.number()
);

// Partial record
const PartialRecordSchema = z.partialRecord(z.string(), z.number());
```

## Map & Set

```typescript { .api }
/**
 * Create a Map validation schema
 * @param keySchema - Schema for map keys
 * @param valueSchema - Schema for map values
 * @returns ZodMap schema instance
 */
function map<K extends ZodTypeAny, V extends ZodTypeAny>(
  keySchema: K,
  valueSchema: V
): ZodMap<K, V>;

/**
 * Create a Set validation schema
 * @param valueSchema - Schema for set values
 * @param params - Optional configuration with description and error map
 * @returns ZodSet schema instance
 */
function set<T extends ZodTypeAny>(
  valueSchema: T,
  params?: { description?: string; errorMap?: ZodErrorMap }
): ZodSet<T>;

interface ZodMap<K extends ZodTypeAny, V extends ZodTypeAny> extends ZodType<
  Map<z.infer<K>, z.infer<V>>,
  Map<z.input<K>, z.input<V>>
> {
  /** Minimum map size */
  min(size: number, msg?: string | { message?: string }): this;
  /** Maximum map size */
  max(size: number, msg?: string | { message?: string }): this;
  /** Exact map size */
  size(size: number, msg?: string | { message?: string }): this;

  /** Key schema */
  keySchema: K;
  /** Value schema */
  valueSchema: V;
}

interface ZodSet<T extends ZodTypeAny> extends ZodType<
  Set<z.infer<T>>,
  Set<z.input<T>>
> {
  /** Minimum set size */
  min(size: number, msg?: string | { message?: string }): this;
  /** Maximum set size */
  max(size: number, msg?: string | { message?: string }): this;
  /** Exact set size */
  size(size: number, msg?: string | { message?: string }): this;

  /** Value schema */
  valueSchema: T;
}
```

**Examples:**
```typescript
// Basic map
const MapSchema = z.map(z.string(), z.number());
const myMap = new Map([
  ["a", 1],
  ["b", 2],
]);
MapSchema.parse(myMap); // Valid

// Map with constraints
const LimitedMapSchema = z.map(z.string(), z.number()).min(1).max(100);

// Complex map types
const UserMapSchema = z.map(
  z.string().uuid(),
  z.object({
    name: z.string(),
    email: z.email(),
  })
);

// Basic set
const SetSchema = z.set(z.string());
const mySet = new Set(["a", "b", "c"]);
SetSchema.parse(mySet); // Valid

// Set with constraints
const LimitedSetSchema = z.set(z.number()).min(1).max(10);

// Set with complex types
const UserIdSetSchema = z.set(z.string().uuid());
```

## Enum & Literal

```typescript { .api }
/**
 * Create an enum validation schema
 * @param values - Array of enum values
 * @param params - Optional configuration with description and error map
 * @returns ZodEnum schema instance
 */
function enum<T extends [string, ...string[]]>(
  values: T,
  params?: { description?: string; errorMap?: ZodErrorMap }
): ZodEnum<T>;

/**
 * Create a native enum validation schema (TypeScript enums)
 * @param enumObject - TypeScript enum object
 * @param params - Optional configuration with description and error map
 * @returns ZodEnum schema instance
 */
function nativeEnum<T extends { [k: string]: string | number }>(
  enumObject: T,
  params?: { description?: string; errorMap?: ZodErrorMap }
): ZodEnum<[T[keyof T], ...T[keyof T][]]>;

/**
 * Create a literal value validation schema
 * @param value - Literal value to match
 * @returns ZodLiteral schema instance
 */
function literal<T extends Primitive>(value: T): ZodLiteral<T>;

interface ZodEnum<T extends [string, ...string[]]> extends ZodType<T[number], T[number]> {
  /** Record of enum entries */
  enum: { [K in T[number]]: K };
  /** Array of enum values */
  options: T;

  /** Extract subset of enum */
  extract<U extends T[number][]>(keys: U): ZodEnum<U>;
  /** Exclude subset of enum */
  exclude<U extends T[number][]>(keys: U): ZodEnum<Exclude<T[number], U[number]>[]>;
}

interface ZodLiteral<T extends Primitive> extends ZodType<T, T> {
  /** The literal value */
  value: T;
}

type Primitive = string | number | bigint | boolean | null | undefined;
```

**Examples:**
```typescript
// Basic enum
const ColorSchema = z.enum(["red", "green", "blue"]);
ColorSchema.parse("red"); // Valid
ColorSchema.parse("yellow"); // Invalid

type Color = z.infer<typeof ColorSchema>;
// => "red" | "green" | "blue"

// Access enum values
ColorSchema.enum.red; // "red"
ColorSchema.options; // ["red", "green", "blue"]

// Extract and exclude
const PrimaryColorSchema = ColorSchema.extract(["red", "blue"]);
const NonRedSchema = ColorSchema.exclude(["red"]);

// Native TypeScript enum
enum Status {
  Pending = "pending",
  Active = "active",
  Completed = "completed",
}

const StatusSchema = z.nativeEnum(Status);
StatusSchema.parse(Status.Active); // Valid
StatusSchema.parse("active"); // Valid

// String literal
const HelloSchema = z.literal("hello");
HelloSchema.parse("hello"); // Valid
HelloSchema.parse("world"); // Invalid

// Number literal
const AnswerSchema = z.literal(42);
AnswerSchema.parse(42); // Valid

// Boolean literal
const TrueSchema = z.literal(true);

// Null literal
const NullSchema = z.literal(null);

// Combine literals with union for multiple allowed values
const DirectionSchema = z.union([
  z.literal("north"),
  z.literal("south"),
  z.literal("east"),
  z.literal("west"),
]);

// Or use enum for the same effect
const DirectionEnumSchema = z.enum(["north", "south", "east", "west"]);
```

## Common Patterns

```typescript
// API response
const ResponseSchema = z.object({
  data: z.array(z.object({
    id: z.string(),
    name: z.string(),
  })),
  meta: z.object({
    page: z.number(),
    total: z.number(),
  }),
});

// Form validation
const FormSchema = z.object({
  name: z.string().min(2),
  email: z.email(),
  tags: z.array(z.string()).optional(),
  settings: z.record(z.string(), z.boolean()),
});

// Configuration
const ConfigSchema = z.object({
  env: z.enum(["dev", "staging", "prod"]),
  features: z.set(z.string()),
  ports: z.map(z.string(), z.number()),
});
```
