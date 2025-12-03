# React Components

React integration providing motion components, hooks, and utilities for creating animated user interfaces with declarative syntax and lifecycle management.

## Capabilities

### Motion Components

React components that can be animated using motion props. Available for all HTML and SVG elements.

```typescript { .api }
/**
 * Motion component namespace providing animated versions of all HTML and SVG elements
 */
const motion: {
  [K in keyof HTMLElementTagNameMap]: React.ForwardRefExoticComponent<
    HTMLMotionProps<K>
  >;
} & {
  [K in keyof SVGElementTagNameMap]: React.ForwardRefExoticComponent<
    SVGMotionProps<K>
  >;
};

interface HTMLMotionProps<T extends keyof HTMLElementTagNameMap> 
  extends Omit<React.HTMLAttributes<HTMLElementTagNameMap[T]>, keyof MotionProps>,
          MotionProps {}

interface SVGMotionProps<T extends keyof SVGElementTagNameMap>
  extends Omit<React.SVGAttributes<SVGElementTagNameMap[T]>, keyof MotionProps>,
          MotionProps {}

interface MotionProps {
  /** Initial animation state */
  initial?: Target | boolean | VariantLabels;
  /** Animation to run on mount or when animate prop changes */
  animate?: Target | VariantLabels | AnimationControls;
  /** Animation to run on unmount */
  exit?: Target | VariantLabels;
  /** Transition configuration */
  transition?: Transition;
  /** Animation variants */
  variants?: Variants;
  /** Manual animation controls */
  animate?: AnimationControls;
  /** Whether component should animate on mount */
  initial?: boolean | Target | VariantLabels;
  /** Layout animation settings */
  layout?: boolean | "position" | "size";
  /** Layout ID for shared layout animations */
  layoutId?: string;
  /** Drag configuration */
  drag?: boolean | "x" | "y";
  /** Drag constraints */
  dragConstraints?: Partial<Box> | React.RefObject<Element>;
  /** Drag momentum settings */
  dragMomentum?: boolean;
  /** Drag elastic settings */
  dragElastic?: boolean | number;
  /** Whlie dragging animation */
  whileDrag?: Target | VariantLabels;
  /** While hovering animation */
  whileHover?: Target | VariantLabels;
  /** While tapping animation */
  whileTap?: Target | VariantLabels;
  /** While in view animation */
  whileInView?: Target | VariantLabels;
}

type Target = {
  [key: string]: string | number | MotionValue;
};

type VariantLabels = string | string[];

interface Variants {
  [key: string]: Target | ((custom?: any, current?: Target) => Target);
}
```

**Usage Examples:**

```typescript
import { motion } from "motion/react";

// Basic animation
function AnimatedBox() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.3 }}
    >
      Content
    </motion.div>
  );
}

// Hover and tap interactions
function InteractiveButton() {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      Click me
    </motion.button>
  );
}

// Drag interaction
function DraggableCard() {
  return (
    <motion.div
      drag
      dragConstraints={{ left: -100, right: 100, top: -100, bottom: 100 }}
      dragElastic={0.1}
      whileDrag={{ scale: 1.1 }}
    >
      Drag me around
    </motion.div>
  );
}
```

### Minimal Motion Components

Smaller bundle size alternative to motion components with essential animation features.

```typescript { .api }
/**
 * Minimal motion component namespace for smaller bundle sizes
 */
const m: {
  [K in keyof HTMLElementTagNameMap]: React.ForwardRefExoticComponent<
    HTMLMotionProps<K>
  >;
} & {
  [K in keyof SVGElementTagNameMap]: React.ForwardRefExoticComponent<
    SVGMotionProps<K>
  >;
};
```

### AnimatePresence

Container component for animating components as they're added or removed from the React tree.

```typescript { .api }
/**
 * Animate components entering and leaving the React tree
 * @param props - AnimatePresence configuration
 * @returns JSX element wrapping animated children
 */
function AnimatePresence(props: AnimatePresenceProps): JSX.Element;

interface AnimatePresenceProps {
  /** Child components to animate */
  children?: React.ReactNode;
  /** Custom exit animations */
  exitBeforeEnter?: boolean;
  /** Whether to animate initial render */
  initial?: boolean;
  /** Callback when element finishes exiting */
  onExitComplete?: () => void;
  /** Animation mode */
  mode?: "wait" | "sync" | "popLayout";
}
```

