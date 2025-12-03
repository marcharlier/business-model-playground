# Results and Errors

PostCSS processing produces results with output CSS, source maps, and metadata. This document covers the Result class, warning system, and error handling mechanisms.

## Result

The Result class contains the output of CSS processing along with metadata and messages.

```typescript { .api }
import { Result, Root, Document, Processor, SourceMap, Message, Warning, ResultOptions, WarningOptions } from 'postcss'

class Result<RootNode = Root | Document> {
  css: string
  content: string                    // Alias for css property
  map: SourceMap
  root: RootNode
  messages: Message[]
  processor: Processor
  opts: ResultOptions
  lastPlugin: Plugin | TransformCallback

  toString(): string
  warn(message: string, options?: WarningOptions): Warning
  warnings(): Warning[]
}
```

### Result Properties

```javascript { .api }
import postcss from 'postcss'

const processor = postcss([require('autoprefixer')])
const result = processor.process('.foo { display: flex; }', {
  from: 'input.css',
  to: 'output.css',
  map: { inline: false }
})

// Access result properties
console.log(result.css)        // Generated CSS string
console.log(result.content)    // Same as css (alias)
console.log(result.map)        // Source map object
console.log(result.root)       // Processed AST root
console.log(result.messages)   // Array of plugin messages
console.log(result.processor)  // Processor instance used
console.log(result.opts)       // Processing options
```

### Result Options

```typescript { .api }
interface ResultOptions extends ProcessOptions {
  node?: Node
  plugin?: string
}

interface ProcessOptions<RootNode = Document | Root> {
  from?: string
  to?: string
  map?: boolean | SourceMapOptions
  parser?: Parser<RootNode> | Syntax<RootNode>
  stringifier?: Stringifier | Syntax<RootNode>
  syntax?: Syntax<RootNode>
  document?: string
}
```

### Messages System

```typescript { .api }
interface Message {
  type: string
  plugin?: string
  [others: string]: any
}
```

```javascript { .api }
import postcss from 'postcss'

const messagePlugin = () => ({
  postcssPlugin: 'message-plugin',
  Once(root, { result }) {
    // Add custom messages
    result.messages.push({
      type: 'info',
      plugin: 'message-plugin', 
      message: 'Processing started',
      timestamp: Date.now()
    })
  },
  
  Declaration(decl, { result }) {
    // Add declaration-specific messages
    if (decl.prop.startsWith('--')) {
      result.messages.push({
        type: 'css-variable',
        plugin: 'message-plugin',
        property: decl.prop,
        value: decl.value,
        line: decl.source.start.line
      })
    }
  }
})

const result = postcss([messagePlugin()])
  .process('.foo { --color: red; color: var(--color); }')

// Access messages
result.messages.forEach(msg => {
  console.log(`${msg.type}: ${msg.message || 'Custom data'}`)
})
```

## Warning

The Warning class represents plugin warnings with source location information.

```typescript { .api }
import { Warning, Node } from 'postcss'

class Warning {
  type: 'warning'
  text: string
  plugin: string
  node: Node
  line: number
  column: number
  endLine?: number
  endColumn?: number

  toString(): string
}
```

### Creating Warnings

```javascript { .api }
import postcss from 'postcss'

const warningPlugin = () => ({
  postcssPlugin: 'warning-plugin',
  
  Declaration(decl, { result }) {
    // Basic warning
    if (decl.important) {
      result.warn('Avoid using !important', { node: decl })
    }
    
    // Warning with specific word highlighted
    if (decl.value === 'red') {
      result.warn('Consider using CSS variables instead of hardcoded colors', {
        node: decl,
        word: 'red'
      })
    }
    
    // Warning with custom position
    if (decl.prop === 'float') {
      result.warn('Float is deprecated, use flexbox or grid', {
        node: decl,
        index: 0,
        endIndex: decl.prop.length
      })
    }
  }
})

const result = postcss([warningPlugin()])
  .process('.foo { color: red !important; float: left; }')

// Access warnings
result.warnings().forEach(warning => {
  console.log(warning.toString())
  // Output: warning-plugin: 2:9: Avoid using !important
})
```

### Warning Options

```typescript { .api }
interface WarningOptions {
  node?: Node
  plugin?: string
  index?: number
  endIndex?: number
  word?: string
  start?: RangePosition
  end?: RangePosition
}

interface RangePosition {
  line: number
  column: number
}
```

```javascript { .api }
import postcss from 'postcss'

const detailedWarningPlugin = () => ({
  postcssPlugin: 'detailed-warning-plugin',
  
  Rule(rule, { result }) {
    // Warning with range highlighting
    const selectorMatch = rule.selector.match(/(\.[a-z]+)/i)
    if (selectorMatch) {
      const start = rule.selector.indexOf(selectorMatch[1])
      const end = start + selectorMatch[1].length
      
      result.warn('Consider using BEM naming convention', {
        node: rule,
        index: start,
        endIndex: end,
        word: selectorMatch[1]
      })
    }
    
    // Warning with line/column position
    result.warn('Rule complexity warning', {
      node: rule,
      start: { line: rule.source.start.line, column: 1 },
      end: { line: rule.source.end.line, column: rule.source.end.column }
    })
  }
})
```

