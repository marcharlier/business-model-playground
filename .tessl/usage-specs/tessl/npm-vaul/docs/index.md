# Vaul

Vaul is an unstyled drawer component library for React that serves as a Dialog replacement optimized for tablet and mobile devices. It provides a comprehensive set of components that work together to create smooth, accessible drawer interfaces with advanced features like snap points, fade transitions, drag gestures with velocity-based animations, and accessibility support.

## Package Information

- **Package Name**: vaul
- **Package Type**: npm
- **Language**: TypeScript
- **Installation**: `npm install vaul`
- **Optional CSS**: `style.css` available for basic styling

## Core Imports

```typescript
import { Drawer } from "vaul";
```

For TypeScript projects, you can also import individual types:

```typescript
import { 
  Drawer, 
  useDrawerContext,
  type DialogProps,
  type ContentProps,
  type HandleProps,
  type WithFadeFromProps,
  type WithoutFadeFromProps,
  type DrawerDirection,
  type DrawerContextValue
} from "vaul";
```

For CommonJS:

```javascript
const { Drawer } = require("vaul");
```

## Basic Usage

```typescript
import { Drawer } from "vaul";

function MyComponent() {
  return (
    <Drawer.Root>
      <Drawer.Trigger>Open Drawer</Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Overlay />
        <Drawer.Content>
          <Drawer.Handle />
          <Drawer.Title>Drawer Title</Drawer.Title>
          <Drawer.Description>Drawer content goes here.</Drawer.Description>
          <Drawer.Close>Close</Drawer.Close>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
```

## Architecture

Vaul is built around several key components:

- **Drawer Components**: A comprehensive set of composable components (`Root`, `Content`, `Overlay`, `Trigger`, etc.)
- **Radix UI Foundation**: Built on top of Radix UI's Dialog primitives for accessibility and behavior
- **Gesture System**: Advanced drag gesture handling with velocity-based animations and snap points
- **Mobile Optimization**: Position-fixed handling, scroll prevention, and mobile browser compatibility
- **Styling Flexibility**: Unstyled approach allowing complete customization while maintaining consistent behavior

## Capabilities

### Core Components

The fundamental drawer components that form the building blocks of any drawer interface.

```typescript { .api }
// Main root component that provides context and state management
interface Drawer.Root extends React.Component<DialogProps> {}

// Main drawer content container
interface Drawer.Content extends React.ForwardRefExoticComponent<ContentProps> {}

// Backdrop overlay component
interface Drawer.Overlay extends React.ForwardRefExoticComponent<React.ComponentProps<typeof DialogPrimitive.Overlay>> {}

// Button/element that triggers drawer open
interface Drawer.Trigger extends typeof DialogPrimitive.Trigger {}

// Portal component for rendering drawer outside normal DOM tree
interface Drawer.Portal extends React.Component<React.ComponentProps<typeof DialogPrimitive.Portal> & { container?: HTMLElement }> {}
```

[Core Components](./core-components.md)

### Interactive Components

Specialized components for drawer interaction and accessibility.

```typescript { .api }
// Draggable handle component for drawer interaction
interface Drawer.Handle extends React.ForwardRefExoticComponent<HandleProps> {}

// Element that closes the drawer when activated
interface Drawer.Close extends typeof DialogPrimitive.Close {}

// Accessible title element for drawer
interface Drawer.Title extends typeof DialogPrimitive.Title {}

// Accessible description element for drawer
interface Drawer.Description extends typeof DialogPrimitive.Description {}

// Special root component for nested drawers
interface Drawer.NestedRoot extends React.Component<DialogProps> {}
```

[Interactive Components](./interactive-components.md)

### Configuration & Types

Type definitions and interfaces for configuring drawer behavior.

```typescript { .api }
interface DialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  defaultOpen?: boolean;
  children?: React.ReactNode;
  snapPoints?: (number | string)[];
  fadeFromIndex?: number;
  activeSnapPoint?: number | string | null;
  setActiveSnapPoint?: (snapPoint: number | string | null) => void;
  closeThreshold?: number;
  noBodyStyles?: boolean;
  shouldScaleBackground?: boolean;
  setBackgroundColorOnScale?: boolean;
  scrollLockTimeout?: number;
  fixed?: boolean;
  handleOnly?: boolean;
  dismissible?: boolean;
  onDrag?: (event: any, percentageDragged: number) => void;
  onRelease?: (event: any, open: boolean) => void;
  modal?: boolean;
  nested?: boolean;
  onClose?: () => void;
  direction?: 'top' | 'bottom' | 'left' | 'right';
  disablePreventScroll?: boolean;
  repositionInputs?: boolean;
  snapToSequentialPoint?: boolean;
  container?: HTMLElement | null;
  onAnimationEnd?: (open: boolean) => void;
  preventScrollRestoration?: boolean;
  autoFocus?: boolean;
}
```

[Configuration & Types](./configuration-types.md)

### Context & Hooks

Advanced context and hooks for building custom drawer components and accessing drawer state.

```typescript { .api }
// Hook to access drawer context from within drawer components
function useDrawerContext(): DrawerContextValue;

// Context value interface containing all drawer state and methods
interface DrawerContextValue {
  drawerRef: React.RefObject<HTMLDivElement>;
  overlayRef: React.RefObject<HTMLDivElement>;
  onPress: (event: React.PointerEvent<HTMLDivElement>) => void;
  onRelease: (event: React.PointerEvent<HTMLDivElement> | null) => void;
  onDrag: (event: React.PointerEvent<HTMLDivElement>) => void;
  dismissible: boolean;
  isOpen: boolean;
  isDragging: boolean;
  modal: boolean;
  shouldFade: boolean;
  activeSnapPoint?: number | string | null;
  setActiveSnapPoint: (snapPoint: number | string | null) => void;
  closeDrawer: () => void;
  direction: DrawerDirection;
  // ... additional properties for complete drawer state
}
```

See [Configuration & Types](./configuration-types.md) for complete context interface and usage examples.