**Usage Examples:**

```typescript
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

function ToggleExample() {
  const [isVisible, setIsVisible] = useState(true);

  return (
    <div>
      <button onClick={() => setIsVisible(!isVisible)}>
        Toggle
      </button>
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            This content animates in and out
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
```

### MotionConfig

Global configuration component for setting default animation options across an app.

```typescript { .api }
/**
 * Provide global motion configuration
 * @param props - Configuration options
 * @returns JSX element providing configuration context
 */
function MotionConfig(props: MotionConfigProps): JSX.Element;

interface MotionConfigProps {
  /** Child components to apply configuration to */
  children?: React.ReactNode;
  /** Default transition for all animations */
  transition?: Transition;
  /** Whether to respect user's reduced motion preference */
  reducedMotion?: "always" | "never" | "user";
  /** Transform template for custom transforms */
  transformTemplate?: (transform: TransformProperties, generated: string) => string;
  /** Animation features to load */
  features?: MotionFeature[];
}
```

### LazyMotion

Component for lazy loading animation features to reduce initial bundle size.

```typescript { .api }
/**
 * Lazy load animation features
 * @param props - Lazy loading configuration
 * @returns JSX element providing lazy-loaded features
 */
function LazyMotion(props: LazyMotionProps): JSX.Element;

interface LazyMotionProps {
  /** Child components */
  children: React.ReactNode;
  /** Animation features to load */
  features: () => Promise<MotionFeature>;
  /** Whether to load features strictly */
  strict?: boolean;
}

// Pre-built feature sets
const domAnimation: () => Promise<MotionFeature>;
const domMax: () => Promise<MotionFeature>;
const domMin: () => Promise<MotionFeature>;
```

**Usage Examples:**

```typescript
import { LazyMotion, domAnimation, motion } from "motion/react";

function App() {
  return (
    <LazyMotion features={domAnimation}>
      <motion.div animate={{ x: 100 }}>
        Animations loaded lazily
      </motion.div>
    </LazyMotion>
  );
}
```

## Animation Hooks

### useAnimate

Hook for imperative animations with a scoped animation function and element reference.

```typescript { .api }
/**
 * Hook for imperative animations
 * @returns Tuple of animation scope ref and animate function
 */
function useAnimate<T extends Element = any>(): [
  React.RefObject<T>,
  (
    target: string,
    keyframes: Keyframes,
    options?: AnimationOptions
  ) => AnimationControls
];

type AnimationScope<T = any> = React.RefObject<T>;
type AnimateFunction = (
  target: string,
  keyframes: Keyframes,
  options?: AnimationOptions
) => AnimationControls;
```

**Usage Examples:**

```typescript
import { useAnimate } from "motion/react";

function AnimatedComponent() {
  const [scope, animate] = useAnimate();

  const handleClick = async () => {
    await animate(".title", { y: -10 }, { duration: 0.1 });
    await animate(".title", { y: 0 }, { duration: 0.1 });
    animate(".content", { opacity: 1, y: 0 }, { duration: 0.3 });
  };

  return (
    <div ref={scope}>
      <h2 className="title">Title</h2>
      <p className="content" style={{ opacity: 0, transform: "translateY(20px)" }}>
        Content
      </p>
      <button onClick={handleClick}>Animate</button>
    </div>
  );
}
```

### useAnimationControls

Hook for creating animation control objects for manual animation management.

```typescript { .api }
/**
 * Create animation controls for manual animation management
 * @returns Animation controls object
 */
function useAnimationControls(): AnimationControls;

interface AnimationControls {
  /** Start animation with target values */
  start(definition: Target | VariantLabels): Promise<void>;
  /** Stop all animations */
  stop(): void;
  /** Set values immediately without animation */
  set(definition: Target): void;
  /** Mount controls (internal) */
  mount(): void;
  /** Unmount controls (internal) */
  unmount(): void;
}
```

