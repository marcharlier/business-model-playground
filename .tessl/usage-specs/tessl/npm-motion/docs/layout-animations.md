# Layout Animations

Automatic layout animations that handle position and size changes smoothly, including shared layout transitions and reorder animations.

## Capabilities

### Layout Animation

Automatic animation of layout changes when element position or size changes.

```typescript { .api }
interface LayoutProps {
  /** Enable layout animations */
  layout?: boolean | "position" | "size";
  /** Unique ID for shared layout animations */
  layoutId?: string;
  /** Root element for layout calculations */
  layoutRoot?: React.RefObject<Element>;
  /** Dependency array for layout updates */
  layoutDependency?: any;
  /** Scroll behavior during layout */
  layoutScroll?: boolean;
}
```

**Usage Examples:**

```typescript
import { motion, useState } from "motion/react";

function LayoutExample() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div
      layout
      onClick={() => setIsExpanded(!isExpanded)}
      style={{
        width: isExpanded ? 300 : 150,
        height: isExpanded ? 200 : 100,
        background: "#6366f1",
        borderRadius: 8,
        cursor: "pointer"
      }}
    >
      <motion.p layout>
        Click to {isExpanded ? "collapse" : "expand"}
      </motion.p>
    </motion.div>
  );
}
```

### Shared Layout Animations

Animations between components that share the same layoutId, creating seamless transitions.

```typescript { .api }
interface SharedLayoutProps {
  /** Shared layout identifier */
  layoutId: string;
  /** Layout transition configuration */
  layoutTransition?: Transition;
}
```

**Usage Examples:**

```typescript
import { motion, useState } from "motion/react";

function SharedLayoutExample() {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const items = [
    { id: "1", title: "Item 1" },
    { id: "2", title: "Item 2" },
    { id: "3", title: "Item 3" }
  ];

  return (
    <div>
      {items.map(item => (
        <motion.div
          key={item.id}
          layoutId={item.id}
          onClick={() => setSelectedId(item.id)}
          style={{
            width: selectedId === item.id ? 300 : 150,
            height: selectedId === item.id ? 200 : 100,
            background: "#f59e0b",
            margin: 10,
            borderRadius: 8,
            cursor: "pointer"
          }}
        >
          <motion.h3 layoutId={`title-${item.id}`}>
            {item.title}
          </motion.h3>
        </motion.div>
      ))}
    </div>
  );
}
```

### LayoutGroup

Component for grouping related layout animations and coordinating transitions.

```typescript { .api }
/**
 * Group related layout animations
 * @param props - Layout group configuration
 * @returns JSX element providing layout group context
 */
function LayoutGroup(props: LayoutGroupProps): JSX.Element;

interface LayoutGroupProps {
  /** Child components */
  children: React.ReactNode;
  /** Unique group identifier */
  id?: string;
  /** Inherit layout group from parent */
  inherit?: boolean;
}
```

**Usage Examples:**

```typescript
import { motion, LayoutGroup } from "motion/react";

function LayoutGroupExample() {
  const [activeTab, setActiveTab] = useState("tab1");

  return (
    <LayoutGroup>
      <div style={{ display: "flex" }}>
        {["tab1", "tab2", "tab3"].map(tab => (
          <motion.button
            key={tab}
            layout
            onClick={() => setActiveTab(tab)}
            style={{
              position: "relative",
              padding: "10px 20px",
              background: activeTab === tab ? "#6366f1" : "transparent",
              color: activeTab === tab ? "white" : "black",
              border: "1px solid #6366f1",
              cursor: "pointer"
            }}
          >
            {tab}
            {activeTab === tab && (
              <motion.div
                layoutId="activeTab"
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "#6366f1",
                  borderRadius: 4,
                  zIndex: -1
                }}
              />
            )}
          </motion.button>
        ))}
      </div>
    </LayoutGroup>
  );
}
```

### Reorder Components

Components for creating drag-to-reorder lists with smooth animations.

```typescript { .api }
interface Reorder {
  /** Reorder group component */
  Group: React.ForwardRefExoticComponent<ReorderGroupProps>;
  /** Reorder item component */
  Item: React.ForwardRefExoticComponent<ReorderItemProps>;
}

interface ReorderGroupProps<T> {
  /** Child reorder items */
  children: React.ReactNode;
  /** Current order of items */
  values: T[];
  /** Callback when order changes */
  onReorder: (newOrder: T[]) => void;
  /** HTML element type */
  as?: keyof HTMLElementTagNameMap;
  /** Reorder axis */
  axis?: "x" | "y";
  /** Layout measurements */
  layoutScroll?: boolean;
}

interface ReorderItemProps<T> {
  /** Child content */
  children?: React.ReactNode;
  /** Item value */
  value: T;
  /** HTML element type */
  as?: keyof HTMLElementTagNameMap;
  /** Drag transition */
  dragTransition?: Transition;
  /** Layout transition */
  layoutTransition?: Transition;
}
```

