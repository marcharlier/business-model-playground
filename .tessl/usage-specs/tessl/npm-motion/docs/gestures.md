# Gestures and Interactions

Comprehensive gesture system for handling drag, pan, hover, and tap interactions with physics-based animations and constraint support.

## Capabilities

### Drag Controls

Imperative drag controls for programmatically managing drag interactions.

```typescript { .api }
/**
 * Hook for creating drag controls
 * @returns Drag controls object
 */
function useDragControls(): DragControls;

interface DragControls {
  /** Start dragging from an event */
  start(event: React.PointerEvent | PointerEvent, options?: DragStartOptions): void;
  /** Stop current drag operation */
  stop(): void;
  /** Check if currently dragging */
  isDragging(): boolean;
}

interface DragStartOptions {
  /** Point from which to start drag */
  point?: Point;
  /** Snap back to origin after drag */
  snapToCursor?: boolean;
}

interface Point {
  x: number;
  y: number;
}
```

**Usage Examples:**

```typescript
import { motion, useDragControls } from "motion/react";

function DragControlExample() {
  const dragControls = useDragControls();

  const startDrag = (event: React.PointerEvent) => {
    dragControls.start(event, { snapToCursor: true });
  };

  return (
    <div>
      <div onPointerDown={startDrag}>
        Custom drag handle
      </div>
      <motion.div
        drag
        dragControls={dragControls}
        dragConstraints={{ left: 0, right: 300, top: 0, bottom: 300 }}
      >
        Draggable element
      </motion.div>
    </div>
  );
}
```

### Drag Configuration

Configuration options for drag behavior on motion components.

```typescript { .api }
interface DragProps {
  /** Enable dragging */
  drag?: boolean | "x" | "y";
  /** Drag constraints */
  dragConstraints?: Partial<Box> | React.RefObject<Element> | false;
  /** Drag controls object */
  dragControls?: DragControls;
  /** Elastic behavior when dragging beyond constraints */
  dragElastic?: boolean | number | Partial<BoundingBox>;
  /** Enable drag momentum */
  dragMomentum?: boolean;
  /** Minimum distance to start drag */
  dragDirectionLock?: boolean;
  /** Threshold for direction lock */
  dragTransition?: Transition;
  /** Propagate drag to parent */
  dragPropagation?: boolean;
  /** Snap back to origin */
  dragSnapToOrigin?: boolean;
  /** Listen for drag on child elements */
  dragListener?: boolean;
}

interface Box {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

interface BoundingBox {
  left: number;
  right: number;
  top: number;
  bottom: number;
}
```

### Gesture Event Handlers

Event handlers for various gesture interactions.

```typescript { .api }
interface GestureHandlers {
  /** Called when drag starts */
  onDragStart?: (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => void;
  /** Called during drag */
  onDrag?: (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => void;
  /** Called when drag ends */
  onDragEnd?: (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => void;
  /** Called when pan starts */
  onPanStart?: (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => void;
  /** Called during pan */
  onPan?: (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => void;
  /** Called when pan ends */
  onPanEnd?: (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => void;
  /** Called on tap/click */
  onTap?: (event: MouseEvent | TouchEvent | PointerEvent, info: TapInfo) => void;
  /** Called when tap starts */
  onTapStart?: (event: MouseEvent | TouchEvent | PointerEvent, info: TapInfo) => void;
  /** Called when tap is cancelled */
  onTapCancel?: (event: MouseEvent | TouchEvent | PointerEvent, info: TapInfo) => void;
  /** Called on hover start */
  onHoverStart?: (event: MouseEvent, info: HoverInfo) => void;
  /** Called on hover end */
  onHoverEnd?: (event: MouseEvent, info: HoverInfo) => void;
}

interface PanInfo {
  /** Current pointer position relative to page */
  point: Point;
  /** Distance moved since last event */
  delta: Point;
  /** Distance moved since gesture start */
  offset: Point;
  /** Current velocity */
  velocity: Point;
}

interface TapInfo {
  /** Tap position relative to page */
  point: Point;
}

interface HoverInfo {
  /** Hover position relative to page */
  point: Point;
}
```

**Usage Examples:**

```typescript
import { motion } from "motion/react";

function GestureExample() {
  const handleDrag = (event: any, info: PanInfo) => {
    console.log("Dragging:", info.offset);
  };

  const handleDragEnd = (event: any, info: PanInfo) => {
    console.log("Drag ended with velocity:", info.velocity);
  };

  const handleTap = (event: any, info: TapInfo) => {
    console.log("Tapped at:", info.point);
  };

  return (
    <motion.div
      drag
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      onTap={handleTap}
      whileDrag={{ scale: 1.1 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      Interactive element
    </motion.div>
  );
}
```

### Hover Interactions

