# React DOM

React DOM is the official React library for DOM rendering and manipulation, providing the essential bridge between React's virtual DOM and the browser's actual DOM. It offers both client-side rendering capabilities for modern React applications and server-side rendering for optimized performance and SEO, along with comprehensive testing utilities for React components.

## Package Information

- **Package Name**: react-dom
- **Package Type**: npm
- **Language**: JavaScript/TypeScript
- **Installation**: `npm install react-dom`
- **Peer Dependencies**: `react@^18.3.1`

## Core Imports

```javascript
import { createRoot, hydrateRoot } from "react-dom/client";
import { createPortal, flushSync } from "react-dom";
```

For server-side rendering:

```javascript
import { renderToPipeableStream, renderToString } from "react-dom/server";
```

For testing:

```javascript
import { act } from "react";
import * as TestUtils from "react-dom/test-utils";
```

For profiling builds:

```javascript
import { createRoot } from "react-dom/profiling";
```

CommonJS:

```javascript
const { createRoot, hydrateRoot } = require("react-dom/client");
const { createPortal, flushSync } = require("react-dom");
```

## Basic Usage

```javascript
import { createRoot } from "react-dom/client";
import { createPortal } from "react-dom";

// Modern client-side rendering
const container = document.getElementById("root");
const root = createRoot(container);
root.render(<App />);

// Create portals for rendering outside parent hierarchy
const modalRoot = document.getElementById("modal-root");
const modal = createPortal(<Modal />, modalRoot);

// Force synchronous updates when needed
import { flushSync } from "react-dom";
flushSync(() => {
  setCount(count + 1);
});
```

## Architecture

React DOM v18 introduces several architectural improvements:

- **Concurrent Features**: Built-in support for Suspense, automatic batching, and time-slicing
- **Modern Rendering**: `createRoot` and `hydrateRoot` APIs replace legacy `render` and `hydrate`
- **Streaming SSR**: Modern server-side rendering with `renderToPipeableStream` and `renderToReadableStream`
- **Testing Integration**: Comprehensive test utilities with component inspection and event simulation
- **Multiple Entry Points**: Optimized bundles for client, server (Node.js/browser), and testing scenarios

## Capabilities

### Client-Side Rendering

Modern client-side DOM rendering with React 18's concurrent features, including root management, hydration, and portals.

```javascript { .api }
function createRoot(container, options?): RootType;
function hydrateRoot(container, children, options?): RootType;
function createPortal(children, container, key?): React$Portal;
```

[Client Rendering](./client-rendering.md)

### Server-Side Rendering

Comprehensive server-side rendering support for both Node.js and browser environments, with legacy string/stream APIs and modern streaming with Suspense support.

```javascript { .api }
function renderToString(element, options?): string;
function renderToPipeableStream(children, options?): PipeableStream;
function renderToReadableStream(children, options?): Promise<ReadableStream>;
```

[Server Rendering](./server-rendering.md)

### Testing Utilities

Comprehensive testing utilities for component inspection, tree traversal, event simulation, and advanced debugging capabilities.

```javascript { .api }
const Simulate: {
  click(element, eventData?): void;
  change(element, eventData?): void;
  // 70+ other DOM event simulation methods
};

function findRenderedDOMComponentWithClass(tree, className): Element;
function scryRenderedComponentsWithType(tree, type): Array<Component>;
```

[Testing Utilities](./testing-utilities.md)

## Global Types

```typescript { .api }
interface RootType {
  render(children: ReactNodeList): void;
  unmount(): void;
}

interface CreateRootOptions {
  identifierPrefix?: string;
  onRecoverableError?: (error: mixed) => void;
  unstable_strictMode?: boolean;
  unstable_concurrentUpdatesByDefault?: boolean;
}

interface HydrateRootOptions extends CreateRootOptions {
  hydratedProps?: Object;
  onHydrated?: (suspenseInstance: SuspenseInstance) => void;
  onDeleted?: (suspenseInstance: SuspenseInstance) => void;
}

type ReactNodeList = ReactNode | Iterable<ReactNodeList>;
type Container = Element | Document | DocumentFragment;

interface React$Portal {
  $$typeof: symbol;
  key: null | string;
  containerInfo: any;
  children: ReactNodeList;
  implementation: any;
}
```

## Version and Metadata

```javascript { .api }
const version: string; // "18.3.1"
```

## Development and Profiling

### Profiling Build

The profiling build provides the same API as the main package but with additional profiling instrumentation:

```javascript { .api }
// Same APIs as main package, but with profiling enabled
import { createRoot, hydrateRoot, flushSync } from "react-dom/profiling";
```

The profiling build is identical to the production build but includes profiling information that can be used with React DevTools Profiler.

## Legacy APIs

React DOM maintains backward compatibility with React 17 APIs, though they are deprecated:

```javascript { .api }
// Deprecated - use createRoot instead
function render(element, container, callback?): Component | null;
function hydrate(element, container, callback?): Component | null;
function unmountComponentAtNode(container): boolean;
function findDOMNode(component): Element | Text | null;
```

These APIs are available in the main `react-dom` package for backward compatibility but should be replaced with modern equivalents in new applications.