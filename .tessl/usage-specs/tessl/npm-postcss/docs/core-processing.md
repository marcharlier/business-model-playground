# Core Processing

PostCSS core processing involves parsing CSS into an AST, applying transformations through processors, and converting back to CSS strings. This document covers the main processing classes and functions.

## Processor

The Processor class manages plugins and applies CSS transformations.

```typescript { .api }
import { Processor, AcceptedPlugin, ProcessOptions, LazyResult, NoWorkResult, Root, Document } from 'postcss'

class Processor {
  plugins: (Plugin | TransformCallback | Transformer)[]
  version: string
  
  use(plugin: AcceptedPlugin): this
  process(css: string | { toString(): string } | LazyResult | Result | Root): LazyResult | NoWorkResult
  process<RootNode extends Document | Root = Root>(
    css: string | { toString(): string } | LazyResult | Result | Root, 
    options: ProcessOptions<RootNode>
  ): LazyResult<RootNode>
}
```

### Creating a Processor

```javascript { .api }
import postcss from 'postcss'

// Create processor with plugins
const processor = postcss([
  require('autoprefixer'),
  require('cssnano')
])

// Add plugins individually
const processor2 = postcss()
processor2.use(require('autoprefixer'))
processor2.use(require('cssnano'))
```

### Processing CSS

```javascript { .api }
import postcss from 'postcss'

const processor = postcss([require('autoprefixer')])

// Basic processing
const result = processor.process('.foo { display: flex; }')
console.log(result.css)

// Processing with options
const result = processor.process(css, {
  from: 'input.css',
  to: 'output.css',
  map: { inline: false }
})

// Async processing
processor.process(css, { from: 'input.css' })
  .then(result => {
    console.log(result.css)
    console.log(result.warnings())
  })
  .catch(error => {
    console.error(error)
  })
```

### Processing Options

```typescript { .api }
interface ProcessOptions<RootNode = Document | Root> {
  from?: string                           // Source file path
  to?: string                            // Output file path  
  map?: boolean | SourceMapOptions       // Source map configuration
  parser?: Parser<RootNode> | Syntax<RootNode>     // Custom parser
  stringifier?: Stringifier | Syntax<RootNode>    // Custom stringifier
  syntax?: Syntax<RootNode>             // Custom syntax (parser + stringifier)
  document?: string                      // Document type hint
}

interface SourceMapOptions {
  inline?: boolean                       // Embed source map inline
  prev?: boolean | string | object | ((file: string) => string) // Previous source map
  sourcesContent?: boolean               // Include sources content
  annotation?: boolean | string | ((file: string, root: Root) => string) // Add annotation
  from?: string                         // Override sources from
  absolute?: boolean                    // Use absolute paths
}
```

## Parser Functions

### parse

Parse CSS strings into AST structures.

```typescript { .api }
import { parse, ProcessOptions, Root, Document } from 'postcss'

interface Parse extends Parser {
  (css: string | { toString(): string }, opts?: ProcessOptions): Root | Document
}
```

```javascript { .api }
import { parse } from 'postcss'

// Basic parsing
const root = parse('.foo { color: red; }')

// Parsing with options
const root = parse(css, {
  from: 'input.css',
  map: { prev: sourceMap }
})

// Parse with custom syntax
const root = parse(scss, {
  parser: require('postcss-scss')
})

// Handle parsing errors
try {
  const root = parse('invalid css {{}')
} catch (error) {
  if (error.name === 'CssSyntaxError') {
    console.log(`${error.file}:${error.line}:${error.column}: ${error.reason}`)
  }
}
```

### Input Processing

The Input class handles CSS source with source map support:

```typescript { .api }
class Input {
  css: string
  document?: string
  file?: string
  id?: string
  map: PreviousMap
  hasBOM: boolean
  from: string

  error(message: string, line: number, column: number, opts?: { plugin?: string }): CssSyntaxError
  error(message: string, offset: number, opts?: { plugin?: string }): CssSyntaxError
  error(message: string, start: Position, end: Position, opts?: { plugin?: string }): CssSyntaxError
  fromOffset(offset: number): { line: number, col: number } | null
  origin(line: number, column: number, endLine?: number, endColumn?: number): false | FilePosition
  toJSON(): object
}
```

```javascript { .api }
import postcss, { Input } from 'postcss'

// Create input with source map
const input = new Input(css, 'input.css', { 
  map: { prev: previousSourceMap }
})

// Parse with input
const root = postcss.parse(input)

// Get original position
const original = input.origin(3, 10)
if (original) {
  console.log(`Original: ${original.file}:${original.line}:${original.column}`)
}
```

