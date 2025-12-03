# Custom Icon Creation

System for creating custom icon components from icon data, supporting Lucide Lab icons, custom SVG definitions, and creating new Lucide-style icon components.

## Capabilities

### Icon Component

The base `Icon` component renders SVG icons from icon node data, supporting custom icons and Lucide Lab integration.

```typescript { .api }
import type { SVGProps, ForwardRefExoticComponent, RefAttributes } from 'react';

type ElementAttributes = RefAttributes<SVGSVGElement> & Partial<SVGProps<SVGSVGElement>>;

/**
 * Base icon component that renders SVG from IconNode data
 * @param props - Icon props including iconNode and standard LucideProps
 * @returns JSX.Element - Rendered SVG icon
 */
function Icon(props: IconComponentProps): JSX.Element;

interface IconComponentProps extends LucideProps {
  /** Icon data structure defining SVG elements */
  iconNode: IconNode;
  /** Optional children to add to the SVG */
  children?: React.ReactNode;
}

interface LucideProps extends ElementAttributes {
  size?: string | number;
  absoluteStrokeWidth?: boolean;
}

type IconNode = [elementName: SVGElementType, attrs: Record<string, string>][];

type SVGElementType =
  | 'circle'
  | 'ellipse'
  | 'g'
  | 'line'
  | 'path'
  | 'polygon'
  | 'polyline'
  | 'rect';
```

**Usage Examples:**

```typescript
import { Icon } from "lucide-react";

// Custom icon data
const customIconNode: IconNode = [
  ['path', { d: 'M12 2L2 7v10c0 5.55 3.84 10 9 10s9-4.45 9-10V7l-8-5z', key: 'custom1' }],
  ['path', { d: 'M12 8v8', key: 'custom2' }],
  ['path', { d: 'M8 12h8', key: 'custom3' }]
];

// Render custom icon
<Icon iconNode={customIconNode} size={32} color="blue" />

// With Lucide Lab icon
import { coconut } from '@lucide/lab';
<Icon iconNode={coconut} />

// With additional children
<Icon iconNode={customIconNode}>
  <circle cx="12" cy="12" r="2" fill="red" />
</Icon>
```

### createLucideIcon Function

Factory function to create reusable icon components from icon data.

```typescript { .api }
/**
 * Creates a reusable Lucide-style icon component from icon data
 * @param iconName - Name for the icon (used for CSS classes and display name)
 * @param iconNode - Icon data structure defining SVG elements
 * @returns LucideIcon - Reusable React component with forwardRef
 */
function createLucideIcon(iconName: string, iconNode: IconNode): LucideIcon;

type LucideIcon = ForwardRefExoticComponent<
  Omit<LucideProps, 'ref'> & RefAttributes<SVGSVGElement>
>;
```

**Usage Examples:**

```typescript
import { createLucideIcon } from "lucide-react";

// Define custom icon data
const heartIconNode: IconNode = [
  ['path', { 
    d: 'M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z',
    key: 'heart1'
  }]
];

// Create reusable component
const Heart = createLucideIcon('heart', heartIconNode);

// Use like any other Lucide icon
<Heart />
<Heart size={24} color="red" />
<Heart className="favorite-icon" />
```

### Icon Node Structure

The `IconNode` type defines how icon data is structured for rendering.

```typescript { .api }
/**
 * Icon node structure representing SVG elements
 * Each element is a tuple of [elementName, attributes]
 */
type IconNode = [elementName: SVGElementType, attrs: Record<string, string>][];

/**
 * Supported SVG element types for icon definitions
 */
type SVGElementType =
  | 'circle'    // <circle cx="12" cy="12" r="5" />
  | 'ellipse'   // <ellipse cx="12" cy="12" rx="5" ry="3" />  
  | 'g'         // <g transform="translate(2,2)">
  | 'line'      // <line x1="0" y1="0" x2="24" y2="24" />
  | 'path'      // <path d="M12 2L2 7v10..." />
  | 'polygon'   // <polygon points="12,2 22,7 22,17 12,22 2,17 2,7" />
  | 'polyline' // <polyline points="12,2 22,7 22,17" />
  | 'rect';     // <rect x="2" y="2" width="20" height="20" />

/**
 * Element attributes are key-value pairs
 * Common attributes: d, x, y, cx, cy, r, width, height, points, key
 */
type ElementAttributes = Record<string, string>;
```

**Usage Examples:**