**Usage Examples:**

```typescript
import { motion, useAnimationControls } from "motion/react";

function ControlledAnimation() {
  const controls = useAnimationControls();

  const startAnimation = () => {
    controls.start({
      x: 100,
      transition: { duration: 1 }
    });
  };

  return (
    <div>
      <motion.div animate={controls} />
      <button onClick={startAnimation}>Start</button>
      <button onClick={() => controls.stop()}>Stop</button>
    </div>
  );
}
```

### useMotionValue

Hook for creating and managing animated values that can be shared between components.

```typescript { .api }
/**
 * Create a motion value
 * @param initial - Initial value
 * @returns MotionValue instance
 */
function useMotionValue<T>(initial: T): MotionValue<T>;

interface MotionValue<T> {
  /** Get current value */
  get(): T;
  /** Set value */
  set(v: T): void;
  /** Subscribe to value changes */
  on(eventName: "change", callback: (latest: T) => void): () => void;
  /** Destroy motion value */
  destroy(): void;
  /** Stop all animations on this value */
  stop(): void;
  /** Check if value is currently animating */
  isAnimating(): boolean;
}
```

### useTransform

Hook for creating derived motion values that transform input values to output values.

```typescript { .api }
/**
 * Transform a motion value through an input/output range
 * @param value - Source motion value
 * @param inputRange - Array of input values
 * @param outputRange - Array of corresponding output values
 * @param options - Transform options
 * @returns Transformed motion value
 */
function useTransform<T>(
  value: MotionValue<number>,
  inputRange: number[],
  outputRange: T[],
  options?: TransformOptions<T>
): MotionValue<T>;

/**
 * Transform a motion value using a function
 * @param value - Source motion value or array of values
 * @param transformer - Transform function
 * @returns Transformed motion value
 */
function useTransform<I, O>(
  value: MotionValue<I> | MotionValue<I>[],
  transformer: (value: I) => O
): MotionValue<O>;

interface TransformOptions<T> {
  /** Clamp output to range */
  clamp?: boolean;
  /** Easing function */
  ease?: Easing | Easing[];
}
```

**Usage Examples:**

```typescript
import { motion, useMotionValue, useTransform } from "motion/react";

function TransformExample() {
  const x = useMotionValue(0);
  const opacity = useTransform(x, [-100, 0, 100], [0, 1, 0]);
  const scale = useTransform(x, [-100, 0, 100], [0.5, 1, 0.5]);

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: -100, right: 100 }}
      style={{ x, opacity, scale }}
    >
      Drag me horizontally
    </motion.div>
  );
}
```

### useSpring

Hook for creating spring-animated motion values.

```typescript { .api }
/**
 * Create a spring-animated motion value
 * @param value - Source motion value or initial value
 * @param config - Spring configuration
 * @returns Spring-animated motion value
 */
function useSpring(
  value: MotionValue<number> | number,
  config?: SpringOptions
): MotionValue<number>;

interface SpringOptions {
  stiffness?: number;
  damping?: number;
  mass?: number;
  bounce?: number;
}
```

### useScroll

Hook for creating scroll-based motion values.

```typescript { .api }
/**
 * Track scroll position and progress
 * @param options - Scroll tracking options
 * @returns Object containing scroll motion values
 */
function useScroll(options?: UseScrollOptions): ScrollMotionValues;

interface UseScrollOptions {
  /** Target element to track (defaults to window) */
  target?: React.RefObject<Element>;
  /** Offset boundaries for progress calculation */
  offset?: Array<string | number>;
  /** Layout effect timing */
  layoutEffect?: boolean;
}

interface ScrollMotionValues {
  /** Horizontal scroll position */
  scrollX: MotionValue<number>;
  /** Vertical scroll position */
  scrollY: MotionValue<number>;
  /** Horizontal scroll progress (0-1) */
  scrollXProgress: MotionValue<number>;
  /** Vertical scroll progress (0-1) */
  scrollYProgress: MotionValue<number>;
}
```

### useVelocity

Hook for tracking the velocity of a motion value.

