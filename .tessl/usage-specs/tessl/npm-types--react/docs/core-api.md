# Core React API

Essential React functionality including components, elements, JSX, and basic type utilities. This covers the foundation of React development with complete type definitions for creating and managing React components.

## Capabilities

### React Elements

Core types for React elements and JSX.

```typescript { .api }
/**
 * Represents a JSX element with props and type information
 */
interface ReactElement<P = any, T extends string | JSXElementConstructor<any> = string | JSXElementConstructor<any>> {
  type: T;
  props: P;
  key: string | null;
  ref: any;
  $$typeof: symbol;
}

/**
 * Union type representing everything React can render
 */
type ReactNode = ReactElement | string | number | Iterable<ReactNode> | ReactPortal | boolean | null | undefined;

/**
 * Type for React element keys
 */
type Key = string | number | bigint;

/**
 * Factory function interface for creating elements
 */
interface Factory<P> {
  (props?: Attributes & P, ...children: ReactNode[]): ReactElement<P>;
}
```

**Usage Examples:**

```typescript
import React, { ReactElement, ReactNode } from "react";

// Function that returns a ReactElement
function createGreeting(name: string): ReactElement {
  return <div>Hello, {name}!</div>;
}

// Component that accepts ReactNode children
interface ContainerProps {
  children: ReactNode;
}

const Container: React.FC<ContainerProps> = ({ children }) => {
  return <div className="container">{children}</div>;
};

// Using with different ReactNode types
<Container>
  <h1>Title</h1>
  {"String content"}
  {123}
  {null}
  {[<span key="1">Item 1</span>, <span key="2">Item 2</span>]}
</Container>
```

### Element Creation

Functions for creating and manipulating React elements.

```typescript { .api }
/**
 * Creates a React element of the given type
 */
function createElement<P extends HTMLAttributes<T>, T extends HTMLElement>(
  type: keyof ReactHTML,
  props?: ClassAttributes<T> & P | null,
  ...children: ReactNode[]
): DetailedReactHTMLElement<P, T>;

function createElement<P extends SVGAttributes<T>, T extends SVGElement>(
  type: keyof ReactSVG,
  props?: ClassAttributes<T> & P | null,
  ...children: ReactNode[]
): ReactSVGElement;

function createElement<P extends {}>(
  type: FunctionComponent<P> | ComponentClass<P> | string,
  props?: Attributes & P | null,
  ...children: ReactNode[]
): ReactElement<P>;

/**
 * Clones a React element and returns a new element with updated props
 */
function cloneElement<P extends HTMLAttributes<T>, T extends HTMLElement>(
  element: DetailedReactHTMLElement<P, T>,
  props?: P,
  ...children: ReactNode[]
): DetailedReactHTMLElement<P, T>;

function cloneElement<P extends SVGAttributes<T>, T extends SVGElement>(
  element: ReactSVGElement,
  props?: P,
  ...children: ReactNode[]
): ReactSVGElement;

function cloneElement<P>(
  element: ReactElement<P>,
  props?: Partial<P> & Attributes,
  ...children: ReactNode[]
): ReactElement<P>;

/**
 * Type guard to check if object is a valid React element
 */
function isValidElement<P>(object: {} | null | undefined): object is ReactElement<P>;
```

**Usage Examples:**

```typescript
import React from "react";

// Creating elements programmatically
const heading = React.createElement('h1', { id: 'title' }, 'Hello World');
const button = React.createElement('button', { onClick: handleClick }, 'Click Me');

// Cloning elements with new props
const originalButton = <button onClick={handleClick}>Original</button>;
const clonedButton = React.cloneElement(originalButton, { 
  disabled: true,
  className: 'disabled'
}, 'Disabled Button');

// Type guard usage
function processElement(element: unknown) {
  if (React.isValidElement(element)) {
    // element is now typed as ReactElement
    console.log(element.type, element.props);
  }
}
```

### Component Types

Type definitions for React components.

