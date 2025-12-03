# experimental_useObject Hook

Streams structured objects validated with Zod schemas. Perfect for forms, data extraction, and structured content generation.

```typescript
import { experimental_useObject } from '@ai-sdk/react';
import { z } from 'zod';
```

## API

```typescript { .api }
function experimental_useObject<
  SCHEMA extends ZodType | Schema,
  RESULT = InferSchema<SCHEMA>,
  INPUT = any
>(
  options: Experimental_UseObjectOptions<SCHEMA, RESULT>
): Experimental_UseObjectHelpers<RESULT, INPUT>;

interface Experimental_UseObjectOptions<SCHEMA, RESULT> {
  api: string; // Required
  schema: SCHEMA; // Required
  id?: string;
  initialValue?: DeepPartial<RESULT>;
  fetch?: FetchFunction;
  onFinish?: (event: { object: RESULT | undefined; error: Error | undefined }) => Promise<void> | void;
  onError?: (error: Error) => void;
  headers?: Record<string, string> | Headers;
  credentials?: RequestCredentials;
}

interface Experimental_UseObjectHelpers<RESULT, INPUT> {
  submit: (input: INPUT) => void;
  object: DeepPartial<RESULT> | undefined;
  error: Error | undefined;
  isLoading: boolean;
  stop: () => void;
  clear: () => void;
}
```

## Basic Usage

```typescript
import { experimental_useObject } from '@ai-sdk/react';
import { z } from 'zod';

const schema = z.object({
  title: z.string(),
  description: z.string(),
  tags: z.array(z.string()),
  published: z.boolean(),
});

type Article = z.infer<typeof schema>;

function ArticleGenerator() {
  const { object, submit, isLoading, error } = experimental_useObject({
    api: '/api/generate-article',
    schema,
    onFinish: ({ object, error }) => {
      if (error) console.error('Validation error:', error);
      else console.log('Article generated:', object);
    },
  });

  return (
    <div>
      <button onClick={() => submit({ topic: 'AI' })} disabled={isLoading}>
        Generate Article
      </button>

      {error && <div className="error">{error.message}</div>}

      {object && (
        <div>
          <h2>{object.title || 'Loading title...'}</h2>
          <p>{object.description || 'Loading description...'}</p>
          <div>
            {object.tags?.map((tag, i) => <span key={i}>{tag}</span>)}
          </div>
          {object.published !== undefined && (
            <span>{object.published ? 'Published' : 'Draft'}</span>
          )}
        </div>
      )}
    </div>
  );
}
```

## Production Patterns

### Validation Error Recovery

```typescript
import { experimental_useObject } from '@ai-sdk/react';
import { z } from 'zod';

const userSchema = z.object({
  name: z.string().min(1, 'Name required'),
  email: z.string().email('Invalid email'),
  age: z.number().min(18, 'Must be 18+').max(120, 'Invalid age'),
});

type User = z.infer<typeof userSchema>;

function UserGenerator() {
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const { object, submit, error, isLoading, clear } = experimental_useObject({
    api: '/api/generate-user',
    schema: userSchema,
    onFinish: ({ object, error }) => {
      if (error) {
        // Parse Zod validation errors
        try {
          const zodError = JSON.parse(error.message);
          setValidationErrors(zodError.errors?.map((e: any) => e.message) || [error.message]);
        } catch {
          setValidationErrors([error.message]);
        }
      } else {
        setValidationErrors([]);
        console.log('Valid user:', object);
      }
    },
    onError: (error) => {
      console.error('Request error:', error);
      setValidationErrors([error.message]);
    },
  });

  const handleRetry = () => {
    setValidationErrors([]);
    clear();
    submit({ retry: true });
  };

  return (
    <div>
      <button onClick={() => submit({ prompt: 'Generate user' })} disabled={isLoading}>
        Generate
      </button>

      {validationErrors.length > 0 && (
        <div className="validation-errors">
          <h4>Validation Errors:</h4>
          <ul>
            {validationErrors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
          <button onClick={handleRetry}>Retry</button>
        </div>
      )}

      {error && <div className="error">Error: {error.message}</div>}

      {object && (
        <div className="user-profile">
          <p>Name: {object.name || 'Loading...'}</p>
          <p>Email: {object.email || 'Loading...'}</p>
          <p>Age: {object.age ?? 'Loading...'}</p>
        </div>
      )}
    </div>
  );
}
```

### Progressive Form Generation

