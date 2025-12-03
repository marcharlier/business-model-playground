# Advanced Schemas

Schemas for functions, promises, custom validation, file uploads, and recursive structures.

## Function Schema

```typescript { .api }
function function<
  Args extends ZodTuple<any, any> = ZodTuple<[], ZodUnknown>,
  Returns extends ZodTypeAny = ZodUnknown
>(params?: { description?: string; errorMap?: ZodErrorMap }): ZodFunction<Args, Returns>;

interface ZodFunction<Args, Returns> {
  args<T extends ZodTuple<any, any>>(...schemas: T): ZodFunction<T, Returns>;
  returns<T extends ZodTypeAny>(schema: T): ZodFunction<Args, T>;
  implement(fn: (...args: any[]) => any): (...args: any[]) => any;
}
```

**Examples:**
```typescript
// Basic function
const fn = z.function();

// With arguments
const fn = z.function()
  .args(z.string(), z.number())
  .returns(z.boolean());

// Implementation
const safeFunction = z
  .function()
  .args(z.string(), z.number())
  .returns(z.string())
  .implement((name, age) => `${name} is ${age} years old`);

// Validates at runtime
safeFunction("Alice", 25);  // OK
safeFunction(123, "invalid");  // Throws
```

## Promise Schema

```typescript { .api }
function promise<T extends ZodTypeAny>(schema: T): ZodPromise<T>;
```

**Examples:**
```typescript
z.promise(z.string())
z.promise(z.object({ data: z.any() }))

const PromiseSchema = z.promise(z.number());
await PromiseSchema.parseAsync(Promise.resolve(42));  // 42
```

## Lazy Schema (Recursive)

```typescript { .api }
function lazy<T extends ZodTypeAny>(getter: () => T): ZodLazy<T>;
```

**Examples:**
```typescript
// Recursive type
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

// Tree structure
interface Node {
  value: number;
  left?: Node;
  right?: Node;
}

const NodeSchema: z.ZodType<Node> = z.lazy(() =>
  z.object({
    value: z.number(),
    left: NodeSchema.optional(),
    right: NodeSchema.optional(),
  })
);

// Linked list
interface ListNode {
  value: string;
  next?: ListNode;
}

const ListNodeSchema: z.ZodType<ListNode> = z.lazy(() =>
  z.object({
    value: z.string(),
    next: ListNodeSchema.optional(),
  })
);
```

## Custom Schema

```typescript { .api }
function custom<T = any>(
  check?: (data: unknown) => boolean,
  params?: { fatal?: boolean; description?: string; errorMap?: ZodErrorMap }
): ZodCustom<T>;
```

**Examples:**
```typescript
// Basic custom validation
const CustomSchema = z.custom<string>((val) => typeof val === "string");

// With validation logic
const EvenNumber = z.custom<number>((val) => {
  return typeof val === "number" && val % 2 === 0;
});

// Custom type
const PositiveNumber = z.custom<number>((val) => {
  return typeof val === "number" && val > 0;
}, { description: "Must be positive number" });
```

## InstanceOf

```typescript { .api }
function instanceof<T extends new (...args: any[]) => any>(
  cls: T,
  params?: { description?: string; errorMap?: ZodErrorMap }
): ZodCustom<InstanceType<T>>;
```

**Examples:**
```typescript
z.instanceof(Date)
z.instanceof(Error)
z.instanceof(RegExp)

class MyClass {}
z.instanceof(MyClass)

// In schema
const schema = z.object({
  createdAt: z.instanceof(Date),
  error: z.instanceof(Error).optional(),
});
```

## File Schema

```typescript { .api }
function file(params?: { description?: string; errorMap?: ZodErrorMap }): ZodFile;

interface ZodFile {
  minSize(bytes: number, msg?: string | { message?: string }): this;
  maxSize(bytes: number, msg?: string | { message?: string }): this;
  type(mimeTypes: string | string[], msg?: string | { message?: string }): this;
}
```

**Examples:**
```typescript
// Basic file
z.file()

// File with constraints
z.file()
  .minSize(1024)        // 1KB minimum
  .maxSize(5242880)     // 5MB maximum
  .type("image/jpeg")   // JPEG only

// Multiple mime types
z.file().type(["image/jpeg", "image/png", "image/gif"])

// Form with file upload
const FormSchema = z.object({
  name: z.string(),
  avatar: z.file()
    .maxSize(2097152)  // 2MB
    .type(["image/jpeg", "image/png"]),
});
```

## Common Patterns

```typescript
// Validated callback
const CallbackSchema = z
  .function()
  .args(z.string(), z.number())
  .returns(z.void());

// API that returns promise
const APISchema = z.promise(z.object({
  data: z.array(z.any()),
  total: z.number(),
}));

// Recursive menu
interface MenuItem {
  label: string;
  items?: MenuItem[];
}

const MenuSchema: z.ZodType<MenuItem> = z.lazy(() =>
  z.object({
    label: z.string(),
    items: z.array(MenuSchema).optional(),
  })
);

// File upload validation
const UploadSchema = z.object({
  document: z.file()
    .maxSize(10485760)  // 10MB
    .type(["application/pdf"]),
  images: z.array(z.file()
    .maxSize(5242880)  // 5MB per image
    .type(["image/jpeg", "image/png"])
  ).max(5),
});

// Custom branded type
const UserId = z.custom<string & { __brand: "UserId" }>((val) => {
  return typeof val === "string" && /^user_/.test(val);
});
```