Hover-based animations and state management.

```typescript { .api }
interface HoverProps {
  /** Animation while hovering */
  whileHover?: Target | VariantLabels;
  /** Hover event handlers */
  onHoverStart?: (event: MouseEvent, info: HoverInfo) => void;
  onHoverEnd?: (event: MouseEvent, info: HoverInfo) => void;
}
```

**Usage Examples:**

```typescript
import { motion } from "motion/react";

function HoverCard() {
  return (
    <motion.div
      whileHover={{
        scale: 1.05,
        boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
        transition: { duration: 0.2 }
      }}
      onHoverStart={() => console.log("Hover started")}
      onHoverEnd={() => console.log("Hover ended")}
    >
      Hover over me
    </motion.div>
  );
}
```

### Tap/Press Interactions

Tap and press gesture handling with feedback animations.

```typescript { .api }
interface TapProps {
  /** Animation while tapping/pressing */
  whileTap?: Target | VariantLabels;
  /** Tap event handlers */
  onTap?: (event: MouseEvent | TouchEvent | PointerEvent, info: TapInfo) => void;
  onTapStart?: (event: MouseEvent | TouchEvent | PointerEvent, info: TapInfo) => void;
  onTapCancel?: (event: MouseEvent | TouchEvent | PointerEvent, info: TapInfo) => void;
}
```

**Usage Examples:**

```typescript
import { motion } from "motion/react";

function TapButton() {
  return (
    <motion.button
      whileTap={{ 
        scale: 0.9,
        backgroundColor: "#4f46e5"
      }}
      onTap={(event, info) => {
        console.log("Button tapped at:", info.point);
      }}
      style={{
        padding: "12px 24px",
        background: "#6366f1",
        color: "white",
        border: "none",
        borderRadius: "6px"
      }}
    >
      Tap me
    </motion.button>
  );
}
```

### Focus Interactions

Focus-based animations for keyboard navigation and accessibility.

```typescript { .api }
interface FocusProps {
  /** Animation while focused */
  whileFocus?: Target | VariantLabels;
}
```

### InView Interactions

Viewport-based animations that trigger when elements enter or leave view.

```typescript { .api }
interface InViewProps {
  /** Animation while in view */
  whileInView?: Target | VariantLabels;
  /** Viewport options */
  viewport?: ViewportOptions;
}

interface ViewportOptions {
  /** Root element for intersection */
  root?: React.RefObject<Element>;
  /** Root margin */
  margin?: string;
  /** Intersection amount */
  amount?: "some" | "all" | number;
  /** Run animation only once */
  once?: boolean;
}
```

**Usage Examples:**

```typescript
import { motion } from "motion/react";

function ScrollReveal() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ 
        opacity: 1, 
        y: 0,
        transition: { duration: 0.6 }
      }}
      viewport={{ 
        once: true, 
        amount: 0.3 
      }}
    >
      This animates when scrolled into view
    </motion.div>
  );
}
```

### Advanced Gesture Configuration

Advanced configuration options for fine-tuning gesture behavior.

```typescript { .api }
interface AdvancedGestureProps {
  /** Drag direction lock */
  dragDirectionLock?: boolean;
  /** Direction lock threshold */
  dragDirectionLockThreshold?: number;
  /** Minimum distance to initiate pan */
  dragStartDistance?: number;
  /** Enable momentum scrolling */
  dragMomentum?: boolean;
  /** Momentum velocity multiplier */
  dragMomentumVelocity?: number;
  /** Transition for drag animations */
  dragTransition?: Transition;
  /** Enable drag propagation to parent */
  dragPropagation?: boolean;
  /** Elastic overshoot amount */
  dragElastic?: boolean | number;
}
```

### Multi-Touch Gestures

Support for multi-touch gestures and pinch-to-zoom interactions.

```typescript { .api }
interface MultiTouchProps {
  /** Enable pinch-to-zoom */
  pinch?: boolean;
  /** Enable rotation gestures */
  rotate?: boolean;
  /** Multi-touch event handlers */
  onPinchStart?: (event: TouchEvent, info: PinchInfo) => void;
  onPinch?: (event: TouchEvent, info: PinchInfo) => void;
  onPinchEnd?: (event: TouchEvent, info: PinchInfo) => void;
}

interface PinchInfo {
  /** Current scale */
  scale: number;
  /** Scale delta */
  scaleOffset: number;
  /** Center point of pinch */
  point: Point;
}
```

**Usage Examples:**

```typescript
import { motion } from "motion/react";

function PinchZoomImage() {
  return (
    <motion.img
      src="/image.jpg"
      pinch
      onPinch={(event, info) => {
        console.log("Pinch scale:", info.scale);
      }}
      style={{
        touchAction: "none" // Prevent browser zoom
      }}
    />
  );
}
```