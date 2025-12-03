# Core Components

The fundamental drawer components that form the building blocks of any drawer interface. These components work together to create the basic drawer structure and behavior.

## Capabilities

### Drawer.Root

Main root component that provides context and state management for the entire drawer system. This component must wrap all other drawer components.

```typescript { .api }
/**
 * Root component that provides drawer context and manages state
 * @param props - Configuration props for the drawer
 * @returns Root drawer component
 */
interface Drawer.Root extends React.Component<DialogProps> {}

interface DialogProps {
  /** Controlled open state */
  open?: boolean;
  /** Callback fired when open state changes */
  onOpenChange?: (open: boolean) => void;
  /** Default open state for uncontrolled usage */
  defaultOpen?: boolean;
  /** Child components */
  children?: React.ReactNode;
  /** Array for snap point behavior - numbers 0-100 for % or px values */
  snapPoints?: (number | string)[];
  /** Index from which overlay fade should be applied */
  fadeFromIndex?: number;
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
  direction?: 'top' | 'bottom' | 'left' | 'right';
  /** Disable scroll prevention */
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

**Usage Examples:**

```typescript
import { Drawer } from "vaul";

// Basic drawer
function BasicDrawer() {
  return (
    <Drawer.Root>
      <Drawer.Trigger>Open</Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Content>Content</Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

// Controlled drawer with snap points
function ControlledDrawer() {
  const [open, setOpen] = React.useState(false);
  
  return (
    <Drawer.Root 
      open={open} 
      onOpenChange={setOpen}
      snapPoints={[0.2, 0.5, 0.8]}
      fadeFromIndex={1}
    >
      <Drawer.Trigger>Open Drawer</Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Overlay />
        <Drawer.Content>
          <p>Drawer with snap points</p>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
```

### Drawer.Content

Main drawer content container that holds the actual drawer content. This component handles pointer events and provides the visual container for drawer contents.

```typescript { .api }
/**
 * Main drawer content container
 * @param props - Content component props extending Radix Dialog.Content
 * @param ref - Forwarded ref to the content element
 * @returns Content container component
 */
interface Drawer.Content extends React.ForwardRefExoticComponent<ContentProps> {}

type ContentProps = React.ComponentProps<typeof DialogPrimitive.Content>;
```

**Usage Examples:**

```typescript
// Basic content
<Drawer.Content>
  <h2>Drawer Title</h2>
  <p>Drawer content goes here.</p>
</Drawer.Content>

// Content with custom styling
<Drawer.Content className="drawer-content">
  <div className="drawer-header">
    <Drawer.Title>Settings</Drawer.Title>
    <Drawer.Close>×</Drawer.Close>
  </div>
  <div className="drawer-body">
    <p>Settings content...</p>
  </div>
</Drawer.Content>
```

### Drawer.Overlay

Backdrop overlay component that appears behind the drawer content. Clicking the overlay typically closes the drawer (unless configured otherwise).

```typescript { .api }
/**
 * Backdrop overlay component
 * @param props - Overlay component props extending Radix Dialog.Overlay
 * @param ref - Forwarded ref to the overlay element
 * @returns Overlay backdrop component
 */
interface Drawer.Overlay extends React.ForwardRefExoticComponent<React.ComponentProps<typeof DialogPrimitive.Overlay>> {}
```

**Usage Examples:**

```typescript
// Basic overlay
<Drawer.Overlay />

// Overlay with custom styling
<Drawer.Overlay className="drawer-overlay" />

// Overlay with click handler
<Drawer.Overlay onClick={() => console.log('Overlay clicked')} />
```

### Drawer.Trigger

Button or element that triggers the drawer to open when activated. Can be any interactive element.

```typescript { .api }
/**
 * Element that triggers drawer open when activated
 */
interface Drawer.Trigger extends typeof DialogPrimitive.Trigger {}
```

**Usage Examples:**

```typescript
// Button trigger
<Drawer.Trigger>Open Drawer</Drawer.Trigger>

// Custom trigger with styling
<Drawer.Trigger className="custom-trigger">
  <Icon name="menu" />
  Menu
</Drawer.Trigger>

// Trigger as different element
<Drawer.Trigger asChild>
  <button className="my-button">Custom Button</button>
</Drawer.Trigger>
```

### Drawer.Portal

Portal component that renders the drawer outside the normal DOM tree. This ensures proper layering and prevents styling conflicts.

```typescript { .api }
/**
 * Portal component for rendering drawer outside normal DOM tree
 * @param props - Portal props extending Radix Dialog.Portal with container override
 * @returns Portal component
 */
interface Drawer.Portal extends React.Component<PortalProps> {}

interface PortalProps extends React.ComponentProps<typeof DialogPrimitive.Portal> {
  /** Override container for portal rendering */
  container?: HTMLElement;
}
```

**Usage Examples:**

```typescript
// Default portal (renders to document.body)
<Drawer.Portal>
  <Drawer.Overlay />
  <Drawer.Content>Content</Drawer.Content>
</Drawer.Portal>

// Portal to custom container
<Drawer.Portal container={customContainer}>
  <Drawer.Overlay />
  <Drawer.Content>Content</Drawer.Content>
</Drawer.Portal>
```