```typescript
// Simple path icon
const simpleIcon: IconNode = [
  ['path', { d: 'M12 2v20', key: 'line1' }],
  ['path', { d: 'M2 12h20', key: 'line2' }]
];

// Complex icon with multiple elements
const complexIcon: IconNode = [
  ['rect', { x: '2', y: '2', width: '20', height: '20', rx: '5', key: 'bg' }],
  ['circle', { cx: '12', cy: '12', r: '3', key: 'center' }],
  ['path', { d: 'M12 1v6m0 10v6', key: 'vertical' }],
  ['path', { d: 'M1 12h6m10 0h6', key: 'horizontal' }]
];

// Group element for transformations
const groupIcon: IconNode = [
  ['g', { transform: 'translate(2,2) scale(0.8)', key: 'group' }],
  ['path', { d: 'M0 0h20v20H0z', key: 'square' }]
];
```

### Creating Icons from SVG

Convert existing SVG code to IconNode format for use with Lucide React.

```typescript { .api }
/**
 * Converting SVG to IconNode:
 * 1. Extract SVG elements (path, circle, etc.)
 * 2. Convert to [elementName, attributes] tuples
 * 3. Add unique 'key' attribute to each element
 * 4. Use with Icon component or createLucideIcon
 */
```

**Usage Examples:**

```typescript
// Original SVG
/*
<svg viewBox="0 0 24 24">
  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
</svg>
*/

// Converted to IconNode
const starIcon: IconNode = [
  ['path', { 
    d: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
    key: 'star'
  }]
];

// Create component
const Star = createLucideIcon('star', starIcon);

// Or use directly
<Icon iconNode={starIcon} />
```

### Icon Styling and Classes

Created icons automatically receive Lucide-style CSS classes and support all standard props.

```typescript { .api }
/**
 * Created icons automatically receive CSS classes:
 * - 'lucide' - Base class for all Lucide icons
 * - 'lucide-{icon-name}' - Specific class for the icon
 * - Additional classes from className prop
 */
```

**Usage Examples:**

```typescript
// Icon created with createLucideIcon gets automatic classes
const CustomIcon = createLucideIcon('my-custom-icon', iconNode);

// Results in classes: 'lucide lucide-my-custom-icon'
<CustomIcon />

// Additional classes
<CustomIcon className="my-extra-class" />
// Results in: 'lucide lucide-my-custom-icon my-extra-class'

// Direct Icon component also gets base class
<Icon iconNode={iconNode} className="custom-direct" />
// Results in: 'lucide custom-direct'
```

### Lucide Lab Integration

Use icons from Lucide Lab (experimental icons) with the Icon component.

```typescript { .api }
/**
 * Lucide Lab provides experimental icons not in the main library
 * Install: npm install @lucide/lab
 * Icons are provided as IconNode data ready for use
 */
```

**Usage Examples:**

```typescript
import { Icon } from "lucide-react";
import { coconut, avocado, mango } from "@lucide/lab";

// Use lab icons directly
<Icon iconNode={coconut} />
<Icon iconNode={avocado} size={32} color="green" />

// Create reusable components from lab icons
const Coconut = createLucideIcon('coconut', coconut);
const Avocado = createLucideIcon('avocado', avocado);

// Use like standard Lucide icons
<Coconut />
<Avocado size={24} />
```

### Default Attributes

Custom icons inherit the same default SVG attributes as built-in icons.

```typescript { .api }
/**
 * Default attributes applied to all custom icons:
 * - xmlns: "http://www.w3.org/2000/svg"
 * - width: 24, height: 24
 * - viewBox: "0 0 24 24"  
 * - fill: "none"
 * - stroke: "currentColor"
 * - strokeWidth: 2
 * - strokeLinecap: "round"
 * - strokeLinejoin: "round"
 */
```

### Accessibility

Custom icons support the same accessibility features as built-in icons.

```typescript { .api }
/**
 * Accessibility features:
 * - Automatic aria-hidden="true" for decorative icons
 * - Support for aria-label and role attributes
 * - Proper focus management with ref support
 */
```

**Usage Examples:**

```typescript
// Decorative icon (automatic aria-hidden)
<Icon iconNode={customIcon} />

// Semantic icon with label
<Icon 
  iconNode={customIcon}
  role="img"
  aria-label="Custom action"
/>

// Interactive icon
<button>
  <Icon iconNode={customIcon} aria-hidden="true" />
  <span className="sr-only">Perform action</span>
</button>
```