# Command Line Interface

CLI tools for building CSS, initializing projects, and managing Tailwind CSS installations.

## Capabilities

### CLI Commands

The Tailwind CSS CLI provides several commands for different tasks:

```bash { .api }
# Build CSS from input to output
tailwindcss -i <input> -o <output> [options]

# Initialize configuration file
tailwindcss init [options]

# Show help information
tailwindcss --help
```

### Build Command

Process CSS and generate Tailwind styles based on your content files.

```bash { .api }
# Basic build
tailwindcss -i ./src/input.css -o ./dist/output.css

# Build with configuration file
tailwindcss -i ./src/input.css -o ./dist/output.css -c ./tailwind.config.js

# Watch for changes and rebuild
tailwindcss -i ./src/input.css -o ./dist/output.css --watch

# Minify output CSS
tailwindcss -i ./src/input.css -o ./dist/output.css --minify

# Include all possible classes (no purging)
tailwindcss -i ./src/input.css -o ./dist/output.css --content ""
```

**Build Options:**

```bash { .api }
-i, --input <file>          Input CSS file
-o, --output <file>         Output CSS file
-c, --config <file>         Configuration file path
-w, --watch [path]          Watch for changes and rebuild
-p, --poll                  Use polling instead of filesystem events when watching
--postcss <file>           PostCSS configuration file
-m, --minify               Minify the output CSS
--content <pattern>        Content files pattern (overrides config)
--no-autoprefixer          Disable autoprefixer
--jit                      Enable JIT mode (deprecated, always enabled)
-h, --help                 Show help information
-v, --version              Show version number
```

**Usage Examples:**

```bash
# Development build with watch
tailwindcss -i ./src/styles.css -o ./public/styles.css --watch

# Production build with minification
tailwindcss -i ./src/styles.css -o ./dist/styles.css --minify

# Build with custom config location
tailwindcss -i ./src/input.css -o ./build/output.css -c ./config/tailwind.js

# Build with specific content pattern
tailwindcss -i ./src/input.css -o ./build/output.css --content "./pages/**/*.html"

# Build with PostCSS configuration
tailwindcss -i ./src/input.css -o ./build/output.css -p ./postcss.config.js
```

### Init Command

Create a Tailwind CSS configuration file.

```bash { .api }
# Create basic configuration file
tailwindcss init

# Create configuration with PostCSS config
tailwindcss init -p

# Create full configuration with all defaults
tailwindcss init --full

# Create TypeScript configuration
tailwindcss init --ts

# Create with custom filename
tailwindcss init tailwind.config.custom.js
```

**Init Options:**

```bash { .api }
-p, --postcss              Create PostCSS configuration file
-f, --full                 Include default values in config
--ts                       Create TypeScript config file
--esm                      Initialize config as ESM
-h, --help                 Show help information
```

**Generated Configuration Examples:**

```javascript
// Basic config (tailwindcss init)
module.exports = {
  content: [],
  theme: {
    extend: {},
  },
  plugins: [],
}

// Full config (tailwindcss init --full)
module.exports = {
  content: [],
  theme: {
    screens: {
      sm: '640px',
      md: '768px',
      // ... all default values
    },
    colors: {
      inherit: 'inherit',
      current: 'currentColor',
      // ... all default colors
    },
    // ... all default theme values
  },
  plugins: [],
}
```

### Help Command

Display help information for CLI usage.

```bash { .api }
# General help
tailwindcss --help
tailwindcss -h

# Command-specific help
tailwindcss init --help
tailwindcss build --help
```

## CLI Integration Patterns

### NPM Scripts Integration

```json { .api }
{
  "scripts": {
    "build-css": "tailwindcss -i ./src/input.css -o ./dist/output.css",
    "watch-css": "tailwindcss -i ./src/input.css -o ./dist/output.css --watch",
    "build-css-prod": "tailwindcss -i ./src/input.css -o ./dist/output.css --minify"
  }
}
```

### Build Tool Integration

```javascript { .api }
// Webpack integration
const { exec } = require('child_process');

module.exports = {
  // ... webpack config
  plugins: [
    {
      apply: (compiler) => {
        compiler.hooks.beforeCompile.tapAsync('TailwindCSS', (params, callback) => {
          exec('tailwindcss -i ./src/input.css -o ./dist/output.css', callback);
        });
      }
    }
  ]
};

// Gulp integration
const { spawn } = require('child_process');

function buildCSS() {
  return spawn('tailwindcss', [
    '-i', './src/input.css',
    '-o', './dist/output.css',
    '--minify'
  ], { stdio: 'inherit' });
}
```

### Docker Integration

```dockerfile { .api }
# Dockerfile
FROM node:18-alpine

# Install Tailwind CSS CLI
RUN npm install -g tailwindcss

# Copy source files
COPY . /app
WORKDIR /app

# Build CSS
RUN tailwindcss -i ./src/input.css -o ./dist/output.css --minify

# Use in build process
EXPOSE 3000
CMD ["node", "server.js"]
```

### CI/CD Integration

```yaml { .api }
# GitHub Actions
name: Build CSS
on: [push, pull_request]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build Tailwind CSS
        run: npx tailwindcss -i ./src/input.css -o ./dist/output.css --minify
      
      - name: Upload CSS artifact
        uses: actions/upload-artifact@v2
        with:
          name: built-css
          path: ./dist/output.css
```

## CLI Configuration

### Input CSS Structure

The CLI expects an input CSS file with Tailwind directives:

```css { .api }
/* input.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Custom styles */
@layer base {
  html {
    font-family: system-ui, sans-serif;
  }
}

@layer components {
  .btn {
    @apply px-4 py-2 rounded font-medium;
  }
}

@layer utilities {
  .content-auto {
    content-visibility: auto;
  }
}
```

### Content Detection

The CLI automatically scans files for class names based on your configuration:

```javascript { .api }
// tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{html,js,ts,jsx,tsx}",
    "./pages/**/*.{html,js,ts,jsx,tsx}",
    "./components/**/*.{html,js,ts,jsx,tsx}",
  ],
  // ...
}
```

### Performance Optimization

- **JIT Compilation**: Only generates CSS for classes found in content
- **Incremental Builds**: Only rebuilds when content or config changes
- **Parallel Processing**: Processes multiple files concurrently
- **Memory Efficiency**: Minimal memory footprint during builds

### Error Handling

The CLI provides detailed error messages for common issues:

- **File not found**: Clear indication when input/output files are missing
- **Invalid configuration**: Specific errors for configuration problems
- **CSS parsing errors**: Line numbers and context for CSS issues
- **Content scanning errors**: Information about problematic content patterns