```typescript
import { experimental_useObject } from '@ai-sdk/react';
import { z } from 'zod';

const formSchema = z.object({
  title: z.string(),
  fields: z.array(
    z.object({
      name: z.string(),
      label: z.string(),
      type: z.enum(['text', 'email', 'number', 'textarea', 'select', 'checkbox']),
      required: z.boolean(),
      placeholder: z.string().optional(),
      options: z.array(z.string()).optional(),
      defaultValue: z.string().optional(),
    })
  ),
  submitButton: z.string(),
});

type FormDefinition = z.infer<typeof formSchema>;

function AIFormGenerator() {
  const { object, submit, isLoading, clear, stop } = experimental_useObject({
    api: '/api/generate-form',
    schema: formSchema,
    experimental_throttle: 50,
  });

  const [formData, setFormData] = useState<Record<string, any>>({});
  const isComplete = !isLoading && object && object.fields && object.fields.length > 0;

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
  };

  const renderField = (field: FormDefinition['fields'][0], index: number) => {
    if (!field.name) return <div key={index}>Loading field...</div>;

    const commonProps = {
      name: field.name,
      placeholder: field.placeholder,
      required: field.required,
      value: formData[field.name] || field.defaultValue || '',
      onChange: (e: any) =>
        setFormData(prev => ({
          ...prev,
          [field.name]: e.target.type === 'checkbox' ? e.target.checked : e.target.value,
        })),
    };

    return (
      <div key={index} className="form-field">
        <label>
          {field.label || 'Loading...'}
          {field.required && <span className="required">*</span>}
        </label>
        {field.type === 'textarea' ? (
          <textarea {...commonProps} rows={4} />
        ) : field.type === 'select' ? (
          <select {...commonProps}>
            <option value="">Select...</option>
            {field.options?.map((opt, i) => (
              <option key={i} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        ) : field.type === 'checkbox' ? (
          <input type="checkbox" {...commonProps} checked={formData[field.name] || false} />
        ) : (
          <input type={field.type} {...commonProps} />
        )}
      </div>
    );
  };

  return (
    <div>
      <div className="controls">
        <button onClick={() => submit({ formType: 'contact' })} disabled={isLoading}>
          Contact Form
        </button>
        <button onClick={() => submit({ formType: 'registration' })} disabled={isLoading}>
          Registration Form
        </button>
        <button onClick={() => submit({ formType: 'survey' })} disabled={isLoading}>
          Survey Form
        </button>
        {isLoading && <button onClick={stop}>Stop</button>}
        <button onClick={clear}>Clear</button>
      </div>

      {isLoading && <div className="loading">Generating form...</div>}

      {object && (
        <form onSubmit={handleFormSubmit} className="generated-form">
          <h2>{object.title || 'Loading form title...'}</h2>

          {object.fields && object.fields.length > 0 ? (
            <>
              {object.fields.map((field, i) => renderField(field, i))}
              {isComplete && (
                <button type="submit">{object.submitButton || 'Submit'}</button>
              )}
            </>
          ) : (
            <p>Loading fields...</p>
          )}
        </form>
      )}
    </div>
  );
}
```

### Schema Evolution & Migration

```typescript
import { experimental_useObject } from '@ai-sdk/react';
import { z } from 'zod';

// Version 1 schema
const schemaV1 = z.object({
  name: z.string(),
  age: z.number(),
});

// Version 2 schema (added fields)
const schemaV2 = z.object({
  name: z.string(),
  age: z.number(),
  email: z.string().email(),
  address: z.object({
    street: z.string(),
    city: z.string(),
  }),
});

function EvolvingSchemaExample() {
  const [schemaVersion, setSchemaVersion] = useState<1 | 2>(1);
  const currentSchema = schemaVersion === 1 ? schemaV1 : schemaV2;

  const { object, submit, error } = experimental_useObject({
    api: '/api/generate-data',
    schema: currentSchema,
    onFinish: ({ object, error }) => {
      if (error) {
        console.error('Schema validation failed, trying older schema');
        // Could fallback to older schema version
        if (schemaVersion === 2) {
          setSchemaVersion(1);
        }
      } else {
        console.log('Generated with schema v' + schemaVersion, object);
      }
    },
  });

  // Migrate old data to new schema
  const migrateToV2 = (v1Data: z.infer<typeof schemaV1>): z.infer<typeof schemaV2> => {
    return {
      ...v1Data,
      email: '',
      address: { street: '', city: '' },
    };
  };

  return (
    <div>
      <select value={schemaVersion} onChange={(e) => setSchemaVersion(Number(e.target.value) as 1 | 2)}>
        <option value={1}>Schema V1 (Basic)</option>
        <option value={2}>Schema V2 (Extended)</option>
      </select>

      <button onClick={() => submit({ version: schemaVersion })}>
        Generate (v{schemaVersion})
      </button>

      {error && <div>Error: {error.message}</div>}
      {object && <pre>{JSON.stringify(object, null, 2)}</pre>}
    </div>
  );
}
```

### Real-time Form Validation

