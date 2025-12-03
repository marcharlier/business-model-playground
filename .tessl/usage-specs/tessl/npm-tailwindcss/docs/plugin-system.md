# Plugin System

Create custom plugins to extend Tailwind with new utilities, components, and variants.

## Capabilities

### Plugin Function

Creates a Tailwind CSS plugin that can add utilities, components, base styles, and variants.

```javascript { .api }
/**
 * Create a Tailwind CSS plugin
 * @param plugin - Plugin function that receives the plugin API
 * @param config - Optional configuration to merge into user config
 * @returns Plugin object for use in plugins array
 */
function plugin(
  plugin: PluginCreator,
  config?: Partial<Config>
): PluginObject;

type PluginCreator = (api: PluginAPI) => void;

interface PluginObject {
  handler: PluginCreator;
  config?: Partial<Config>;
}
```

**Usage Examples:**

```javascript
const plugin = require('tailwindcss/plugin');

// Simple plugin
const myPlugin = plugin(function({ addUtilities }) {
  addUtilities({
    '.content-auto': {
      'content-visibility': 'auto',
    },
    '.content-hidden': {
      'content-visibility': 'hidden',
    },
  });
});

// Plugin with configuration
const buttonPlugin = plugin(function({ addComponents, theme }) {
  addComponents({
    '.btn': {
      padding: theme('spacing.2') + ' ' + theme('spacing.4'),
      borderRadius: theme('borderRadius.md'),
      fontWeight: theme('fontWeight.medium'),
    },
  });
}, {
  theme: {
    extend: {
      colors: {
        'btn-primary': '#3B82F6',
      }
    }
  }
});

// Use in configuration
module.exports = {
  plugins: [myPlugin, buttonPlugin]
};
```

### Plugin with Options

Creates a configurable plugin that accepts options.

```javascript { .api }
/**
 * Create a plugin with configurable options
 * @param plugin - Function that returns a plugin based on options
 * @param config - Optional function that returns configuration based on options
 * @returns Plugin function that accepts options and returns plugin object
 */
plugin.withOptions<T>(
  plugin: (options: T) => PluginCreator,
  config?: (options: T) => Partial<Config>
): PluginWithOptions<T>;

interface PluginWithOptions<T> {
  (options: T): PluginObject;
  __isOptionsFunction: true;
}
```

**Usage Examples:**

```javascript
const plugin = require('tailwindcss/plugin');

// Configurable plugin
const aspectRatioPlugin = plugin.withOptions(
  function (options = {}) {
    return function({ addUtilities, matchUtilities, theme }) {
      const values = {
        auto: 'auto',
        square: '1 / 1',
        video: '16 / 9',
        ...theme('aspectRatio'),
        ...(options.values || {})
      };

      matchUtilities(
        {
          'aspect': (value) => ({
            'aspect-ratio': value,
          }),
        },
        { values }
      );
    };
  },
  function (options) {
    return {
      theme: {
        aspectRatio: options.values || {}
      }
    };
  }
);

// Use with options
module.exports = {
  plugins: [
    aspectRatioPlugin({
      values: {
        '4/3': '4 / 3',
        '21/9': '21 / 9',
      }
    })
  ]
};

// Use with defaults
module.exports = {
  plugins: [aspectRatioPlugin()]
};
```

## Plugin API

### Add Utilities

Add static utility classes to the utilities layer.

```javascript { .api }
/**
 * Add static utility classes
 * @param utilities - CSS rule objects for utilities
 * @param options - Options for prefix and important handling
 */
addUtilities(
  utilities: CSSRuleObject | CSSRuleObject[],
  options?: {
    respectPrefix?: boolean;
    respectImportant?: boolean;
  }
): void;
```

**Usage Examples:**

```javascript
plugin(function({ addUtilities }) {
  addUtilities({
    '.skew-10deg': {
      transform: 'skewY(-10deg)',
    },
    '.skew-15deg': {
      transform: 'skewY(-15deg)',
    },
  });

  // With nested selectors
  addUtilities({
    '.tab-size': {
      'tab-size': '4',
    },
    '.tab-size-8': {
      'tab-size': '8',
    },
  }, {
    respectPrefix: false,
    respectImportant: false,
  });
});
```

### Match Utilities

Add dynamic utility classes that work with arbitrary values.

```javascript { .api }
/**
 * Add dynamic utility classes with theme values
 * @param utilities - Map of utility names to value functions
 * @param options - Configuration for values, types, and modifiers
 */
matchUtilities<T = string, U = string>(
  utilities: Record<string, (value: T, extra: { modifier: U | null }) => CSSRuleObject | null>,
  options?: {
    values?: Record<string, T>;
    type?: ValueType | ValueType[];
    modifiers?: 'any' | Record<string, U>;
    supportsNegativeValues?: boolean;
    respectPrefix?: boolean;
    respectImportant?: boolean;
  }
): void;

type ValueType = 
  | 'any' | 'color' | 'url' | 'image' | 'length' | 'percentage' 
  | 'position' | 'lookup' | 'generic-name' | 'family-name' 
  | 'number' | 'line-width' | 'absolute-size' | 'relative-size' | 'shadow';
```

**Usage Examples:**

