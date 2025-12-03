# Configuration & Types

Type definitions and interfaces for configuring drawer behavior. This section covers all the available options for customizing drawer behavior, animations, and interactions.

## Capabilities

### DialogProps Interface

Main configuration interface for the Root component that controls all aspects of drawer behavior.

```typescript { .api }
/**
 * Main props interface for Root component
 * Union of WithFadeFromProps or WithoutFadeFromProps
 */
type DialogProps = (WithFadeFromProps | WithoutFadeFromProps) & BaseDialogProps;

interface BaseDialogProps {
  /** Controlled open state */
  open?: boolean;
  /** Callback fired when open state changes */
  onOpenChange?: (open: boolean) => void;
  /** Default open state for uncontrolled usage */
  defaultOpen?: boolean;
  /** Child components */
  children?: React.ReactNode;
  /** Controlled active snap point */
  activeSnapPoint?: number | string | null;
  /** Callback to set active snap point */
  setActiveSnapPoint?: (snapPoint: number | string | null) => void;
  /** Threshold for closing (default: 0.25) */
  closeThreshold?: number;
  /** Prevent body style changes */
  noBodyStyles?: boolean;
  /** Enable background scaling effect */
  shouldScaleBackground?: boolean;
  /** Change background color when scaling */
  setBackgroundColorOnScale?: boolean;
  /** Duration for scroll lock in ms (default: 100) */
  scrollLockTimeout?: number;
  /** Fixed positioning behavior */
  fixed?: boolean;
  /** Restrict dragging to handle only */
  handleOnly?: boolean;
  /** Allow dismissal via gestures (default: true) */
  dismissible?: boolean;
  /** Drag event handler */
  onDrag?: (event: React.PointerEvent<HTMLDivElement>, percentageDragged: number) => void;
  /** Release event handler */
  onRelease?: (event: React.PointerEvent<HTMLDivElement>, open: boolean) => void;
  /** Modal behavior (default: true) */
  modal?: boolean;
  /** Nested drawer support */
  nested?: boolean;
  /** Close callback */
  onClose?: () => void;
  /** Drawer direction (default: 'bottom') */
  direction?: DrawerDirection;
  /** Disable scroll prevention (default: true) */
  disablePreventScroll?: boolean;
  /** Reposition inputs on keyboard */
  repositionInputs?: boolean;
  /** Disable velocity-based snapping */
  snapToSequentialPoint?: boolean;
  /** Portal container */
  container?: HTMLElement | null;
  /** Animation end callback */
  onAnimationEnd?: (open: boolean) => void;
  /** Prevent scroll restoration */
  preventScrollRestoration?: boolean;
  /** Auto focus behavior */
  autoFocus?: boolean;
}
```

### Snap Points Configuration

Snap points allow drawers to "snap" to specific positions, creating multi-height drawer experiences.

```typescript { .api }
/**
 * Props for drawers with fade configuration
 */
interface WithFadeFromProps {
  /** Array of snap points - numbers 0-100 for % or px values like "300px" */
  snapPoints: (number | string)[];
  /** Index from which overlay fade should be applied */
  fadeFromIndex: number;
}

/**
 * Props for drawers without fade configuration
 */
interface WithoutFadeFromProps {
  /** Optional array of snap points */
  snapPoints?: (number | string)[];
  /** Not allowed when snapPoints are optional */
  fadeFromIndex?: never;
}
```

**Usage Examples:**

```typescript
// Drawer with snap points and fade
<Drawer.Root
  snapPoints={[0.2, 0.5, 0.8]}
  fadeFromIndex={1} // Fade starts from 50% height
>
  {/* drawer content */}
</Drawer.Root>

// Drawer with pixel-based snap points
<Drawer.Root
  snapPoints={["100px", "300px", "500px"]}
  fadeFromIndex={0}
>
  {/* drawer content */}
</Drawer.Root>

// Drawer without snap points
<Drawer.Root>
  {/* drawer content */}
</Drawer.Root>
```

### Direction and Positioning

Control drawer direction and positioning behavior.

```typescript { .api }
/**
 * Valid drawer directions
 */
type DrawerDirection = 'top' | 'bottom' | 'left' | 'right';

/**
 * Snap point configuration interface
 */
interface SnapPoint {
  /** Fraction of screen height/width (0-1) */
  fraction: number;
  /** Absolute height/width in pixels */
  height: number;
}
```

**Usage Examples:**

```typescript
// Bottom drawer (default)
<Drawer.Root direction="bottom">
  {/* content */}
</Drawer.Root>

// Side drawer
<Drawer.Root direction="right">
  {/* content */}
</Drawer.Root>

// Top drawer
<Drawer.Root direction="top">
  {/* content */}
</Drawer.Root>
```

### Event Handlers

Event handling configuration for custom behavior during drawer interactions.

