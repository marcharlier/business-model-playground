# AST Nodes

PostCSS represents CSS as an Abstract Syntax Tree (AST) composed of different node types. This document covers all the node classes and their methods for AST manipulation.

## Node (Base Class)

The base class for all CSS AST nodes, providing common functionality.

```typescript { .api }
import { Node, Container, Document, Source, Position, Range, NewChild, ChildProps, Stringifier, Syntax, CssSyntaxError, Warning, NodeErrorOptions, WarningOptions } from 'postcss'

class Node {
  type: string
  parent?: Container | Document
  source?: Source
  raws: any

  clone(overrides?: object): this
  cloneBefore(overrides?: object): this
  cloneAfter(overrides?: object): this
  remove(): this
  replaceWith(...nodes: NewChild[]): this
  next(): ChildNode | undefined
  prev(): ChildNode | undefined
  before(newNode: Node | ChildProps | Node[] | string): this
  after(newNode: Node | ChildProps | Node[] | string): this
  root(): Root
  assign(overrides: object): this
  toString(stringifier?: Stringifier | Syntax): string
  error(message: string, options?: NodeErrorOptions): CssSyntaxError
  warn(result: Result, message: string, options?: WarningOptions): Warning
  positionInside(index: number): Position
  positionBy(opts?: Pick<WarningOptions, 'index' | 'word'>): Position
  rangeBy(opts?: Pick<WarningOptions, 'endIndex' | 'index' | 'word'>): Range
  raw(prop: string, defaultType?: string): string
  cleanRaws(keepBetween?: boolean): void
  toJSON(): object
}
```

### Node Usage Examples

```javascript { .api }
import postcss from 'postcss'

const root = postcss.parse('.foo { color: red; }')
const rule = root.first

// Node navigation
console.log(rule.type)        // 'rule'
console.log(rule.parent)      // Root node
console.log(rule.root())      // Root node

// Node manipulation
const cloned = rule.clone()
rule.cloneBefore({ selector: '.bar' })
rule.cloneAfter({ selector: '.baz' })

// Insert new nodes
rule.before(postcss.comment({ text: 'Before rule' }))
rule.after(postcss.comment({ text: 'After rule' }))

// Replace node
rule.replaceWith(
  postcss.rule({ selector: '.new' }),
  postcss.rule({ selector: '.another' })
)

// Remove node
rule.remove()

// Get position information
const position = rule.positionBy({ word: 'color' })
console.log(`Line: ${position.line}, Column: ${position.column}`)
```

### Source Information

```typescript { .api }
interface Source {
  input: Input
  start?: Position
  end?: Position
}

interface Position {
  line: number    // 1-based line number
  column: number  // 1-based column number
  offset: number  // 0-based character offset
}

interface Range {
  start: Position  // Inclusive start
  end: Position   // Exclusive end
}
```

## Container (Base for Parent Nodes)

Abstract base class for nodes that can contain children (Root, AtRule, Rule).

```typescript { .api }
import { Container, Node, Child, NewChild, ValueOptions } from 'postcss'

abstract class Container extends Node {
  nodes?: Child[]
  first?: Child       // Getter for first child
  last?: Child        // Getter for last child

  append(...nodes: NewChild[]): this
  prepend(...nodes: NewChild[]): this
  insertBefore(oldNode: Child | number, newNode: NewChild): this
  insertAfter(oldNode: Child | number, newNode: NewChild): this
  removeChild(child: Child | number): this
  removeAll(): this
  replaceValues(pattern: RegExp | string, replaced: string | ((substring: string, ...args: any[]) => string)): this
  replaceValues(pattern: RegExp | string, options: ValueOptions, replaced: string | Function): this
  index(child: Child | number): number
  each(callback: (node: Child, index: number) => false | void): false | undefined
  walk(callback: (node: ChildNode, index: number) => false | void): false | undefined
  walkDecls(callback: (decl: Declaration, index: number) => false | void): false | undefined
  walkDecls(propFilter: RegExp | string, callback: (decl: Declaration, index: number) => false | void): false | undefined
  walkRules(callback: (rule: Rule, index: number) => false | void): false | undefined
  walkRules(selectorFilter: RegExp | string, callback: (rule: Rule, index: number) => false | void): false | undefined
  walkAtRules(callback: (atRule: AtRule, index: number) => false | void): false | undefined
  walkAtRules(nameFilter: RegExp | string, callback: (atRule: AtRule, index: number) => false | void): false | undefined
  walkComments(callback: (comment: Comment, index: number) => false | void): false | undefined
  every(condition: (node: Child, index: number, nodes: Child[]) => boolean): boolean
  some(condition: (node: Child, index: number, nodes: Child[]) => boolean): boolean
  push(child: Child): this
}
```