```typescript { .api }
/**
 * Function component interface
 */
interface FunctionComponent<P = {}> {
  (props: P, context?: any): ReactElement<any, any> | null;
  propTypes?: WeakValidationMap<P> | undefined;
  contextTypes?: ValidationMap<any> | undefined;
  defaultProps?: Partial<P> | undefined;
  displayName?: string | undefined;
}

/**
 * Alias for FunctionComponent
 */
type FC<P = {}> = FunctionComponent<P>;

/**
 * Class component interface
 */
interface ComponentClass<P = {}, S = ComponentState> extends StaticLifecycle<P, S> {
  new (props: P, context?: any): Component<P, S>;
  propTypes?: WeakValidationMap<P> | undefined;
  contextTypes?: ValidationMap<any> | undefined;
  childContextTypes?: ValidationMap<any> | undefined;
  defaultProps?: Partial<P> | undefined;
  displayName?: string | undefined;
}

/**
 * Union of function and class components
 */
type ComponentType<P = {}> = ComponentClass<P> | FunctionComponent<P>;

/**
 * Type for any component constructor accepting props P
 */
type JSXElementConstructor<P> =
  | ((props: P) => ReactElement<any, any> | null)
  | (new (props: P) => Component<any, any>);

/**
 * Retrieves element type from component or intrinsic element
 */
type ElementType<P = any, Tag extends keyof JSX.IntrinsicElements = keyof JSX.IntrinsicElements> =
  | {[K in Tag]: P extends JSX.IntrinsicElements[K] ? K : never}[Tag]
  | ComponentType<P>;
```

**Usage Examples:**

```typescript
import React, { FunctionComponent, ComponentClass, ComponentType } from "react";

// Function component with explicit typing
const Greeting: FunctionComponent<{ name: string }> = ({ name }) => {
  return <h1>Hello, {name}!</h1>;
};

// Using FC alias
const Welcome: React.FC<{ title: string }> = ({ title }) => {
  return <div>{title}</div>;
};

// Class component
class Counter extends React.Component<{ initialCount: number }, { count: number }> {
  constructor(props: { initialCount: number }) {
    super(props);
    this.state = { count: props.initialCount };
  }

  render() {
    return <div>Count: {this.state.count}</div>;
  }
}

// Higher-order component
function withLoading<P extends object>(
  Component: ComponentType<P>
): FunctionComponent<P & { loading?: boolean }> {
  return ({ loading, ...props }: P & { loading?: boolean }) => {
    if (loading) return <div>Loading...</div>;
    return <Component {...props as P} />;
  };
}
```

### Component Class Base

Base class for React components with lifecycle methods.

```typescript { .api }
/**
 * Base React component class
 */
abstract class Component<P = {}, S = {}, SS = any> implements ComponentLifecycle<P, S, SS> {
  static contextType?: Context<any> | undefined;
  
  context: unknown;
  props: Readonly<P>;
  state: Readonly<S>;
  refs: {
    [key: string]: ReactInstance;
  };

  constructor(props: P, context?: any);

  setState<K extends keyof S>(
    state: ((prevState: Readonly<S>, props: Readonly<P>) => Pick<S, K> | S | null) | (Pick<S, K> | S | null),
    callback?: () => void
  ): void;

  forceUpdate(callback?: () => void): void;
  render(): ReactNode;

  // Lifecycle methods
  componentDidMount?(): void;
  shouldComponentUpdate?(nextProps: Readonly<P>, nextState: Readonly<S>, nextContext: any): boolean;
  componentWillUnmount?(): void;
  componentDidCatch?(error: Error, errorInfo: ErrorInfo): void;
  getSnapshotBeforeUpdate?(prevProps: Readonly<P>, prevState: Readonly<S>): SS | null;
  componentDidUpdate?(prevProps: Readonly<P>, prevState: Readonly<S>, snapshot?: SS): void;
  componentWillMount?(): void;
  UNSAFE_componentWillMount?(): void;
  componentWillReceiveProps?(nextProps: Readonly<P>, nextContext: any): void;
  UNSAFE_componentWillReceiveProps?(nextProps: Readonly<P>, nextContext: any): void;
  componentWillUpdate?(nextProps: Readonly<P>, nextState: Readonly<S>, nextContext: any): void;
  UNSAFE_componentWillUpdate?(nextProps: Readonly<P>, nextState: Readonly<S>, nextContext: any): void;
}

/**
 * Pure component that implements shallow comparison in shouldComponentUpdate
 */
class PureComponent<P = {}, S = {}, SS = any> extends Component<P, S, SS> {}
```

