# PostCSS

PostCSS is a tool for transforming styles with JavaScript plugins. It parses CSS into an Abstract Syntax Tree (AST), allows plugins to transform it, and then converts it back to CSS. PostCSS is widely used for tasks like autoprefixing, CSS optimization, and CSS-in-JS transformations.

## Package Information

- **Package Name**: postcss
- **Package Type**: npm
- **Language**: JavaScript/TypeScript
- **Installation**: `npm install postcss`
- **Version**: 8.5.3
- **Main Entry Points**:
  - CommonJS: `lib/postcss.js`
  - ESM: `lib/postcss.mjs`
  - TypeScript: `lib/postcss.d.ts`
- **Repository**: https://github.com/postcss/postcss

## Core Imports

```javascript { .api }
// CommonJS
const postcss = require('postcss')

// ES Modules  
import postcss from 'postcss'

// TypeScript
import postcss from 'postcss'
import type { ProcessOptions, Plugin } from 'postcss'

// Individual imports
const { parse, stringify, list, fromJSON } = require('postcss')
import { parse, stringify, list, fromJSON } from 'postcss'

// Node constructors
const { Node, Rule, Declaration, AtRule, Comment, Root, Document } = require('postcss')
import { Node, Rule, Declaration, AtRule, Comment, Root, Document } from 'postcss'
```

## Basic Usage

### Processing CSS with Plugins

```javascript { .api }
const postcss = require('postcss')

// Create processor with plugins
const processor = postcss([
  require('autoprefixer'),
  require('cssnano')
])

// Process CSS
processor.process(css, { from: 'input.css', to: 'output.css' })
  .then(result => {
    console.log(result.css) // Transformed CSS
    console.log(result.map.toString()) // Source map
  })
```

### Parsing and Manipulating CSS AST

```javascript { .api }
const postcss = require('postcss')

// Parse CSS to AST
const root = postcss.parse(`
  .foo { color: red; }
  .bar { color: blue; }
`)

// Manipulate AST
root.walkRules(rule => {
  rule.selector = `.prefix-${rule.selector}`
})

// Convert back to CSS
const css = root.toString()
// Result: .prefix-.foo { color: red; } .prefix-.bar { color: blue; }
```

### Creating Nodes Programmatically

```javascript { .api }
const postcss = require('postcss')

// Create individual nodes
const decl = postcss.decl({ prop: 'color', value: 'red' })
const rule = postcss.rule({ selector: '.example' })
const comment = postcss.comment({ text: 'This is a comment' })

// Build CSS structure
rule.append(decl)
const root = postcss.root()
root.append(comment, rule)

console.log(root.toString())
// Result: /* This is a comment */ .example { color: red; }
```

## Architecture

PostCSS is built around several key components:

### AST Nodes
- **Node**: Base class for all AST nodes with common methods
- **Container**: Base class for nodes that can contain children
- **Root**: Represents the CSS document root
- **Rule**: CSS rules with selectors and declarations  
- **Declaration**: CSS property-value pairs
- **AtRule**: CSS at-rules like @media, @import
- **Comment**: CSS comments
- **Document**: Container for multiple CSS roots

### Processing Pipeline
- **Parser**: Converts CSS strings to AST
- **Processor**: Manages plugins and applies transformations
- **Stringifier**: Converts AST back to CSS strings
- **Result**: Contains processed CSS and metadata

### Plugin System
- **Plugin Interface**: Modern plugin API with lifecycle hooks
- **Legacy Plugins**: Older transformation-function based plugins
- **Helpers**: Utilities provided to plugins during processing

## Capabilities

### CSS Parsing and Generation

Parse CSS strings into manipulable AST structures and generate CSS output with source maps:

```javascript { .api }
const postcss = require('postcss')

// Parse CSS
const root = postcss.parse(css, { from: 'input.css' })

// Generate CSS with source map
const result = root.toResult({ to: 'output.css', map: { inline: false } })
console.log(result.css)
console.log(result.map.toString())
```

### AST Traversal and Manipulation

Walk through and modify CSS AST nodes with powerful traversal methods:

```javascript { .api }
const postcss = require('postcss')
const root = postcss.parse(css)

// Walk all nodes
root.walk(node => {
  if (node.type === 'decl' && node.prop === 'color') {
    node.value = 'blue'
  }
})

// Walk specific node types
root.walkRules(rule => {
  if (rule.selector.includes('.old-')) {
    rule.selector = rule.selector.replace('.old-', '.new-')
  }
})

root.walkDecls('margin', decl => {
  decl.value = postcss.list.space(decl.value).map(v => 
    v === '0' ? '0' : v
  ).join(' ')
})

root.walkAtRules('media', atRule => {
  if (atRule.params === 'screen') {
    atRule.params = 'screen and (min-width: 768px)'
  }
})
```

### Plugin Development and Processing

Create and use plugins to transform CSS:

```javascript { .api }
// Modern plugin API
const myPlugin = (opts = {}) => {
  return {
    postcssPlugin: 'my-plugin',
    Once(root, { result }) {
      // Process entire stylesheet once
    },
    Declaration(decl, { result }) {
      // Process each declaration
      if (decl.prop.startsWith('--custom-')) {
        result.warn('Custom properties detected', { node: decl })
      }
    },
    Rule(rule, { result }) {
      // Process each rule
    }
  }
}
myPlugin.postcss = true

// Use plugin
const processor = postcss([myPlugin({ option: 'value' })])
```

### Value Parsing and Utilities

Parse and manipulate CSS values safely:

```javascript { .api }
const postcss = require('postcss')

// Split comma-separated values
const colors = postcss.list.comma('red, blue, green')
// Result: ['red', 'blue', 'green']

// Split space-separated values  
const margins = postcss.list.space('10px 20px 30px 40px')
// Result: ['10px', '20px', '30px', '40px']

// Custom splitting
const values = postcss.list.split('a|b|c', ['|'], true)
// Result: ['a', 'b', 'c']
```

### Error Handling and Source Maps

Comprehensive error handling with source location information:

```javascript { .api }
const postcss = require('postcss')

try {
  const root = postcss.parse('invalid css {{}')
} catch (error) {
  if (error.name === 'CssSyntaxError') {
    console.log(error.message) // Error with line/column info
    console.log(error.showSourceCode()) // Highlighted source code
  }
}

// Plugin warnings
const myPlugin = () => ({
  postcssPlugin: 'my-plugin',
  Declaration(decl, { result }) {
    if (decl.important) {
      result.warn('Avoid !important', { 
        node: decl,
        word: '!important'
      })
    }
  }
})
```

### JSON Serialization

Serialize and deserialize AST for caching and analysis:

```javascript { .api }
const postcss = require('postcss')

// Serialize to JSON
const root = postcss.parse('.foo { color: red; }')
const json = root.toJSON()

// Deserialize from JSON
const restored = postcss.fromJSON(json)
console.log(restored.toString()) // .foo { color: red; }
```

## Sub-documentation

- [Core Processing](./core-processing.md) - Processor, parsing, and string generation
- [AST Nodes](./ast-nodes.md) - Node classes and AST manipulation
- [Plugin System](./plugin-system.md) - Plugin interfaces and development
- [Results and Errors](./results-errors.md) - Processing results and error handling  
- [Utilities](./utilities.md) - List module and other utilities