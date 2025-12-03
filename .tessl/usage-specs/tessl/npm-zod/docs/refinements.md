# Refinements and Custom Validation

Add custom validation logic to schemas with synchronous or asynchronous checks.

## Refine Method

Boolean validation checks with custom error messages.

```typescript { .api }
interface ZodType<Output, Input> {
  refine(
    check: (value: Output) => boolean | Promise<boolean>,
    params?: string | {
      message?: string;
      path?: (string | number)[];
      params?: object;
    }
  ): this;
}
```

**Examples:**
```typescript
// Simple refine
z.number().refine((val) => val > 0, "Must be positive")
z.string().refine((val) => val.includes("@"), "Invalid email format")

// With custom path
z.string().refine(
  (val) => val.length >= 8,
  {
    message: "Must be at least 8 characters",
    path: ["credentials", "password"],
  }
)

// Multiple refine calls
z.string()
  .refine((val) => val.length >= 8, "At least 8 characters")
  .refine((val) => /[A-Z]/.test(val), "Must contain uppercase")
  .refine((val) => /[a-z]/.test(val), "Must contain lowercase")
  .refine((val) => /[0-9]/.test(val), "Must contain number")
  .refine((val) => /[!@#$%^&*]/.test(val), "Must contain special char")

// Refine on objects (cross-field validation)
z.object({
  password: z.string(),
  confirmPassword: z.string(),
}).refine(
  (data) => data.password === data.confirmPassword,
  {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  }
)

// Async refine (requires parseAsync)
z.string().refine(
  async (username) => {
    const exists = await checkUsernameExists(username);
    return !exists;
  },
  { message: "Username already taken" }
)

// Must use:
await schema.parseAsync(data);
```

## SuperRefine Method

Advanced refinement with context for adding multiple issues.

```typescript { .api }
interface ZodType<Output, Input> {
  superRefine(
    refineFn: (value: Output, ctx: RefinementCtx) => void | Promise<void>
  ): this;
}

interface RefinementCtx {
  addIssue(issue: IssueData): void;
  path: (string | number)[];
}

interface IssueData {
  code: ZodIssueCode;
  message?: string;
  path?: (string | number)[];
  fatal?: boolean;  // Stops validation immediately
  [key: string]: any;
}
```

**Examples:**
```typescript
// Multiple validation issues
z.string().superRefine((val, ctx) => {
  if (val.length < 8) {
    ctx.addIssue({
      code: z.ZodIssueCode.too_small,
      minimum: 8,
      type: "string",
      inclusive: true,
      message: "At least 8 characters",
    });
  }

  if (!/[A-Z]/.test(val)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Must contain uppercase",
    });
  }

  if (!/[0-9]/.test(val)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Must contain number",
    });
  }
})

// Conditional validation
z.object({
  type: z.enum(["personal", "business"]),
  taxId: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.type === "business" && !data.taxId) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Tax ID required for business accounts",
      path: ["taxId"],
    });
  }
})

// Cross-field validation
z.object({
  startDate: z.date(),
  endDate: z.date(),
}).superRefine((data, ctx) => {
  if (data.endDate <= data.startDate) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "End date must be after start date",
      path: ["endDate"],
    });
  }
})

// Fatal issues (stop validation immediately)
z.string().superRefine((val, ctx) => {
  if (val.includes("forbidden")) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Forbidden content detected",
      fatal: true,  // Stops validation
    });
  }
})

// Async super refine
z.string().superRefine(async (val, ctx) => {
  const isValid = await validateWithAPI(val);
  if (!isValid) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Validation failed",
    });
  }
})
```

## Check Method

Reusable validation check functions.

```typescript { .api }
interface ZodType<Output, Input> {
  check(...checks: Array<(value: Output) => boolean | Promise<boolean>>): this;
}
```

**Examples:**
```typescript
// Single check
z.number().check((val) => val % 2 === 0)

// Multiple checks
z.number()
  .check((val) => val > 0)
  .check((val) => val < 100)
  .check((val) => val % 2 === 0)

// Reusable check functions
const isPositive = (val: number) => val > 0;
const isEven = (val: number) => val % 2 === 0;

z.number().check(isPositive, isEven)
```

## Overwrite Method

Transform values during validation (in-place modification).

```typescript { .api }
interface ZodType<Output, Input> {
  overwrite(transformFn: (value: Output) => Output): ZodEffects<this>;
}
```

**Examples:**
```typescript
// Normalize email
z.string()
  .email()
  .overwrite((val) => val.toLowerCase().trim())

// Remove forbidden characters
z.string()
  .overwrite((val) => val.replace(/[<>]/g, ""))

// Conditional overwrite
z.object({
  name: z.string(),
  autoGenerate: z.boolean(),
}).overwrite((data) => {
  if (data.autoGenerate) {
    return { ...data, name: `Generated_${Date.now()}` };
  }
  return data;
})
```

## Common Patterns

```typescript
// Password validation
const PasswordSchema = z
  .string()
  .refine((val) => val.length >= 8, "At least 8 characters")
  .refine((val) => /[A-Z]/.test(val), "Must contain uppercase")
  .refine((val) => /[a-z]/.test(val), "Must contain lowercase")
  .refine((val) => /[0-9]/.test(val), "Must contain number");

// Confirm password pattern
const PasswordFormSchema = z
  .object({
    password: z.string().min(8),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

// Async username availability
const UsernameSchema = z.string().refine(
  async (username) => {
    const available = await checkAvailability(username);
    return available;
  },
  { message: "Username already taken" }
);

// Must use: await schema.parseAsync(data);

// Date range validation
const DateRangeSchema = z
  .object({
    start: z.date(),
    end: z.date(),
  })
  .refine((data) => data.end > data.start, {
    message: "End date must be after start date",
    path: ["end"],
  });

// Conditional required field
const AccountSchema = z
  .object({
    type: z.enum(["personal", "business"]),
    taxId: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.type === "business" && !data.taxId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Tax ID required for business",
        path: ["taxId"],
      });
    }
  });

// Complex validation with multiple issues
const ComplexSchema = z.object({ data: z.any() }).superRefine((val, ctx) => {
  // Add multiple issues
  // Access context path
  // Conditional validation
  // Fatal errors
});

// Combine with transformations
const ValidateAndTransform = z
  .string()
  .trim()
  .refine((val) => val.length > 0)
  .transform((val) => val.toUpperCase());
```

## Best Practices

```typescript
// Use refine for simple boolean checks
z.string().refine((val) => val.length > 0)

// Use superRefine for:
// - Multiple issues
// - Complex validation
// - Conditional validation
// - Access to context path

// Async refinements require parseAsync
const asyncSchema = z.string().refine(async (val) => {
  return await checkAvailability(val);
});
await asyncSchema.parseAsync(data);  // Required

// Error handling with refinements
const result = z
  .number()
  .refine((val) => val > 0, "Must be positive")
  .safeParse(-1);

if (!result.success) {
  console.log(result.error.issues[0].message);  // "Must be positive"
}
```
