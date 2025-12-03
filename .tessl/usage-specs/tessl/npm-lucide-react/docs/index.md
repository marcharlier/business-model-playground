# Lucide React

Lucide React is a comprehensive icon library package for React applications that provides SVG icons as tree-shakable React components. It offers a complete implementation of the Lucide icon collection with customizable styling, sizing, and color properties, designed for maximum performance and flexibility with zero dependencies beyond React.

## Package Information

- **Package Name**: lucide-react
- **Package Type**: npm
- **Language**: TypeScript
- **Installation**: `npm install lucide-react`

## Core Imports

```typescript
import { Camera, Grid, Pen } from "lucide-react";
import { Icon } from "lucide-react";
import { createLucideIcon } from "lucide-react";
import { icons } from "lucide-react";
```

For CommonJS:

```javascript
const { Camera, Grid, Pen, Icon } = require("lucide-react");
```

Dynamic imports:

```typescript
import { DynamicIcon, iconNames } from "lucide-react/dynamic";
```

## Basic Usage

```typescript
import { Camera, Grid, Pen } from "lucide-react";

// Basic icon usage
const App = () => {
  return (
    <div>
      <Camera />
      <Grid size={32} color="blue" />
      <Pen strokeWidth={3} className="my-icon" />
    </div>
  );
};
```

## Architecture

Lucide React is built around several key components:

- **Icon Components**: Individual icon components (e.g., `Camera`, `Grid`) created from SVG data
- **Base Icon Component**: Core `Icon` component that renders SVG from icon node data
- **Dynamic Loading**: `DynamicIcon` component for runtime icon selection by name
- **Icon Factory**: `createLucideIcon` function for creating new icon components
- **Type System**: Complete TypeScript definitions with `LucideProps` and `IconNode` types
- **Tree-shaking**: ES modules structure ensuring only imported icons are bundled

## Capabilities

### Static Icon Components

Individual React components for each Lucide icon, optimized for tree-shaking and static imports. Perfect for when you know which icons you need at build time.

```typescript { .api }
type LucideIcon = ForwardRefExoticComponent<
  Omit<LucideProps, 'ref'> & RefAttributes<SVGSVGElement>
>;

interface LucideProps extends ElementAttributes {
  size?: string | number;
  absoluteStrokeWidth?: boolean;
}
```

[Static Icons](./static-icons.md)

### Dynamic Icon Loading

Runtime icon loading system for displaying icons based on string names. Useful for CMS-driven applications or when icon selection is determined at runtime.

```typescript { .api }
function DynamicIcon(props: DynamicIconProps): JSX.Element;

interface DynamicIconProps extends LucideProps {
  name: IconName;
  fallback?: () => JSX.Element | null;
}

type IconName = keyof typeof dynamicIconImports;
const iconNames: Array<IconName>;
const dynamicIconImports: Record<string, () => Promise<DynamicIconModule>>;

interface DynamicIconModule {
  default: LucideIcon;
  __iconNode: IconNode;
}
```

[Dynamic Icons](./dynamic-icons.md)

### Custom Icon Creation

System for creating custom icon components from icon data, supporting Lucide Lab icons and custom SVG definitions.

```typescript { .api }
function Icon(props: IconComponentProps): JSX.Element;
function createLucideIcon(iconName: string, iconNode: IconNode): LucideIcon;

interface IconComponentProps extends LucideProps {
  iconNode: IconNode;
}

type IconNode = [elementName: SVGElementType, attrs: Record<string, string>][];
```

[Custom Icons](./custom-icons.md)

## Types

```typescript { .api }
import type { SVGProps, ForwardRefExoticComponent, RefAttributes } from 'react';
type SVGElementType =
  | 'circle'
  | 'ellipse' 
  | 'g'
  | 'line'
  | 'path'
  | 'polygon'
  | 'polyline'
  | 'rect';

type IconNode = [elementName: SVGElementType, attrs: Record<string, string>][];

type SVGAttributes = Partial<SVGProps<SVGSVGElement>>;
type ElementAttributes = RefAttributes<SVGSVGElement> & SVGAttributes;

interface LucideProps extends ElementAttributes {
  size?: string | number;
  absoluteStrokeWidth?: boolean;
}

type LucideIcon = ForwardRefExoticComponent<
  Omit<LucideProps, 'ref'> & RefAttributes<SVGSVGElement>
>;
```