```javascript
plugin(function({ matchUtilities, theme }) {
  // Simple match utilities
  matchUtilities(
    {
      'tab-size': (value) => ({
        'tab-size': value,
      }),
    },
    { values: theme('tabSize') }
  );

  // With type validation
  matchUtilities(
    {
      'rotate': (value) => ({
        transform: `rotate(${value})`,
      }),
    },
    {
      values: theme('rotate'),
      type: 'angle',
      supportsNegativeValues: true,
    }
  );

  // With modifiers
  matchUtilities(
    {
      'shadow': (value, { modifier }) => ({
        'box-shadow': value,
        ...(modifier && {
          'box-shadow-color': modifier,
        }),
      }),
    },
    {
      values: theme('boxShadow'),
      modifiers: theme('boxShadowColor'),
      type: 'shadow',
    }
  );
});
```

### Add Components

Add static component styles to the components layer.

```javascript { .api }
/**
 * Add static component styles
 * @param components - CSS rule objects for components
 * @param options - Options for prefix and important handling
 */
addComponents(
  components: CSSRuleObject | CSSRuleObject[],
  options?: {
    respectPrefix?: boolean;
    respectImportant?: boolean;
  }
): void;
```

**Usage Examples:**

```javascript
plugin(function({ addComponents, theme }) {
  addComponents({
    '.btn': {
      padding: theme('spacing.2') + ' ' + theme('spacing.4'),
      borderRadius: theme('borderRadius.md'),
      fontWeight: theme('fontWeight.medium'),
    },
    '.btn-primary': {
      backgroundColor: theme('colors.blue.500'),
      color: theme('colors.white'),
      '&:hover': {
        backgroundColor: theme('colors.blue.600'),
      },
    },
  });
});
```

### Match Components

Add dynamic component styles that work with theme values.

```javascript { .api }
/**
 * Add dynamic component styles with theme values
 * @param components - Map of component names to value functions
 * @param options - Configuration for values, types, and modifiers
 */
matchComponents<T = string, U = string>(
  components: Record<string, (value: T, extra: { modifier: U | null }) => CSSRuleObject | null>,
  options?: {
    values?: Record<string, T>;
    type?: ValueType | ValueType[];
    modifiers?: 'any' | Record<string, U>;
    respectPrefix?: boolean;
    respectImportant?: boolean;
  }
): void;
```

### Add Base Styles

Add base styles that are included before utilities and components.

```javascript { .api }
/**
 * Add base styles
 * @param base - CSS rule objects for base styles
 */
addBase(base: CSSRuleObject | CSSRuleObject[]): void;
```

**Usage Examples:**

```javascript
plugin(function({ addBase, theme }) {
  addBase({
    'h1': {
      fontSize: theme('fontSize.2xl'),
      fontWeight: theme('fontWeight.bold'),
    },
    'h2': {
      fontSize: theme('fontSize.xl'),
      fontWeight: theme('fontWeight.semibold'),
    },
  });
});
```

### Add Variants

Add custom variants for conditional styling.

```javascript { .api }
/**
 * Add custom variants
 * @param name - Variant name
 * @param definition - CSS selector or function returning selector
 */
addVariant(
  name: string, 
  definition: string | string[] | (() => string) | (() => string)[]
): void;
```

**Usage Examples:**

```javascript
plugin(function({ addVariant }) {
  // Simple variant
  addVariant('hocus', ['&:hover', '&:focus']);
  
  // Function-based variant
  addVariant('not-first', () => '&:not(:first-child)');
  
  // Multiple selectors
  addVariant('group-optional', [
    ':merge(.group):optional &',
    ':merge(.group):optional&',
  ]);
});
```

### Match Variants

Add dynamic variants that accept values.

```javascript { .api }
/**
 * Add dynamic variants with values
 * @param name - Variant name
 * @param cb - Function that returns selector based on value
 * @param options - Configuration for values and sorting
 */
matchVariant<T = string>(
  name: string,
  cb: (value: T, extra: { modifier: string | null }) => string | string[],
  options?: {
    values?: Record<string, T>;
    sort?(a: { value: T; modifier: string | null }, b: { value: T; modifier: string | null }): number;
  }
): void;
```

### Theme Access

Access theme configuration values within plugins.

```javascript { .api }
/**
 * Access theme configuration values
 * @param path - Dot-notation path to theme value
 * @param defaultValue - Default value if path doesn't exist
 * @returns Theme value or default
 */
theme<TDefaultValue = any>(
  path?: string, 
  defaultValue?: TDefaultValue
): TDefaultValue;
```

### Config Access

Access full configuration object within plugins.

```javascript { .api }
/**
 * Access full configuration object
 * @param path - Dot-notation path to config value
 * @param defaultValue - Default value if path doesn't exist
 * @returns Config value or default
 */
config<TDefaultValue = any>(
  path?: string, 
  defaultValue?: TDefaultValue
): TDefaultValue;
```

### Core Plugin Check

Check if a core plugin is enabled.

```javascript { .api }
/**
 * Check if a core plugin is enabled
 * @param path - Core plugin name
 * @returns Whether the core plugin is enabled
 */
corePlugins(path: string): boolean;
```

### Escape Class Names

Escape special characters in class names for CSS selectors.

```javascript { .api }
/**
 * Escape special characters in class names
 * @param className - Class name to escape
 * @returns Escaped class name for CSS selectors
 */
e(className: string): string;
```

## Type Definitions

```javascript { .api }
interface CSSRuleObject {
  [selector: string]: string | string[] | null | CSSRuleObject;
}

interface PluginUtils {
  colors: DefaultColors;
  theme(path: string, defaultValue?: unknown): any;
  breakpoints<T = Record<string, unknown>>(screens: T): T;
  rgb(color: string): ({ opacityVariable, opacityValue }: { opacityVariable?: string; opacityValue?: number }) => string;
  hsl(color: string): ({ opacityVariable, opacityValue }: { opacityVariable?: string; opacityValue?: number }) => string;
}
```