```typescript { .api }
/**
 * Track velocity of a motion value
 * @param value - Motion value to track
 * @returns Motion value containing velocity
 */
function useVelocity(value: MotionValue<number>): MotionValue<number>;
```

### useInView

Hook for detecting when an element is in the viewport.

```typescript { .api }
/**
 * Detect when element is in viewport
 * @param options - Intersection observer options
 * @returns Tuple of ref and isInView boolean
 */
function useInView(options?: UseInViewOptions): [React.RefObject<Element>, boolean];

interface UseInViewOptions {
  /** Root element for intersection */
  root?: React.RefObject<Element>;
  /** Root margin */
  margin?: string;
  /** Intersection threshold */
  amount?: "some" | "all" | number;
  /** Run only once */
  once?: boolean;
}
```

### Utility Hooks

Additional utility hooks for enhanced functionality.

```typescript { .api }
/**
 * Cycle through an array of values
 * @param items - Array of values to cycle through
 * @returns Tuple of current value and cycle function
 */
function useCycle<T>(...items: T[]): [T, () => void];

/**
 * Create motion template from template string
 * @param template - Template string with motion value placeholders
 * @param values - Motion values to substitute
 * @returns Motion value containing template result
 */
function useMotionTemplate(
  template: TemplateStringsArray,
  ...values: MotionValue[]
): MotionValue<string>;

/**
 * Create time-based motion value
 * @returns Motion value that updates with current time
 */
function useTime(): MotionValue<number>;

/**
 * Optimize will-change CSS property
 * @returns Ref to attach to element
 */
function useWillChange(): React.RefObject<Element>;

/**
 * Check user's reduced motion preference
 * @returns Boolean indicating if user prefers reduced motion
 */
function useReducedMotion(): boolean | null;

/**
 * Hook for presence detection in AnimatePresence
 * @returns Tuple of presence state and safe removal callback
 */
function usePresence(): [boolean, () => void | undefined];

/**
 * Check if component is currently present
 * @returns Boolean indicating current presence state
 */
function useIsPresent(): boolean;

/**
 * Hook for DOM event handling with cleanup
 * @param ref - Element ref to attach event to
 * @param eventName - Name of DOM event
 * @param handler - Event handler function
 * @param options - Event listener options
 */
function useDomEvent(
  ref: React.RefObject<Element>,
  eventName: string,
  handler: (event: Event) => void,
  options?: AddEventListenerOptions
): void;
```

### React Contexts

React contexts for advanced motion configuration and state management.

```typescript { .api }
/**
 * Core motion context for component coordination
 */
const MotionContext: React.Context<MotionContextValue>;

/**
 * Global motion configuration context
 */
const MotionConfigContext: React.Context<MotionConfigContextValue>;

/**
 * Layout group context for coordinating layout animations
 */
const LayoutGroupContext: React.Context<LayoutGroupContextValue>;

/**
 * Presence context for AnimatePresence state
 */
const PresenceContext: React.Context<PresenceContextValue>;

/**
 * Layout group switching context
 */
const SwitchLayoutGroupContext: React.Context<SwitchLayoutGroupContextValue>;

interface MotionContextValue {
  /** Transform template function */
  transformTemplate?: (transform: TransformProperties, generated: string) => string;
  /** Reduced motion setting */
  reducedMotion?: "always" | "never" | "user";
}

interface MotionConfigContextValue {
  /** Global transition settings */
  transition?: Transition;
  /** Transform template */
  transformTemplate?: (transform: TransformProperties, generated: string) => string;
  /** Reduced motion preference */
  reducedMotion?: "always" | "never" | "user";
}

interface LayoutGroupContextValue {
  /** Layout group ID */
  id?: string;
  /** Group inheritance */
  inherit?: boolean;
}

interface PresenceContextValue {
  /** Whether component is present */
  isPresent: boolean;
  /** Safe to remove callback */
  safeToRemove?: () => void;
  /** Custom exit animation */
  custom?: any;
}

interface SwitchLayoutGroupContextValue {
  /** Switch layout group */
  switchLayoutGroup: () => void;
}
```