**Usage Examples:**

```typescript
import React, { Component, PureComponent, ErrorInfo } from "react";

// Basic class component
class Timer extends Component<{}, { seconds: number }> {
  private intervalId?: NodeJS.Timeout;

  constructor(props: {}) {
    super(props);
    this.state = { seconds: 0 };
  }

  componentDidMount() {
    this.intervalId = setInterval(() => {
      this.setState(prevState => ({ seconds: prevState.seconds + 1 }));
    }, 1000);
  }

  componentWillUnmount() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  render() {
    return <div>Seconds: {this.state.seconds}</div>;
  }
}

// Pure component for performance optimization
class ExpensiveItem extends PureComponent<{ value: number; label: string }> {
  render() {
    console.log('ExpensiveItem rendered');
    return <div>{this.props.label}: {this.props.value}</div>;
  }
}

// Error boundary component
class ErrorBoundary extends Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.log('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong.</h1>;
    }
    return this.props.children;
  }
}
```

### Props and Attributes

Base interfaces for component props and element attributes.

```typescript { .api }
/**
 * Base attributes interface
 */
interface Attributes {
  key?: Key | null | undefined;
}

/**
 * Attributes with ref support
 */
interface RefAttributes<T> extends Attributes {
  ref?: Ref<T> | undefined;
}

/**
 * Class attributes for class components
 */
interface ClassAttributes<T> extends Attributes {
  ref?: LegacyRef<T> | undefined;
}

/**
 * Props with children
 */
type PropsWithChildren<P = unknown> = P & { children?: ReactNode | undefined };

/**
 * Props with ref (does not remove ref if it exists)
 */
type PropsWithRef<P> = 'ref' extends keyof P
  ? P extends { ref?: infer R | undefined }
    ? string extends R
      ? PropsWithoutRef<P> & { ref?: Exclude<R, string> | undefined }
      : P
    : P
  : P;

/**
 * Props without ref
 */
type PropsWithoutRef<P> = 'ref' extends keyof P ? Omit<P, 'ref'> : P;
```

**Usage Examples:**

```typescript
import React, { PropsWithChildren, PropsWithRef, RefAttributes } from "react";

// Component with children
interface CardProps {
  title: string;
  className?: string;
}

const Card: React.FC<PropsWithChildren<CardProps>> = ({ title, className, children }) => {
  return (
    <div className={className}>
      <h2>{title}</h2>
      {children}
    </div>
  );
};

// Component with forwarded ref
interface InputProps {
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ placeholder, value, onChange }, ref) => {
    return <input ref={ref} placeholder={placeholder} value={value} onChange={onChange} />;
  }
);

// Using PropsWithRef for HOCs
function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>
): React.FC<PropsWithRef<P>> {
  return (props) => (
    <ErrorBoundary>
      <Component {...props} />
    </ErrorBoundary>
  );
}
```

### Component Props Utilities

Utility types for extracting props from components.

```typescript { .api }
/**
 * Extract props type from component type
 */
type ComponentProps<T extends keyof JSX.IntrinsicElements | JSXElementConstructor<any>> =
  T extends JSXElementConstructor<infer P>
    ? P
    : T extends keyof JSX.IntrinsicElements
    ? JSX.IntrinsicElements[T]
    : {};

/**
 * Extract props with ref from component
 */
type ComponentPropsWithRef<T extends ElementType> = T extends (new (props: infer P) => Component<any, any>)
  ? PropsWithoutRef<P> & RefAttributes<InstanceType<T>>
  : ComponentProps<T>;

/**
 * Extract props without ref from component
 */
type ComponentPropsWithoutRef<T extends ElementType> = PropsWithoutRef<ComponentProps<T>>;

/**
 * Extract ref type from component
 */
type ElementRef<C extends ElementType> = 'ref' extends keyof ComponentPropsWithRef<C>
  ? NonNullable<ComponentPropsWithRef<C>['ref']> extends Ref<infer Instance>
    ? Instance
    : never
  : never;
```

