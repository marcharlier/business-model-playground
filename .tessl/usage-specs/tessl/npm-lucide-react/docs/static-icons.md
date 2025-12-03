# Static Icon Components

Individual React components for each Lucide icon, optimized for tree-shaking and static imports. Each icon is a separate component that can be imported directly, ensuring only the icons you use are included in your bundle.

## Capabilities

### Individual Icon Components

Each Lucide icon is available as a named export from the main package. Icons are named in PascalCase (e.g., `AirVent`, `Camera`, `Grid`).

```typescript { .api }
import type { SVGProps, ForwardRefExoticComponent, RefAttributes } from 'react';

type ElementAttributes = RefAttributes<SVGSVGElement> & Partial<SVGProps<SVGSVGElement>>;

/**
 * Individual icon components with consistent API
 * All icons support the same props and are forwardRef components
 */
type LucideIcon = ForwardRefExoticComponent<
  Omit<LucideProps, 'ref'> & RefAttributes<SVGSVGElement>
>;

interface LucideProps extends ElementAttributes {
  /** Icon size in pixels or CSS units */
  size?: string | number;
  /** Use absolute stroke width (adjusts for icon size) */
  absoluteStrokeWidth?: boolean;
}

type ElementAttributes = RefAttributes<SVGSVGElement> & SVGAttributes;
type SVGAttributes = Partial<SVGProps<SVGSVGElement>>;
```

**Usage Examples:**

```typescript
import { Camera, Grid, Pen, AirVent } from "lucide-react";

// Basic usage with default props
<Camera />

// Customized with props
<Grid 
  size={32} 
  color="blue" 
  strokeWidth={3} 
  className="my-icon"
/>

// Using size as string
<Pen size="2rem" />

// Absolute stroke width (maintains visual weight at different sizes)
<AirVent size={16} absoluteStrokeWidth={true} />
```

### Icon Props

All icon components accept the same standardized props for consistent styling.

#### Size Property

```typescript { .api }
/**
 * Controls the width and height of the icon
 * @param size - Number in pixels or string with CSS units
 * @default 24
 */
size?: string | number;
```

**Usage Examples:**

```typescript
// Number (pixels)
<Camera size={48} />

// String with units
<Camera size="2rem" />
<Camera size="100%" />
<Camera size="2.5em" />
```

#### Color and Stroke Properties

Icons inherit standard SVG stroke properties for styling.

```typescript { .api }
/**
 * Standard SVG stroke properties
 * Icons use stroke-based rendering with default attributes
 */
color?: string;        // Alias for stroke
stroke?: string;       // SVG stroke color
strokeWidth?: number;  // SVG stroke width
fill?: string;         // SVG fill color
```

**Usage Examples:**

```typescript
// Color variants
<Camera color="red" />
<Camera stroke="#3B82F6" />
<Camera color="currentColor" /> // Default - inherits text color

// Stroke width
<Camera strokeWidth={1} />   // Thin
<Camera strokeWidth={3} />   // Bold

// Fill (most icons are stroke-based, but some support fill)
<Camera fill="none" />       // Default
<Camera fill="currentColor" />
```

#### Absolute Stroke Width

```typescript { .api }
/**
 * Maintains consistent visual stroke width across different icon sizes
 * @param absoluteStrokeWidth - When true, stroke width is adjusted based on icon size
 * @default false
 */
absoluteStrokeWidth?: boolean;
```

**Usage Examples:**

```typescript
// Standard behavior - stroke scales with icon
<Camera size={16} strokeWidth={2} />  // Thin strokes
<Camera size={48} strokeWidth={2} />  // Thick strokes

// Absolute stroke width - maintains visual consistency
<Camera size={16} strokeWidth={2} absoluteStrokeWidth={true} />  // Stroke adjusted
<Camera size={48} strokeWidth={2} absoluteStrokeWidth={true} />  // Same visual weight
```

### Default Attributes

All icons inherit these default SVG attributes:

```typescript { .api }
/**
 * Default SVG attributes applied to all icons
 * These can be overridden by passing props
 */
interface DefaultAttributes {
  xmlns: "http://www.w3.org/2000/svg";
  width: 24;
  height: 24;
  viewBox: "0 0 24 24";
  fill: "none";
  stroke: "currentColor";
  strokeWidth: 2;
  strokeLinecap: "round";
  strokeLinejoin: "round";
}
```

### SVG Attributes Support

Icon components accept all standard SVG element attributes for advanced customization.

```typescript { .api }
/**
 * All standard SVG element attributes are supported
 * Icons are rendered as <svg> elements
 */
interface SVGSupport extends SVGProps<SVGSVGElement> {
  // Common SVG attributes
  className?: string;
  style?: CSSProperties;
  transform?: string;
  opacity?: number;
  filter?: string;
  mask?: string;
  clipPath?: string;
  // ... all other SVG attributes
}
```

**Usage Examples:**

```typescript
// CSS classes and styles
<Camera className="icon-class" style={{ marginRight: '8px' }} />

// SVG transformations
<Camera transform="rotate(45)" />

// Accessibility
<Camera role="img" aria-label="Camera icon" />
<Camera aria-hidden="true" />  // Decorative icons

// Advanced SVG properties
<Camera opacity={0.5} filter="drop-shadow(2px 2px 4px rgba(0,0,0,0.3))" />
```

### Ref Support

All icon components support React refs using `forwardRef`.

```typescript { .api }
/**
 * Icons support refs to access the underlying SVG element
 * Useful for imperative operations like focus management
 */
const iconRef = useRef<SVGSVGElement>(null);
```

**Usage Examples:**

```typescript
import { useRef, useEffect } from 'react';
import { Camera } from 'lucide-react';

const MyComponent = () => {
  const iconRef = useRef<SVGSVGElement>(null);
  
  useEffect(() => {
    if (iconRef.current) {
      // Access SVG element directly
      iconRef.current.focus();
      console.log(iconRef.current.getBBox());
    }
  }, []);
  
  return <Camera ref={iconRef} />;
};
```

### Icon Naming Convention

Icons follow PascalCase naming derived from the original icon names:

```typescript { .api }
/**
 * Icon names are converted from kebab-case to PascalCase
 * Examples:
 * - "air-vent" -> AirVent
 * - "chevron-right" -> ChevronRight  
 * - "wifi-off" -> WifiOff
 */
```

### Icons Namespace

All icons are also available through the `icons` namespace export:

```typescript { .api }
/**
 * Namespace containing all icon components
 * Useful when you want to access icons programmatically
 */
import { icons } from "lucide-react";

// Access icons through namespace
const CameraIcon = icons.Camera;
const GridIcon = icons.Grid;
```

**Usage Examples:**

```typescript
import { icons } from "lucide-react";

// Programmatic icon access
const getIcon = (iconName: keyof typeof icons) => {
  return icons[iconName];
};

// Dynamic component selection
const IconDisplay = ({ name }: { name: keyof typeof icons }) => {
  const IconComponent = icons[name];
  return <IconComponent />;
};

// Icon picker/gallery
const IconGallery = () => (
  <div>
    {Object.entries(icons).map(([name, IconComponent]) => (
      <div key={name}>
        <IconComponent />
        <span>{name}</span>
      </div>
    ))}
  </div>
);
```

### Aliases

Some icons have alias exports for backward compatibility:

```typescript { .api }
/**
 * Icon aliases provide alternative names for the same icon
 * Useful for backward compatibility and alternative naming preferences
 */
import { Pen, Edit2 } from "lucide-react";  // Edit2 is alias for Pen
```