# Union and Intersection Types

Combine schemas using union (OR) or intersection (AND) logic.

## Union

```typescript { .api }
function union<T extends readonly [ZodTypeAny, ZodTypeAny, ...ZodTypeAny[]]>(schemas: T): ZodUnion<T>;
```

**Examples:**
```typescript
// Basic union
z.union([z.string(), z.number()])
// type: string | number

// Multiple types
z.union([z.string(), z.number(), z.boolean()])

// Complex unions
z.union([
  z.object({ type: z.literal("user"), name: z.string() }),
  z.object({ type: z.literal("admin"), permissions: z.array(z.string()) }),
])

// Nullable/optional patterns
z.union([z.string(), z.null()])      // string | null
z.union([z.string(), z.undefined()]) // string | undefined
// Better: use .nullable() or .optional()
```

## Discriminated Union

Optimized union validation using a discriminator field.

```typescript { .api }
function discriminatedUnion<
  Discriminator extends string,
  Options extends ZodDiscriminatedUnionOption<Discriminator>[]
>(discriminator: Discriminator, options: Options): ZodDiscriminatedUnion<Discriminator, Options>;
```

**Examples:**
```typescript
// Basic discriminated union
const MessageSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("text"), content: z.string() }),
  z.object({ type: z.literal("image"), url: z.string().url() }),
  z.object({ type: z.literal("video"), url: z.string().url(), duration: z.number() }),
]);

type Message = z.infer<typeof MessageSchema>;
// { type: "text"; content: string }
// | { type: "image"; url: string }
// | { type: "video"; url: string; duration: number }

// API response types
const ResponseSchema = z.discriminatedUnion("status", [
  z.object({ status: z.literal("success"), data: z.any() }),
  z.object({ status: z.literal("error"), error: z.string() }),
  z.object({ status: z.literal("loading") }),
]);

// Form state
const FormStateSchema = z.discriminatedUnion("state", [
  z.object({ state: z.literal("idle") }),
  z.object({ state: z.literal("submitting") }),
  z.object({ state: z.literal("success"), data: z.any() }),
  z.object({ state: z.literal("error"), error: z.string() }),
]);
```

## Intersection

Combines two schemas (AND logic).

```typescript { .api }
function intersection<A extends ZodTypeAny, B extends ZodTypeAny>(
  left: A,
  right: B
): ZodIntersection<A, B>;

// Or use method
schemaA.and(schemaB);
```

**Examples:**
```typescript
// Basic intersection
const BaseUser = z.object({ id: z.string(), name: z.string() });
const WithEmail = z.object({ email: z.string().email() });

z.intersection(BaseUser, WithEmail)
// Or: BaseUser.and(WithEmail)
// type: { id: string; name: string; email: string }

// Multiple intersections
const WithTimestamps = z.object({
  createdAt: z.date(),
  updatedAt: z.date(),
});

BaseUser.and(WithEmail).and(WithTimestamps)

// Note: For objects, .merge() is usually better
BaseUser.merge(WithEmail).merge(WithTimestamps)
```

## Common Patterns

```typescript
// Nullable pattern
const NullableString = z.union([z.string(), z.null()]);
// Better: z.string().nullable()

// Optional pattern
const OptionalString = z.union([z.string(), z.undefined()]);
// Better: z.string().optional()

// API response with success/error
const APIResponse = z.discriminatedUnion("success", [
  z.object({
    success: z.literal(true),
    data: z.any(),
  }),
  z.object({
    success: z.literal(false),
    error: z.string(),
    code: z.number(),
  }),
]);

// Event types
const EventSchema = z.discriminatedUnion("event", [
  z.object({ event: z.literal("click"), x: z.number(), y: z.number() }),
  z.object({ event: z.literal("scroll"), scrollY: z.number() }),
  z.object({ event: z.literal("resize"), width: z.number(), height: z.number() }),
]);

// Payment methods
const PaymentSchema = z.discriminatedUnion("method", [
  z.object({
    method: z.literal("card"),
    cardNumber: z.string(),
    cvv: z.string(),
  }),
  z.object({
    method: z.literal("paypal"),
    email: z.string().email(),
  }),
  z.object({
    method: z.literal("crypto"),
    wallet: z.string(),
    currency: z.enum(["BTC", "ETH"]),
  }),
]);

// Composing with intersection
const BaseEntity = z.object({ id: z.string() });
const Timestamped = z.object({ createdAt: z.date(), updatedAt: z.date() });
const Audited = z.object({ createdBy: z.string(), updatedBy: z.string() });

const FullEntity = BaseEntity.and(Timestamped).and(Audited);
// Or use merge for objects
const FullEntityMerged = BaseEntity.merge(Timestamped).merge(Audited);
```

## Type Inference

```typescript
const UnionSchema = z.union([z.string(), z.number()]);
type UnionType = z.infer<typeof UnionSchema>;  // string | number

const DiscriminatedSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("a"), value: z.string() }),
  z.object({ type: z.literal("b"), value: z.number() }),
]);
type DiscriminatedType = z.infer<typeof DiscriminatedSchema>;
// { type: "a"; value: string } | { type: "b"; value: number }

const IntersectionSchema = z.intersection(
  z.object({ a: z.string() }),
  z.object({ b: z.number() })
);
type IntersectionType = z.infer<typeof IntersectionSchema>;
// { a: string; b: number }
```

## When to Use

- **Union**: Multiple valid types (OR logic)
- **Discriminated Union**: Tagged union types with better performance
- **Intersection**: Combine types (AND logic), but prefer `.merge()` for objects
