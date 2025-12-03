# Utilities

PostCSS provides several utility modules and functions for working with CSS values and AST manipulation. This document covers the list module for value parsing and other utility functions.

## List Module

The list module provides safe parsing and splitting of CSS values, handling quoted strings, functions, and complex syntax correctly.

```typescript { .api }
import { list } from 'postcss'

interface List {
  comma(str: string): string[]
  space(str: string): string[]
  split(string: string, separators: string[], last?: boolean): string[]
}
```

### Comma-Separated Values

Split values separated by commas, commonly used for multiple values like `font-family`, `background-image`, etc.

```javascript { .api }
import { list } from 'postcss'

// Basic comma separation
const fonts = list.comma('Arial, "Helvetica Neue", sans-serif')
console.log(fonts)
// Result: ['Arial', '"Helvetica Neue"', 'sans-serif']

// Complex values with functions
const backgrounds = list.comma('url("bg1.jpg"), linear-gradient(red, blue), #fff')
console.log(backgrounds)
// Result: ['url("bg1.jpg")', 'linear-gradient(red, blue)', '#fff']

// Handle empty values
const empty = list.comma('')
console.log(empty) // Result: ['']

const single = list.comma('single-value')
console.log(single) // Result: ['single-value']

// Values with nested commas (inside functions)
const complex = list.comma('rgba(255, 0, 0, 0.5), rgb(0, 255, 0)')
console.log(complex)
// Result: ['rgba(255, 0, 0, 0.5)', 'rgb(0, 255, 0)']
```

### Space-Separated Values

Split values separated by spaces, commonly used for shorthand properties like `margin`, `padding`, `font`, etc.

```javascript { .api }
import { list } from 'postcss'

// Basic space separation
const margins = list.space('10px 20px 30px 40px')
console.log(margins)
// Result: ['10px', '20px', '30px', '40px']

// Handle multiple spaces
const paddings = list.space('1em  2em   3em')
console.log(paddings)
// Result: ['1em', '2em', '3em']

// Values with quotes
const fontFamily = list.space('"Times New Roman" serif')
console.log(fontFamily)
// Result: ['"Times New Roman"', 'serif']

// Complex font shorthand
const font = list.space('bold 16px/1.5 "Helvetica Neue", Arial, sans-serif')
console.log(font)
// Result: ['bold', '16px/1.5', '"Helvetica Neue",', 'Arial,', 'sans-serif']

// Values with functions
const transform = list.space('translate(10px, 20px) rotate(45deg) scale(1.2)')
console.log(transform)
// Result: ['translate(10px, 20px)', 'rotate(45deg)', 'scale(1.2)']
```

### Custom Splitting

Split by custom separators with fine control over behavior.

```typescript { .api }
list.split(string: string, separators: string[], last?: boolean): string[]
```

```javascript { .api }
import { list } from 'postcss'

// Split by custom separator
const values = list.split('a|b|c', ['|'], false)
console.log(values) // Result: ['a', 'b', 'c']

// Split by multiple separators
const mixed = list.split('a|b;c|d', ['|', ';'], false)
console.log(mixed) // Result: ['a', 'b', 'c', 'd']

// Keep last separator (useful for trailing separators)
const trailing = list.split('a|b|c|', ['|'], true)
console.log(trailing) // Result: ['a', 'b', 'c', '']

// Complex example with slash separator
const fontSizes = list.split('16px/1.5', ['/'], false)
console.log(fontSizes) // Result: ['16px', '1.5']
```

## Value Processing Utilities

### Safe Value Parsing

```javascript { .api }
import postcss, { list } from 'postcss'

function parseMarginValue(value) {
  const parts = list.space(value)
  
  switch (parts.length) {
    case 1:
      return { top: parts[0], right: parts[0], bottom: parts[0], left: parts[0] }
    case 2:
      return { top: parts[0], right: parts[1], bottom: parts[0], left: parts[1] }
    case 3:
      return { top: parts[0], right: parts[1], bottom: parts[2], left: parts[1] }
    case 4:
      return { top: parts[0], right: parts[1], bottom: parts[2], left: parts[3] }
    default:
      throw new Error(`Invalid margin value: ${value}`)
  }
}

// Usage in plugin
const marginPlugin = () => ({
  postcssPlugin: 'margin-plugin',
  Declaration(decl) {
    if (decl.prop === 'margin') {
      try {
        const parsed = parseMarginValue(decl.value)
        console.log(`Margin: top=${parsed.top}, right=${parsed.right}`)
      } catch (error) {
        console.warn(`Failed to parse margin: ${error.message}`)
      }
    }
  }
})
```

### Transform Values

```javascript { .api }
import { list } from 'postcss'

function transformFontFamily(value) {
  return list.comma(value)
    .map(family => {
      // Remove quotes from generic families
      if (['serif', 'sans-serif', 'monospace', 'cursive', 'fantasy'].includes(family)) {
        return family
      }
      
      // Ensure custom families are quoted
      if (!family.startsWith('"') && !family.startsWith("'")) {
        return `"${family}"`
      }
      
      return family
    })
    .join(', ')
}

const fontFamilyPlugin = () => ({
  postcssPlugin: 'font-family-plugin',
  Declaration(decl) {
    if (decl.prop === 'font-family') {
      decl.value = transformFontFamily(decl.value)
    }
  }
})

// Example transformation:
// Input:  font-family: Arial, Helvetica Neue, sans-serif
// Output: font-family: "Arial", "Helvetica Neue", sans-serif
```