### Container Usage Examples

```javascript { .api }
import postcss from 'postcss'

const root = postcss.parse(`
  .foo { color: red; }
  .bar { color: blue; }
`)

// Add nodes
root.append(postcss.rule({ selector: '.new' }))
root.prepend(postcss.comment({ text: 'Header comment' }))

// Insert relative to existing nodes
const fooRule = root.first
root.insertAfter(fooRule, postcss.rule({ selector: '.after-foo' }))
root.insertBefore(fooRule, postcss.rule({ selector: '.before-foo' }))

// Remove nodes
root.removeChild(0)  // Remove first child
root.removeAll()     // Remove all children

// Iterate over children
root.each((node, index) => {
  console.log(`${index}: ${node.type}`)
})

// Walk all descendants
root.walk(node => {
  if (node.type === 'decl' && node.prop === 'color') {
    node.value = 'green'
  }
})

// Walk specific node types
root.walkRules(rule => {
  rule.selector = rule.selector.replace(/^\./, '.prefix-')
})

root.walkDecls('margin', decl => {
  decl.value = '0'
})

root.walkAtRules('media', atRule => {
  console.log(`Media query: ${atRule.params}`)
})

// Replace values in all declarations
root.replaceValues(/red/g, 'blue')
root.replaceValues(/(\d+)px/, { props: ['font-size'] }, '$1rem')
```

## Root

Represents the CSS stylesheet root containing all top-level rules and at-rules.

```typescript { .api }
import { Root, Container, Document, ProcessOptions, Result, RootRaws, ContainerProps } from 'postcss'

class Root extends Container {
  type: 'root'
  nodes: NonNullable<Container['nodes']>
  parent?: Document
  raws: RootRaws

  toResult(options?: ProcessOptions): Result
}

interface RootRaws {
  after?: string
  semicolon?: boolean
  codeBefore?: string
  codeAfter?: string
}

interface RootProps extends ContainerProps {
  raws?: RootRaws
}
```

### Root Usage Examples

```javascript { .api }
import postcss from 'postcss'

// Create root node
const root = postcss.root()

// Add CSS structures
root.append(
  postcss.comment({ text: 'Main stylesheet' }),
  postcss.rule({ 
    selector: '.container',
    nodes: [
      postcss.decl({ prop: 'max-width', value: '1200px' }),
      postcss.decl({ prop: 'margin', value: '0 auto' })
    ]
  }),
  postcss.atRule({
    name: 'media',
    params: 'screen and (max-width: 768px)',
    nodes: [
      postcss.rule({
        selector: '.container',
        nodes: [postcss.decl({ prop: 'max-width', value: '100%' })]
      })
    ]
  })
)

// Convert to result with processing options
const result = root.toResult({
  to: 'output.css',
  map: { inline: false }
})

console.log(result.css)
console.log(result.map.toString())
```

## Rule

Represents CSS rules with selectors and declarations.

```typescript { .api }
import { Rule, Container, ContainerWithChildren, RuleRaws, ContainerProps } from 'postcss'

class Rule extends Container {
  type: 'rule'
  selector: string
  selectors: string[]
  nodes: NonNullable<Container['nodes']>
  parent?: ContainerWithChildren
  raws: RuleRaws
}

interface RuleRaws {
  before?: string
  after?: string
  between?: string
  semicolon?: boolean
  ownSemicolon?: string
  selector?: { value: string, raw: string }
}

interface RuleProps extends ContainerProps {
  selector?: string
  selectors?: string[]
  raws?: RuleRaws
}
```

### Rule Usage Examples

```javascript { .api }
import postcss from 'postcss'

// Create rule
const rule = postcss.rule({ selector: '.example' })

// Work with selectors
rule.selector = '.foo, .bar'
console.log(rule.selectors) // ['.foo', '.bar']

rule.selectors = ['.baz', '.qux']
console.log(rule.selector)  // '.baz, .qux'

// Add declarations
rule.append(
  postcss.decl({ prop: 'color', value: 'red' }),
  postcss.decl({ prop: 'font-size', value: '16px' })
)

// Modify existing declarations
rule.walkDecls(decl => {
  if (decl.prop === 'color') {
    decl.value = 'blue'
  }
})

// Clone rule with modifications
const cloned = rule.clone({
  selector: '.modified',
  raws: { before: '\n  ' }
})
```