**Usage Examples:**

```typescript
import { Reorder } from "motion/react";
import { useState } from "react";

function ReorderExample() {
  const [items, setItems] = useState([
    { id: 1, text: "Item 1" },
    { id: 2, text: "Item 2" },
    { id: 3, text: "Item 3" },
    { id: 4, text: "Item 4" }
  ]);

  return (
    <Reorder.Group 
      axis="y" 
      values={items} 
      onReorder={setItems}
      style={{ listStyle: "none", padding: 0 }}
    >
      {items.map(item => (
        <Reorder.Item 
          key={item.id} 
          value={item}
          style={{
            padding: "10px 20px",
            margin: "5px 0",
            background: "#f3f4f6",
            borderRadius: 8,
            cursor: "grab"
          }}
        >
          {item.text}
        </Reorder.Item>
      ))}
    </Reorder.Group>
  );
}
```

### Layout Transitions

Configuration options for customizing layout animation transitions.

```typescript { .api }
interface LayoutTransition extends Transition {
  /** Transition for layout changes */
  layout?: Transition;
  /** Transition for position changes */
  layoutPosition?: Transition;
  /** Transition for size changes */
  layoutSize?: Transition;
  /** Transition for border radius changes */
  layoutBorderRadius?: Transition;
  /** Transition for opacity changes during layout */
  layoutOpacity?: Transition;
}
```

### Layout Event Handlers

Event handlers for layout animation lifecycle events.

```typescript { .api }
interface LayoutEventHandlers {
  /** Called before layout animation starts */
  onLayoutAnimationStart?: () => void;
  /** Called when layout animation completes */
  onLayoutAnimationComplete?: () => void;
  /** Called when layout measurements change */
  onLayoutMeasure?: (layout: Box) => void;
}

interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}
```

### Advanced Layout Features

Advanced layout animation features for complex scenarios.

```typescript { .api }
interface AdvancedLayoutProps {
  /** Preserve aspect ratio during layout */
  layoutPreserveAspectRatio?: boolean;
  /** Layout calculation mode */
  layoutCalculation?: "auto" | "manual";
  /** Custom layout measurement function */
  layoutMeasure?: (element: Element) => Box;
  /** Ignore transform during layout */
  layoutIgnoreTransform?: boolean;
  /** Layout animation priority */
  layoutPriority?: number;
}
```

### CrossFade Animation

Smooth transitions between different components or states.

```typescript { .api }
/**
 * Create crossfade animation between components
 * @param components - Components to crossfade between
 * @param activeIndex - Index of currently active component
 * @returns JSX element with crossfade animation
 */
function crossfade<T extends React.ComponentType<any>>(
  components: T[],
  activeIndex: number
): JSX.Element;
```

### Layout Debugging

Tools for debugging layout animations and understanding layout calculations.

```typescript { .api }
interface LayoutDebugProps {
  /** Show layout bounding boxes */
  layoutDebug?: boolean;
  /** Highlight layout changes */
  layoutHighlight?: boolean;
  /** Log layout measurements */
  layoutLog?: boolean;
}
```

**Usage Examples:**

```typescript
import { motion } from "motion/react";

function DebugLayout() {
  return (
    <motion.div
      layout
      layoutDebug // Shows bounding boxes
      layoutLog // Logs measurements to console
      onLayoutMeasure={(layout) => {
        console.log("Layout measured:", layout);
      }}
      style={{
        width: Math.random() * 200 + 100,
        height: Math.random() * 200 + 100,
        background: "#ef4444"
      }}
    >
      Debug layout
    </motion.div>
  );
}
```

### Layout Performance

Performance optimization techniques for layout animations.

```typescript { .api }
interface LayoutPerformanceProps {
  /** Use GPU for layout animations */
  layoutGPU?: boolean;
  /** Layout animation priority */
  layoutPriority?: "high" | "normal" | "low";
  /** Batch layout updates */
  layoutBatch?: boolean;
  /** Throttle layout calculations */
  layoutThrottle?: number;
}
```