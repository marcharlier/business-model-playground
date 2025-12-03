# Error Handling

Structured error types with granular issue reporting and formatting utilities.

## ZodError Class

```typescript { .api }
/**
 * Main error class for Zod validation failures
 */
class ZodError<T = any> extends Error {
  /** Array of validation issues */
  issues: ZodIssue[];

  /** Alias for issues (deprecated) */
  errors: ZodIssue[];

  /** Error name (always "ZodError") */
  name: "ZodError";

  /** Formatted error message */
  message: string;

  constructor(issues: ZodIssue[]);

  /**
   * Format error as tree structure matching data shape
   * @param mapper - Optional function to transform issues
   * @returns Formatted error tree with _errors arrays at each level
   */
  format<U = string>(mapper?: (issue: ZodIssue) => U): ZodFormattedError<T, U>;

  /**
   * Flatten error structure into form and field errors
   * @param mapper - Optional function to transform issues
   * @returns Flattened error object with formErrors and fieldErrors
   */
  flatten<U = string>(mapper?: (issue: ZodIssue) => U): ZodFlattenedError<U>;

  /**
   * String representation of error
   * @returns Error string with all issues listed
   */
  toString(): string;

  /**
   * Add issue to error (deprecated)
   * @param issue - Issue to add
   */
  addIssue(issue: ZodIssue): void;

  /**
   * Add multiple issues (deprecated)
   * @param issues - Issues to add
   */
  addIssues(issues: ZodIssue[]): void;

  /** Check if error has no issues */
  get isEmpty(): boolean;

  /** Get error as JSON (alias for issues) */
  get errors(): ZodIssue[];
}

interface ZodFormattedError<T = any, U = string> {
  _errors: U[];
  [key: string]: ZodFormattedError<any, U> | U[];
}

interface ZodFlattenedError<U = string> {
  formErrors: U[];
  fieldErrors: { [k: string]: U[] };
}
```

**Examples:**
```typescript
try {
  UserSchema.parse(invalidData);
} catch (error) {
  if (error instanceof z.ZodError) {
    // Access issues
    console.log(error.issues);

    // Format as tree
    const formatted = error.format();
    // { _errors: [], name: { _errors: ["Too short"] }, ... }

    // Flatten errors
    const flattened = error.flatten();
    // { formErrors: [], fieldErrors: { name: ["Too short"], ... } }

    // String representation
    console.log(error.toString());
    console.log(error.message);

    // Check if empty
    console.log(error.isEmpty);  // false
  }
}
```

## ZodIssue Types

```typescript { .api }
interface ZodIssue {
  code: ZodIssueCode;
  path: (string | number)[];
  message: string;
}

enum ZodIssueCode {
  invalid_type = "invalid_type",
  invalid_literal = "invalid_literal",
  custom = "custom",
  invalid_union = "invalid_union",
  invalid_union_discriminator = "invalid_union_discriminator",
  invalid_enum_value = "invalid_enum_value",
  unrecognized_keys = "unrecognized_keys",
  invalid_arguments = "invalid_arguments",
  invalid_return_type = "invalid_return_type",
  invalid_date = "invalid_date",
  invalid_string = "invalid_string",
  too_small = "too_small",
  too_big = "too_big",
  invalid_intersection_types = "invalid_intersection_types",
  not_multiple_of = "not_multiple_of",
  not_finite = "not_finite",
}

// Specific issue types
interface ZodInvalidTypeIssue extends ZodIssue {
  code: "invalid_type";
  expected: ZodParsedType;
  received: ZodParsedType;
}

interface ZodTooSmallIssue extends ZodIssue {
  code: "too_small";
  type: "string" | "number" | "bigint" | "array" | "set" | "date";
  minimum: number | bigint;
  inclusive: boolean;
  exact?: boolean;
}

interface ZodTooBigIssue extends ZodIssue {
  code: "too_big";
  type: "string" | "number" | "bigint" | "array" | "set" | "date";
  maximum: number | bigint;
  inclusive: boolean;
  exact?: boolean;
}

interface ZodCustomIssue extends ZodIssue {
  code: "custom";
  params?: { [k: string]: any };
}

interface ZodInvalidStringIssue extends ZodIssue {
  code: "invalid_string";
  validation: "email" | "url" | "uuid" | "regex" | "datetime" | "ip"
    | { includes: string; position?: number }
    | { startsWith: string }
    | { endsWith: string };
}

interface ZodInvalidUnionIssue extends ZodIssue {
  code: "invalid_union";
  unionErrors: ZodError[];
}

interface ZodInvalidEnumValueIssue extends ZodIssue {
  code: "invalid_enum_value";
  options: any[];
  received: any;
}

interface ZodUnrecognizedKeysIssue extends ZodIssue {
  code: "unrecognized_keys";
  keys: string[];
}

interface ZodInvalidLiteralIssue extends ZodIssue {
  code: "invalid_literal";
  expected: any;
  received: any;
}

interface ZodInvalidUnionDiscriminatorIssue extends ZodIssue {
  code: "invalid_union_discriminator";
  options: any[];
}

interface ZodInvalidArgumentsIssue extends ZodIssue {
  code: "invalid_arguments";
  argumentsError: ZodError;
}

interface ZodInvalidReturnTypeIssue extends ZodIssue {
  code: "invalid_return_type";
  returnTypeError: ZodError;
}

interface ZodInvalidDateIssue extends ZodIssue {
  code: "invalid_date";
}

interface ZodInvalidIntersectionTypesIssue extends ZodIssue {
  code: "invalid_intersection_types";
}

interface ZodNotMultipleOfIssue extends ZodIssue {
  code: "not_multiple_of";
  multipleOf: number | bigint;
}

interface ZodNotFiniteIssue extends ZodIssue {
  code: "not_finite";
}

type ZodParsedType =
  | "string" | "number" | "bigint" | "boolean" | "date" | "symbol"
  | "undefined" | "null" | "array" | "object" | "map" | "set"
  | "function" | "promise" | "nan" | "unknown";
```

