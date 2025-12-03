# clsx

clsx is a tiny (239B) utility for constructing className strings conditionally. It serves as a faster and smaller drop-in replacement for the popular classnames module, supporting various input types including strings, objects, arrays, and booleans while automatically filtering out falsy values.

## Package Information

- **Package Name**: clsx
- **Package Type**: npm
- **Language**: JavaScript with TypeScript definitions
- **Installation**: `npm install clsx`

## Core Imports

ES Module (default):
```javascript
import clsx from "clsx";
```

ES Module (named):
```javascript
import { clsx } from "clsx";
```

CommonJS:
```javascript
const clsx = require("clsx");
```

Lite version (string-only):
```javascript
import clsx from "clsx/lite";
// or
import { clsx } from "clsx/lite";
```

## Basic Usage

```javascript
import clsx from 'clsx';

// Strings (variadic)
clsx('foo', true && 'bar', 'baz');
//=> 'foo bar baz'

// Objects
clsx({ foo: true, bar: false, baz: isTrue() });
//=> 'foo baz'

// Arrays
clsx(['foo', 0, false, 'bar']);
//=> 'foo bar'

// Mixed arguments (kitchen sink)
clsx('foo', [1 && 'bar', { baz: false, bat: null }, ['hello', ['world']]], 'cya');
//=> 'foo bar hello world cya'
```

## Capabilities

### Main clsx Function

The primary function that accepts any number of arguments of various types and returns a consolidated className string.

```typescript { .api }
function clsx(...inputs: ClassValue[]): string;
```

**Arguments:**
- `inputs` - Any number of ClassValue arguments (strings, numbers, booleans, objects, arrays, null, undefined)

**Returns:**
- `string` - Consolidated className string with space-separated class names

**Behavior:**
- Falsy values (false, 0, '', null, undefined, NaN) are ignored
- Standalone boolean values are discarded
- String and number values are included directly
- Object keys with truthy values are included as class names
- Arrays are processed recursively, flattening nested structures
- BigInt values are converted to strings and included

### Lite Version

A lightweight variant that only processes string arguments, ignoring all other input types.

```typescript { .api }
function clsx(...inputs: string[]): string;
```

**Arguments:**
- `inputs` - Any number of string arguments (non-string arguments are ignored)

**Returns:**
- `string` - Consolidated className string from valid string inputs only

**Usage:**
```javascript
import clsx from 'clsx/lite';

// Only strings are processed
clsx('hello', true && 'foo', false && 'bar');
//=> "hello foo"

// Non-string inputs are ignored
clsx({ foo: true }, ['bar'], 42);
//=> ""
```

## Types

```typescript { .api }
type ClassValue = ClassArray | ClassDictionary | string | number | bigint | null | boolean | undefined;

type ClassDictionary = Record<string, any>;

type ClassArray = ClassValue[];
```

**Type Descriptions:**
- `ClassValue` - Union type representing all valid input types for clsx
- `ClassDictionary` - Object type where keys are class names and values determine inclusion
- `ClassArray` - Recursive array type allowing nested ClassValue items

## Input Type Behavior

### Strings
- Included directly in the output
- Empty strings are ignored
- Whitespace is preserved as provided

### Numbers
- Converted to strings and included
- Zero (0) is treated as falsy and ignored
- Infinity is converted to "Infinity"
- NaN is treated as falsy and ignored

### Booleans
- Used for conditional logic but not included in output
- Commonly used with logical operators: `condition && 'class-name'`

### Objects
- Keys with truthy values are included as class names
- Keys with falsy values are ignored
- Nested objects within arrays are processed normally

### Arrays
- Processed recursively, supporting unlimited nesting
- Each element is evaluated according to its type
- Empty arrays are ignored

### Null/Undefined
- Always ignored and filtered out
- Safe to pass without conditional checks

## Usage Patterns

### Conditional Classes
```javascript
clsx('base-class', {
  'active': isActive,
  'disabled': !isEnabled,
  'error': hasError
});
```

### Mixed Input Types
```javascript
clsx(
  'always-present',
  condition && 'conditional-class',
  {
    'object-based': someBoolean,
    'another-class': anotherCondition
  },
  ['array', 'classes', nested && 'nested-class']
);
```

### React Component Example
```javascript
function Button({ variant, size, disabled, className, children }) {
  return (
    <button
      className={clsx(
        'btn',
        `btn-${variant}`,
        `btn-${size}`,
        {
          'btn-disabled': disabled
        },
        className
      )}
    >
      {children}
    </button>
  );
}
```

### Tailwind CSS Integration
```javascript
// Optimal for Tailwind with clsx/lite
import clsx from 'clsx/lite';

const classes = clsx(
  'text-base',
  props.active && 'text-primary',
  props.className
);
```

## Distribution Formats

### Main Package
- **CommonJS**: `dist/clsx.js`
- **ES Module**: `dist/clsx.mjs`  
- **UMD**: `dist/clsx.min.js`
- **Size**: 239 bytes (gzipped)

### Lite Package
- **CommonJS**: `dist/lite.js`
- **ES Module**: `dist/lite.mjs`
- **Size**: 140 bytes (gzipped)

## Browser Support

- **Modern Browsers**: All browsers supporting Array.isArray (IE9+)
- **Node.js**: All versions 6+
- **Legacy Support**: clsx@1.0.x for IE8 and below

## Error Handling

clsx is designed to be fault-tolerant:
- Accepts any input without throwing errors
- Gracefully handles undefined, null, and unexpected types
- No validation errors - invalid inputs are simply ignored
- Safe to use with dynamic or untrusted input data