### Value Validation

```javascript { .api }
import { list } from 'postcss'

function validateBoxShadow(value) {
  const shadows = list.comma(value)
  
  return shadows.every(shadow => {
    if (shadow === 'none') return true
    
    const parts = list.space(shadow)
    // Basic validation: at least 2 values (offset-x, offset-y)
    if (parts.length < 2) return false
    
    // Check for valid length values
    const lengthPattern = /^-?\d+(\.\d+)?(px|em|rem|%|vw|vh|cm|mm|in|pt|pc)$/
    return parts.slice(0, 4).every(part => {
      return lengthPattern.test(part) || part === 'inset' || isColor(part)
    })
  })
}

function isColor(value) {
  return /^(#[0-9a-f]{3,6}|rgb\(|rgba\(|hsl\(|hsla\(|[a-z]+)$/i.test(value)
}

const validationPlugin = () => ({
  postcssPlugin: 'validation-plugin',
  Declaration(decl, { result }) {
    if (decl.prop === 'box-shadow') {
      if (!validateBoxShadow(decl.value)) {
        result.warn('Invalid box-shadow syntax', { node: decl })
      }
    }
  }
})
```

## Advanced List Operations

### Merge and Deduplicate

```javascript { .api }
import { list } from 'postcss'

function mergeAndDeduplicateValues(value1, value2, separator = 'space') {
  const split = separator === 'comma' ? list.comma : list.space
  const join = separator === 'comma' ? ', ' : ' '
  
  const values1 = split(value1)
  const values2 = split(value2)
  const merged = [...values1, ...values2]
  
  // Remove duplicates while preserving order
  const unique = merged.filter((value, index) => merged.indexOf(value) === index)
  
  return unique.join(join)
}

// Example usage
const fonts1 = 'Arial, sans-serif'
const fonts2 = '"Helvetica Neue", Arial, monospace'
const mergedFonts = mergeAndDeduplicateValues(fonts1, fonts2, 'comma')
console.log(mergedFonts) // 'Arial, sans-serif, "Helvetica Neue", monospace'
```

### Convert Between Formats

```javascript { .api }
import { list } from 'postcss'

function convertShorthandToLonghand(property, value) {
  const conversions = {
    margin: ['margin-top', 'margin-right', 'margin-bottom', 'margin-left'],
    padding: ['padding-top', 'padding-right', 'padding-bottom', 'padding-left'],
    'border-width': ['border-top-width', 'border-right-width', 'border-bottom-width', 'border-left-width']
  }
  
  const properties = conversions[property]
  if (!properties) return null
  
  const values = list.space(value)
  const expanded = {}
  
  switch (values.length) {
    case 1:
      properties.forEach(prop => expanded[prop] = values[0])
      break
    case 2:
      expanded[properties[0]] = values[0] // top
      expanded[properties[1]] = values[1] // right
      expanded[properties[2]] = values[0] // bottom
      expanded[properties[3]] = values[1] // left
      break
    case 3:
      expanded[properties[0]] = values[0] // top
      expanded[properties[1]] = values[1] // right
      expanded[properties[2]] = values[2] // bottom
      expanded[properties[3]] = values[1] // left
      break
    case 4:
      properties.forEach((prop, i) => expanded[prop] = values[i])
      break
  }
  
  return expanded
}

const expandPlugin = () => ({
  postcssPlugin: 'expand-plugin',
  Declaration(decl) {
    const expanded = convertShorthandToLonghand(decl.prop, decl.value)
    if (expanded) {
      // Replace shorthand with longhand properties
      Object.entries(expanded).forEach(([prop, value]) => {
        decl.parent.insertAfter(decl, { prop, value })
      })
      decl.remove()
    }
  }
})
```

## Working with Function Values

```javascript { .api }
import { list } from 'postcss'

function parseFunctionValue(value) {
  const match = value.match(/^([a-z-]+)\((.*)\)$/i)
  if (!match) return null
  
  const [, name, args] = match
  const argList = list.comma(args)
  
  return { name, args: argList }
}

function createFunctionValue(name, args) {
  const argString = Array.isArray(args) ? args.join(', ') : args
  return `${name}(${argString})`
}

// Example: Transform calc() functions
const calcPlugin = () => ({
  postcssPlugin: 'calc-plugin',
  Declaration(decl) {
    if (decl.value.includes('calc(')) {
      const parts = list.space(decl.value)
      const transformed = parts.map(part => {
        const func = parseFunctionValue(part)
        if (func && func.name === 'calc') {
          // Transform calc(10px + 5px) to calc(15px)
          const expression = func.args[0]
          const simplified = simplifyCalcExpression(expression)
          return createFunctionValue('calc', [simplified])
        }
        return part
      })
      
      decl.value = transformed.join(' ')
    }
  }
})

function simplifyCalcExpression(expression) {
  // Basic simplification - in real plugin would use proper math parser
  const match = expression.match(/^(\d+)px\s*\+\s*(\d+)px$/)
  if (match) {
    const sum = parseInt(match[1]) + parseInt(match[2])
    return `${sum}px`
  }
  return expression
}
```