**Usage Examples:**

```typescript
import React, { ComponentProps, ComponentPropsWithRef, ElementRef } from "react";

// Extract props from HTML elements
type DivProps = ComponentProps<'div'>;
type ButtonProps = ComponentProps<'button'>;

// Extract props from custom components
const MyButton: React.FC<{ variant: 'primary' | 'secondary'; onClick: () => void }> = (props) => (
  <button onClick={props.onClick}>{props.variant}</button>
);

type MyButtonProps = ComponentProps<typeof MyButton>; // { variant: 'primary' | 'secondary'; onClick: () => void }

// Props with ref for forwarding
type InputPropsWithRef = ComponentPropsWithRef<'input'>;
type MyButtonPropsWithRef = ComponentPropsWithRef<typeof MyButton>;

// Extract ref types
type DivRef = ElementRef<'div'>; // HTMLDivElement
type InputRef = ElementRef<'input'>; // HTMLInputElement

// Utility function using extracted types
function cloneButtonWithProps(
  button: React.ReactElement<ComponentProps<'button'>>,
  additionalProps: Partial<ComponentProps<'button'>>
) {
  return React.cloneElement(button, additionalProps);
}
```

### Built-in Components

Core React built-in components.

```typescript { .api }
/**
 * Fragment component for grouping elements without extra DOM nodes
 */
const Fragment: ExoticComponent<{ children?: ReactNode | undefined }>;

/**
 * StrictMode component for development checks
 */
const StrictMode: ExoticComponent<{ children?: ReactNode | undefined }>;

/**
 * Profiler component for performance measurement
 */
interface ProfilerProps {
  children?: ReactNode | undefined;
  id: string;
  onRender: ProfilerOnRenderCallback;
}

type ProfilerOnRenderCallback = (
  id: string,
  phase: "mount" | "update" | "nested-update",
  actualDuration: number,
  baseDuration: number,
  startTime: number,
  commitTime: number
) => void;

const Profiler: ExoticComponent<ProfilerProps>;

/**
 * Suspense component for loading states
 */
interface SuspenseProps {
  children?: ReactNode | undefined;
  fallback?: ReactNode | undefined;
}

const Suspense: ExoticComponent<SuspenseProps>;
```

**Usage Examples:**

```typescript
import React, { Fragment, StrictMode, Profiler, Suspense } from "react";

// Fragment usage
const List = () => (
  <Fragment>
    <li>Item 1</li>
    <li>Item 2</li>
    <li>Item 3</li>
  </Fragment>
);

// Short syntax
const ShortList = () => (
  <>
    <li>Item 1</li>
    <li>Item 2</li>
  </>
);

// StrictMode for development
const App = () => (
  <StrictMode>
    <div>
      <Header />
      <Main />
      <Footer />
    </div>
  </StrictMode>
);

// Profiler for performance monitoring
const ProfiledComponent = () => {
  const onRenderCallback = (id: string, phase: "mount" | "update", actualDuration: number) => {
    console.log(`${id} ${phase} took ${actualDuration}ms`);
  };

  return (
    <Profiler id="MyComponent" onRender={onRenderCallback}>
      <MyExpensiveComponent />
    </Profiler>
  );
};

// Suspense for loading states
const LazyLoadedApp = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <LazyComponent />
  </Suspense>
);
```

## Types

### Core Type Definitions

```typescript { .api }
// React version
const version: string;

// Internal type markers
const $$typeof: symbol;

// Component state type
type ComponentState = any;

// Legacy types (deprecated)
type ReactText = string | number;
type ReactChild = ReactElement | ReactText;
interface ReactNodeArray extends ReadonlyArray<ReactNode> {}
type ReactFragment = {} | ReactNodeArray;

// Portal type
interface ReactPortal {
  key: Key | null;
  children: ReactNode;
  type: symbol;
  props: {
    children: ReactNode;
  };
}

// Error info for error boundaries
interface ErrorInfo {
  componentStack?: string | null | undefined;
  digest?: string | null | undefined;
}
```