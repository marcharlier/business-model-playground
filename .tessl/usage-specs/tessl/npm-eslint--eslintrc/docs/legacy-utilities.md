# Legacy Configuration Utilities

The Legacy object provides access to internal ESLint configuration utilities that are primarily intended for use within the ESLint ecosystem. These utilities handle configuration arrays, validation, module resolution, and other internal ESLint operations.

## Capabilities

### Configuration Array Management

Core configuration array functionality for managing ESLint configurations.

```javascript { .api }
/**
 * Configuration array implementation extending Array
 */
class ConfigArray extends Array {
  // Array-like container for configuration objects with additional ESLint-specific methods
}

/**
 * Gets used extracted configurations from a config array
 * @param configArray - The configuration array to analyze
 * @returns Array of used extracted configurations
 */
function getUsedExtractedConfigs(configArray: ConfigArray): any[];

/**
 * Factory for creating configuration arrays
 */
class ConfigArrayFactory {
  constructor(options?: any);
  // Methods for creating and managing configuration arrays
}

/**
 * Factory for cascading configuration arrays
 */
class CascadingConfigArrayFactory {
  constructor(options?: any);
  // Methods for creating cascading configuration hierarchies
}

/**
 * Creates context for ConfigArrayFactory
 * @param options - Context creation options
 * @returns Context object for configuration array factory
 */
function createConfigArrayFactoryContext(options?: any): any;
```

**Usage Examples:**

```javascript
import { Legacy } from "@eslint/eslintrc";

// Create configuration array
const configArray = new Legacy.ConfigArray();

// Use configuration factory
const factory = new Legacy.ConfigArrayFactory({
    configPath: "/path/to/config"
});

// Get used configurations
const usedConfigs = Legacy.getUsedExtractedConfigs(configArray);
```

### Configuration Dependencies and Extraction

Utilities for handling configuration dependencies and extracted configurations.

```javascript { .api }
/**
 * Represents a configuration dependency
 */
class ConfigDependency {
  constructor(options?: any);
  // Methods for managing configuration dependencies
}

/**
 * Represents an extracted configuration
 */
class ExtractedConfig {
  constructor(options?: any);
  // Methods for working with extracted configuration data
}

/**
 * Tests if overrides should be applied
 */
class OverrideTester {
  constructor(options?: any);
  // Methods for testing override conditions
}

/**
 * Handles ignore patterns in configurations
 */
class IgnorePattern {
  constructor(options?: any);
  // Methods for managing ignore patterns
}
```

**Usage Examples:**

```javascript
import { Legacy } from "@eslint/eslintrc";

// Create configuration dependency
const dependency = new Legacy.ConfigDependency({
    id: "config-id",
    path: "/path/to/config"
});

// Create extracted config
const extracted = new Legacy.ExtractedConfig({
    // config data
});

// Test overrides
const overrideTester = new Legacy.OverrideTester({
    // override conditions
});
```

### Configuration File Loading

Utilities for loading configuration files.

```javascript { .api }
/**
 * Loads configuration files
 * @param configPath - Path to the configuration file
 * @param options - Loading options
 * @returns Loaded configuration object
 */
function loadConfigFile(configPath: string, options?: any): any;
```

**Usage Examples:**

```javascript
import { Legacy } from "@eslint/eslintrc";

// Load configuration file
const config = Legacy.loadConfigFile("./.eslintrc.json", {
    basePath: process.cwd()
});
```

### Environment Definitions

Built-in environment definitions for different JavaScript runtime contexts.

```javascript { .api }
/**
 * Built-in environment definitions
 */
interface Environments {
  [envName: string]: {
    globals?: { [globalName: string]: boolean | "readonly" | "writable" };
    parserOptions?: any;
  };
}

const environments: Environments;
```

**Usage Examples:**

```javascript
import { Legacy } from "@eslint/eslintrc";

// Access environment definitions
const browserEnv = Legacy.environments.browser;
const nodeEnv = Legacy.environments.node;
const es6Env = Legacy.environments.es6;

// Check available environments
const envNames = Object.keys(Legacy.environments);
console.log("Available environments:", envNames);
```

### Configuration Operations (ConfigOps)

Utilities for configuration operations including rule severity management.

