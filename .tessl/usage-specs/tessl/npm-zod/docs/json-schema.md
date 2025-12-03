# JSON Schema Conversion

Convert Zod schemas to JSON Schema format for documentation and interoperability.

## JSON Schema Conversion

```typescript { .api }
function toJSONSchema<T extends ZodTypeAny>(
  schema: T,
  options?: {
    name?: string;
    $refStrategy?: "root" | "relative" | "none";
    basePath?: string[];
    effectStrategy?: "input" | "output";
  }
): JSONSchema7;
```

**Examples:**
```typescript
import { z } from "zod";

// Basic conversion
const schema = z.object({
  name: z.string(),
  age: z.number(),
});

const jsonSchema = z.toJSONSchema(schema);
// {
//   type: "object",
//   properties: {
//     name: { type: "string" },
//     age: { type: "number" }
//   },
//   required: ["name", "age"],
//   additionalProperties: false
// }

// With name
const jsonSchema = z.toJSONSchema(schema, { name: "User" });
// Adds "$id": "User" to the schema

// Reference strategy
const jsonSchema = z.toJSONSchema(schema, {
  $refStrategy: "root"  // or "relative" or "none"
});
```

## Supported Schema Types

```typescript
// Primitives
z.string()         // { type: "string" }
z.number()         // { type: "number" }
z.boolean()        // { type: "boolean" }
z.null()           // { type: "null" }

// String formats
z.email()          // { type: "string", format: "email" }
z.url()            // { type: "string", format: "uri" }
z.uuid()           // { type: "string", format: "uuid" }

// Number constraints
z.number().min(0)  // { type: "number", minimum: 0 }
z.number().max(100) // { type: "number", maximum: 100 }
z.number().int()   // { type: "integer" }

// String constraints
z.string().min(3)  // { type: "string", minLength: 3 }
z.string().max(20) // { type: "string", maxLength: 20 }
z.string().regex(/^[a-z]+$/) // { type: "string", pattern: "^[a-z]+$" }

// Arrays
z.array(z.string()) // { type: "array", items: { type: "string" } }
z.array(z.number()).min(1) // { type: "array", items: { type: "number" }, minItems: 1 }

// Objects
z.object({
  name: z.string(),
  age: z.number().optional(),
})
// {
//   type: "object",
//   properties: {
//     name: { type: "string" },
//     age: { type: "number" }
//   },
//   required: ["name"]
// }

// Enums
z.enum(["a", "b", "c"])
// { type: "string", enum: ["a", "b", "c"] }

// Unions
z.union([z.string(), z.number()])
// { anyOf: [{ type: "string" }, { type: "number" }] }

// Nullable
z.string().nullable()
// { anyOf: [{ type: "string" }, { type: "null" }] }

// Optional
z.string().optional()
// { type: "string" } (not in required array)

// Default values
z.string().default("hello")
// { type: "string", default: "hello" }
```

## Descriptions

```typescript
const schema = z.object({
  name: z.string({ description: "User's full name" }),
  age: z.number({ description: "User's age in years" }),
  email: z.email({ description: "User's email address" }),
});

const jsonSchema = z.toJSONSchema(schema);
// Properties will include description fields
```

## Complex Schemas

```typescript
// Nested objects
const AddressSchema = z.object({
  street: z.string(),
  city: z.string(),
  country: z.string(),
});

const UserSchema = z.object({
  name: z.string(),
  address: AddressSchema,
});

const jsonSchema = z.toJSONSchema(UserSchema);

// Discriminated unions
const MessageSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("text"), content: z.string() }),
  z.object({ type: z.literal("image"), url: z.string().url() }),
]);

const jsonSchema = z.toJSONSchema(MessageSchema);
// Converts to JSON Schema with oneOf

// Arrays of objects
const UsersSchema = z.array(z.object({
  id: z.string().uuid(),
  name: z.string(),
  email: z.email(),
}));

const jsonSchema = z.toJSONSchema(UsersSchema);
```

## Common Patterns

```typescript
// API documentation generation
const APISchema = z.object({
  method: z.enum(["GET", "POST", "PUT", "DELETE"]),
  path: z.string(),
  body: z.object({
    data: z.any(),
  }).optional(),
  headers: z.record(z.string(), z.string()).optional(),
});

const apiJsonSchema = z.toJSONSchema(APISchema, {
  name: "APIRequest",
});

// Save as JSON file for OpenAPI spec
import fs from "fs";
fs.writeFileSync("api-schema.json", JSON.stringify(apiJsonSchema, null, 2));

// Generate documentation
const schemas = {
  User: z.toJSONSchema(UserSchema),
  Post: z.toJSONSchema(PostSchema),
  Comment: z.toJSONSchema(CommentSchema),
};

// Form validation schema for UI libraries
const FormSchema = z.object({
  name: z.string().min(2),
  email: z.email(),
  age: z.number().int().min(18),
  subscribe: z.boolean().default(false),
});

const formJsonSchema = z.toJSONSchema(FormSchema);
// Use with react-jsonschema-form or similar

// OpenAPI integration
const RouteSchema = z.object({
  params: z.object({ id: z.string() }),
  query: z.object({ page: z.coerce.number().optional() }),
  body: UserSchema,
});

const openAPISchema = {
  parameters: z.toJSONSchema(RouteSchema.shape.params),
  requestBody: {
    content: {
      "application/json": {
        schema: z.toJSONSchema(RouteSchema.shape.body),
      },
    },
  },
};
```

## Limitations

```typescript
// Not all Zod features map to JSON Schema:
// - Refinements (custom validation)
// - Transformations
// - Async validation
// - Custom error messages

// These features are Zod-specific and cannot be represented in JSON Schema

// For documentation purposes, use descriptions
const schema = z.object({
  password: z.string()
    .min(8, { description: "Must be at least 8 characters" })
    .refine((val) => /[A-Z]/.test(val), "Must contain uppercase")
    // refine won't appear in JSON Schema, only min constraint
});
```

## Effect Strategy

```typescript
// For schemas with transformations
const TransformSchema = z.string().transform((s) => s.length);

// Input schema (before transformation)
const inputSchema = z.toJSONSchema(TransformSchema, {
  effectStrategy: "input"
});
// { type: "string" }

// Output schema (after transformation)
const outputSchema = z.toJSONSchema(TransformSchema, {
  effectStrategy: "output"
});
// { type: "number" }
```

## Use Cases

1. **API Documentation**: Generate OpenAPI/Swagger specs
2. **Form Validation**: JSON Schema for form libraries
3. **Code Generation**: Generate types in other languages
4. **Validation Libraries**: Use with JSON Schema validators
5. **Documentation**: Auto-generate schema documentation
6. **Interoperability**: Share schemas with non-TypeScript systems
