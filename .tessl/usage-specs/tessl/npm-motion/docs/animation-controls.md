# Animation Controls

Imperative animation controls for complex sequences, timeline management, and dynamic animation orchestration.

## Capabilities

### Animation Controls Object

Provides imperative control over animations with methods for starting, stopping, and managing animation sequences.

```typescript { .api }
/**
 * Hook for creating animation controls
 * @returns Animation controls object
 */
function useAnimationControls(): AnimationControls;

interface AnimationControls {
  /** Start animation with target values or variant labels */
  start(definition: Target | VariantLabels): Promise<void>;
  /** Stop all running animations */
  stop(): void;
  /** Set values immediately without animation */
  set(definition: Target): void;
  /** Mount controls to component lifecycle */
  mount(): void;
  /** Unmount controls from component lifecycle */
  unmount(): void;
  /** Get current animation state */
  getState(): AnimationState;
}

interface AnimationState {
  /** Currently animating properties */
  animating: string[];
  /** Current target values */
  target: Target;
  /** Animation progress (0-1) */
  progress: number;
}

type Target = {
  [property: string]: string | number | MotionValue;
};

type VariantLabels = string | string[];
```

**Usage Examples:**

```typescript
import { motion, useAnimationControls } from "motion/react";
import { useEffect } from "react";

function ControlledAnimation() {
  const controls = useAnimationControls();

  useEffect(() => {
    // Start animation sequence
    const sequence = async () => {
      await controls.start({ scale: 1.2, transition: { duration: 0.5 } });
      await controls.start({ rotate: 180, transition: { duration: 0.5 } });
      await controls.start({ scale: 1, rotate: 0, transition: { duration: 0.5 } });
    };
    
    sequence();
  }, [controls]);

  return (
    <motion.div
      animate={controls}
      style={{
        width: 100,
        height: 100,
        background: "#6366f1",
        borderRadius: 8
      }}
    />
  );
}
```

### Animation Sequencing

Tools for creating complex animation sequences with precise timing control.

```typescript { .api }
/**
 * Create animation sequence with timing control
 * @param animations - Array of animation steps
 * @returns Promise that resolves when sequence completes
 */
function animateSequence(animations: AnimationStep[]): Promise<void>;

interface AnimationStep {
  /** Animation controls or target element */
  target: AnimationControls | string | Element;
  /** Animation values */
  keyframes: Target;
  /** Animation options */
  options?: AnimationOptions;
  /** When to start relative to sequence (in seconds) */
  at?: number | string;
}
```

**Usage Examples:**

```typescript
import { useAnimationControls, animateSequence } from "motion/react";

function ComplexSequence() {
  const titleControls = useAnimationControls();
  const subtitleControls = useAnimationControls();
  const buttonControls = useAnimationControls();

  const playSequence = async () => {
    await animateSequence([
      {
        target: titleControls,
        keyframes: { opacity: 1, y: 0 },
        options: { duration: 0.6 }
      },
      {
        target: subtitleControls,
        keyframes: { opacity: 1, y: 0 },
        options: { duration: 0.6 },
        at: 0.2 // Start 0.2s after previous animation
      },
      {
        target: buttonControls,
        keyframes: { opacity: 1, scale: 1 },
        options: { duration: 0.4 },
        at: 0.4
      }
    ]);
  };

  return (
    <div>
      <motion.h1
        animate={titleControls}
        initial={{ opacity: 0, y: 20 }}
      >
        Title
      </motion.h1>
      <motion.p
        animate={subtitleControls}
        initial={{ opacity: 0, y: 20 }}
      >
        Subtitle
      </motion.p>
      <motion.button
        animate={buttonControls}
        initial={{ opacity: 0, scale: 0.8 }}
        onClick={playSequence}
      >
        Play Sequence
      </motion.button>
    </div>
  );
}
```

### Timeline Controls

Advanced timeline control for managing multiple animations with precise timing.

```typescript { .api }
/**
 * Create animation timeline
 * @param options - Timeline configuration
 * @returns Timeline controls object
 */
function useTimeline(options?: TimelineOptions): TimelineControls;

interface TimelineControls {
  /** Play timeline from current position */
  play(): void;
  /** Pause timeline */
  pause(): void;
  /** Stop timeline and reset to start */
  stop(): void;
  /** Seek to specific time */
  seek(time: number): void;
  /** Reverse timeline playback */
  reverse(): void;
  /** Current playback time */
  currentTime: number;
  /** Total timeline duration */
  duration: number;
  /** Playback rate multiplier */
  playbackRate: number;
  /** Add animation to timeline */
  add(animation: TimelineAnimation, time?: number): void;
  /** Remove animation from timeline */
  remove(animation: TimelineAnimation): void;
}

interface TimelineOptions {
  /** Auto-play timeline on creation */
  autoplay?: boolean;
  /** Loop timeline */
  loop?: boolean;
  /** Timeline playback rate */
  playbackRate?: number;
}

interface TimelineAnimation {
  /** Target for animation */
  target: AnimationControls | string | Element;
  /** Animation keyframes */
  keyframes: Target;
  /** Animation duration */
  duration: number;
  /** Start time in timeline */
  startTime: number;
  /** Animation easing */
  ease?: Easing;
}
```