## Declaration

Represents CSS property declarations (property-value pairs).

```typescript { .api }
import { Declaration, Node, ContainerWithChildren, DeclarationRaws } from 'postcss'

class Declaration extends Node {
  type: 'decl'
  prop: string
  value: string
  important: boolean
  variable: boolean     // Getter: is CSS variable (starts with -- or $)
  parent?: ContainerWithChildren
  raws: DeclarationRaws
}

interface DeclarationRaws {
  before?: string
  between?: string
  important?: string
  value?: { value: string, raw: string }
}

interface DeclarationProps {
  prop: string
  value: string
  important?: boolean
  raws?: DeclarationRaws
}
```

### Declaration Usage Examples

```javascript { .api }
import postcss from 'postcss'

// Create declaration
const decl = postcss.decl({ 
  prop: 'color', 
  value: 'red',
  important: true
})

console.log(decl.toString()) // 'color: red !important'

// Check if variable
const customProp = postcss.decl({ prop: '--main-color', value: 'blue' })
console.log(customProp.variable) // true

const sassProp = postcss.decl({ prop: '$primary', value: 'green' })  
console.log(sassProp.variable) // true

// Modify declaration
decl.prop = 'background-color'
decl.value = 'blue'
decl.important = false

// Work with raw values
decl.raws.between = ': ' // space after colon
decl.raws.important = ' !important' // custom important format
```

## AtRule

Represents CSS at-rules like @media, @import, @keyframes, etc.

```typescript { .api }
import { AtRule, Container, ContainerWithChildren, AtRuleRaws, ContainerProps } from 'postcss'

class AtRule extends Container {
  type: 'atrule'
  name: string
  params: string
  nodes?: Container['nodes']    // undefined for statement at-rules
  parent?: ContainerWithChildren
  raws: AtRuleRaws
}

interface AtRuleRaws {
  before?: string
  after?: string
  between?: string
  afterName?: string
  semicolon?: boolean
  params?: { value: string, raw: string }
}

interface AtRuleProps extends ContainerProps {
  name: string
  params?: string | number
  raws?: AtRuleRaws
}
```

### AtRule Usage Examples

```javascript { .api }
import postcss from 'postcss'

// Create block at-rule (with children)
const mediaRule = postcss.atRule({
  name: 'media',
  params: 'screen and (max-width: 768px)'
})

mediaRule.append(
  postcss.rule({
    selector: '.mobile-only',
    nodes: [postcss.decl({ prop: 'display', value: 'block' })]
  })
)

// Create statement at-rule (no children)
const importRule = postcss.atRule({
  name: 'import',
  params: '"styles.css"'
})
// importRule.nodes is undefined

// Keyframes example
const keyframes = postcss.atRule({
  name: 'keyframes',
  params: 'slideIn'
})

keyframes.append(
  postcss.rule({
    selector: '0%',
    nodes: [postcss.decl({ prop: 'transform', value: 'translateX(-100%)' })]
  }),
  postcss.rule({
    selector: '100%',
    nodes: [postcss.decl({ prop: 'transform', value: 'translateX(0)' })]
  })
)

// Check if at-rule has children
console.log(mediaRule.nodes !== undefined)  // true (block at-rule)
console.log(importRule.nodes !== undefined) // false (statement at-rule)
```

## Comment

Represents CSS comments.

```typescript { .api }
import { Comment, Node, Container, CommentRaws, NodeProps } from 'postcss'

class Comment extends Node {
  type: 'comment'
  text: string
  parent?: Container
  raws: CommentRaws
}

interface CommentRaws {
  before?: string
  left?: string
  right?: string
}

interface CommentProps extends NodeProps {
  text: string
  raws?: CommentRaws
}
```

### Comment Usage Examples

```javascript { .api }
import postcss from 'postcss'

// Create comment
const comment = postcss.comment({ text: 'This is a comment' })
console.log(comment.toString()) // '/* This is a comment */'

// Comments with custom formatting
const comment2 = postcss.comment({
  text: 'Multiline\ncomment',
  raws: {
    before: '\n',
    left: ' ',
    right: ' '
  }
})

// Add comments to CSS
const root = postcss.root()
root.append(
  postcss.comment({ text: 'Header comment' }),
  postcss.rule({ selector: '.foo' }),
  postcss.comment({ text: 'Footer comment' })
)

// Find and modify comments
root.walkComments(comment => {
  if (comment.text.includes('TODO')) {
    comment.text = comment.text.replace('TODO', 'DONE')
  }
})
```

