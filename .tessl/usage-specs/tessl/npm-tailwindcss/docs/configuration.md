# Configuration System

Tools for loading, resolving, and working with Tailwind CSS configuration objects.

## Capabilities

### Resolve Configuration

Merges user configuration with default values to create a fully resolved configuration object.

```javascript { .api }
/**
 * Resolve configuration by merging user config with defaults
 * @param config - User configuration object to merge with defaults
 * @returns Fully resolved configuration object with all defaults applied
 */
function resolveConfig<T extends Config>(config: T): ResolvedConfig<T>;

type ResolvedConfig<T extends Config> = Omit<T, 'theme'> & {
  theme: MergedThemeConfig<T['theme']>;
};
```

**Usage Examples:**

```javascript
const resolveConfig = require('tailwindcss/resolveConfig');
const tailwindConfig = require('./tailwind.config.js');

// Resolve complete configuration
const fullConfig = resolveConfig(tailwindConfig);

// Access resolved theme values
console.log(fullConfig.theme.colors.blue);
console.log(fullConfig.theme.spacing);
console.log(fullConfig.theme.screens);

// Use in custom build tools
const breakpoints = fullConfig.theme.screens;
const colors = fullConfig.theme.colors;
```

### Load Configuration

Loads and parses Tailwind configuration from a file path, supporting multiple formats.

```javascript { .api }
/**
 * Load configuration from a file path
 * @param path - Path to configuration file (.js, .mjs, .ts, .cjs)
 * @returns Configuration object loaded from file
 */
function loadConfig(path: string): Config;
```

**Usage Examples:**

```javascript
const loadConfig = require('tailwindcss/loadConfig');

// Load from JavaScript file
const config = loadConfig('./tailwind.config.js');

// Load from TypeScript file
const config = loadConfig('./tailwind.config.ts');

// Load from ES module
const config = loadConfig('./tailwind.config.mjs');

// Use loaded config with resolveConfig
const resolvedConfig = resolveConfig(config);
```

### Default Configuration

Complete default configuration object used as base for all Tailwind installations.

```javascript { .api }
const defaultConfig: Config;
```

**Usage Examples:**

```javascript
const defaultConfig = require('tailwindcss/defaultConfig');

// Examine default configuration
console.log(defaultConfig.theme.colors);
console.log(defaultConfig.theme.spacing);
console.log(defaultConfig.corePlugins);

// Extend from defaults
module.exports = {
  ...defaultConfig,
  content: ['./src/**/*.html'],
  theme: {
    ...defaultConfig.theme,
    extend: {
      colors: {
        primary: '#3B82F6'
      }
    }
  }
};
```

### Default Theme

Default theme configuration containing all design tokens.

```javascript { .api }
const defaultTheme: ThemeConfig;

interface ThemeConfig {
  screens: ScreensConfig;
  colors: ColorsConfig;
  spacing: SpacingConfig;
  fontFamily: FontFamilyConfig;
  fontSize: FontSizeConfig;
  fontWeight: FontWeightConfig;
  lineHeight: LineHeightConfig;
  letterSpacing: LetterSpacingConfig;
  borderRadius: BorderRadiusConfig;
  borderWidth: BorderWidthConfig;
  boxShadow: BoxShadowConfig;
  // ... all theme properties
}
```

**Usage Examples:**

```javascript
const defaultTheme = require('tailwindcss/defaultTheme');

// Extend font families
module.exports = {
  theme: {
    extend: {
      fontFamily: {
        'heading': ['Inter', ...defaultTheme.fontFamily.sans],
        'body': [...defaultTheme.fontFamily.sans],
      },
      screens: {
        'xs': '475px',
        ...defaultTheme.screens,
      }
    }
  }
};

// Use default spacing scale
const spacing = defaultTheme.spacing;
console.log(spacing['4']); // "1rem"
console.log(spacing['px']); // "1px"
```

## Configuration Structure

### Core Configuration

```javascript { .api }
interface Config {
  /** Content configuration for JIT mode */
  content: ContentConfig;
  
  /** Theme customization and extensions */
  theme?: Partial<ThemeConfig> & { extend?: Partial<ThemeConfig> };
  
  /** Plugin registration */
  plugins?: PluginCreator[];
  
  /** Core plugin configuration */
  corePlugins?: CorePluginsConfig;
  
  /** Important selector strategy */
  important?: boolean | string;
  
  /** Class name prefix */
  prefix?: string;
  
  /** Modifier separator character */
  separator?: string;
  
  /** Classes to always include */
  safelist?: SafelistConfig[];
  
  /** Classes to always exclude */
  blocklist?: string[];
  
  /** Dark mode configuration */
  darkMode?: DarkModeConfig;
  
  /** Future feature flags */
  future?: Partial<Record<FutureFeature, boolean>>;
  
  /** Experimental feature flags */
  experimental?: Partial<Record<ExperimentalFeature, boolean>>;
}
```

### Content Configuration

```javascript { .api }
type ContentConfig = 
  | (FilePath | RawContent)[]
  | {
      files: (FilePath | RawContent)[];
      relative?: boolean;
      extract?: ExtractorConfig;
      transform?: TransformerConfig;
    };

type FilePath = string;
interface RawContent {
  raw: string;
  extension?: string;
}

type ExtractorConfig = ExtractorFn | Record<string, ExtractorFn>;
type ExtractorFn = (content: string) => string[];

type TransformerConfig = TransformerFn | Record<string, TransformerFn>;
type TransformerFn = (content: string) => string;
```

### Theme Configuration

```javascript { .api }
interface ThemeConfig {
  /** Responsive breakpoints */
  screens: Record<string, string | ScreenConfig>;
  
  /** Color palette */
  colors: Record<string, string | Record<string, string>>;
  
  /** Spacing scale */
  spacing: Record<string, string>;
  
  /** Typography configuration */
  fontFamily: Record<string, string | string[] | FontFamilyConfig>;
  fontSize: Record<string, string | FontSizeConfig>;
  fontWeight: Record<string, string | number>;
  lineHeight: Record<string, string>;
  letterSpacing: Record<string, string>;
  
  /** Border configuration */
  borderRadius: Record<string, string>;
  borderWidth: Record<string, string>;
  
  /** Effect configuration */
  boxShadow: Record<string, string | string[]>;
  opacity: Record<string, string>;
  
  /** Layout configuration */
  zIndex: Record<string, string | number>;
  container: ContainerConfig;
  
  // ... extensive theme properties
}

interface ScreenConfig {
  min?: string;
  max?: string;
  raw?: string;
}

interface FontFamilyConfig extends Array<string> {
  1?: {
    fontFeatureSettings?: string;
    fontVariationSettings?: string;
  };
}

type FontSizeConfig = 
  | string 
  | [fontSize: string, lineHeight: string]
  | [fontSize: string, options: { lineHeight?: string; letterSpacing?: string; fontWeight?: string | number }];
```

### Advanced Configuration Options

```javascript { .api }
type CorePluginsConfig = 
  | CorePluginList[]
  | Partial<Record<CorePluginList, boolean>>;

type DarkModeConfig = 
  | 'media'
  | 'class' 
  | ['class', string]
  | 'selector'
  | ['selector', string]
  | ['variant', string | string[]];

interface SafelistConfig {
  pattern: RegExp;
  variants?: string[];
}

type FutureFeature = 
  | 'hoverOnlyWhenSupported'
  | 'respectDefaultRingColorOpacity'
  | 'disableColorOpacityUtilitiesByDefault'
  | 'relativeContentPathsByDefault';

type ExperimentalFeature = 
  | 'optimizeUniversalDefaults'
  | 'matchVariant';
```