```typescript { .api }
/**
 * Drag event handler type
 */
type DragHandler = (event: React.PointerEvent<HTMLDivElement>, percentageDragged: number) => void;

/**
 * Release event handler type
 */
type ReleaseHandler = (event: React.PointerEvent<HTMLDivElement>, open: boolean) => void;

/**
 * Animation end handler type
 */
type AnimationEndHandler = (open: boolean) => void;
```

**Usage Examples:**

```typescript
function CustomDrawer() {
  const handleDrag = (event: React.PointerEvent<HTMLDivElement>, percentage: number) => {
    console.log(`Dragged to ${percentage}%`);
    // Custom drag behavior
  };

  const handleRelease = (event: React.PointerEvent<HTMLDivElement>, open: boolean) => {
    console.log(`Released, drawer is ${open ? 'open' : 'closed'}`);
    // Custom release behavior
  };

  const handleAnimationEnd = (open: boolean) => {
    console.log(`Animation ended, drawer is ${open ? 'open' : 'closed'}`);
    // Post-animation logic
  };

  return (
    <Drawer.Root
      onDrag={handleDrag}
      onRelease={handleRelease}
      onAnimationEnd={handleAnimationEnd}
    >
      {/* drawer content */}
    </Drawer.Root>
  );
}
```

### Individual Type Exports

These types are exported individually for direct use in TypeScript projects.

```typescript { .api }
/**
 * Props interface for drawers with fade configuration
 */
interface WithFadeFromProps {
  /** Array of snap points - numbers 0-100 for % or px values like "300px" */
  snapPoints: (number | string)[];
  /** Index from which overlay fade should be applied */
  fadeFromIndex: number;
}

/**
 * Props interface for drawers without fade configuration
 */
interface WithoutFadeFromProps {
  /** Optional array of snap points */
  snapPoints?: (number | string)[];
  /** Not allowed when snapPoints are optional */
  fadeFromIndex?: never;
}

/**
 * Props type for Content component - exported individually
 */
type ContentProps = React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>;

/**
 * Props type for Handle component - exported individually
 */
interface HandleProps extends React.ComponentPropsWithoutRef<'div'> {
  /** Prevent snap point cycling when dragging the handle */
  preventCycle?: boolean;
}
```

### Component-Specific Types

Additional type definitions for individual components.

```typescript { .api }
/**
 * Props type for Portal component (internal)
 */
type PortalProps = React.ComponentPropsWithoutRef<typeof DialogPrimitive.Portal> & {
  /** Override container for portal rendering */
  container?: HTMLElement;
}
```

### Advanced Configuration

Advanced configuration options for fine-tuning drawer behavior.

```typescript { .api }
/**
 * Advanced configuration options
 */
interface AdvancedConfig {
  /** Threshold for closing drawer (0-1, default: 0.25) */
  closeThreshold?: number;
  /** Timeout for scroll lock in milliseconds (default: 100) */
  scrollLockTimeout?: number;
  /** Prevent default body style changes */
  noBodyStyles?: boolean;
  /** Scale background content when drawer opens */
  shouldScaleBackground?: boolean;
  /** Change background color during scaling */
  setBackgroundColorOnScale?: boolean;
  /** Use fixed positioning */
  fixed?: boolean;
  /** Only allow dragging via handle */
  handleOnly?: boolean;
  /** Disable gesture-based dismissal */
  dismissible?: boolean;
  /** Disable scroll prevention (default: true) */
  disablePreventScroll?: boolean;
  /** Reposition inputs when keyboard appears */
  repositionInputs?: boolean;
  /** Disable velocity-based snap point selection */
  snapToSequentialPoint?: boolean;
  /** Prevent scroll position restoration */
  preventScrollRestoration?: boolean;
  /** Control auto-focus behavior */
  autoFocus?: boolean;
}
```

**Usage Examples:**

```typescript
// Fine-tuned drawer configuration
<Drawer.Root
  closeThreshold={0.4} // Require 40% drag to close
  scrollLockTimeout={1000} // 1 second scroll lock
  shouldScaleBackground={true}
  setBackgroundColorOnScale={true}
  handleOnly={true} // Only draggable via handle
  repositionInputs={true} // Handle mobile keyboards
  snapToSequentialPoint={true} // Disable velocity snapping
>
  {/* drawer content */}
</Drawer.Root>

// Mobile-optimized drawer
<Drawer.Root
  fixed={true}
  repositionInputs={true}
  disablePreventScroll={false}
  direction="bottom"
>
  {/* mobile-friendly content */}
</Drawer.Root>
```

### Context and Hooks

Advanced context and hook types for custom drawer implementations.

