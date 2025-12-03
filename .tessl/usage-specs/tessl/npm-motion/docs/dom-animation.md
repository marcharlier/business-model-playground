# DOM Animation

Core DOM animation functionality for animating elements directly without framework dependencies. Provides imperative animation controls with spring physics, keyframe support, and scroll-based animations.

## Capabilities

### Animate Function

Animates DOM elements using CSS properties with various animation types including springs, keyframes, and tweens.

```typescript { .api }
/**
 * Animate one or more DOM elements
 * @param target - CSS selector, Element, or array of Elements to animate
 * @param keyframes - Animation values (single value or keyframe array)
 * @param options - Animation configuration options
 * @returns Animation controls for the created animation
 */
function animate(
  target: ElementOrSelector,
  keyframes: DOMKeyframesDefinition,
  options?: AnimationOptions
): AnimationPlaybackControlsWithThen;

type ElementOrSelector = Element | Element[] | NodeListOf<Element> | string;

interface AnimationPlaybackControlsWithThen {
  /** The current time of the animation, in seconds */
  time: number;
  /** The playback speed of the animation (1 = normal, 2 = double, 0.5 = half) */
  speed: number;
  /** The start time of the animation, in milliseconds */
  startTime: number | null;
  /** Duration of the animation, in seconds */
  duration: number;
  /** Stops the animation at its current state */
  stop(): void;
  /** Plays the animation */
  play(): void;
  /** Pauses the animation */
  pause(): void;
  /** Completes the animation and applies the final state */
  complete(): void;
  /** Cancels the animation and applies the initial state */
  cancel(): void;
  /** Promise that resolves when animation completes */
  finished: Promise<any>;
  /** Promise-like then method for chaining */
  then(onResolve: () => void, onReject?: () => void): Promise<void>;
}

interface AnimationOptions {
  /** Animation duration in seconds */
  duration?: number;
  /** Delay before animation starts in seconds */
  delay?: number;
  /** Animation easing function */
  ease?: Easing;
  /** Animation type */
  type?: "spring" | "keyframes" | "tween";
  /** Number of times to repeat */
  repeat?: number;
  /** How to repeat the animation */
  repeatType?: "loop" | "reverse" | "mirror";
  /** Delay between repeats in seconds */
  repeatDelay?: number;
  /** Direction of animation */
  direction?: "normal" | "reverse" | "alternate" | "alternate-reverse";
  /** Spring-specific options */
  stiffness?: number;
  damping?: number;
  mass?: number;
  bounce?: number;
}

type DOMKeyframesDefinition = {
  [K in keyof CSSStyleDeclaration]?: ValueKeyframesDefinition;
} & {
  x?: ValueKeyframesDefinition;
  y?: ValueKeyframesDefinition;
  z?: ValueKeyframesDefinition;
  rotate?: ValueKeyframesDefinition;
  scale?: ValueKeyframesDefinition;
  skew?: ValueKeyframesDefinition;
  pathLength?: ValueKeyframesDefinition;
  pathOffset?: ValueKeyframesDefinition;
  [key: `--${string}`]: ValueKeyframesDefinition;
};

type ValueKeyframesDefinition = 
  | string 
  | number 
  | Array<string | number | null>;
```

**Usage Examples:**

```typescript
import { animate } from "motion";

// Simple property animation
animate("#box", { x: 100, y: 50 }, { duration: 1 });

// Multiple keyframes
animate(".card", { 
  scale: [1, 1.2, 1],
  rotate: [0, 180, 360]
}, { duration: 2, ease: "easeInOut" });

// Spring animation
animate("#element", { x: 200 }, { 
  type: "spring",
  stiffness: 300,
  damping: 20
});

// Complex keyframe object
animate("#complex", {
  x: [0, 100, 200],
  backgroundColor: ["#ff0000", "#00ff00", "#0000ff"],
  borderRadius: ["0px", "50px", "0px"]
}, { duration: 3 });
```

### Animate Mini

Lightweight animation function using the Web Animations API for simple animations with minimal bundle size.

```typescript { .api }
/**
 * Lightweight WAAPI-based animation
 * @param target - CSS selector or Element to animate
 * @param keyframes - WAAPI-compatible keyframe object
 * @param options - WAAPI animation options
 * @returns Web Animation API Animation instance
 */
function animateMini(
  target: string | Element,
  keyframes: Keyframe[] | PropertyIndexedKeyframes,
  options?: KeyframeAnimationOptions
): Animation;
```

### Animate Sequence

Creates sequential animations that play one after another or with timing offsets.

```typescript { .api }
/**
 * Create a sequence of animations
 * @param sequence - Array of animation definitions
 * @returns Promise that resolves when sequence completes
 */
function animateSequence(
  sequence: AnimationSequence[]
): Promise<void>;

interface AnimationSequence {
  target: string | Element | Element[];
  keyframes: Keyframes;
  options?: AnimationOptions & { at?: number | string };
}
```

