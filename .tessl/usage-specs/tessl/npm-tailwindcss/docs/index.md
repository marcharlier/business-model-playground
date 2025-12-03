# Tailwind CSS

Tailwind CSS is a utility-first CSS framework for rapidly building custom user interfaces. It provides low-level utility classes that let you build completely custom designs without ever leaving your HTML.

## Package Information

- **Package Name**: tailwindcss
- **Package Type**: npm
- **Language**: JavaScript/TypeScript
- **Installation**: `npm install tailwindcss`

## Core Imports

```javascript
// PostCSS plugin (main use case)
const tailwindcss = require('tailwindcss');

// Configuration utilities
const resolveConfig = require('tailwindcss/resolveConfig');
const loadConfig = require('tailwindcss/loadConfig');
const defaultConfig = require('tailwindcss/defaultConfig');
const defaultTheme = require('tailwindcss/defaultTheme');
const colors = require('tailwindcss/colors');

// Plugin creation
const plugin = require('tailwindcss/plugin');

// Nesting plugin
const nesting = require('tailwindcss/nesting');
```

For ES modules:
```javascript
import tailwindcss from 'tailwindcss';
import resolveConfig from 'tailwindcss/resolveConfig';
import loadConfig from 'tailwindcss/loadConfig';
import defaultConfig from 'tailwindcss/defaultConfig';
import defaultTheme from 'tailwindcss/defaultTheme';
import colors from 'tailwindcss/colors';
import plugin from 'tailwindcss/plugin';
import nesting from 'tailwindcss/nesting';
```

## Basic Usage

```javascript
// PostCSS configuration
module.exports = {
  plugins: [
    require('tailwindcss'),
    require('autoprefixer'),
  ]
}

// Tailwind config file (tailwind.config.js)
module.exports = {
  content: ['./src/**/*.{html,js}'],
  theme: {
    extend: {
      colors: {
        primary: '#3B82F6',
      }
    },
  },
  plugins: [],
}
```

## Architecture

Tailwind CSS is built around several key components:

- **PostCSS Plugin**: Core processing engine that generates CSS from utility classes
- **Configuration System**: Customizable theme and plugin configuration with merging and resolution
- **JIT Compiler**: Just-in-time compilation that generates only the CSS you use
- **Plugin System**: Extensible architecture for adding custom utilities, components, and variants
- **CLI Tools**: Command-line interface for building, initializing, and managing projects
- **Color System**: Comprehensive default color palette with semantic naming
- **Type System**: Full TypeScript support with extensive type definitions

## Capabilities

### PostCSS Plugin

Main Tailwind CSS PostCSS plugin that processes CSS and generates utility classes.

```javascript { .api }
/**
 * Main Tailwind CSS PostCSS plugin
 * @param config - Tailwind configuration object or path to config file
 * @returns PostCSS plugin instance
 */
function tailwindcss(config?: string | Config): PostCSS.Plugin;
```

[PostCSS Plugin](./postcss-plugin.md)

### Configuration System

Tools for loading, resolving, and working with Tailwind CSS configuration.

```javascript { .api }
/**
 * Resolve configuration by merging user config with defaults
 * @param configs - Configuration objects to merge
 * @returns Fully resolved configuration object
 */
function resolveConfig<T extends Config>(config: T): ResolvedConfig<T>;

/**
 * Load configuration from a file path
 * @param path - Path to configuration file
 * @returns Configuration object
 */
function loadConfig(path: string): Config;
```

[Configuration System](./configuration.md)

### Plugin System

Create custom plugins to extend Tailwind with new utilities, components, and variants.