### PreviousMap

The PreviousMap class handles source map information from input CSS (e.g., from preprocessors like Sass):

```typescript { .api }
import { PreviousMap, SourceMapConsumer, ProcessOptions } from 'postcss'

class PreviousMap {
  annotation?: string    // sourceMappingURL content
  file?: string         // CSS source identifier
  inline: boolean       // Was source map inlined by data-uri
  mapFile?: string      // Path to source map file
  root?: string         // Directory with source map file
  text?: string         // Source map file content

  constructor(css: string, opts?: ProcessOptions)
  
  consumer(): SourceMapConsumer  // Create SourceMapGenerator instance (lazy)
  withContent(): boolean         // Does source map contain sourcesContent
}
```

```javascript { .api }
import postcss, { PreviousMap } from 'postcss'

// PreviousMap is automatically created when parsing CSS with existing source map
const css = `
.foo { color: red; }
/*# sourceMappingURL=input.css.map */
`

const root = postcss.parse(css, { from: 'input.css' })
const prevMap = root.source.input.map

console.log(prevMap.inline)        // false (external map file)
console.log(prevMap.annotation)    // 'input.css.map' 
console.log(prevMap.withContent()) // true if sourcesContent present

// Access source map consumer for advanced operations
const consumer = prevMap.consumer()
const originalPos = consumer.originalPositionFor({ line: 1, column: 0 })
```

## Stringifier Functions

### stringify

Convert AST nodes back to CSS strings.

```typescript { .api }
import { stringify, AnyNode, Builder } from 'postcss'

interface Stringify extends Stringifier {
  (node: AnyNode, builder: Builder): void
}
```

```javascript { .api }
import { stringify } from 'postcss'

// Basic stringification
const css = stringify(root)

// Custom stringification
const customStringify = (node, builder) => {
  if (node.type === 'rule') {
    builder(node.selector + ' {', node, 'start')
    node.each(child => stringify(child, builder))
    builder('}', node, 'end')
  }
}

// Use custom stringifier
const css = root.toString(customStringify)
```

### Stringifier Options

```typescript { .api }
interface Stringifier {
  (node: AnyNode, builder: Builder): void
}

interface Builder {
  (str: string, node?: AnyNode, type?: 'start' | 'end'): void
}

interface Syntax<RootNode = Root | Document> {
  parse?: Parser<RootNode>
  stringify?: Stringifier
}
```

## JSON Serialization

### fromJSON

Rehydrate JSON representations back to AST nodes.

```typescript { .api }
import { fromJSON, Node } from 'postcss'

interface FromJSON extends JSONHydrator {
  (data: object): Node
  (data: object[]): Node[]
}
```

```javascript { .api }
import { fromJSON } from 'postcss'

// Serialize AST to JSON
const root = postcss.parse('.foo { color: red; }')
const json = root.toJSON()

// Deserialize from JSON
const restored = fromJSON(json)
console.log(restored.toString()) // .foo { color: red; }

// Deserialize array of nodes
const nodes = [
  { type: 'rule', selector: '.foo', nodes: [] },
  { type: 'rule', selector: '.bar', nodes: [] }
]
const restoredNodes = fromJSON(nodes)
```

### JSON Structure

```javascript { .api }
// Example JSON structure
const nodeJson = {
  type: 'rule',
  selector: '.example',
  nodes: [
    {
      type: 'decl',
      prop: 'color',
      value: 'red',
      important: false
    }
  ],
  source: {
    start: { line: 1, column: 1, offset: 0 },
    end: { line: 1, column: 20, offset: 19 },
    input: {
      css: '.example { color: red; }',
      from: 'input.css'
    }
  },
  raws: {
    before: '',
    between: ' ',
    after: ' '
  }
}
```

## NoWorkResult

NoWorkResult is a special result type returned when no plugins are used, optimizing for cases where no CSS transformation is needed.

```typescript { .api }
import { NoWorkResult, LazyResult, SourceMap, Message, ResultOptions, Processor, Result, Root, Warning } from 'postcss'

class NoWorkResult implements LazyResult<Root> {
  catch: Promise<Result<Root>>['catch']
  finally: Promise<Result<Root>>['finally'] 
  then: Promise<Result<Root>>['then']
  
  // Sync-only properties (lazy parsed)
  css: string
  content: string    // Alias for css
  map: SourceMap
  messages: Message[]
  opts: ResultOptions
  processor: Processor
  root: Root        // Triggers CSS parsing on first access
  [Symbol.toStringTag]: string

  constructor(processor: Processor, css: string, opts: ResultOptions)
  
  async(): Promise<Result<Root>>
  sync(): Result<Root>
  toString(): string
  warnings(): Warning[]
}
```

