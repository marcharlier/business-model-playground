# @types/react

@types/react provides comprehensive TypeScript definitions for React, enabling developers to use React components, hooks, and APIs with full type safety and intellisense support. This package defines types for React's core functionality including components, elements, hooks, context, events, and DOM interactions.

## Package Information

- **Package Name**: @types/react
- **Package Type**: npm
- **Language**: TypeScript
- **Installation**: `npm install --save-dev @types/react`
- **Dependencies**: @types/prop-types, csstype

## Core Imports

```typescript
import * as React from "react";
```

Import specific functionality:

```typescript
import { 
  useState, 
  useEffect, 
  Component, 
  ReactNode, 
  ReactElement,
  FunctionComponent,
  MouseEventHandler
} from "react";
```

CommonJS:

```javascript
const React = require("react");
```

### Entry Points

The package provides multiple entry points for different React features:

```typescript
// Main React API
import * as React from "react";

// Canary features (React 19+ experimental)
import * as React from "react/canary";

// Experimental features
import * as React from "react/experimental";

// JSX Runtime (for new JSX transform)
import { jsx, jsxs } from "react/jsx-runtime";
import { jsxDEV } from "react/jsx-dev-runtime";
```

## Basic Usage

```typescript
import React, { useState, useEffect, ReactNode, MouseEventHandler } from "react";

// Function component with props
interface ButtonProps {
  children: ReactNode;
  onClick: MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({ children, onClick, disabled }) => {
  return (
    <button onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
};

// Component with state and effects
const Counter: React.FC = () => {
  const [count, setCount] = useState<number>(0);
  
  useEffect(() => {
    console.log(`Count updated to: ${count}`);
  }, [count]);

  const handleIncrement: MouseEventHandler<HTMLButtonElement> = () => {
    setCount(prev => prev + 1);
  };

  return (
    <div>
      <p>Count: {count}</p>
      <Button onClick={handleIncrement}>Increment</Button>
    </div>
  );
};
```

## Architecture

@types/react is organized around several key type categories:

- **Core Types**: Fundamental React types like ReactElement, ReactNode, and Key
- **Component Types**: Interfaces for function and class components, including lifecycle methods
- **Hook Types**: Complete type definitions for all React hooks with proper generic support
- **Event System**: Comprehensive synthetic event types mirroring DOM events with React-specific enhancements
- **JSX Types**: Type definitions for JSX elements, intrinsic elements, and component props
- **DOM Integration**: HTML and SVG element attribute types with React-specific additions
- **Advanced Features**: Types for context, refs, portals, and higher-order components

## Capabilities

### Core React API

Essential React functionality including components, elements, JSX, and basic type utilities. This covers the foundation of React development.

```typescript { .api }
// Core component types
type ReactElement<P = any, T extends string | JSXElementConstructor<any> = string | JSXElementConstructor<any>> = {
  type: T;
  props: P;
  key: string | null;
};

type ReactNode = ReactElement | string | number | ReactFragment | ReactPortal | boolean | null | undefined;

type ComponentType<P = {}> = ComponentClass<P> | FunctionComponent<P>;
```

[Core React API](./core-api.md)

### React Hooks

Complete type definitions for all React hooks including state management, effects, performance optimization, and advanced patterns.

```typescript { .api }
function useState<S>(initialState: S | (() => S)): [S, Dispatch<SetStateAction<S>>];
function useEffect(effect: EffectCallback, deps?: DependencyList): void;
function useMemo<T>(factory: () => T, deps: DependencyList): T;
function useCallback<T extends Function>(callback: T, deps: DependencyList): T;
```

[React Hooks](./hooks.md)

### Event System

Comprehensive synthetic event types and event handler interfaces for all DOM events with React-specific enhancements.

```typescript { .api }
interface SyntheticEvent<T = Element, E = Event> extends BaseSyntheticEvent<E, EventTarget & T, EventTarget> {}

type MouseEventHandler<T = Element> = EventHandler<MouseEvent<T>>;
type ChangeEventHandler<T = Element> = EventHandler<ChangeEvent<T>>;
type FormEventHandler<T = Element> = EventHandler<FormEvent<T>>;
```

[Event System](./events.md)

### Ref System

Complete ref system including useRef, forwardRef, and all ref-related utilities with proper type inference.

```typescript { .api }
interface RefObject<T> {
  readonly current: T | null;
}

interface MutableRefObject<T> {
  current: T;
}

function useRef<T>(initialValue: T): MutableRefObject<T>;
function forwardRef<T, P = {}>(render: ForwardRefRenderFunction<T, P>): ForwardRefExoticComponent<PropsWithoutRef<P> & RefAttributes<T>>;
```

[Ref System](./refs.md)

### Context System

React Context API types including createContext, useContext, and context provider/consumer patterns.

```typescript { .api }
interface Context<T> {
  Provider: Provider<T>;
  Consumer: Consumer<T>;
  displayName?: string | undefined;
}

function createContext<T>(defaultValue: T): Context<T>;
function useContext<T>(context: Context<T>): T;
```

[Context System](./context.md)

### Advanced Components

Higher-order components, lazy loading, memoization, and Suspense with complete type safety.

```typescript { .api }
function memo<P extends object>(Component: FunctionComponent<P>, propsAreEqual?: (prevProps: Readonly<P>, nextProps: Readonly<P>) => boolean): NamedExoticComponent<P>;

function lazy<T extends ComponentType<any>>(factory: () => Promise<{ default: T }>): LazyExoticComponent<T>;

class Suspense extends Component<SuspenseProps> {}
```

[Advanced Components](./advanced-components.md)

### DOM Types

Complete HTML and SVG element attribute types, DOM event interfaces, and React-specific DOM enhancements.

```typescript { .api }
interface HTMLAttributes<T> extends AriaAttributes, DOMAttributes<T> {
  className?: string | undefined;
  id?: string | undefined;
  style?: CSSProperties | undefined;
  // ... hundreds of HTML attributes
}

type DetailedHTMLProps<E extends HTMLAttributes<T>, T> = ClassAttributes<T> & E;
```

[DOM Types](./dom-types.md)

### Canary Features

Features available in React canary releases including async actions, useOptimistic, and server components.

```typescript { .api }
function use<T>(usable: Usable<T>): T;
function useOptimistic<State>(passthrough: State): [State, (action: State | ((pendingState: State) => State)) => void];
function cache<CachedFunction extends Function>(fn: CachedFunction): CachedFunction;
```

[Canary Features](./canary.md)

### Experimental Features

Cutting-edge React features in experimental builds including Suspense enhancements and effect events.

```typescript { .api }
function experimental_useEffectEvent<T extends Function>(event: T): T;
const unstable_SuspenseList: ExoticComponent<SuspenseListProps>;
```

[Experimental Features](./experimental.md)

## Types

### Core Type Definitions

```typescript { .api }
// Fundamental React types
type Key = string | number | bigint;
type ReactText = string | number;
type ReactChild = ReactElement | ReactText;

interface ReactNodeArray extends ReadonlyArray<ReactNode> {}
type ReactFragment = {} | ReactNodeArray;

// Utility types for component development
type Dispatch<A> = (value: A) => void;
type SetStateAction<S> = S | ((prevState: S) => S);

// JSX namespace types
namespace JSX {
  interface Element extends ReactElement<any, any> {}
  interface ElementClass extends Component<any> {
    render(): ReactNode;
  }
  interface ElementAttributesProperty {
    props: {};
  }
  interface ElementChildrenAttribute {
    children: {};
  }
}
```