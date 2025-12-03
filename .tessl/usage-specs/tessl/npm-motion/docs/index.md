# Motion

Motion is a comprehensive animation library for JavaScript, React, and Vue applications, providing a unified API across all three frameworks. It features a hybrid engine that combines JavaScript flexibility with native browser APIs to deliver GPU-accelerated animations at 120fps, making it highly performant for complex motion graphics and user interface animations.

## Package Information

- **Package Name**: motion
- **Package Type**: npm
- **Language**: TypeScript
- **Installation**: `npm install motion`

## Core Imports

Motion provides different entry points optimized for specific use cases:

**JavaScript/DOM animations:**
```typescript
import { animate, scroll, inView } from "motion";
```

**React animations:**
```typescript
import { motion, AnimatePresence, useAnimate } from "motion/react";
```

**React client components (HTML/SVG elements):**
```typescript
import { div, span, button, svg, circle } from "motion/react-client";
```

**Mini builds for smaller bundles:**
```typescript
import { animate } from "motion/mini";
import { useAnimate } from "motion/react-mini";
```

**Vue animations:**
```javascript
import { motion } from "motion-v";
```

**Debug utilities:**
```typescript
import { recordStats } from "motion/debug";
```

For CommonJS:
```javascript
const { animate, motion } = require("motion");
```

## Basic Usage

**JavaScript DOM animation:**
```typescript
import { animate } from "motion";

// Animate a DOM element
animate("#box", { x: 100, rotate: 45 }, { duration: 1 });

// Animate with spring physics
animate(".card", { scale: 1.1 }, { type: "spring", stiffness: 300 });
```

**React component animation:**
```typescript
import { motion } from "motion/react";

function AnimatedComponent() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      transition={{ duration: 0.3 }}
    >
      Hello Motion!
    </motion.div>
  );
}
```

**Vue component animation:**
```vue
<script>
import { motion } from "motion-v";

export default {
  components: { motion }
};
</script>

<template>
  <motion.div 
    :animate="{ x: 100, rotate: 45 }"
    :transition="{ duration: 1 }"
  >
    Hello Motion!
  </motion.div>
</template>
```

**Scroll-triggered animation:**
```typescript
import { scroll } from "motion";

scroll(({ y }) => {
  // Animate based on scroll position
  animate("#parallax", { y: y.current * 0.5 });
});
```

## Architecture

Motion is built around several key components:

- **Hybrid Engine**: Blends JavaScript flexibility with native browser APIs for optimal performance
- **Multi-Framework Support**: Unified API across JavaScript, React, and Vue with framework-specific optimizations
- **Entry Point Optimization**: Different builds (main, mini, react, client) for various use cases
- **Animation Features**: Springs, keyframes, gestures, drag interactions, layout animations
- **Performance Features**: GPU acceleration, tree-shaking, lazy loading support

## Capabilities

### DOM Animation

Core DOM animation functionality for animating elements directly without framework dependencies. Provides imperative animation controls with spring physics and keyframe support.

```typescript { .api }
function animate(
  target: string | Element | Element[],
  keyframes: Keyframes,
  options?: AnimationOptions
): AnimationControls;

function scroll(
  onScroll: (info: ScrollInfo) => void,
  options?: ScrollOptions
): () => void;

function inView(
  element: string | Element,
  onStart: (entry: IntersectionObserverEntry) => void | Promise<void>,
  options?: InViewOptions
): () => void;
```

[DOM Animation](./dom-animation.md)

### React Components

React integration providing motion components, hooks, and utilities for creating animated user interfaces with declarative syntax and lifecycle management.

```typescript { .api }
const motion: {
  [K in keyof HTMLElementTagNameMap]: React.ForwardRefExoticComponent<
    HTMLMotionProps<K>
  >;
} & {
  [K in keyof SVGElementTagNameMap]: React.ForwardRefExoticComponent<
    SVGMotionProps<K>
  >;
};

function AnimatePresence(props: AnimatePresenceProps): JSX.Element;

function useAnimate(): [AnimationScope, AnimateFunction];
function useMotionValue<T>(initial: T): MotionValue<T>;
function useSpring(value: MotionValue<number>, config?: SpringOptions): MotionValue<number>;
```

[React Components](./react-components.md)

### Gestures and Interactions

Comprehensive gesture system for handling drag, pan, hover, and tap interactions with physics-based animations and constraint support.

```typescript { .api }
interface DragControls {
  start(event: React.PointerEvent | PointerEvent): void;
  stop(): void;
}

function useDragControls(): DragControls;

interface PanInfo {
  point: Point;
  delta: Point;
  offset: Point;
  velocity: Point;
}
```

[Gestures and Interactions](./gestures.md)

### Layout Animations

Automatic layout animations that handle position and size changes smoothly, including shared layout transitions and reorder animations.

```typescript { .api }
function LayoutGroup(props: LayoutGroupProps): JSX.Element;

interface Reorder {
  Group: React.ForwardRefExoticComponent<ReorderGroupProps>;
  Item: React.ForwardRefExoticComponent<ReorderItemProps>;
}
```

[Layout Animations](./layout-animations.md)

### Animation Controls

Imperative animation controls for complex sequences, timeline management, and dynamic animation orchestration.

```typescript { .api }
interface AnimationControls {
  start(definition: AnimationDefinition): Promise<void>;
  stop(): void;
  set(definition: Target): void;
  mount(): void;
  unmount(): void;
}

function useAnimationControls(): AnimationControls;
```

[Animation Controls](./animation-controls.md)

### Value System

Motion value system for creating, transforming, and composing animated values with reactive updates and performance optimization.

```typescript { .api }
interface MotionValue<T> {
  get(): T;
  set(v: T): void;
  on(eventName: string, callback: (latest: T) => void): () => void;
  destroy(): void;
}

function useTransform<T>(
  value: MotionValue<number>,
  inputRange: number[],
  outputRange: T[]
): MotionValue<T>;
```

[Value System](./value-system.md)

## Types

```typescript { .api }
interface AnimationOptions {
  duration?: number;
  delay?: number;
  ease?: Easing;
  type?: "spring" | "keyframes" | "tween";
  repeat?: number;
  repeatType?: "loop" | "reverse" | "mirror";
  repeatDelay?: number;
}

interface SpringOptions {
  stiffness?: number;
  damping?: number;
  mass?: number;
  bounce?: number;
  duration?: number;
}

type Keyframes = string | number | Array<string | number>;

type Easing = 
  | "linear"
  | "easeIn" 
  | "easeOut" 
  | "easeInOut"
  | "circIn"
  | "circOut"
  | "circInOut"
  | "backIn"
  | "backOut"
  | "backInOut"
  | "anticipate"
  | ((t: number) => number);

interface Point {
  x: number;
  y: number;
}

interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface ScrollInfo {
  x: MotionValue<number>;
  y: MotionValue<number>;
  xProgress: MotionValue<number>;
  yProgress: MotionValue<number>;
}
```