## CssSyntaxError

PostCSS throws CssSyntaxError for parsing and processing errors with detailed location information.

```typescript { .api }
import { CssSyntaxError } from 'postcss'

class CssSyntaxError extends Error {
  name: 'CssSyntaxError'
  message: string
  reason: string
  file?: string
  line?: number
  column?: number
  endLine?: number
  endColumn?: number
  source?: string
  input?: FilePosition
  plugin?: string

  toString(): string
  showSourceCode(color?: boolean): string
}

interface FilePosition {
  file?: string
  url: string
  line: number
  column: number
  endLine?: number
  endColumn?: number
  source?: string
}
```

### Parsing Errors

```javascript { .api }
import postcss from 'postcss'

try {
  // Invalid CSS syntax
  const root = postcss.parse('invalid css { { }')
} catch (error) {
  if (error.name === 'CssSyntaxError') {
    console.log(`Error: ${error.reason}`)
    console.log(`Location: ${error.file}:${error.line}:${error.column}`)
    console.log(`Source: ${error.source}`)
    
    // Show highlighted source code
    console.log(error.showSourceCode(true))
  }
}
```

### Plugin Errors

```javascript { .api }
import postcss from 'postcss'

const errorPlugin = () => ({
  postcssPlugin: 'error-plugin',
  
  Declaration(decl) {
    if (decl.prop === 'forbidden-prop') {
      // Create error with source location
      throw decl.error('This property is not allowed', {
        plugin: 'error-plugin',
        word: decl.prop
      })
    }
  },
  
  Rule(rule) {
    if (rule.selector.includes('*')) {
      // Error with custom position
      const starIndex = rule.selector.indexOf('*')
      throw rule.error('Universal selector not allowed', {
        plugin: 'error-plugin',
        index: starIndex,
        endIndex: starIndex + 1
      })
    }
  }
})

try {
  postcss([errorPlugin()]).process('.foo { forbidden-prop: value; }')
} catch (error) {
  console.log(error.showSourceCode())
  // Displays highlighted source with error location
}
```

### Error Creation from Nodes

```javascript { .api }
import postcss from 'postcss'

const validationPlugin = () => ({
  postcssPlugin: 'validation-plugin',
  
  Declaration(decl) {
    try {
      validateDeclaration(decl.prop, decl.value)
    } catch (validationError) {
      // Create CSS error from node with context
      const cssError = decl.error(
        `Invalid ${decl.prop} value: ${validationError.message}`,
        { 
          plugin: 'validation-plugin',
          word: decl.value
        }
      )
      
      // Add additional context
      cssError.plugin = 'validation-plugin'
      throw cssError
    }
  }
})

function validateDeclaration(prop, value) {
  const patterns = {
    'color': /^(#[0-9a-f]{6}|rgb\(|hsl\(|[a-z]+)$/i,
    'font-size': /^(\d+(\.\d+)?(px|em|rem|%)|[a-z-]+)$/i
  }
  
  const pattern = patterns[prop]
  if (pattern && !pattern.test(value)) {
    throw new Error(`Invalid format for ${prop}`)
  }
}
```

## Error Handling Patterns

### Graceful Error Handling

```javascript { .api }
const robustPlugin = () => ({
  postcssPlugin: 'robust-plugin',
  
  Declaration(decl, { result }) {
    try {
      // Risky transformation
      decl.value = complexTransformation(decl.value)
    } catch (error) {
      // Log error but continue processing
      result.warn(`Transformation failed: ${error.message}`, {
        node: decl,
        plugin: 'robust-plugin'
      })
    }
  }
})
```

### Error Collection

```javascript { .api }
const lintPlugin = () => ({
  postcssPlugin: 'lint-plugin',
  prepare() {
    const errors = []
    
    return {
      Declaration(decl, { result }) {
        // Collect errors instead of throwing immediately
        if (decl.prop.includes('_')) {
          errors.push({
            message: 'Properties should not contain underscores',
            node: decl,
            severity: 'error'
          })
        }
      },
      
      OnceExit(root, { result }) {
        // Report all errors at the end
        errors.forEach(({ message, node, severity }) => {
          if (severity === 'error') {
            throw node.error(message, { plugin: 'lint-plugin' })
          } else {
            result.warn(message, { node, plugin: 'lint-plugin' })
          }
        })
      }
    }
  }
})
```

### Async Error Handling

