# Flat Config Compatibility

The FlatCompat class provides compatibility layer functionality for translating ESLintRC-style configurations into flat config objects, enabling existing ESLint configurations to work with newer ESLint versions.

## Capabilities

### FlatCompat Constructor

Creates a new FlatCompat instance for translating ESLintRC configurations.

```javascript { .api }
/**
 * Creates a new FlatCompat instance for translating ESLintRC configurations
 * @param options - Configuration options for the compatibility layer
 */
constructor(options?: {
  /** Base directory for resolving relative paths (default: process.cwd()) */
  baseDirectory?: string;
  /** Directory to resolve plugins relative to */
  resolvePluginsRelativeTo?: string;
  /** Configuration object for "eslint:recommended" (required if extends uses it) */
  recommendedConfig?: any;
  /** Configuration object for "eslint:all" (required if extends uses it) */
  allConfig?: any;
});
```

**Usage Examples:**

```javascript
import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";

// Basic setup
const compat = new FlatCompat({
    baseDirectory: __dirname,
});

// Setup with recommended config support
const compat = new FlatCompat({
    baseDirectory: __dirname,
    resolvePluginsRelativeTo: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all,
});
```

### Complete Config Translation

Translates an entire ESLintRC-style configuration object into flat config format.

```javascript { .api }
/**
 * Translates an ESLintRC-style config into a flat-config-style config
 * @param eslintrcConfig - The ESLintRC-style config object
 * @returns Array of flat config objects representing the configuration
 */
config(eslintrcConfig: {
  extends?: string | string[];
  plugins?: string[];
  env?: { [envName: string]: boolean };
  globals?: { [globalName: string]: boolean | "readonly" | "writable" | "off" };
  rules?: { [ruleName: string]: any };
  settings?: { [key: string]: any };
  parser?: string;
  parserOptions?: any;
  overrides?: any[];
  [key: string]: any;
}): any[];
```

**Usage Examples:**

```javascript
import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat({
    baseDirectory: __dirname,
});

// Translate complete ESLintRC config
const flatConfigs = compat.config({
    extends: ["eslint:recommended", "plugin:react/recommended"],
    plugins: ["react", "jsx-a11y"],
    env: {
        browser: true,
        es2021: true
    },
    globals: {
        myGlobal: "readonly"
    },
    rules: {
        "no-unused-vars": "error",
        "react/prop-types": "off"
    },
    settings: {
        react: {
            version: "detect"
        }
    },
    parserOptions: {
        ecmaVersion: 2021,
        sourceType: "module"
    }
});

export default [...flatConfigs];
```

### Environment Configuration Translation

Translates the env section of an ESLintRC-style config.

```javascript { .api }
/**
 * Translates the env section of an ESLintRC-style config
 * @param envConfig - Object mapping environment names to boolean values
 * @returns Array of flat config objects representing the environments
 */
env(envConfig: { [envName: string]: boolean }): any[];
```

**Usage Examples:**

```javascript
// Translate environment settings
const envConfigs = compat.env({
    browser: true,
    node: true,
    es2021: true,
    jest: true
});

export default [
    ...envConfigs,
    // other configs
];
```

### Extends Configuration Translation

Translates the extends section of an ESLintRC-style config.

```javascript { .api }
/**
 * Translates the extends section of an ESLintRC-style config
 * @param configsToExtend - Names of the configs to load and extend
 * @returns Array of flat config objects representing the extended configurations
 */
extends(...configsToExtend: string[]): any[];
```

**Usage Examples:**

```javascript
// Extend from multiple configurations
const extendedConfigs = compat.extends(
    "eslint:recommended",
    "@eslint/js/recommended", 
    "plugin:react/recommended",
    "plugin:@typescript-eslint/recommended"
);

export default [
    ...extendedConfigs,
    // additional configs
];

// Single extend
const singleExtend = compat.extends("airbnb-base");
```

### Plugin Configuration Translation

Translates the plugins section of an ESLintRC-style config.

```javascript { .api }
/**
 * Translates the plugins section of an ESLintRC-style config
 * @param plugins - Names of the plugins to load
 * @returns Array of flat config objects representing the plugins
 */
plugins(...plugins: string[]): any[];
```

**Usage Examples:**

```javascript
// Load multiple plugins
const pluginConfigs = compat.plugins(
    "react",
    "jsx-a11y", 
    "@typescript-eslint",
    "import"
);

export default [
    ...pluginConfigs,
    // additional configs
];

// Single plugin
const reactPlugin = compat.plugins("react");
```

## Common Usage Patterns

### Full Migration Pattern

Complete migration from ESLintRC to flat config:

```javascript
import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
    baseDirectory: __dirname,
    resolvePluginsRelativeTo: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all,
});

// Original .eslintrc.js content:
// {
//   "extends": ["eslint:recommended", "plugin:react/recommended"],
//   "plugins": ["react", "jsx-a11y"],
//   "env": { "browser": true, "es2021": true },
//   "rules": { "no-unused-vars": "error" }
// }

export default [
    // Translate the entire original config
    ...compat.config({
        extends: ["eslint:recommended", "plugin:react/recommended"],
        plugins: ["react", "jsx-a11y"],
        env: { browser: true, es2021: true },
        rules: { "no-unused-vars": "error" }
    }),
    
    // Add additional flat config objects as needed
    {
        files: ["**/*.test.js"],
        env: { jest: true }
    }
];
```

### Incremental Migration Pattern

Gradual migration using individual translation methods:

```javascript
import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";

const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
});

export default [
    // Start with base ESLint recommended
    ...compat.extends("eslint:recommended"),
    
    // Add specific environments
    ...compat.env({
        browser: true,
        es2021: true
    }),
    
    // Add plugins incrementally
    ...compat.plugins("react"),
    ...compat.plugins("jsx-a11y"),
    
    // Add custom flat config rules
    {
        rules: {
            "no-unused-vars": "error",
            "prefer-const": "warn"
        }
    }
];
```

## Error Handling

### Missing Required Configs

```javascript
// This will throw an error if "eslint:recommended" is used in extends
// but recommendedConfig is not provided
const compat = new FlatCompat(); // Missing recommendedConfig

try {
    const configs = compat.extends("eslint:recommended");
} catch (error) {
    console.error("Missing parameter 'recommendedConfig' in FlatCompat constructor");
}
```

### Plugin Resolution Errors

```javascript
// Plugin resolution errors will be thrown during config generation
const compat = new FlatCompat({
    baseDirectory: __dirname,
    resolvePluginsRelativeTo: __dirname,
});

try {
    const configs = compat.plugins("nonexistent-plugin");
} catch (error) {
    console.error("Failed to resolve plugin:", error.message);
}
```