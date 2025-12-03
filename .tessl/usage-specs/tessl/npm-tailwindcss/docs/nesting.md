# CSS Nesting

PostCSS plugin for CSS nesting syntax support, allowing you to write nested CSS rules with Tailwind CSS.

## Capabilities

### Nesting Plugin

PostCSS plugin that adds support for CSS nesting syntax, compatible with both postcss-nested and postcss-nesting plugins.

```javascript { .api }
/**
 * PostCSS plugin for CSS nesting syntax
 * @param plugin - Optional nesting plugin to use (postcss-nested, postcss-nesting, or string path)
 * @returns PostCSS plugin instance
 */
function nesting(plugin?: AcceptedPlugin | string | void): PostCSS.Plugin;

type AcceptedPlugin = PostCSS.Plugin | PostCSS.PluginCreator<any> | PostCSS.Transformer;
```

**Usage Examples:**

```javascript
// Basic usage with default plugin (postcss-nested)
const postcss = require('postcss');
const nesting = require('tailwindcss/nesting');
const tailwindcss = require('tailwindcss');

postcss([
  nesting(),
  tailwindcss(),
])
.process(css, { from: undefined });

// Use with postcss-nesting instead
postcss([
  nesting(require('postcss-nesting')),
  tailwindcss(),
])
.process(css, { from: undefined });

// Use with string reference
postcss([
  nesting('postcss-nesting'),
  tailwindcss(),
])
.process(css, { from: undefined });
```

### PostCSS Configuration Integration

Integrate the nesting plugin into your PostCSS configuration:

```javascript { .api }
// postcss.config.js
module.exports = {
  plugins: [
    require('tailwindcss/nesting'),
    require('tailwindcss'),
    require('autoprefixer'),
  ]
}

// With specific nesting plugin
module.exports = {
  plugins: [
    require('tailwindcss/nesting')(require('postcss-nesting')),
    require('tailwindcss'),
    require('autoprefixer'),
  ]
}
```

## CSS Nesting Syntax

### Basic Nesting

Write nested CSS rules that get flattened during processing:

```css { .api }
/* Input CSS */
.card {
  @apply bg-white shadow-lg rounded-lg;
  
  .title {
    @apply text-xl font-bold mb-2;
  }
  
  .content {
    @apply text-gray-600;
    
    p {
      @apply mb-4;
    }
  }
}

/* Output CSS */
.card {
  background-color: #fff;
  box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  border-radius: 0.5rem;
}

.card .title {
  font-size: 1.25rem;
  line-height: 1.75rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.card .content {
  color: #4b5563;
}

.card .content p {
  margin-bottom: 1rem;
}
```

### Pseudo-class and Pseudo-element Nesting

Nest pseudo-classes and pseudo-elements:

```css { .api }
/* Input CSS */
.button {
  @apply bg-blue-500 text-white px-4 py-2 rounded;
  
  &:hover {
    @apply bg-blue-600;
  }
  
  &:focus {
    @apply ring-2 ring-blue-300;
  }
  
  &::before {
    content: '';
    @apply absolute inset-0 bg-gradient-to-r from-transparent to-white opacity-0;
  }
  
  &:hover::before {
    @apply opacity-10;
  }
}
```

### Media Query Nesting

Nest media queries within selectors:

```css { .api }
/* Input CSS */
.responsive-grid {
  @apply grid grid-cols-1 gap-4;
  
  @media (min-width: 640px) {
    @apply grid-cols-2;
  }
  
  @media (min-width: 768px) {
    @apply grid-cols-3;
  }
  
  @media (min-width: 1024px) {
    @apply grid-cols-4;
  }
}
```

### Complex Nesting Patterns

Combine multiple nesting features:

```css { .api }
/* Input CSS */
.navigation {
  @apply bg-white shadow;
  
  .nav-list {
    @apply flex space-x-4;
    
    .nav-item {
      @apply relative;
      
      .nav-link {
        @apply block px-3 py-2 text-gray-700 hover:text-blue-600;
        
        &.active {
          @apply text-blue-600 font-medium;
          
          &::after {
            content: '';
            @apply absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600;
          }
        }
      }
      
      .dropdown {
        @apply absolute top-full left-0 bg-white shadow-lg rounded-md py-2 min-w-48 opacity-0 invisible;
        
        .nav-item:hover & {
          @apply opacity-100 visible;
        }
        
        .dropdown-link {
          @apply block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100;
        }
      }
    }
  }
}
```

## Plugin Compatibility

### postcss-nested vs postcss-nesting

The nesting plugin supports both popular nesting implementations:

```javascript { .api }
// postcss-nested (default) - supports Sass-like nesting
require('tailwindcss/nesting')()

// postcss-nesting - follows CSS Nesting Module specification
require('tailwindcss/nesting')(require('postcss-nesting'))
```

**Differences:**

| Feature | postcss-nested | postcss-nesting |
|---------|----------------|------------------|
| Syntax | Sass-like | CSS Nesting Module |
| `&` reference | Yes | Yes |
| Direct nesting | `.foo { .bar {} }` | Requires `&` |
| Spec compliance | Custom | W3C Standard |

### Framework Integration

#### Next.js Integration

```javascript { .api }
// next.config.js
module.exports = {
  experimental: {
    // Enable if using app directory
    appDir: true,
  },
  // PostCSS configuration
  postcss: {
    plugins: {
      'tailwindcss/nesting': {},
      tailwindcss: {},
      autoprefixer: {},
    },
  },
}
```

#### Vite Integration

```javascript { .api }
// vite.config.js
import { defineConfig } from 'vite'

export default defineConfig({
  css: {
    postcss: {
      plugins: [
        require('tailwindcss/nesting'),
        require('tailwindcss'),
        require('autoprefixer'),
      ],
    },
  },
})
```

#### Webpack Integration

```javascript { .api }
// webpack.config.js
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader',
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: [
                  require('tailwindcss/nesting'),
                  require('tailwindcss'),
                  require('autoprefixer'),
                ],
              },
            },
          },
        ],
      },
    ],
  },
}
```

## Best Practices

### Nesting Guidelines

1. **Limit nesting depth**: Keep nesting to 3-4 levels maximum for maintainability
2. **Use semantic grouping**: Nest related styles together logically
3. **Leverage Tailwind utilities**: Combine `@apply` with nesting for cleaner code
4. **Media query organization**: Place media queries inside components when possible

### Performance Considerations

- **Build-time processing**: Nesting is resolved at build time, no runtime cost
- **Output optimization**: Generated CSS is optimized and flattened
- **Bundle size**: No impact on final CSS bundle size
- **Browser compatibility**: Output CSS works in all browsers

### Migration from Sass/SCSS

```css { .api }
/* Sass/SCSS syntax */
.component {
  color: blue;
  
  .child {
    color: red;
    
    &:hover {
      color: green;
    }
  }
}

/* PostCSS nesting equivalent */
.component {
  @apply text-blue-500;
  
  .child {
    @apply text-red-500;
    
    &:hover {
      @apply text-green-500;
    }
  }
}
```