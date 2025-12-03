# Client-Side Rendering

Modern client-side DOM rendering with React 18's concurrent features, including root management, hydration, portals, and synchronous update control.

## Capabilities

### Create Root

Creates a React root for rendering components into a DOM container with concurrent features enabled.

```javascript { .api }
/**
 * Creates a React root for concurrent rendering
 * @param container - DOM element to render into
 * @param options - Optional configuration for the root
 * @returns Root instance with render() and unmount() methods
 */
function createRoot(container: Container, options?: CreateRootOptions): RootType;

interface CreateRootOptions {
  /** Prefix for generated HTML attribute IDs */
  identifierPrefix?: string;
  /** Callback for recoverable errors during rendering */
  onRecoverableError?: (error: mixed) => void;
  /** Enable strict mode for the root */
  unstable_strictMode?: boolean;
  /** Enable concurrent updates by default */
  unstable_concurrentUpdatesByDefault?: boolean;
}

interface RootType {
  /** Render React elements into the root */
  render(children: ReactNodeList): void;
  /** Unmount and clean up the root */
  unmount(): void;
}

type Container = Element | Document | DocumentFragment;
```

**Usage Examples:**

```javascript
import { createRoot } from "react-dom/client";

// Basic usage
const container = document.getElementById("root");
const root = createRoot(container);
root.render(<App />);

// With options
const root = createRoot(container, {
  identifierPrefix: "my-app",
  onRecoverableError: (error) => {
    console.error("Recoverable error:", error);
  },
});

// Update the rendered content
root.render(<App key="updated" />);

// Clean up when done
root.unmount();
```

### Hydrate Root

Hydrates server-rendered content with React, attaching event listeners and making it interactive.

```javascript { .api }
/**
 * Hydrates server-rendered content with React
 * @param container - DOM element containing server-rendered content
 * @param children - React elements that match the server-rendered content
 * @param options - Optional configuration for hydration
 * @returns Root instance for managing the hydrated content
 */
function hydrateRoot(
  container: Document | Element,
  children: ReactNodeList,
  options?: HydrateRootOptions
): RootType;

interface HydrateRootOptions extends CreateRootOptions {
  /** Props used during server rendering for validation */
  hydratedProps?: Object;
  /** Callback when hydration completes successfully */
  onHydrated?: (suspenseInstance: SuspenseInstance) => void;
  /** Callback when server-rendered content is deleted during hydration */
  onDeleted?: (suspenseInstance: SuspenseInstance) => void;
}
```

**Usage Examples:**

```javascript
import { hydrateRoot } from "react-dom/client";

// Basic hydration
const container = document.getElementById("root");
hydrateRoot(container, <App />);

// With hydration callbacks
hydrateRoot(container, <App />, {
  onHydrated: (suspenseInstance) => {
    console.log("Hydration completed");
  },
  onDeleted: (suspenseInstance) => {
    console.log("Server content was replaced");
  },
});
```

### Create Portal

Renders children into a different part of the DOM tree, outside the normal parent-child hierarchy.

```javascript { .api }
/**
 * Renders children into a different DOM node
 * @param children - React elements to render
 * @param container - Target DOM container
 * @param key - Optional key for the portal
 * @returns Portal object that React can render
 */
function createPortal(
  children: ReactNodeList,
  container: Element | DocumentFragment,
  key?: string
): React$Portal;

interface React$Portal {
  $$typeof: symbol;
  key: null | string;
  containerInfo: any;
  children: ReactNodeList;
  implementation: any;
}
```

**Usage Examples:**

```javascript
import { createPortal } from "react-dom";

// Modal rendered outside main app tree
function Modal({ children, isOpen }) {
  if (!isOpen) return null;
  
  const modalRoot = document.getElementById("modal-root");
  return createPortal(
    <div className="modal">{children}</div>,
    modalRoot
  );
}

// Tooltip positioned relative to document body
function Tooltip({ content, targetRef }) {
  return createPortal(
    <div className="tooltip" style={{ 
      position: "absolute",
      left: targetRef.current?.offsetLeft,
      top: targetRef.current?.offsetTop 
    }}>
      {content}
    </div>,
    document.body
  );
}
```

### Flush Sync

Forces React to flush updates synchronously, blocking until all updates are committed to the DOM.

```javascript { .api }
/**
 * Forces synchronous flushing of updates
 * @param fn - Optional callback to execute before flushing
 * @returns Return value of the callback function
 */
function flushSync<R>(fn?: () => R): R | void;
```

**Usage Examples:**

```javascript
import { flushSync } from "react-dom";

// Ensure DOM is updated before reading measurements
flushSync(() => {
  setCount(count + 1);
});
const height = containerRef.current.offsetHeight;

// Force synchronous update for third-party library integration
function handleScroll() {
  flushSync(() => {
    setScrollPosition(window.scrollY);
  });
  // scrollPosition is guaranteed to be updated in DOM here
  externalLibrary.update();
}
```

## Legacy Client APIs

These APIs are deprecated but maintained for backward compatibility:

### Legacy Render

```javascript { .api }
/**
 * Legacy rendering method (use createRoot instead)
 * @deprecated Use createRoot().render() instead
 */
function render(element: ReactElement, container: Container, callback?: () => void): Component | null;

/**
 * Legacy hydration method (use hydrateRoot instead)
 * @deprecated Use hydrateRoot() instead
 */
function hydrate(element: ReactElement, container: Container, callback?: () => void): Component | null;

/**
 * Legacy unmounting method
 * @deprecated Use root.unmount() instead
 */
function unmountComponentAtNode(container: Container): boolean;
```

### Find DOM Node

```javascript { .api }
/**
 * Finds the DOM node for a component instance
 * @deprecated Use refs instead
 */
function findDOMNode(component: Component): Element | Text | null;
```

**Migration Examples:**

```javascript
// Legacy approach (deprecated)
import { render, unmountComponentAtNode } from "react-dom";
render(<App />, container);
unmountComponentAtNode(container);

// Modern approach (recommended)
import { createRoot } from "react-dom/client";
const root = createRoot(container);
root.render(<App />);
root.unmount();
```

## Unstable APIs

These APIs are experimental and may change:

```javascript { .api }
function unstable_batchedUpdates<A, R>(fn: (a: A) => R, a: A): R;
function unstable_flushControlled(fn: () => void): void;
function unstable_createEventHandle(type: string, options?: EventHandleOptions): EventHandle;
```