```javascript { .api }
const asyncPlugin = () => ({
  postcssPlugin: 'async-plugin',
  
  async AtRule: {
    async import(atRule, { result }) {
      try {
        const content = await fetchRemoteCSS(atRule.params)
        const importedRoot = postcss.parse(content)
        atRule.replaceWith(importedRoot.nodes)
      } catch (error) {
        if (error.code === 'ENOTFOUND') {
          result.warn(`Failed to fetch import: ${error.message}`, {
            node: atRule,
            plugin: 'async-plugin'
          })
        } else {
          throw atRule.error(`Import error: ${error.message}`, {
            plugin: 'async-plugin'
          })
        }
      }
    }
  }
})
```

## SourceMap Interface

PostCSS source maps extend the standard SourceMapGenerator from the source-map-js library:

```typescript { .api }
import { SourceMapGenerator, RawSourceMap } from 'source-map-js'

interface SourceMap extends SourceMapGenerator {
  toJSON(): RawSourceMap
  toString(): string
  
  // SourceMapGenerator methods
  addMapping(mapping: {
    source: string
    original: { line: number, column: number }
    generated: { line: number, column: number }
    name?: string
  }): void
  
  setSourceContent(sourceFile: string, sourceContent: string): void
  applySourceMap(sourceMapConsumer: SourceMapConsumer, sourceFile?: string, sourceMapPath?: string): void
}
```

### Working with Source Maps

```javascript { .api }
import postcss from 'postcss'

const result = processor.process(css, {
  from: 'input.css',
  to: 'output.css',
  map: {
    inline: false,
    annotation: true,
    sourcesContent: true,
    prev: previousSourceMap // from preprocessor
  }
})

// Access source map
const sourceMap = result.map
console.log(sourceMap.toString()) // Source map as string
console.log(sourceMap.toJSON())   // Source map as object

// Add custom mapping
sourceMap.addMapping({
  source: 'input.css',
  original: { line: 1, column: 0 },
  generated: { line: 1, column: 0 }
})

// Set source content
sourceMap.setSourceContent('input.css', originalCssContent)
```

## Source Map Integration

Source maps preserve original source locations through transformations:

```javascript { .api }
import postcss from 'postcss'

const processor = postcss([
  require('postcss-nested'),
  require('autoprefixer')
])

const result = processor.process(scss, {
  from: 'input.scss',
  to: 'output.css',
  map: {
    inline: false,
    annotation: true,
    sourcesContent: true
  }
})

// Warnings include original source positions
result.warnings().forEach(warning => {
  console.log(`${warning.line}:${warning.column}: ${warning.text}`)
})

// Errors show original source code
try {
  processor.process(invalidScss, { from: 'invalid.scss' })
} catch (error) {
  if (error.name === 'CssSyntaxError') {
    console.log(`Error in ${error.file}:`)
    console.log(error.showSourceCode(true))
  }
}
```

## Result Processing Examples

### Extract Statistics

```javascript { .api }
const statsPlugin = () => ({
  postcssPlugin: 'stats-plugin',
  prepare() {
    const stats = {
      rules: 0,
      declarations: 0,
      atRules: 0,
      comments: 0,
      selectors: new Set(),
      properties: new Set()
    }
    
    return {
      Rule(rule) {
        stats.rules++
        rule.selectors.forEach(sel => stats.selectors.add(sel))
      },
      
      Declaration(decl) {
        stats.declarations++
        stats.properties.add(decl.prop)
      },
      
      AtRule(atRule) {
        stats.atRules++
      },
      
      Comment(comment) {
        stats.comments++
      },
      
      OnceExit(root, { result }) {
        result.messages.push({
          type: 'stats',
          plugin: 'stats-plugin',
          ...stats,
          selectors: Array.from(stats.selectors),
          properties: Array.from(stats.properties)
        })
      }
    }
  }
})

const result = postcss([statsPlugin()]).process(css)
const statsMessage = result.messages.find(m => m.type === 'stats')
console.log('CSS Statistics:', statsMessage)
```

### Custom Result Processing

```javascript { .api }
async function processWithMetadata(css, plugins = []) {
  const startTime = Date.now()
  
  try {
    const result = await postcss(plugins).process(css, {
      from: 'input.css',
      to: 'output.css',
      map: { inline: false }
    })
    
    return {
      success: true,
      css: result.css,
      map: result.map,
      warnings: result.warnings(),
      messages: result.messages,
      processingTime: Date.now() - startTime,
      stats: extractStats(result.messages)
    }
  } catch (error) {
    return {
      success: false,
      error: {
        message: error.message,
        line: error.line,
        column: error.column,
        file: error.file,
        source: error.showSourceCode ? error.showSourceCode() : null
      },
      processingTime: Date.now() - startTime
    }
  }
}

function extractStats(messages) {
  return messages.reduce((acc, msg) => {
    if (msg.type === 'stats') {
      return { ...acc, ...msg }
    }
    return acc
  }, {})
}
```