```javascript { .api }
/**
 * Create a Tailwind CSS plugin
 * @param plugin - Plugin function that receives the plugin API
 * @param config - Optional configuration to merge
 * @returns Plugin object
 */
function plugin(
  plugin: PluginCreator,
  config?: Partial<Config>
): PluginObject;

/**
 * Create a plugin with configurable options
 * @param plugin - Function that returns a plugin based on options
 * @param config - Function that returns configuration based on options
 * @returns Plugin function with options
 */
function plugin.withOptions<T>(
  plugin: (options: T) => PluginCreator,
  config?: (options: T) => Partial<Config>
): PluginWithOptions<T>;

interface PluginAPI {
  addUtilities(utilities: CSSRuleObject | CSSRuleObject[], options?: PluginOptions): void;
  matchUtilities<T>(utilities: Record<string, (value: T) => CSSRuleObject>, options?: MatchOptions<T>): void;
  addComponents(components: CSSRuleObject | CSSRuleObject[], options?: PluginOptions): void;
  matchComponents<T>(components: Record<string, (value: T) => CSSRuleObject>, options?: MatchOptions<T>): void;
  addBase(base: CSSRuleObject | CSSRuleObject[]): void;
  addVariant(name: string, definition: string | string[] | (() => string)): void;
  matchVariant<T>(name: string, cb: (value: T) => string | string[], options?: MatchVariantOptions<T>): void;
  theme<TDefaultValue>(path?: string, defaultValue?: TDefaultValue): TDefaultValue;
  config<TDefaultValue>(path?: string, defaultValue?: TDefaultValue): TDefaultValue;
  corePlugins(path: string): boolean;
  e(className: string): string;
}
```

[Plugin System](./plugin-system.md)

### Theme and Colors

Default theme configuration and color system.

```javascript { .api }
const defaultTheme: ThemeConfig;
const defaultConfig: Config;
const colors: DefaultColors;
```

[Theme and Colors](./theme-colors.md)

### Command Line Interface

CLI tools for building CSS, initializing projects, and managing Tailwind.

```bash
# Build CSS
tailwindcss -i input.css -o output.css

# Initialize configuration
tailwindcss init

# Watch for changes
tailwindcss -i input.css -o output.css --watch
```

[Command Line Interface](./cli.md)

### CSS Nesting Plugin

PostCSS plugin for CSS nesting syntax support.

```javascript { .api }
/**
 * PostCSS plugin for CSS nesting syntax
 * @param plugin - Nesting plugin to use (postcss-nested or postcss-nesting)
 * @returns PostCSS plugin instance
 */
function nesting(plugin?: AcceptedPlugin | string): PostCSS.Plugin;
```

[CSS Nesting](./nesting.md)

### Pre-built CSS Files

Ready-to-use CSS files for different Tailwind layers.

```css { .api }
/* Complete Tailwind CSS with all layers */
@import 'tailwindcss/tailwind.css';

/* Individual layers */
@import 'tailwindcss/base.css';        /* @tailwind base; */
@import 'tailwindcss/components.css';  /* @tailwind components; */
@import 'tailwindcss/utilities.css';   /* @tailwind utilities; */
@import 'tailwindcss/variants.css';    /* @tailwind variants; */
@import 'tailwindcss/screens.css';     /* Screen reader utilities */
```

## Core Types

```typescript { .api }
interface Config {
  content: ContentConfig;
  theme?: ThemeConfig & { extend?: Partial<ThemeConfig> };
  plugins?: PluginsConfig;
  corePlugins?: CorePluginsConfig;
  important?: boolean | string;
  prefix?: string;
  separator?: string;
  safelist?: Array<string | { pattern: RegExp; variants?: string[] }>;
  blocklist?: string[];
  darkMode?: 'media' | 'class' | ['class', string] | 'selector' | ['selector', string] | ['variant', string | string[]];
  future?: Partial<Record<string, boolean>>;
  experimental?: Partial<Record<string, boolean>>;
}

type ContentConfig = 
  | (string | { raw: string; extension?: string })[]
  | {
      files: (string | { raw: string; extension?: string })[];
      relative?: boolean;
      extract?: ExtractorFn | Record<string, ExtractorFn>;
      transform?: TransformerFn | Record<string, TransformerFn>;
    };

interface ThemeConfig {
  screens: Record<string, string | { min?: string; max?: string; raw?: string }>;
  colors: Record<string, string | Record<string, string>>;
  spacing: Record<string, string>;
  fontFamily: Record<string, string | string[]>;
  fontSize: Record<string, string | [string, string] | [string, { lineHeight?: string; letterSpacing?: string }]>;
  fontWeight: Record<string, string | number>;
  lineHeight: Record<string, string>;
  letterSpacing: Record<string, string>;
  borderRadius: Record<string, string>;
  borderWidth: Record<string, string>;
  boxShadow: Record<string, string | string[]>;
  // ... extensive theme configuration options
}

type PluginCreator = (api: PluginAPI) => void;

interface CSSRuleObject {
  [selector: string]: string | string[] | CSSRuleObject;
}
```