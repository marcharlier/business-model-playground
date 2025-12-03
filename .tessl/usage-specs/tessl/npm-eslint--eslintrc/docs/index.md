# ESLintRC Library

The @eslint/eslintrc package provides the legacy ESLintRC configuration file format for ESLint with a compatibility layer for flat config migration. It includes the FlatCompat utility class for translating ESLintRC-style configurations into flat config objects, enabling existing ESLint configurations to work with newer ESLint versions that use the flat config format.

## Package Information

- **Package Name**: @eslint/eslintrc
- **Package Type**: npm
- **Language**: JavaScript/TypeScript (ESM with CommonJS compatibility)
- **Installation**: `npm install @eslint/eslintrc`

## Core Imports

```javascript
import { FlatCompat } from "@eslint/eslintrc";
```

For CommonJS:

```javascript
const { FlatCompat } = require("@eslint/eslintrc");
```

Accessing legacy utilities:

```javascript
import { Legacy } from "@eslint/eslintrc";
```

Universal environment (browser/limited Node.js features):

```javascript
import { Legacy } from "@eslint/eslintrc/universal";
```

## Basic Usage

```javascript
import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";
import path from "path";
import { fileURLToPath } from "url";

// ESM setup (CommonJS equivalent available)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
    baseDirectory: __dirname,
    resolvePluginsRelativeTo: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all,
});

export default [
    // Translate extends configurations
    ...compat.extends("standard", "plugin:react/recommended"),
    
    // Translate environment settings
    ...compat.env({
        es2020: true,
        node: true
    }),
    
    // Translate plugin configurations
    ...compat.plugins("jsx-a11y", "react"),
    
    // Translate complete ESLintRC config object
    ...compat.config({
        plugins: ["jsx-a11y", "react"],
        extends: "standard",
        env: {
            es2020: true,
            node: true
        },
        rules: {
            semi: "error"
        }
    })
];
```

## Architecture

The @eslint/eslintrc package is built around several key components:

- **FlatCompat Class**: Primary API for translating ESLintRC configurations to flat config format
- **Configuration Factories**: Internal utilities for creating and managing configuration arrays
- **Shared Utilities**: Common functions for configuration operations, validation, and module resolution
- **Environment Definitions**: Built-in environment configurations for different JavaScript runtime contexts
- **Legacy API**: Collection of internal ESLint utilities exposed for compatibility

## Capabilities

### Flat Config Compatibility

Primary functionality for translating ESLintRC-style configurations to flat config format. Essential for migrating existing ESLint configurations to newer ESLint versions.

```javascript { .api }
class FlatCompat {
  constructor(options?: {
    baseDirectory?: string;
    resolvePluginsRelativeTo?: string;
    recommendedConfig?: any;
    allConfig?: any;
  });
  
  config(eslintrcConfig: any): any[];
  env(envConfig: { [name: string]: boolean }): any[];
  extends(...configsToExtend: string[]): any[];
  plugins(...plugins: string[]): any[];
}
```

[Flat Config Compatibility](./flat-compat.md)

### Legacy Configuration Utilities

Internal ESLint configuration utilities exposed for compatibility with existing ESLint tooling. These are primarily intended for use within the ESLint ecosystem.

```javascript { .api }
interface Legacy {
  ConfigArray: any;
  createConfigArrayFactoryContext: Function;
  CascadingConfigArrayFactory: any;
  ConfigArrayFactory: any;
  ConfigDependency: any;
  ExtractedConfig: any;
  IgnorePattern: any;
  OverrideTester: any;
  getUsedExtractedConfigs: Function;
  environments: { [envName: string]: any };
  loadConfigFile: Function;
  ConfigOps: any;
  ConfigValidator: any;
  ModuleResolver: any;
  naming: any;
}
```

[Legacy Utilities](./legacy-utilities.md)

## Types

### FlatCompatOptions

Configuration options for the FlatCompat constructor.

```typescript { .api }
interface FlatCompatOptions {
  /** Base directory for resolving relative paths (default: process.cwd()) */
  baseDirectory?: string;
  /** Directory to resolve plugins relative to */
  resolvePluginsRelativeTo?: string;
  /** Configuration object for "eslint:recommended" (required if using extends) */
  recommendedConfig?: any;
  /** Configuration object for "eslint:all" (required if using extends) */
  allConfig?: any;
}
```

### ESLintRCConfig

Represents an ESLintRC-style configuration object.

```typescript { .api }
interface ESLintRCConfig {
  extends?: string | string[];
  plugins?: string[];
  env?: { [envName: string]: boolean };
  globals?: { [globalName: string]: boolean | "readonly" | "writable" | "off" };
  rules?: { [ruleName: string]: any };
  settings?: { [key: string]: any };
  parser?: string;
  parserOptions?: any;
  overrides?: ESLintRCConfig[];
  [key: string]: any;
}
```

### EnvironmentConfig

Environment configuration object for the env() method.

```typescript { .api }
interface EnvironmentConfig {
  [envName: string]: boolean;
}
```