```javascript { .api }
/**
 * Configuration operations utilities
 */
interface ConfigOps {
  /**
   * Normalizes rule severity to number (0, 1, or 2)
   * @param ruleConfig - Rule configuration value
   * @returns Numeric severity value
   */
  getRuleSeverity(ruleConfig: any): 0 | 1 | 2;
  
  /**
   * Converts numeric severities to string format
   * @param config - Configuration object to normalize
   */
  normalizeToStrings(config: any): void;
  
  /**
   * Checks if rule configuration represents error severity
   * @param ruleConfig - Rule configuration to check
   * @returns True if error severity
   */
  isErrorSeverity(ruleConfig: any): boolean;
  
  /**
   * Validates rule severity value
   * @param ruleConfig - Rule configuration to validate
   * @returns True if valid severity
   */
  isValidSeverity(ruleConfig: any): boolean;
  
  /**
   * Validates all rule severities in a configuration
   * @param config - Configuration object to validate
   * @returns True if all severities are valid
   */
  isEverySeverityValid(config: any): boolean;
  
  /**
   * Normalizes global configuration values
   * @param configuredValue - Global configuration value
   * @returns Normalized global value
   */
  normalizeConfigGlobal(configuredValue: any): "readonly" | "writable" | "off";
}
```

**Usage Examples:**

```javascript
import { Legacy } from "@eslint/eslintrc";

// Check rule severity
const severity = Legacy.ConfigOps.getRuleSeverity("error"); // Returns 2
const isError = Legacy.ConfigOps.isErrorSeverity("error"); // Returns true

// Validate severities
const isValid = Legacy.ConfigOps.isValidSeverity("warn"); // Returns true

// Normalize global config
const globalValue = Legacy.ConfigOps.normalizeConfigGlobal("readonly");
```

### Configuration Validation (ConfigValidator)

Class for validating ESLint configurations, rules, environments, and other configuration components.

```javascript { .api }
/**
 * Configuration validation class
 */
class ConfigValidator {
  constructor(options?: { builtInRules?: Map<string, any> });
  
  /**
   * Validates an entire config object
   * @param config - Configuration to validate
   * @param source - Name of the configuration source for error reporting
   * @param getAdditionalRule - Map from strings to loaded rules (optional)
   * @param getAdditionalEnv - Map from strings to loaded environments (optional)
   */
  validate(config: any, source: string, getAdditionalRule?: Function, getAdditionalEnv?: Function): void;
  
  /**
   * Validates the top level properties of the config object
   * @param config - The config object to validate
   * @param source - Name of the configuration source for error reporting
   */
  validateConfigSchema(config: any, source: string): void;
  
  /**
   * Validates a rules config object
   * @param rulesConfig - The rules config object to validate
   * @param source - Name of the configuration source for error reporting
   * @param getAdditionalRule - Map from strings to loaded rules
   */
  validateRules(rulesConfig: any, source: string, getAdditionalRule: Function): void;
  
  /**
   * Validates rule configuration options against schema
   * @param rule - The rule object or null
   * @param ruleId - Rule identifier
   * @param options - Rule options (array or number)
   * @param source - Source of the rule configuration
   */
  validateRuleOptions(rule: any, ruleId: string, options: any, source?: string): void;
  
  /**
   * Validates a rule's severity and returns the severity value
   * @param options - The given options for the rule
   * @returns The rule's severity value
   */
  validateRuleSeverity(options: any): number | string;
  
  /**
   * Validates the non-severity options passed to a rule
   * @param rule - The rule to validate
   * @param localOptions - The options for the rule, excluding severity
   */
  validateRuleSchema(rule: any, localOptions: any[]): void;
  
  /**
   * Validates an environment object
   * @param environment - The environment config object to validate
   * @param source - Name of the configuration source for error reporting
   * @param getAdditionalEnv - Map from strings to loaded environments (optional)
   */
  validateEnvironment(environment: any, source: string, getAdditionalEnv?: Function): void;
  
  /**
   * Validates a globals section of a config file
   * @param globalsConfig - The globals section
   * @param source - Name of the configuration source for error reporting
   */
  validateGlobals(globalsConfig: any, source?: string): void;
  
  /**
   * Validates processor configuration
   * @param processorName - The processor name
   * @param source - Name of config file
   * @param getProcessor - The getter of defined processors
   */
  validateProcessor(processorName?: string, source: string, getProcessor: Function): void;
  
  /**
   * Validates config array object
   * @param configArray - The config array to validate
   */
  validateConfigArray(configArray: any): void;
  
  /**
   * Gets a complete options schema for a rule
   * @param rule - Rule object
   * @returns JSON Schema for the rule's options, or null if not available
   */
  getRuleOptionsSchema(rule: any): any;
  
  /**
   * Formats an array of schema validation errors
   * @param errors - An array of error messages to format
   * @returns Formatted error message
   */
  formatErrors(errors: any[]): string;
}
```