### State Machine Integration

Integration with state machines for complex animation orchestration.

```typescript { .api }
/**
 * Create animation state machine
 * @param states - State configuration
 * @param initialState - Initial state name
 * @returns State machine controls
 */
function useAnimationStateMachine(
  states: AnimationStates,
  initialState: string
): StateMachineControls;

interface AnimationStates {
  [stateName: string]: {
    /** Animation values for this state */
    animation: Target;
    /** Transition configuration */
    transition?: Transition;
    /** Valid transitions from this state */
    transitions?: {
      [eventName: string]: string;
    };
    /** Actions to run on state entry */
    onEntry?: () => void;
    /** Actions to run on state exit */
    onExit?: () => void;
  };
}

interface StateMachineControls {
  /** Current state name */
  currentState: string;
  /** Send event to trigger transition */
  send(event: string): void;
  /** Get all possible events from current state */
  getPossibleEvents(): string[];
  /** Check if transition is possible */
  canTransition(event: string): boolean;
}
```

**Usage Examples:**

```typescript
import { motion, useAnimationStateMachine } from "motion/react";

function StateMachineExample() {
  const stateMachine = useAnimationStateMachine({
    idle: {
      animation: { scale: 1, rotate: 0 },
      transitions: {
        hover: "hovered",
        click: "clicked"
      }
    },
    hovered: {
      animation: { scale: 1.1, rotate: 0 },
      transitions: {
        leave: "idle",
        click: "clicked"
      }
    },
    clicked: {
      animation: { scale: 0.95, rotate: 360 },
      transition: { duration: 0.3 },
      transitions: {
        release: "idle"
      }
    }
  }, "idle");

  return (
    <motion.div
      animate={stateMachine.currentState}
      variants={{
        idle: { scale: 1, rotate: 0 },
        hovered: { scale: 1.1, rotate: 0 },
        clicked: { scale: 0.95, rotate: 360 }
      }}
      onMouseEnter={() => stateMachine.send("hover")}
      onMouseLeave={() => stateMachine.send("leave")}
      onMouseDown={() => stateMachine.send("click")}
      onMouseUp={() => stateMachine.send("release")}
      style={{
        width: 100,
        height: 100,
        background: "#f59e0b",
        borderRadius: 8,
        cursor: "pointer"
      }}
    >
      State: {stateMachine.currentState}
    </motion.div>
  );
}
```

### Animation Composition

Tools for composing multiple animations together with different combination modes.

```typescript { .api }
/**
 * Compose multiple animations
 * @param animations - Array of animation controls
 * @param mode - Composition mode
 * @returns Composed animation controls
 */
function composeAnimations(
  animations: AnimationControls[],
  mode: CompositionMode
): AnimationControls;

type CompositionMode = 
  | "sequential" // Run animations one after another
  | "parallel"   // Run animations simultaneously
  | "staggered"  // Run animations with stagger delay
  | "alternating"; // Alternate between animations

interface StaggerOptions {
  /** Delay between each animation */
  stagger: number;
  /** Stagger direction */
  from?: "first" | "last" | "center" | number;
  /** Ease stagger timing */
  ease?: Easing;
}
```

### Dynamic Animation Creation

Runtime creation and modification of animations based on data or user input.

```typescript { .api }
/**
 * Create dynamic animation from configuration
 * @param config - Animation configuration
 * @returns Animation controls
 */
function createDynamicAnimation(config: DynamicAnimationConfig): AnimationControls;

interface DynamicAnimationConfig {
  /** Target element or controls */
  target: string | Element | AnimationControls;
  /** Animation properties generator */
  generator: (data: any) => Target;
  /** Data source for animation */
  data: any;
  /** Update trigger */
  trigger?: "data" | "time" | "manual";
  /** Update interval for time-based triggers */
  interval?: number;
}
```

**Usage Examples:**

```typescript
import { createDynamicAnimation } from "motion/react";

function DynamicVisualization() {
  const data = [1, 4, 2, 8, 3, 6, 5];

  const chartAnimation = createDynamicAnimation({
    target: ".bar",
    generator: (values) => ({
      height: values.map(v => v * 10),
      backgroundColor: values.map(v => 
        v > 5 ? "#ef4444" : "#22c55e"
      )
    }),
    data: data,
    trigger: "data"
  });

  return (
    <div className="chart">
      {data.map((value, index) => (
        <motion.div
          key={index}
          className="bar"
          animate={chartAnimation}
          style={{
            width: 20,
            marginRight: 5,
            backgroundColor: "#6366f1"
          }}
        />
      ))}
    </div>
  );
}
```

### Performance Monitoring

Tools for monitoring animation performance and optimization.

```typescript { .api }
/**
 * Monitor animation performance
 * @param controls - Animation controls to monitor
 * @returns Performance metrics
 */
function useAnimationPerformance(
  controls: AnimationControls
): AnimationPerformanceMetrics;

interface AnimationPerformanceMetrics {
  /** Frames per second */
  fps: number;
  /** Frame time in milliseconds */
  frameTime: number;
  /** Dropped frames count */
  droppedFrames: number;
  /** Animation efficiency (0-1) */
  efficiency: number;
  /** GPU usage percentage */
  gpuUsage: number;
}
```