```typescript { .api }
/**
 * Hook to access drawer context from within drawer components
 * @returns DrawerContextValue object with drawer state and methods
 * @throws Error if used outside of Drawer.Root
 */
function useDrawerContext(): DrawerContextValue;

/**
 * Context value interface containing all drawer state and methods
 */
interface DrawerContextValue {
  /** Ref to the drawer content element */
  drawerRef: React.RefObject<HTMLDivElement>;
  /** Ref to the overlay element */
  overlayRef: React.RefObject<HTMLDivElement>;
  /** Pointer press handler */
  onPress: (event: React.PointerEvent<HTMLDivElement>) => void;
  /** Pointer release handler */
  onRelease: (event: React.PointerEvent<HTMLDivElement> | null) => void;
  /** Drag handler */
  onDrag: (event: React.PointerEvent<HTMLDivElement>) => void;
  /** Nested drawer drag handler */
  onNestedDrag: (event: React.PointerEvent<HTMLDivElement>, percentageDragged: number) => void;
  /** Nested drawer open change handler */
  onNestedOpenChange: (open: boolean) => void;
  /** Nested drawer release handler */
  onNestedRelease: (event: React.PointerEvent<HTMLDivElement>, open: boolean) => void;
  /** Whether drawer can be dismissed */
  dismissible: boolean;
  /** Current open state */
  isOpen: boolean;
  /** Current dragging state */
  isDragging: boolean;
  /** Keyboard visibility ref */
  keyboardIsOpen: React.MutableRefObject<boolean>;
  /** Computed snap point offsets */
  snapPointsOffset: number[] | null;
  /** Configured snap points */
  snapPoints?: (number | string)[] | null;
  /** Current active snap point index */
  activeSnapPointIndex?: number | null;
  /** Modal behavior setting */
  modal: boolean;
  /** Whether overlay should fade */
  shouldFade: boolean;
  /** Current active snap point */
  activeSnapPoint?: number | string | null;
  /** Function to set active snap point */
  setActiveSnapPoint: (snapPoint: number | string | null) => void;
  /** Function to close drawer */
  closeDrawer: () => void;
  /** Open prop from parent */
  openProp?: boolean;
  /** Open change callback from parent */
  onOpenChange?: (open: boolean) => void;
  /** Drawer direction */
  direction: DrawerDirection;
  /** Whether to scale background */
  shouldScaleBackground: boolean;
  /** Whether to change background color on scale */
  setBackgroundColorOnScale: boolean;
  /** Whether to apply body styles */
  noBodyStyles: boolean;
  /** Whether only handle can drag */
  handleOnly?: boolean;
  /** Portal container */
  container?: HTMLElement | null;
  /** Auto focus setting */
  autoFocus?: boolean;
  /** Animation state ref */
  shouldAnimate?: React.MutableRefObject<boolean>;
}
```

**Usage Examples:**

```typescript
import { useDrawerContext } from "vaul";

// Custom component that uses drawer context
function CustomDrawerComponent() {
  const { isOpen, closeDrawer, isDragging } = useDrawerContext();
  
  return (
    <div>
      <p>Drawer is {isOpen ? 'open' : 'closed'}</p>
      <p>Currently {isDragging ? 'dragging' : 'not dragging'}</p>
      <button onClick={closeDrawer}>Close Drawer</button>
    </div>
  );
}

// Use within drawer content
<Drawer.Root>
  <Drawer.Trigger>Open</Drawer.Trigger>
  <Drawer.Portal>
    <Drawer.Content>
      <CustomDrawerComponent />
    </Drawer.Content>
  </Drawer.Portal>
</Drawer.Root>
```

### State Management Types

Types for controlled and uncontrolled state management.

```typescript { .api }
/**
 * Controlled state configuration
 */
interface ControlledState {
  /** Current open state */
  open: boolean;
  /** State change handler */
  onOpenChange: (open: boolean) => void;
  /** Current active snap point */
  activeSnapPoint?: number | string | null;
  /** Active snap point change handler */
  setActiveSnapPoint?: (snapPoint: number | string | null) => void;
}

/**
 * Uncontrolled state configuration
 */
interface UncontrolledState {
  /** Default open state */
  defaultOpen?: boolean;
  /** Close callback for uncontrolled usage */
  onClose?: () => void;
}
```

**Usage Examples:**

```typescript
// Controlled drawer
function ControlledDrawer() {
  const [open, setOpen] = useState(false);
  const [activeSnap, setActiveSnap] = useState<number | null>(null);

  return (
    <Drawer.Root
      open={open}
      onOpenChange={setOpen}
      activeSnapPoint={activeSnap}
      setActiveSnapPoint={setActiveSnap}
      snapPoints={[0.3, 0.6, 0.9]}
    >
      {/* drawer content */}
    </Drawer.Root>
  );
}

// Uncontrolled drawer
function UncontrolledDrawer() {
  return (
    <Drawer.Root
      defaultOpen={false}
      onClose={() => console.log('Drawer closed')}
    >
      {/* drawer content */}
    </Drawer.Root>
  );
}
```

### Utility Types

Additional utility types used internally but may be useful for advanced usage.

```typescript { .api }
/**
 * Utility type for any function
 */
type AnyFunction = (...args: any) => any;

/**
 * Snap point configuration interface
 */
interface SnapPoint {
  /** Fraction of screen height/width (0-1) */
  fraction: number;
  /** Absolute height/width in pixels */
  height: number;
}
```