## Error Formatting

```typescript { .api }
/**
 * Format error as tree structure matching data shape
 * @param error - ZodError to format
 * @param mapper - Optional function to transform issues
 * @returns Formatted error tree with _errors arrays at each level
 */
function formatError<T = any, U = string>(
  error: ZodError<T>,
  mapper?: (issue: ZodIssue) => U
): ZodFormattedError<T, U>;

/**
 * Flatten error structure into form and field errors
 * @param error - ZodError to flatten
 * @param mapper - Optional function to transform issues
 * @returns Flattened error object with formErrors and fieldErrors
 */
function flattenError<U = string>(
  error: ZodError,
  mapper?: (issue: ZodIssue) => U
): ZodFlattenedError<U>;

/**
 * Format error as tree (alias for formatError)
 * @param error - ZodError to format
 * @param mapper - Optional function to transform issues
 * @returns Formatted error tree
 */
function treeifyError<T = any, U = string>(
  error: ZodError<T>,
  mapper?: (issue: ZodIssue) => U
): ZodFormattedError<T, U>;

/**
 * Pretty-print error as readable string
 * @param error - ZodError to prettify
 * @returns Formatted error string with path: message format
 */
function prettifyError(error: ZodError): string;
```

**Examples:**
```typescript
const result = ComplexSchema.safeParse(data);

if (!result.success) {
  const error = result.error;

  // Format as tree
  const formatted = error.format();
  // {
  //   _errors: [],
  //   name: { _errors: ["Too short"] },
  //   age: { _errors: ["Must be positive"] },
  //   address: {
  //     _errors: [],
  //     street: { _errors: ["Required"] }
  //   }
  // }

  // Flatten errors
  const flattened = error.flatten();
  // {
  //   formErrors: [],
  //   fieldErrors: {
  //     name: ["Too short"],
  //     age: ["Must be positive"],
  //     "address.street": ["Required"]
  //   }
  // }

  // Custom mapper
  const customFormatted = error.format((issue) => ({
    code: issue.code,
    message: issue.message,
  }));

  // Prettify
  const pretty = z.prettifyError(error);
  // name: Too short
  // age: Must be positive
  // address.street: Required
}
```

## Error Handling Patterns

```typescript
// Pattern 1: Try-catch with parse
try {
  const data = schema.parse(input);
  // Use data
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error(error.issues);
  }
}

// Pattern 2: Safe parse (preferred)
const result = schema.safeParse(input);
if (!result.success) {
  console.error(result.error.issues);
} else {
  // Use result.data
}

// Pattern 3: Express middleware
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

// Pattern 4: Issue inspection
const result = schema.safeParse(input);
if (!result.success) {
  result.error.issues.forEach((issue) => {
    switch (issue.code) {
      case z.ZodIssueCode.invalid_type:
        console.log(`Expected ${issue.expected}, got ${issue.received}`);
        break;
      case z.ZodIssueCode.too_small:
        console.log(`Value too small: minimum is ${issue.minimum}`);
        break;
      case z.ZodIssueCode.custom:
        console.log(`Custom validation failed: ${issue.message}`);
        break;
    }
  });
}

// Pattern 5: Form validation
function validateForm(formData: FormData) {
  const result = FormSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!result.success) {
    const errors = result.error.flatten().fieldErrors;
    // Display errors in form
    return { success: false, errors };
  }

  return { success: true, data: result.data };
}

// Pattern 6: API response
async function handleRequest(body: unknown) {
  const result = await schema.safeParseAsync(body);

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

## Custom Error Messages

```typescript
// Custom error messages
const schema = z
  .string()
  .min(5, "Too short!")
  .max(20, "Too long!");

// Error map for all issues
const customSchema = z.string().parse(data, {
  errorMap: (issue, ctx) => {
    if (issue.code === z.ZodIssueCode.too_small) {
      return { message: "Custom message for too_small" };
    }
    return { message: ctx.defaultError };
  },
});

// Global error map
z.config({
  errorMap: (issue, ctx) => {
    // Custom global error mapping
    return { message: ctx.defaultError };
  },
});
```