### NoWorkResult Usage

```javascript { .api }
import postcss from 'postcss'

// When no plugins are defined, PostCSS returns NoWorkResult for optimization
const processor = postcss([]) // No plugins
const result = processor.process('.foo { color: red; }')

// CSS is not parsed until root is accessed
console.log(result.css)     // Still not parsed, returns original CSS
console.log(result.root)    // NOW css is parsed because we accessed root

// Promise interface still works
result.then(res => {
  console.log(res.css)
}).catch(error => {
  console.error(error)
})

// Sync/async methods available
const syncResult = result.sync()
const asyncResult = await result.async()
```

## LazyResult Processing

LazyResult provides promise-like processing with sync/async execution control:

```typescript { .api }
class LazyResult<RootNode = Root | Document> implements PromiseLike<Result<RootNode>> {
  then: Promise<Result<RootNode>>['then']
  catch: Promise<Result<RootNode>>['catch']  
  finally: Promise<Result<RootNode>>['finally']
  
  // Sync-only properties (throw if async plugins used)
  css: string
  content: string
  map: SourceMap
  root: RootNode
  messages: Message[]
  opts: ResultOptions
  processor: Processor

  sync(): Result<RootNode>
  async(): Promise<Result<RootNode>>
  toString(): string
  warnings(): Warning[]
}
```

```javascript { .api }
import postcss from 'postcss'

const processor = postcss([require('autoprefixer')])

// Promise-like usage
processor.process(css)
  .then(result => {
    console.log(result.css)
  })

// Sync execution (throws if async plugins present)
const lazyResult = processor.process(css)
try {
  const result = lazyResult.sync()
  console.log(result.css)
} catch (error) {
  // Handle sync execution error
}

// Force async execution
const result = await lazyResult.async()

// Access properties (sync only)
const lazyResult = processor.process(css)
console.log(lazyResult.css)     // Works if no async plugins
console.log(lazyResult.root)    // Access processed AST
console.log(lazyResult.warnings()) // Get warnings
```

## Legacy Plugin API (Deprecated)

PostCSS 8.x still supports the deprecated `postcss.plugin()` method for backward compatibility:

```typescript { .api }
import { plugin } from 'postcss'

interface LegacyPluginCreator<T> {
  (name: string, initializer: (opts?: T) => TransformCallback): PluginCreator<T>
}

let plugin: LegacyPluginCreator<any>
```

### Legacy Plugin Usage

```javascript { .api }
import postcss from 'postcss'

// Deprecated - use modern plugin API instead
const oldPlugin = postcss.plugin('old-plugin', (opts = {}) => {
  return (root, result) => {
    // Transform CSS
    root.walkRules(rule => {
      if (opts.prefix) {
        rule.selector = `${opts.prefix}${rule.selector}`
      }
    })
  }
})

// Usage (shows deprecation warning)
const processor = postcss([oldPlugin({ prefix: '.namespace-' })])

// Convert to modern API
const modernPlugin = (opts = {}) => ({
  postcssPlugin: 'modern-plugin',
  Rule(rule) {
    if (opts.prefix) {
      rule.selector = `${opts.prefix}${rule.selector}`
    }
  }
})
modernPlugin.postcss = true
```

## Processing Pipeline Example

```javascript { .api }
import postcss from 'postcss'

// Complete processing pipeline
const processor = postcss([
  require('postcss-import'),
  require('autoprefixer'),
  require('cssnano')
])

const css = `
  @import "base.css";
  .container {
    display: flex;
    user-select: none;
  }
`

processor.process(css, {
  from: 'src/main.css',
  to: 'dist/main.css', 
  map: {
    inline: false,
    annotation: true,
    sourcesContent: true
  }
})
.then(result => {
  // Write CSS output
  fs.writeFileSync('dist/main.css', result.css)
  
  // Write source map
  if (result.map) {
    fs.writeFileSync('dist/main.css.map', result.map.toString())
  }
  
  // Handle warnings
  result.warnings().forEach(warn => {
    console.warn(warn.toString())
  })
})
.catch(error => {
  if (error.name === 'CssSyntaxError') {
    console.error(error.showSourceCode(true))
  } else {
    console.error(error)
  }
})
```