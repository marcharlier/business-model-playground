# Dynamic Icon Loading

Runtime icon loading system for displaying icons based on string names. The dynamic loading system is useful for CMS-driven applications or when icon selection is determined at runtime, but comes with the trade-off of including all icons in the bundle.

## Capabilities

### DynamicIcon Component

The `DynamicIcon` component loads icons dynamically by name at runtime.

```typescript { .api }
import type { SVGProps, RefAttributes } from 'react';

type ElementAttributes = RefAttributes<SVGSVGElement> & Partial<SVGProps<SVGSVGElement>>;

/**
 * Dynamic icon component that loads icons by name at runtime
 * @param props - DynamicIcon props including name and standard LucideProps
 * @returns JSX.Element or null/fallback
 */
function DynamicIcon(props: DynamicIconProps): JSX.Element;

interface DynamicIconProps extends LucideProps {
  /** Name of the icon to load */
  name: IconName;
  /** Fallback component to render while loading or on error */
  fallback?: () => JSX.Element | null;
}

interface LucideProps extends ElementAttributes {
  size?: string | number;
  absoluteStrokeWidth?: boolean;
}
```

**Usage Examples:**

```typescript
import { DynamicIcon } from "lucide-react/dynamic";

// Basic usage
<DynamicIcon name="camera" />

// With props
<DynamicIcon 
  name="grid" 
  size={32} 
  color="blue" 
  strokeWidth={3}
/>

// With fallback
<DynamicIcon 
  name="unknown-icon" 
  fallback={() => <div>Loading...</div>}
/>

// From variable
const iconName = "chevron-right";
<DynamicIcon name={iconName} />
```

### Icon Names

The `IconName` type and `iconNames` array provide access to all available icon names.

```typescript { .api }
/**
 * Type representing all valid icon names
 * Generated from the available icons in the dynamic imports
 */
type IconName = keyof typeof dynamicIconImports;

/**
 * Array of all available icon names
 * Useful for iteration or validation
 */
const iconNames: Array<IconName>;
```

**Usage Examples:**

```typescript
import { iconNames, IconName } from "lucide-react/dynamic";

// Validate icon name
function isValidIconName(name: string): name is IconName {
  return iconNames.includes(name as IconName);
}

// Iterate over all icons
iconNames.forEach(name => {
  console.log(`Icon: ${name}`);
});

// Generate icon picker
const IconPicker = () => (
  <div>
    {iconNames.map(name => (
      <DynamicIcon key={name} name={name} size={24} />
    ))}
  </div>
);

// Type-safe icon name handling
const handleIconSelect = (name: IconName) => {
  setSelectedIcon(name);
};
```

### Dynamic Icon Imports

The underlying dynamic import system maps icon names to import functions.

```typescript { .api }
/**
 * Dynamic import mapping object (internal)
 * Maps icon names to functions that return icon modules
 */
const dynamicIconImports: Record<string, () => Promise<DynamicIconModule>>;

/**
 * Structure of dynamically imported icon modules
 */
interface DynamicIconModule {
  default: LucideIcon;
  __iconNode: IconNode;
}

type IconNode = [elementName: SVGElementType, attrs: Record<string, string>][];
```

### Loading Behavior

The `DynamicIcon` component handles asynchronous loading with React hooks.

```typescript { .api }
/**
 * DynamicIcon loading states:
 * 1. Initial render: null or fallback
 * 2. Loading: fallback component (if provided) 
 * 3. Loaded: rendered icon
 * 4. Error: fallback component or null
 */
```

**Usage Examples:**

```typescript
import { DynamicIcon } from "lucide-react/dynamic";

// Loading indicator
const LoadingSpinner = () => <div className="spinner">Loading...</div>;

// Error fallback
const ErrorIcon = () => <div className="error">❌</div>;

// Comprehensive fallback handling
<DynamicIcon 
  name={userSelectedIcon}
  fallback={() => (
    userSelectedIcon ? <LoadingSpinner /> : <ErrorIcon />
  )}
/>

// Conditional rendering
const MyIcon = ({ iconName }: { iconName: string }) => {
  if (!iconNames.includes(iconName as IconName)) {
    return <div>Invalid icon</div>;
  }
  
  return <DynamicIcon name={iconName as IconName} />;
};
```

### Performance Considerations

Dynamic icons have different performance characteristics compared to static imports.

```typescript { .api }
/**
 * Performance implications:
 * - All icons are included in the bundle (no tree-shaking)
 * - Icons are loaded asynchronously on first use
 * - Subsequent uses of the same icon are cached
 * - Bundle size is larger but individual icons load faster
 */
```

**Best Practices:**

```typescript
// ❌ Not recommended for static icon usage
<DynamicIcon name="camera" />  // Known at build time

// ✅ Recommended for static usage
import { Camera } from "lucide-react";
<Camera />

// ✅ Good use case for dynamic icons
const IconDisplay = ({ iconName }: { iconName: string }) => (
  <DynamicIcon name={iconName as IconName} />
);

// ✅ CMS or user-driven icon selection
const UserIcon = ({ user }: { user: User }) => (
  <DynamicIcon name={user.preferredIcon} />
);
```

### Error Handling

Handle cases where icon names are invalid or loading fails.

```typescript { .api }
/**
 * Error scenarios:
 * - Invalid icon name (not in iconNames)
 * - Import failure (network issues, missing files)
 * - Module loading errors
 */
```

**Usage Examples:**

```typescript
import { DynamicIcon, iconNames, IconName } from "lucide-react/dynamic";

// Safe icon component with validation
const SafeIcon = ({ name, ...props }: { name: string } & LucideProps) => {
  if (!iconNames.includes(name as IconName)) {
    console.warn(`Invalid icon name: ${name}`);
    return <div>Invalid Icon</div>;
  }
  
  return (
    <DynamicIcon 
      name={name as IconName} 
      fallback={() => <div>Loading...</div>}
      {...props}
    />
  );
};

// With TypeScript validation
const validateAndRenderIcon = (iconName: unknown) => {
  if (typeof iconName === 'string' && iconNames.includes(iconName as IconName)) {
    return <DynamicIcon name={iconName as IconName} />;
  }
  return <div>Invalid icon name</div>;
};
```

### Client-Side Directive

Dynamic icons include a 'use client' directive for Next.js app router compatibility.

```typescript { .api }
/**
 * Dynamic icons are marked with 'use client' for Next.js compatibility
 * This ensures they work properly in server-side rendering scenarios
 */
```