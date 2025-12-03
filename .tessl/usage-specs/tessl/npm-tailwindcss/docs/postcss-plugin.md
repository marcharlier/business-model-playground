# PostCSS Plugin

The main Tailwind CSS PostCSS plugin that processes CSS and generates utility classes based on your content files and configuration.

## Capabilities

### Main Plugin Function

Creates a PostCSS plugin instance that processes Tailwind directives and generates CSS.

```javascript { .api }
/**
 * Main Tailwind CSS PostCSS plugin
 * @param config - Tailwind configuration object or path to config file
 * @returns PostCSS plugin instance with postcssPlugin property
 */
function tailwindcss(config?: string | Config): {
  postcssPlugin: 'tailwindcss';
  plugins: PostCSS.AcceptedPlugin[];
  postcss: true;
};
```

**Usage Examples:**

```javascript
// With configuration object
const postcss = require('postcss');
const tailwindcss = require('tailwindcss');

const result = await postcss([
  tailwindcss({
    content: ['./src/**/*.html'],
    theme: {
      extend: {
        colors: {
          primary: '#3B82F6'
        }
      }
    }
  })
]).process(css, { from: undefined });

// With configuration file path
const result = await postcss([
  tailwindcss('./tailwind.config.js')
]).process(css, { from: undefined });

// With default configuration
const result = await postcss([
  tailwindcss()
]).process(css, { from: undefined });
```

### CSS Directives

The plugin processes special CSS directives in your source files:

```css
/* Include Tailwind's base styles */
@tailwind base;

/* Include Tailwind's component classes */
@tailwind components;

/* Include Tailwind's utility classes */
@tailwind utilities;

/* Include Tailwind's variant utilities */
@tailwind variants;

/* Apply utility classes (legacy) */
@apply bg-blue-500 text-white p-4;

/* Access theme values */
.custom {
  color: theme('colors.blue.500');
  width: theme('spacing.8');
}

/* Screen-based media queries */
@screen md {
  .custom {
    display: block;
  }
}
```

### Processing Behavior

The plugin operates in Just-In-Time (JIT) mode by default:

- **Content Scanning**: Scans configured content files for class names
- **On-Demand Generation**: Generates only the CSS for classes found in your content
- **Variant Generation**: Creates responsive and state variants for used utilities
- **Purging**: Automatically removes unused CSS in production builds

### Configuration Integration

The plugin integrates with Tailwind's configuration system:

```javascript { .api }
interface PluginConfig {
  // Content configuration for JIT mode
  content: ContentConfig;
  
  // Theme customization
  theme?: Partial<ThemeConfig>;
  
  // Plugin registration
  plugins?: PluginCreator[];
  
  // Core plugin control
  corePlugins?: CorePluginsConfig;
  
  // Global modifiers
  important?: boolean | string;
  prefix?: string;
  separator?: string;
  
  // CSS class control
  safelist?: SafelistConfig[];
  blocklist?: string[];
  
  // Dark mode strategy
  darkMode?: DarkModeConfig;
}
```

### Error Handling

The plugin provides detailed error messages for common issues:

- **Missing Configuration**: Clear guidance when configuration is invalid
- **Content Path Issues**: Warnings when content paths don't match files
- **Invalid CSS**: Helpful messages for malformed `@apply` directives
- **Plugin Conflicts**: Detection of conflicting plugin configurations

### Performance Features

- **Incremental Building**: Only rebuilds changed CSS
- **Memory Optimization**: Efficient caching of generated styles
- **Fast Content Scanning**: Optimized regex patterns for class detection
- **Parallel Processing**: Concurrent handling of multiple content files