```typescript
import { experimental_useObject } from '@ai-sdk/react';
import { z } from 'zod';
import { useEffect } from 'react';

const profileSchema = z.object({
  username: z.string().min(3).max(20),
  bio: z.string().max(500),
  website: z.string().url().optional(),
  social: z.object({
    twitter: z.string().optional(),
    github: z.string().optional(),
  }),
});

type Profile = z.infer<typeof profileSchema>;

function ProfileValidator() {
  const [inputData, setInputData] = useState<Partial<Profile>>({});
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const { object, submit, error } = experimental_useObject({
    api: '/api/validate-profile',
    schema: profileSchema,
  });

  // Validate on input change
  useEffect(() => {
    const validateField = async () => {
      try {
        profileSchema.parse(inputData);
        setFieldErrors({});
      } catch (err) {
        if (err instanceof z.ZodError) {
          const errors: Record<string, string> = {};
          err.errors.forEach((e) => {
            const path = e.path.join('.');
            errors[path] = e.message;
          });
          setFieldErrors(errors);
        }
      }
    };

    if (Object.keys(inputData).length > 0) {
      validateField();
    }
  }, [inputData]);

  const handleChange = (field: string, value: string) => {
    setInputData(prev => {
      const newData = { ...prev };
      const keys = field.split('.');
      let current: any = newData;

      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
      }

      current[keys[keys.length - 1]] = value;
      return newData;
    });
  };

  const handleSubmit = () => {
    submit(inputData);
  };

  return (
    <div>
      <div className="form">
        <div>
          <input
            placeholder="Username"
            value={inputData.username || ''}
            onChange={(e) => handleChange('username', e.target.value)}
          />
          {fieldErrors.username && <span className="error">{fieldErrors.username}</span>}
        </div>

        <div>
          <textarea
            placeholder="Bio"
            value={inputData.bio || ''}
            onChange={(e) => handleChange('bio', e.target.value)}
          />
          {fieldErrors.bio && <span className="error">{fieldErrors.bio}</span>}
        </div>

        <div>
          <input
            placeholder="Website"
            value={inputData.website || ''}
            onChange={(e) => handleChange('website', e.target.value)}
          />
          {fieldErrors.website && <span className="error">{fieldErrors.website}</span>}
        </div>

        <button onClick={handleSubmit} disabled={Object.keys(fieldErrors).length > 0}>
          Submit
        </button>
      </div>

      {error && <div>Validation Error: {error.message}</div>}
      {object && <div>Valid Profile: {JSON.stringify(object, null, 2)}</div>}
    </div>
  );
}
```

### Partial Object Updates

```typescript
import { experimental_useObject } from '@ai-sdk/react';
import { z } from 'zod';

const recipeSchema = z.object({
  name: z.string(),
  ingredients: z.array(z.object({
    item: z.string(),
    amount: z.string(),
  })),
  instructions: z.array(z.string()),
  prepTime: z.number(),
  cookTime: z.number(),
});

type Recipe = z.infer<typeof recipeSchema>;

function RecipeBuilder() {
  const { object, submit, isLoading, clear } = experimental_useObject({
    api: '/api/generate-recipe',
    schema: recipeSchema,
    experimental_throttle: 50,
  });

  // Track completion percentage
  const calculateProgress = (obj: DeepPartial<Recipe> | undefined): number => {
    if (!obj) return 0;
    let completed = 0;
    let total = 5; // name, ingredients, instructions, prepTime, cookTime

    if (obj.name) completed++;
    if (obj.ingredients && obj.ingredients.length > 0) completed++;
    if (obj.instructions && obj.instructions.length > 0) completed++;
    if (obj.prepTime !== undefined) completed++;
    if (obj.cookTime !== undefined) completed++;

    return Math.round((completed / total) * 100);
  };

  const progress = calculateProgress(object);

  return (
    <div>
      <button onClick={() => submit({ dish: 'pasta carbonara' })} disabled={isLoading}>
        Generate Recipe
      </button>

      {isLoading && (
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }}>
            {progress}%
          </div>
        </div>
      )}

      {object && (
        <div className="recipe">
          <h1>{object.name || '⏳ Generating name...'}</h1>

          <div className="meta">
            <span>Prep: {object.prepTime !== undefined ? `${object.prepTime} min` : '⏳'}</span>
            <span>Cook: {object.cookTime !== undefined ? `${object.cookTime} min` : '⏳'}</span>
          </div>

          <div className="ingredients">
            <h2>Ingredients {object.ingredients ? `(${object.ingredients.length})` : ''}</h2>
            {object.ingredients && object.ingredients.length > 0 ? (
              <ul>
                {object.ingredients.map((ing, i) => (
                  <li key={i}>{ing.amount} {ing.item}</li>
                ))}
              </ul>
            ) : (
              <p>⏳ Loading ingredients...</p>
            )}
          </div>

          <div className="instructions">
            <h2>Instructions {object.instructions ? `(${object.instructions.length} steps)` : ''}</h2>
            {object.instructions && object.instructions.length > 0 ? (
              <ol>
                {object.instructions.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ol>
            ) : (
              <p>⏳ Loading instructions...</p>
            )}
          </div>

          {!isLoading && progress === 100 && (
            <div className="complete">✓ Recipe Complete!</div>
          )}
        </div>
      )}

      <button onClick={clear}>Clear</button>
    </div>
  );
}
```