**Usage Examples:**

```typescript
import { animateSequence } from "motion";

// Sequential animations
await animateSequence([
  { target: "#first", keyframes: { x: 100 }, options: { duration: 1 } },
  { target: "#second", keyframes: { y: 100 }, options: { duration: 1 } },
  { target: "#third", keyframes: { scale: 1.5 }, options: { duration: 1 } },
]);

// Overlapping animations with timing
await animateSequence([
  { target: "#a", keyframes: { x: 100 }, options: { duration: 2 } },
  { target: "#b", keyframes: { y: 100 }, options: { duration: 1, at: 0.5 } },
  { target: "#c", keyframes: { rotate: 360 }, options: { duration: 1, at: "-0.5" } },
]);
```

### Scroll Animation

Creates scroll-driven animations that respond to page or element scroll position.

```typescript { .api }
/**
 * Create scroll-driven animations
 * @param onScroll - Callback function or animation controls
 * @param options - Scroll animation options
 * @returns Function to stop scroll listener
 */
function scroll(
  onScroll: OnScroll | AnimationPlaybackControls,
  options?: ScrollOptions
): VoidFunction;

type OnScroll = (progress: number) => void | ((progress: number, info: ScrollInfo) => void);

interface ScrollInfo {
  time: number;
  x: AxisScrollInfo;
  y: AxisScrollInfo;
}

interface AxisScrollInfo {
  current: number;
  offset: number[];
  progress: number;
  scrollLength: number;
  velocity: number;
  targetOffset: number;
  targetLength: number;
  containerLength: number;
}

interface ScrollOptions {
  /** Source element for scroll events */
  source?: HTMLElement;
  /** Container element for scroll tracking */
  container?: Element;
  /** Target element to track scroll position */
  target?: Element;
  /** Axis to track ("x" or "y", defaults to "y") */
  axis?: "x" | "y";
  /** Scroll offset boundaries */
  offset?: ScrollOffset;
}

type ScrollOffset = Array<Edge | Intersection | ProgressIntersection>;
type Edge = string | number;
type Intersection = `${Edge} ${Edge}`;
type ProgressIntersection = [number, number];
```

**Usage Examples:**

```typescript
import { scroll, animate } from "motion";

// Basic scroll animation
const stopScrolling = scroll(({ y }) => {
  animate("#parallax", { 
    y: y.current * 0.5,
    opacity: 1 - y.progress 
  });
});

// Element-specific scroll tracking
scroll(({ yProgress }) => {
  animate("#progress-bar", { 
    scaleX: yProgress.current 
  });
}, { 
  target: document.querySelector("#scroll-container"),
  offset: ["start end", "end start"]
});
```

### Scroll Info

Utility function for getting current scroll information without setting up a scroll listener.

```typescript { .api }
/**
 * Get current scroll information
 * @param element - Element to get scroll info for (defaults to window)
 * @returns Current scroll position and progress
 */
function scrollInfo(element?: Element): ScrollInfoSnapshot;

interface ScrollInfoSnapshot {
  /** Current horizontal scroll position */
  x: number;
  /** Current vertical scroll position */
  y: number;
  /** Horizontal scroll progress (0-1) */
  xProgress: number;
  /** Vertical scroll progress (0-1) */
  yProgress: number;
}
```

**Usage Examples:**

```typescript
import { scrollInfo } from "motion";

// Get current window scroll info
const currentScroll = scrollInfo();
console.log("Scroll position:", currentScroll.x, currentScroll.y);
console.log("Scroll progress:", currentScroll.xProgress, currentScroll.yProgress);

// Get scroll info for specific element
const containerScroll = scrollInfo(document.querySelector("#container"));
```

### InView Animation

Triggers animations when elements enter or leave the viewport using Intersection Observer.

```typescript { .api }
/**
 * Trigger animation when element enters viewport
 * @param element - CSS selector or Element to observe
 * @param onStart - Callback when element enters view
 * @param options - Intersection observer options
 * @returns Function to stop observing
 */
function inView(
  elementOrSelector: ElementOrSelector,
  onStart: (element: Element, entry: IntersectionObserverEntry) => void | ViewChangeHandler,
  options?: InViewOptions
): VoidFunction;

type ViewChangeHandler = (entry: IntersectionObserverEntry) => void;

interface InViewOptions {
  /** Root element for intersection (defaults to viewport) */
  root?: Element | Document;
  /** Root margin for intersection calculations */
  margin?: MarginType;
  /** Threshold for triggering intersection */
  amount?: "some" | "all" | number;
}

type MarginType =
  | `${number}${"px" | "%"}`
  | `${number}${"px" | "%"} ${number}${"px" | "%"}`
  | `${number}${"px" | "%"} ${number}${"px" | "%"} ${number}${"px" | "%"}`
  | `${number}${"px" | "%"} ${number}${"px" | "%"} ${number}${"px" | "%"} ${number}${"px" | "%"}`;
```