## URL and Path Utilities

```javascript { .api }
import { list } from 'postcss'
import path from 'path'

function extractUrls(value) {
  const urls = []
  const urlRegex = /url\(['"]?(.*?)['"]?\)/g
  let match
  
  while ((match = urlRegex.exec(value)) !== null) {
    urls.push(match[1])
  }
  
  return urls
}

function replaceUrls(value, replaceFn) {
  return value.replace(/url\(['"]?(.*?)['"]?\)/g, (match, url) => {
    const newUrl = replaceFn(url)
    const quote = match.includes('"') ? '"' : match.includes("'") ? "'" : ''
    return `url(${quote}${newUrl}${quote})`
  })
}

const urlPlugin = (options = {}) => ({
  postcssPlugin: 'url-plugin',
  Declaration(decl) {
    if (decl.value.includes('url(')) {
      const urls = extractUrls(decl.value)
      
      // Process each URL
      urls.forEach(url => {
        if (options.resolve && !url.startsWith('http')) {
          // Resolve relative paths
          const absolutePath = path.resolve(options.basePath || '', url)
          decl.value = replaceUrls(decl.value, (u) => 
            u === url ? absolutePath : u
          )
        }
      })
    }
  }
})
```

## Performance Considerations

```javascript { .api }
import { list } from 'postcss'

// Cache parsed values for better performance
const valueCache = new Map()

function cachedParse(value, type = 'space') {
  const key = `${type}:${value}`
  
  if (valueCache.has(key)) {
    return valueCache.get(key)
  }
  
  const result = type === 'comma' ? list.comma(value) : list.space(value)
  valueCache.set(key, result)
  
  return result
}

// Batch process values
function processDeclarations(declarations, processor) {
  const batches = new Map()
  
  // Group by value type
  declarations.forEach(decl => {
    const type = getValueType(decl.prop)
    if (!batches.has(type)) batches.set(type, [])
    batches.get(type).push(decl)
  })
  
  // Process each batch
  batches.forEach((decls, type) => {
    decls.forEach(decl => {
      const parsed = cachedParse(decl.value, type)
      processor(decl, parsed, type)
    })
  })
}

function getValueType(prop) {
  const commaProps = ['font-family', 'background-image', 'transition', 'animation']
  const spaceProps = ['margin', 'padding', 'border-width', 'font']
  
  if (commaProps.some(p => prop.includes(p))) return 'comma'
  if (spaceProps.some(p => prop.includes(p))) return 'space'
  return 'space' // default
}
```

## Integration Examples

### Complete Value Processing Pipeline

```javascript { .api }
import postcss, { list } from 'postcss'

const valueProcessingPlugin = (options = {}) => ({
  postcssPlugin: 'value-processing',
  
  Declaration(decl, { result }) {
    try {
      // Parse value based on property type
      const parsed = parseDeclarationValue(decl)
      
      // Validate parsed value
      if (!validateParsedValue(decl.prop, parsed)) {
        result.warn(`Invalid value for ${decl.prop}`, { node: decl })
        return
      }
      
      // Transform value
      const transformed = transformValue(decl.prop, parsed, options)
      
      // Reconstruct value string
      decl.value = reconstructValue(transformed, getValueType(decl.prop))
      
    } catch (error) {
      result.warn(`Failed to process ${decl.prop}: ${error.message}`, { node: decl })
    }
  }
})

function parseDeclarationValue(decl) {
  const type = getValueType(decl.prop)
  const parsed = type === 'comma' ? list.comma(decl.value) : list.space(decl.value)
  
  return {
    type,
    values: parsed,
    original: decl.value
  }
}

function validateParsedValue(prop, parsed) {
  // Add validation logic based on CSS specification
  if (prop === 'margin' && parsed.values.length > 4) return false
  if (prop === 'font-family' && parsed.values.length === 0) return false
  return true
}

function transformValue(prop, parsed, options) {
  return {
    ...parsed,
    values: parsed.values.map(value => {
      // Apply transformations based on options
      if (options.convertUnits && value.endsWith('px')) {
        return convertPxToRem(value)
      }
      if (options.normalizeQuotes && isQuoted(value)) {
        return normalizeQuotes(value)
      }
      return value
    })
  }
}

function reconstructValue(transformed, type) {
  const separator = type === 'comma' ? ', ' : ' '
  return transformed.values.join(separator)
}

function convertPxToRem(value) {
  const px = parseFloat(value)
  const rem = px / 16
  return `${rem}rem`
}

function normalizeQuotes(value) {
  return value.replace(/'/g, '"')
}

function isQuoted(value) {
  return (value.startsWith('"') && value.endsWith('"')) || 
         (value.startsWith("'") && value.endsWith("'"))
}
```