### Shared State Pattern

```typescript
// components/ObjectDisplay.tsx
import { experimental_useObject } from '@ai-sdk/react';
import { z } from 'zod';

const schema = z.object({
  title: z.string(),
  content: z.string(),
});

export function ObjectDisplay() {
  const { object, isLoading } = experimental_useObject({
    id: 'shared-object',
    api: '/api/generate',
    schema,
  });

  return (
    <div className="display">
      {isLoading && <div>Loading...</div>}
      {object && (
        <div>
          <h2>{object.title}</h2>
          <p>{object.content}</p>
        </div>
      )}
    </div>
  );
}

// components/ObjectControls.tsx
export function ObjectControls() {
  const { submit, stop, clear, isLoading } = experimental_useObject({
    id: 'shared-object',
    api: '/api/generate',
    schema,
  });

  return (
    <div className="controls">
      <button onClick={() => submit({ prompt: 'Generate' })} disabled={isLoading}>
        Generate
      </button>
      {isLoading && <button onClick={stop}>Stop</button>}
      <button onClick={clear}>Clear</button>
    </div>
  );
}
```

## Schema Types

```typescript { .api }
// Base schema interface
interface Schema<T = unknown> {
  validate(value: unknown): { success: true; value: T } | { success: false; error: Error };
}

// Zod schema type
type ZodType = import('zod').ZodType;

// Infer TypeScript type from schema
type InferSchema<SCHEMA> =
  SCHEMA extends Schema<infer T> ? T :
  SCHEMA extends ZodType ? import('zod').infer<SCHEMA> :
  unknown;

// Deeply partial type for streaming
type DeepPartial<T> = T extends object
  ? { [P in keyof T]?: DeepPartial<T[P]> }
  : T;
```

### Custom Schema Example

```typescript
import { experimental_useObject } from '@ai-sdk/react';

// Custom schema implementation
const customSchema = {
  validate(value: unknown) {
    if (typeof value === 'object' && value !== null) {
      const obj = value as any;
      if (
        typeof obj.name === 'string' &&
        typeof obj.age === 'number' &&
        obj.age >= 0 &&
        obj.age <= 150
      ) {
        return { success: true, value: obj as { name: string; age: number } };
      }
    }
    return {
      success: false,
      error: new Error('Invalid data: expected { name: string, age: number }'),
    };
  },
};

function CustomSchemaExample() {
  const { object, submit } = experimental_useObject({
    api: '/api/generate',
    schema: customSchema,
  });

  return (
    <div>
      <button onClick={() => submit({ prompt: 'Generate person' })}>Generate</button>
      {object && (
        <div>
          <p>Name: {object.name}</p>
          <p>Age: {object.age}</p>
        </div>
      )}
    </div>
  );
}
```

## Best Practices

1. **Use strict schemas**: Define precise validation rules to catch errors early
2. **Handle validation errors**: Implement `onFinish` to handle schema validation failures
3. **Progressive rendering**: Check for undefined fields and show loading states
4. **Type safety**: Use `z.infer<typeof schema>` for proper TypeScript types
5. **Error recovery**: Provide retry mechanisms for validation failures
6. **Show progress**: Display completion percentage for better UX
7. **Validate input**: Validate user input before submitting
8. **Schema versioning**: Plan for schema evolution and migration
9. **Optimize throttling**: Use `experimental_throttle` for large objects
10. **Clear state**: Use `clear()` to reset between generations

## Common Zod Patterns

```typescript
// Optional fields
z.object({
  required: z.string(),
  optional: z.string().optional(),
});

// Default values
z.object({
  name: z.string().default('Unknown'),
});

// Enums
z.object({
  status: z.enum(['draft', 'published', 'archived']),
});

// Arrays with validation
z.object({
  tags: z.array(z.string()).min(1).max(10),
});

// Nested objects
z.object({
  user: z.object({
    name: z.string(),
    email: z.string().email(),
  }),
});

// Unions
z.object({
  value: z.union([z.string(), z.number()]),
});

// Refinements (custom validation)
z.object({
  password: z.string().min(8).refine(
    (val) => /[A-Z]/.test(val),
    'Must contain uppercase letter'
  ),
});
```