**Usage Examples:**

```typescript
import { inView, animate } from "motion";

// Animate when element enters view
const stopObserving = inView("#fadeIn", (entry) => {
  animate(entry.target, 
    { opacity: 1, y: 0 }, 
    { duration: 0.6 }
  );
});

// Multiple threshold points
inView(".card", (entry) => {
  if (entry.isIntersecting) {
    animate(entry.target, { scale: 1, opacity: 1 });
  } else {
    animate(entry.target, { scale: 0.8, opacity: 0.5 });
  }
}, { amount: 0.5 });
```

### Scoped Animation

Creates animation functions scoped to specific elements or contexts for better performance and organization.

```typescript { .api }
/**
 * Create a scoped animation function
 * @param scope - Root element or selector for scoping
 * @returns Scoped animate function
 */
function createScopedAnimate(
  scope: string | Element
): (target: string, keyframes: Keyframes, options?: AnimationOptions) => AnimationControls;
```

**Usage Examples:**

```typescript
import { createScopedAnimate } from "motion";

// Create scoped animator for a component
const animateInModal = createScopedAnimate("#modal");

// All animations are scoped to the modal
animateInModal(".title", { y: 0, opacity: 1 });
animateInModal(".content", { y: 20, opacity: 1 }, { delay: 0.1 });
animateInModal(".button", { scale: 1 }, { delay: 0.2 });
```

## Value Utilities

### Color Values

Color manipulation utilities for animating between different color formats.

```typescript { .api }
/**
 * Create RGB color value
 * @param r - Red component (0-255)
 * @param g - Green component (0-255) 
 * @param b - Blue component (0-255)
 * @returns RGB color string
 */
function rgb(r: number, g: number, b: number): string;

/**
 * Create RGBA color value
 * @param r - Red component (0-255)
 * @param g - Green component (0-255)
 * @param b - Blue component (0-255)
 * @param a - Alpha component (0-1)
 * @returns RGBA color string
 */
function rgba(r: number, g: number, b: number, a: number): string;

/**
 * Create HSL color value
 * @param h - Hue (0-360)
 * @param s - Saturation percentage (0-100)
 * @param l - Lightness percentage (0-100)
 * @returns HSL color string
 */
function hsl(h: number, s: number, l: number): string;

/**
 * Convert hex color to RGB object
 * @param hex - Hex color string
 * @returns RGB color object
 */
function hex(hex: string): { r: number; g: number; b: number };
```

### Interpolation

Value interpolation utilities for creating smooth transitions between values.

```typescript { .api }
/**
 * Interpolate between two values
 * @param from - Start value
 * @param to - End value
 * @param progress - Progress between values (0-1)
 * @returns Interpolated value
 */
function mix(from: number, to: number, progress: number): number;

/**
 * Create interpolation function from input/output ranges
 * @param inputRange - Array of input values
 * @param outputRange - Array of corresponding output values
 * @param options - Interpolation options
 * @returns Interpolation function
 */
function interpolate(
  inputRange: number[],
  outputRange: (number | string)[],
  options?: InterpolateOptions
): (input: number) => number | string;

interface InterpolateOptions {
  /** Clamp output to range */
  clamp?: boolean;
  /** Easing function to apply */
  ease?: Easing;
}
```

## Debug Utilities

### Performance Statistics

Debug utility for recording animation performance statistics.

```typescript { .api }
/**
 * Record performance statistics for animations
 * @param enabled - Whether to enable statistics recording
 * @returns Performance statistics object
 */
function recordStats(enabled?: boolean): PerformanceStats;

interface PerformanceStats {
  /** Start recording statistics */
  start(): void;
  /** Stop recording statistics */
  stop(): void;
  /** Get current statistics */
  getStats(): AnimationStats;
  /** Clear recorded statistics */
  clear(): void;
}

interface AnimationStats {
  /** Total animations created */
  totalAnimations: number;
  /** Currently active animations */
  activeAnimations: number;
  /** Average frame rate */
  averageFPS: number;
  /** Dropped frames count */
  droppedFrames: number;
  /** Memory usage in MB */
  memoryUsage: number;
}
```

**Usage Examples:**

```typescript
import { recordStats } from "motion/debug";

// Start recording performance stats
const stats = recordStats(true);
stats.start();

// Run some animations...
animate("#element1", { x: 100 });
animate("#element2", { scale: 1.5 });

// Check performance
const currentStats = stats.getStats();
console.log("FPS:", currentStats.averageFPS);
console.log("Active animations:", currentStats.activeAnimations);

// Stop recording
stats.stop();
```