**Usage Examples:**

```javascript
import { Legacy } from "@eslint/eslintrc";

// Create validator with built-in rules
const validator = new Legacy.ConfigValidator({
    builtInRules: new Map([
        ["no-unused-vars", { /* rule definition */ }]
    ])
});

// Validate entire configuration
try {
    validator.validate({
        rules: {
            "no-unused-vars": "error"
        },
        env: {
            browser: true
        }
    }, "my-config");
} catch (error) {
    console.error("Configuration validation failed:", error.message);
}

// Validate specific rule options
validator.validateRuleOptions(
    { create: function() {} }, // rule object
    "no-unused-vars",
    ["error", { "vars": "all" }],
    "my-config"
);

// Validate globals configuration
validator.validateGlobals({
    window: "readonly",
    console: "readonly"
}, "my-config");

// Validate environment configuration
validator.validateEnvironment({
    browser: true,
    node: false
}, "my-config");
```

### Module Resolution (ModuleResolver)

Utilities for resolving modules relative to specific paths.

```javascript { .api }
/**
 * Module resolution utilities
 */
interface ModuleResolver {
  /**
   * Resolves a module relative to a specific path
   * @param moduleName - Name of the module to resolve
   * @param relativeToPath - Path to resolve relative to
   * @returns Resolved module path
   */
  resolve(moduleName: string, relativeToPath: string): string;
}
```

**Usage Examples:**

```javascript
import { Legacy } from "@eslint/eslintrc";

// Resolve module relative to path
try {
    const resolvedPath = Legacy.ModuleResolver.resolve(
        "eslint-plugin-react",
        "/path/to/project"
    );
    console.log("Resolved plugin path:", resolvedPath);
} catch (error) {
    console.error("Module resolution failed:", error.message);
}
```

### Package Naming Utilities (naming)

Utilities for normalizing and working with package names.

```javascript { .api }
/**
 * Package naming utilities
 */
interface Naming {
  /**
   * Normalizes package names for ESLint plugins/configs
   * @param name - Package name to normalize
   * @param prefix - Prefix to apply/remove
   * @returns Normalized package name
   */
  normalizePackageName(name: string, prefix: string): string;
  
  /**
   * Gets shorthand name from full package name
   * @param fullname - Full package name
   * @param prefix - Prefix to consider for shorthand
   * @returns Shorthand name
   */
  getShorthandName(fullname: string, prefix: string): string;
  
  /**
   * Extracts namespace from package name
   * @param term - Package name term
   * @returns Namespace portion
   */
  getNamespaceFromTerm(term: string): string;
}
```

**Usage Examples:**

```javascript
import { Legacy } from "@eslint/eslintrc";

// Normalize plugin names
const normalizedName = Legacy.naming.normalizePackageName(
    "react", 
    "eslint-plugin-"
); // Returns "eslint-plugin-react"

// Get shorthand
const shorthand = Legacy.naming.getShorthandName(
    "eslint-plugin-react",
    "eslint-plugin-"
); // Returns "react"

// Extract namespace
const namespace = Legacy.naming.getNamespaceFromTerm("@typescript-eslint/parser");
// Returns "@typescript-eslint/"
```

## Universal Environment Access

When using the universal export, only a subset of Legacy utilities are available:

```javascript
import { Legacy } from "@eslint/eslintrc/universal";

// Available in universal environment:
// - environments
// - ConfigOps
// - ConfigValidator  
// - naming

// NOT available in universal environment:
// - ConfigArray, ConfigArrayFactory, CascadingConfigArrayFactory
// - ConfigDependency, ExtractedConfig, IgnorePattern, OverrideTester
// - loadConfigFile, createConfigArrayFactoryContext
// - ModuleResolver (Node.js specific)
```

## Integration Patterns

### Using Legacy Utilities with Custom ESLint Tooling

```javascript
import { Legacy } from "@eslint/eslintrc";

// Create custom configuration management
function createCustomConfig(options) {
    const factory = new Legacy.ConfigArrayFactory({
        configPath: options.configPath,
        resolvePluginsRelativeTo: options.pluginPath
    });
    
    const validator = new Legacy.ConfigValidator();
    
    return {
        validate: (config) => validator.validateConfigData(config),
        create: (configData) => factory.create(configData)
    };
}

// Environment-aware configuration
function getEnvironmentGlobals(envName) {
    const env = Legacy.environments[envName];
    return env ? env.globals || {} : {};
}
```