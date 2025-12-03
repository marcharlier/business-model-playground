# Value System

Motion value system for creating, transforming, and composing animated values with reactive updates and performance optimization.

## Capabilities

### MotionValue

Core animated value container that can be subscribed to and transformed.

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
  /** Set value (triggers subscribers) */
  set(value: T): void;
  /** Subscribe to value changes */
  on(eventName: "change", callback: (latest: T) => void): () => void;
  /** Subscribe to velocity changes */
  on(eventName: "velocityChange", callback: (latest: number) => void): () => void;
  /** Subscribe to animation start */
  on(eventName: "animationStart", callback: () => void): () => void;
  /** Subscribe to animation complete */
  on(eventName: "animationComplete", callback: () => void): () => void;
  /** Stop all animations on this value */
  stop(): void;
  /** Destroy motion value and cleanup */
  destroy(): void;
  /** Check if value is currently animating */
  isAnimating(): boolean;
  /** Get current velocity */
  getVelocity(): number;
  /** Get previous value */
  getPrevious(): T;
  /** Jump to value without animation */
  jump(value: T): void;
}
```

**Usage Examples:**

```typescript
import { motion, useMotionValue } from "motion/react";
import { useEffect } from "react";

function MotionValueExample() {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  useEffect(() => {
    // Subscribe to value changes
    const unsubscribeX = x.on("change", (latest) => {
      console.log("X changed to:", latest);
    });

    const unsubscribeVelocity = x.on("velocityChange", (velocity) => {
      console.log("X velocity:", velocity);
    });

    return () => {
      unsubscribeX();
      unsubscribeVelocity();
    };
  }, [x]);

  const handleClick = () => {
    x.set(Math.random() * 200);
    y.set(Math.random() * 200);
  };

  return (
    <div>
      <motion.div
        style={{ x, y }}
        drag
        dragConstraints={{ left: 0, right: 300, top: 0, bottom: 300 }}
      >
        Drag me or click button
      </motion.div>
      <button onClick={handleClick}>Random Position</button>
      <p>X: {x.get().toFixed(2)}</p>
    </div>
  );
}
```

### Transform Values

Transform motion values using input/output ranges or custom functions.

```typescript { .api }
/**
 * Transform a motion value through input/output ranges
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
 * Transform using a custom function
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
  /** Easing function for transform */
  ease?: Easing | Easing[];
  /** Mix mode for color transformations */
  mixer?: (from: T, to: T) => (progress: number) => T;
}
```

**Usage Examples:**

```typescript
import { motion, useMotionValue, useTransform } from "motion/react";

function TransformExample() {
  const x = useMotionValue(0);
  
  // Transform position to opacity
  const opacity = useTransform(x, [-100, 0, 100], [0, 1, 0]);
  
  // Transform position to scale
  const scale = useTransform(x, [-100, 0, 100], [0.5, 1, 0.5]);
  
  // Transform position to rotation
  const rotate = useTransform(x, [-100, 100], [-45, 45]);
  
  // Transform position to color
  const backgroundColor = useTransform(
    x,
    [-100, 0, 100],
    ["#ef4444", "#6366f1", "#22c55e"]
  );

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: -100, right: 100 }}
      style={{
        x,
        opacity,
        scale,
        rotate,
        backgroundColor,
        width: 100,
        height: 100,
        borderRadius: 8
      }}
    >
      Drag me horizontally
    </motion.div>
  );
}
```

### Spring Values

Create spring-animated motion values for natural, physics-based animations.

```typescript { .api }
/**
 * Create spring-animated motion value
 * @param value - Source motion value or static value
 * @param config - Spring configuration
 * @returns Spring-animated motion value
 */
function useSpring(
  value: MotionValue<number> | number,
  config?: SpringOptions
): MotionValue<number>;

interface SpringOptions {
  /** Spring stiffness (default: 100) */
  stiffness?: number;
  /** Spring damping (default: 10) */
  damping?: number;
  /** Spring mass (default: 1) */
  mass?: number;
  /** Bounce amount (0-1, alternative to damping) */
  bounce?: number;
  /** Minimum change threshold */
  restSpeed?: number;
  /** Minimum displacement threshold */
  restDelta?: number;
}
```

**Usage Examples:**

```typescript
import { motion, useMotionValue, useSpring } from "motion/react";

function SpringExample() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Create spring-animated values that follow mouse
  const springX = useSpring(mouseX, { stiffness: 150, damping: 15 });
  const springY = useSpring(mouseY, { stiffness: 150, damping: 15 });

  const handleMouseMove = (e: React.MouseEvent) => {
    mouseX.set(e.clientX - 50);
    mouseY.set(e.clientY - 50);
  };

  return (
    <div 
      onMouseMove={handleMouseMove}
      style={{ width: "100vw", height: "100vh", position: "relative" }}
    >
      <motion.div
        style={{
          x: springX,
          y: springY,
          position: "absolute",
          width: 100,
          height: 100,
          backgroundColor: "#f59e0b",
          borderRadius: "50%",
          pointerEvents: "none"
        }}
      />
      <p>Move your mouse around</p>
    </div>
  );
}
```

### Velocity Tracking

Track and utilize velocity of motion values for momentum-based interactions.

```typescript { .api }
/**
 * Track velocity of a motion value
 * @param value - Motion value to track
 * @returns Motion value containing velocity
 */
function useVelocity(value: MotionValue<number>): MotionValue<number>;

/**
 * Get instantaneous velocity
 * @param value - Motion value
 * @returns Current velocity
 */
function getVelocity(value: MotionValue<number>): number;
```

**Usage Examples:**

```typescript
import { motion, useMotionValue, useVelocity, useTransform } from "motion/react";