## Document

Represents a document containing multiple CSS roots (used for CSS-in-JS, etc.).

```typescript { .api }
import { Document, Container, Root, ProcessOptions, Result, ContainerProps } from 'postcss'

class Document extends Container<Root> {
  type: 'document'
  nodes: Root[]
  parent: undefined
  raws: Record<string, any>

  toResult(options?: ProcessOptions): Result
}

interface DocumentProps extends ContainerProps {
  nodes?: Root[]
  raws?: Record<string, any>
}
```

### Document Usage Examples

```javascript { .api }
import postcss from 'postcss'

// Create document with multiple roots
const doc = postcss.document()

// Add CSS roots
doc.append(
  postcss.root([
    postcss.rule({ selector: '.component-a' })
  ]),
  postcss.root([
    postcss.rule({ selector: '.component-b' })
  ])
)

// Process document
const processor = postcss([require('autoprefixer')])
const result = processor.process(doc)

// Each root is processed separately
doc.each(root => {
  console.log(`Root contains ${root.nodes.length} nodes`)
})

// Convert to result
const docResult = doc.toResult({ to: 'output.css' })
```

## Node Construction Helpers

PostCSS provides helper functions for creating nodes:

```javascript { .api }
import postcss from 'postcss'

// Create nodes using factory functions
const root = postcss.root()
const rule = postcss.rule({ selector: '.example' })
const decl = postcss.decl({ prop: 'color', value: 'red' })
const atRule = postcss.atRule({ name: 'media', params: 'screen' })
const comment = postcss.comment({ text: 'Example comment' })
const document = postcss.document()

// Access node constructors directly
const Rule = postcss.Rule
const Declaration = postcss.Declaration
const AtRule = postcss.AtRule
const Comment = postcss.Comment
const Root = postcss.Root
const Document = postcss.Document

// Create using constructors
const rule2 = new Rule({ selector: '.another' })
const decl2 = new Declaration({ prop: 'font-size', value: '16px' })

// Create with complete node options
const ruleWithSource = postcss.rule({
  selector: '.example',
  source: {
    input: inputObject,
    start: { line: 1, column: 1, offset: 0 },
    end: { line: 1, column: 15, offset: 14 }
  },
  raws: {
    before: '\n  ',
    between: ' ',
    after: '\n'
  }
})

// Create nodes with children
const mediaRule = postcss.atRule({
  name: 'media',
  params: 'screen and (max-width: 768px)',
  nodes: [
    postcss.rule({
      selector: '.mobile',
      nodes: [
        postcss.decl({ prop: 'display', value: 'block' })
      ]
    })
  ]
})
```

## Node Type Checking

```javascript { .api }
import postcss from 'postcss'

const root = postcss.parse('.foo { color: red; } /* comment */')

root.walk(node => {
  switch (node.type) {
    case 'rule':
      console.log(`Rule: ${node.selector}`)
      break
    case 'decl':
      console.log(`Declaration: ${node.prop}: ${node.value}`)
      break
    case 'atrule':
      console.log(`At-rule: @${node.name} ${node.params}`)
      break
    case 'comment':
      console.log(`Comment: ${node.text}`)
      break
  }
})

// Type-safe checking
if (node.type === 'rule') {
  // TypeScript knows this is a Rule
  console.log(node.selector)
}
```

## Advanced AST Manipulation

```javascript { .api }
import postcss from 'postcss'

const root = postcss.parse(`
  .container {
    display: flex;
    gap: 1rem;
  }
  @media (max-width: 768px) {
    .container {
      display: block;
    }
  }
`)

// Complex traversal and modification
root.walkRules(rule => {
  // Add responsive prefix to mobile rules
  if (rule.parent.type === 'atrule' && rule.parent.name === 'media') {
    rule.selector = `.mobile-${rule.selector.slice(1)}`
  }
  
  // Convert flex containers to grid
  rule.walkDecls('display', decl => {
    if (decl.value === 'flex') {
      decl.value = 'grid'
      
      // Add grid-specific properties
      const gapDecl = rule.nodes.find(n => n.type === 'decl' && n.prop === 'gap')
      if (gapDecl) {
        rule.insertAfter(gapDecl, postcss.decl({ 
          prop: 'grid-template-columns', 
          value: 'repeat(auto-fit, minmax(200px, 1fr))' 
        }))
      }
    }
  })
})

console.log(root.toString())
```