function VelocityExample() {
  const x = useMotionValue(0);
  const xVelocity = useVelocity(x);
  
  // Transform velocity to visual effects
  const scale = useTransform(xVelocity, [-1000, 0, 1000], [0.8, 1, 1.2]);
  const opacity = useTransform(xVelocity, [-1000, 0, 1000], [0.5, 1, 0.5]);

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: -200, right: 200 }}
      style={{
        x,
        scale,
        opacity,
        width: 100,
        height: 100,
        backgroundColor: "#8b5cf6",
        borderRadius: 8
      }}
    >
      Drag fast for effects
    </motion.div>
  );
}
```

### Motion Templates

Create string templates with embedded motion values for complex animations.

```typescript { .api }
/**
 * Create motion template string
 * @param template - Template string with placeholders
 * @param values - Motion values to substitute
 * @returns Motion value containing template result
 */
function useMotionTemplate(
  template: TemplateStringsArray,
  ...values: (MotionValue<any> | string | number)[]
): MotionValue<string>;
```

**Usage Examples:**

```typescript
import { motion, useMotionValue, useMotionTemplate } from "motion/react";

function TemplateExample() {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useMotionValue(0);

  // Create complex transform template
  const transform = useMotionTemplate`translateX(${x}px) translateY(${y}px) rotate(${rotate}deg)`;
  
  // Create gradient template
  const hue = useMotionValue(0);
  const saturation = useMotionValue(50);
  const background = useMotionTemplate`linear-gradient(45deg, hsl(${hue}, ${saturation}%, 50%), hsl(${hue}, ${saturation}%, 70%))`;

  const handleClick = () => {
    x.set(Math.random() * 200 - 100);
    y.set(Math.random() * 200 - 100);
    rotate.set(Math.random() * 360);
    hue.set(Math.random() * 360);
    saturation.set(Math.random() * 50 + 50);
  };

  return (
    <motion.div
      style={{
        transform,
        background,
        width: 150,
        height: 150,
        borderRadius: 8,
        cursor: "pointer"
      }}
      onClick={handleClick}
    >
      Click me
    </motion.div>
  );
}
```

### Time-based Values

Create motion values that update based on time for continuous animations.

```typescript { .api }
/**
 * Create time-based motion value
 * @returns Motion value that updates with current time
 */
function useTime(): MotionValue<number>;

/**
 * Create animation frame motion value
 * @param callback - Function to call each frame
 * @param autoStart - Whether to start immediately
 * @returns Control functions
 */
function useAnimationFrame(
  callback: (time: number, delta: number) => void,
  autoStart?: boolean
): {
  start: () => void;
  stop: () => void;
  isRunning: boolean;
};
```

**Usage Examples:**

```typescript
import { motion, useTime, useTransform } from "motion/react";

function TimeAnimation() {
  const time = useTime();
  
  // Create oscillating values based on time
  const x = useTransform(time, (t) => Math.sin(t / 1000) * 50);
  const y = useTransform(time, (t) => Math.cos(t / 1000) * 50);
  const rotate = useTransform(time, (t) => t / 10);
  const hue = useTransform(time, (t) => (t / 50) % 360);
  
  const backgroundColor = useTransform(hue, (h) => `hsl(${h}, 70%, 60%)`);

  return (
    <motion.div
      style={{
        x,
        y,
        rotate,
        backgroundColor,
        width: 100,
        height: 100,
        borderRadius: "50%",
        margin: "200px auto"
      }}
    >
      Time-based animation
    </motion.div>
  );
}
```

### Value Composition

Combine multiple motion values into complex animations and interactions.

```typescript { .api }
/**
 * Combine multiple motion values
 * @param values - Array of motion values
 * @param combiner - Function to combine values
 * @returns Combined motion value
 */
function combineMotionValues<T>(
  values: MotionValue<any>[],
  combiner: (...values: any[]) => T
): MotionValue<T>;

/**
 * Create complex motion value from multiple sources
 * @param config - Configuration object
 * @returns Complex motion value
 */
function useComplexMotionValue<T>(config: ComplexValueConfig<T>): MotionValue<T>;

interface ComplexValueConfig<T> {
  /** Source motion values */
  sources: { [key: string]: MotionValue<any> };
  /** Combination function */
  combiner: (values: { [key: string]: any }) => T;
  /** Update mode */
  mode?: "immediate" | "throttled" | "debounced";
  /** Throttle/debounce delay */
  delay?: number;
}
```

### Performance Optimization

Tools for optimizing motion value performance and memory usage.

```typescript { .api }
/**
 * Optimize will-change CSS property
 * @returns Ref to attach to element
 */
function useWillChange(): React.RefObject<Element>;

/**
 * Create optimized motion value for transforms
 * @param property - Transform property name
 * @param initial - Initial value
 * @returns Optimized motion value
 */
function useOptimizedMotionValue(
  property: TransformProperty,
  initial: number
): MotionValue<number>;

type TransformProperty = "x" | "y" | "z" | "rotate" | "rotateX" | "rotateY" | "rotateZ" | "scale" | "scaleX" | "scaleY" | "skew" | "skewX" | "skewY";
```

**Usage Examples:**

```typescript
import { motion, useOptimizedMotionValue, useWillChange } from "motion/react";

function OptimizedAnimation() {
  const willChangeRef = useWillChange();
  const x = useOptimizedMotionValue("x", 0);
  const y = useOptimizedMotionValue("y", 0);
  const scale = useOptimizedMotionValue("scale", 1);

  return (
    <motion.div
      ref={willChangeRef}
      drag
      style={{
        x,
        y,
        scale,
        width: 100,
        height: 100,
        backgroundColor: "#10b981",
        borderRadius: 8
      }}
    >
      Optimized for performance
    </motion.div>
  );
}
```