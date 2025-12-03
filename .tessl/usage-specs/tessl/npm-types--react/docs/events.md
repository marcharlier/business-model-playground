# Event System

Comprehensive synthetic event types and event handler interfaces for all DOM events with React-specific enhancements. React's SyntheticEvent system provides consistent behavior across browsers while maintaining full type safety.

## Capabilities

### Base Synthetic Events

Core synthetic event interfaces that wrap native DOM events.

```typescript { .api }
/**
 * Base interface for all synthetic events
 */
interface BaseSyntheticEvent<E = object, C = any, T = any> {
  nativeEvent: E;
  currentTarget: C;
  target: T;
  bubbles: boolean;
  cancelable: boolean;
  defaultPrevented: boolean;
  eventPhase: number;
  isTrusted: boolean;
  preventDefault(): void;
  isDefaultPrevented(): boolean;
  stopPropagation(): void;
  isPropagationStopped(): boolean;
  persist(): void;
  timeStamp: number;
  type: string;
}

/**
 * Main SyntheticEvent interface
 */
interface SyntheticEvent<T = Element, E = Event> extends BaseSyntheticEvent<E, EventTarget & T, EventTarget> {}

/**
 * Generic event handler type
 */
type EventHandler<E extends SyntheticEvent<any>> = { bivarianceHack(event: E): void }["bivarianceHack"];

/**
 * React event handler for any element
 */
type ReactEventHandler<T = Element> = EventHandler<SyntheticEvent<T>>;
```

**Usage Examples:**

```typescript
import React, { SyntheticEvent, ReactEventHandler } from "react";

const EventExample: React.FC = () => {
  // Generic event handler
  const handleGenericEvent: ReactEventHandler = (event) => {
    event.preventDefault();
    console.log('Event type:', event.type);
    console.log('Event target:', event.target);
    console.log('Current target:', event.currentTarget);
    console.log('Native event:', event.nativeEvent);
  };

  // Typed event handler for specific element
  const handleDivEvent: ReactEventHandler<HTMLDivElement> = (event) => {
    // event.currentTarget is HTMLDivElement
    console.log('Div element:', event.currentTarget.className);
  };

  return (
    <div>
      <div onClick={handleDivEvent} className="clickable-div">
        Click me
      </div>
      <button onFocus={handleGenericEvent}>
        Focus me
      </button>
    </div>
  );
};
```

### Mouse Events

Mouse interaction events with complete type definitions.

```typescript { .api }
/**
 * Mouse event interface
 */
interface MouseEvent<T = Element> extends UIEvent<T, NativeMouseEvent> {
  altKey: boolean;
  button: number;
  buttons: number;
  clientX: number;
  clientY: number;
  ctrlKey: boolean;
  metaKey: boolean;
  movementX: number;
  movementY: number;
  pageX: number;
  pageY: number;
  relatedTarget: EventTarget | null;
  screenX: number;
  screenY: number;
  shiftKey: boolean;
  getModifierState(key: string): boolean;
}

/**
 * Mouse event handler type
 */
type MouseEventHandler<T = Element> = EventHandler<MouseEvent<T>>;
```

**Usage Examples:**

```typescript
import React, { MouseEvent, MouseEventHandler } from "react";

const MouseEventExample: React.FC = () => {
  // Button click handler
  const handleClick: MouseEventHandler<HTMLButtonElement> = (event) => {
    console.log('Button clicked:', event.button); // 0 = left, 1 = middle, 2 = right
    console.log('Ctrl key held:', event.ctrlKey);
    console.log('Click position:', event.clientX, event.clientY);
    
    if (event.altKey) {
      event.preventDefault();
      console.log('Alt+click detected');
    }
  };

  // Mouse movement tracking
  const handleMouseMove: MouseEventHandler<HTMLDivElement> = (event) => {
    console.log('Mouse position:', event.pageX, event.pageY);
    console.log('Movement:', event.movementX, event.movementY);
  };

  // Context menu
  const handleContextMenu: MouseEventHandler = (event) => {
    event.preventDefault(); // Prevent browser context menu
    console.log('Right click detected');
  };

  // Double click
  const handleDoubleClick: MouseEventHandler = (event) => {
    console.log('Double click at:', event.screenX, event.screenY);
  };

  return (
    <div>
      <button 
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        onDoubleClick={handleDoubleClick}
      >
        Multi-function Button
      </button>
      
      <div 
        onMouseMove={handleMouseMove}
        style={{ width: 200, height: 200, border: '1px solid black' }}
      >
        Move mouse here
      </div>
    </div>
  );
};
```

### Keyboard Events

Keyboard input events with key detection and modifier support.

```typescript { .api }
/**
 * Keyboard event interface
 */
interface KeyboardEvent<T = Element> extends UIEvent<T, NativeKeyboardEvent> {
  altKey: boolean;
  /** @deprecated Use `key` instead */
  charCode: number;
  ctrlKey: boolean;
  code: string;
  key: string;
  /** @deprecated Use `key` instead */
  keyCode: number;
  locale: string;
  location: number;
  metaKey: boolean;
  repeat: boolean;
  shiftKey: boolean;
  /** @deprecated Use `key` instead */
  which: number;
  getModifierState(key: string): boolean;
}

/**
 * Keyboard event handler type
 */
type KeyboardEventHandler<T = Element> = EventHandler<KeyboardEvent<T>>;
```

**Usage Examples:**

```typescript
import React, { KeyboardEvent, KeyboardEventHandler, useState } from "react";

const KeyboardEventExample: React.FC = () => {
  const [inputValue, setInputValue] = useState('');
  
  // Key press handler
  const handleKeyDown: KeyboardEventHandler<HTMLInputElement> = (event) => {
    console.log('Key pressed:', event.key);
    console.log('Key code:', event.code);
    
    // Handle specific keys
    switch (event.key) {
      case 'Enter':
        if (event.ctrlKey) {
          console.log('Ctrl+Enter pressed');
          event.preventDefault();
        }
        break;
      case 'Escape':
        event.currentTarget.blur();
        break;
      case 'Tab':
        if (event.shiftKey) {
          console.log('Shift+Tab pressed');
        }
        break;
    }
    
    // Arrow key navigation
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
      console.log('Arrow key navigation:', event.key);
    }
  };

  // Key up handler
  const handleKeyUp: KeyboardEventHandler<HTMLInputElement> = (event) => {
    // Check modifier keys
    const modifiers = [];
    if (event.ctrlKey) modifiers.push('Ctrl');
    if (event.shiftKey) modifiers.push('Shift');
    if (event.altKey) modifiers.push('Alt');
    if (event.metaKey) modifiers.push('Meta');
    
    console.log('Key released:', event.key, 'Modifiers:', modifiers);
  };

  // Key press (deprecated but still available)
  const handleKeyPress: KeyboardEventHandler<HTMLInputElement> = (event) => {
    // Only fired for printable characters
    console.log('Character input:', event.key);
  };

  return (
    <div>
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
        onKeyPress={handleKeyPress}
        placeholder="Type here to test keyboard events"
      />
      <p>Current value: {inputValue}</p>
    </div>
  );
};
```

### Form Events

Form-related events including input changes and form submissions.

```typescript { .api }
/**
 * Generic form event interface
 */
interface FormEvent<T = Element> extends SyntheticEvent<T> {}

/**
 * Form event handler type
 */
type FormEventHandler<T = Element> = EventHandler<FormEvent<T>>;

/**
 * Change event interface for form inputs
 */
interface ChangeEvent<T = Element> extends SyntheticEvent<T> {
  target: EventTarget & T;
}

/**
 * Change event handler type
 */
type ChangeEventHandler<T = Element> = EventHandler<ChangeEvent<T>>;
```

**Usage Examples:**

```typescript
import React, { FormEvent, ChangeEvent, FormEventHandler, ChangeEventHandler, useState } from "react";

interface FormData {
  name: string;
  email: string;
  age: number;
  subscribe: boolean;
  country: string;
}

const FormEventExample: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    age: 0,
    subscribe: false,
    country: ''
  });

  // Form submission
  const handleSubmit: FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault(); // Prevent default form submission
    
    console.log('Form submitted with data:', formData);
    
    // Validate form
    if (!formData.name || !formData.email) {
      alert('Please fill in required fields');
      return;
    }
    
    // Process form data
    console.log('Processing form...', formData);
  };

  // Text input changes
  const handleInputChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    const { name, value, type, checked } = event.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : 
              type === 'number' ? Number(value) : value
    }));
  };

  // Select changes
  const handleSelectChange: ChangeEventHandler<HTMLSelectElement> = (event) => {
    setFormData(prev => ({ ...prev, country: event.target.value }));
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>
          Name (required):
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
          />
        </label>
      </div>
      
      <div>
        <label>
          Email (required):
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
          />
        </label>
      </div>
      
      <div>
        <label>
          Age:
          <input
            type="number"
            name="age"
            value={formData.age}
            onChange={handleInputChange}
            min="0"
            max="120"
          />
        </label>
      </div>
      
      <div>
        <label>
          <input
            type="checkbox"
            name="subscribe"
            checked={formData.subscribe}
            onChange={handleInputChange}
          />
          Subscribe to newsletter
        </label>
      </div>
      
      <div>
        <label>
          Country:
          <select value={formData.country} onChange={handleSelectChange}>
            <option value="">Select...</option>
            <option value="us">United States</option>
            <option value="ca">Canada</option>
            <option value="uk">United Kingdom</option>
          </select>
        </label>
      </div>
      
      <button type="submit">Submit</button>
    </form>
  );
};
```

### Focus Events

Focus and blur events for element focus management.

```typescript { .api }
/**
 * Focus event interface
 */
interface FocusEvent<T = Element, RelatedTarget = Element> extends SyntheticEvent<T, NativeFocusEvent> {
  relatedTarget: (EventTarget & RelatedTarget) | null;
  target: EventTarget & T;
}

/**
 * Focus event handler type
 */
type FocusEventHandler<T = Element> = EventHandler<FocusEvent<T>>;
```

**Usage Examples:**

```typescript
import React, { FocusEvent, FocusEventHandler, useState, useRef } from "react";

const FocusEventExample: React.FC = () => {
  const [focusedElement, setFocusedElement] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus handler
  const handleFocus: FocusEventHandler<HTMLInputElement> = (event) => {
    const elementName = event.currentTarget.name || 'unnamed';
    setFocusedElement(elementName);
    
    console.log('Element focused:', elementName);
    console.log('Related target (previous focus):', event.relatedTarget);
    
    // Add visual feedback
    event.currentTarget.style.borderColor = 'blue';
  };

  // Blur handler
  const handleBlur: FocusEventHandler<HTMLInputElement> = (event) => {
    console.log('Element blurred:', event.currentTarget.name);
    console.log('Related target (next focus):', event.relatedTarget);
    
    // Remove visual feedback
    event.currentTarget.style.borderColor = '';
    
    // Validate on blur
    if (event.currentTarget.name === 'email' && event.currentTarget.value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(event.currentTarget.value)) {
        event.currentTarget.style.borderColor = 'red';
      }
    }
  };

  const focusFirstInput = () => {
    inputRef.current?.focus();
  };

  return (
    <div>
      <p>Currently focused: {focusedElement || 'none'}</p>
      
      <button onClick={focusFirstInput}>Focus First Input</button>
      
      <div>
        <input
          ref={inputRef}
          type="text"
          name="firstName"
          placeholder="First Name"
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
      </div>
      
      <div>
        <input
          type="email"
          name="email"
          placeholder="Email"
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
      </div>
      
      <div>
        <textarea
          name="message"
          placeholder="Message"
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
      </div>
    </div>
  );
};
```

### Touch Events

Touch input events for mobile and touch-enabled devices.

```typescript { .api }
/**
 * Touch event interface
 */
interface TouchEvent<T = Element> extends UIEvent<T, NativeTouchEvent> {
  altKey: boolean;
  changedTouches: TouchList;
  ctrlKey: boolean;
  metaKey: boolean;
  shiftKey: boolean;
  targetTouches: TouchList;
  touches: TouchList;
  getModifierState(key: string): boolean;
}

/**
 * Touch event handler type
 */
type TouchEventHandler<T = Element> = EventHandler<TouchEvent<T>>;
```

**Usage Examples:**

```typescript
import React, { TouchEvent, TouchEventHandler, useState } from "react";

interface TouchData {
  x: number;
  y: number;
  timestamp: number;
}

const TouchEventExample: React.FC = () => {
  const [touchStart, setTouchStart] = useState<TouchData | null>(null);
  const [touchCurrent, setTouchCurrent] = useState<TouchData | null>(null);

  // Touch start
  const handleTouchStart: TouchEventHandler<HTMLDivElement> = (event) => {
    event.preventDefault(); // Prevent scrolling
    
    const touch = event.touches[0];
    if (touch) {
      const touchData: TouchData = {
        x: touch.clientX,
        y: touch.clientY,
        timestamp: Date.now()
      };
      setTouchStart(touchData);
      setTouchCurrent(touchData);
      
      console.log('Touch started at:', touchData);
    }
  };

  // Touch move
  const handleTouchMove: TouchEventHandler<HTMLDivElement> = (event) => {
    event.preventDefault();
    
    const touch = event.touches[0];
    if (touch && touchStart) {
      const touchData: TouchData = {
        x: touch.clientX,
        y: touch.clientY,
        timestamp: Date.now()
      };
      setTouchCurrent(touchData);
      
      // Calculate distance and direction
      const deltaX = touchData.x - touchStart.x;
      const deltaY = touchData.y - touchStart.y;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      
      console.log('Touch moved:', { deltaX, deltaY, distance });
    }
  };

  // Touch end
  const handleTouchEnd: TouchEventHandler<HTMLDivElement> = (event) => {
    if (touchStart && touchCurrent) {
      const deltaX = touchCurrent.x - touchStart.x;
      const deltaY = touchCurrent.y - touchStart.y;
      const duration = touchCurrent.timestamp - touchStart.timestamp;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      
      // Detect swipe
      if (distance > 50 && duration < 300) {
        const direction = Math.abs(deltaX) > Math.abs(deltaY) 
          ? (deltaX > 0 ? 'right' : 'left')
          : (deltaY > 0 ? 'down' : 'up');
        
        console.log('Swipe detected:', direction);
      }
      
      // Detect tap
      if (distance < 10 && duration < 200) {
        console.log('Tap detected');
      }
    }
    
    setTouchStart(null);
    setTouchCurrent(null);
  };

  // Touch cancel
  const handleTouchCancel: TouchEventHandler<HTMLDivElement> = (event) => {
    console.log('Touch cancelled');
    setTouchStart(null);
    setTouchCurrent(null);
  };

  return (
    <div
      style={{
        width: 300,
        height: 300,
        border: '2px solid #ccc',
        backgroundColor: '#f9f9f9',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        userSelect: 'none'
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchCancel}
    >
      <p>Touch this area</p>
      {touchCurrent && (
        <div style={{ position: 'absolute', top: 10, left: 10 }}>
          Position: ({touchCurrent.x}, {touchCurrent.y})
        </div>
      )}
    </div>
  );
};
```

### Drag Events

Drag and drop events for file uploads and element reordering.

```typescript { .api }
/**
 * Drag event interface
 */
interface DragEvent<T = Element> extends MouseEvent<T, NativeDragEvent> {
  dataTransfer: DataTransfer;
}

/**
 * Drag event handler type
 */
type DragEventHandler<T = Element> = EventHandler<DragEvent<T>>;
```

**Usage Examples:**

```typescript
import React, { DragEvent, DragEventHandler, useState } from "react";

interface DraggableItem {
  id: string;
  content: string;
}

const DragEventExample: React.FC = () => {
  const [items, setItems] = useState<DraggableItem[]>([
    { id: '1', content: 'Item 1' },
    { id: '2', content: 'Item 2' },
    { id: '3', content: 'Item 3' }
  ]);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);

  // Drag start
  const handleDragStart: DragEventHandler<HTMLDivElement> = (event) => {
    const itemId = event.currentTarget.dataset.itemId;
    if (itemId) {
      setDraggedItem(itemId);
      event.dataTransfer.setData('text/plain', itemId);
      event.dataTransfer.effectAllowed = 'move';
      
      // Add visual feedback
      event.currentTarget.style.opacity = '0.5';
    }
  };

  // Drag over (must prevent default to allow drop)
  const handleDragOver: DragEventHandler<HTMLDivElement> = (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  };

  // Drag enter
  const handleDragEnter: DragEventHandler<HTMLDivElement> = (event) => {
    event.preventDefault();
    event.currentTarget.style.backgroundColor = '#e6f3ff';
  };

  // Drag leave
  const handleDragLeave: DragEventHandler<HTMLDivElement> = (event) => {
    event.currentTarget.style.backgroundColor = '';
  };

  // Drop
  const handleDrop: DragEventHandler<HTMLDivElement> = (event) => {
    event.preventDefault();
    event.currentTarget.style.backgroundColor = '';
    
    const draggedItemId = event.dataTransfer.getData('text/plain');
    const targetItemId = event.currentTarget.dataset.itemId;
    
    if (draggedItemId && targetItemId && draggedItemId !== targetItemId) {
      // Reorder items
      setItems(prevItems => {
        const newItems = [...prevItems];
        const draggedIndex = newItems.findIndex(item => item.id === draggedItemId);
        const targetIndex = newItems.findIndex(item => item.id === targetItemId);
        
        if (draggedIndex !== -1 && targetIndex !== -1) {
          const [draggedItem] = newItems.splice(draggedIndex, 1);
          newItems.splice(targetIndex, 0, draggedItem);
        }
        
        return newItems;
      });
    }
    
    setDraggedItem(null);
  };

  // Drag end
  const handleDragEnd: DragEventHandler<HTMLDivElement> = (event) => {
    // Reset visual feedback
    event.currentTarget.style.opacity = '';
    setDraggedItem(null);
  };

  return (
    <div>
      <h3>Drag and Drop Reordering</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {items.map(item => (
          <div
            key={item.id}
            data-item-id={item.id}
            draggable
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onDragEnd={handleDragEnd}
            style={{
              padding: '12px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              backgroundColor: '#f9f9f9',
              cursor: 'move',
              userSelect: 'none'
            }}
          >
            {item.content}
          </div>
        ))}
      </div>
    </div>
  );
};
```

### Other Event Types

Additional specialized event types for various interactions.

```typescript { .api }
/**
 * Clipboard event interface
 */
interface ClipboardEvent<T = Element> extends SyntheticEvent<T, NativeClipboardEvent> {
  clipboardData: DataTransfer;
}

type ClipboardEventHandler<T = Element> = EventHandler<ClipboardEvent<T>>;

/**
 * Composition event interface (for IME input)
 */
interface CompositionEvent<T = Element> extends SyntheticEvent<T, NativeCompositionEvent> {
  data: string;
}

type CompositionEventHandler<T = Element> = EventHandler<CompositionEvent<T>>;

/**
 * Wheel event interface
 */
interface WheelEvent<T = Element> extends MouseEvent<T, NativeWheelEvent> {
  deltaMode: number;
  deltaX: number;
  deltaY: number;
  deltaZ: number;
}

type WheelEventHandler<T = Element> = EventHandler<WheelEvent<T>>;

/**
 * Animation event interface
 */
interface AnimationEvent<T = Element> extends SyntheticEvent<T, NativeAnimationEvent> {
  animationName: string;
  elapsedTime: number;
  pseudoElement: string;
}

type AnimationEventHandler<T = Element> = EventHandler<AnimationEvent<T>>;

/**
 * Transition event interface
 */
interface TransitionEvent<T = Element> extends SyntheticEvent<T, NativeTransitionEvent> {
  elapsedTime: number;
  propertyName: string;
  pseudoElement: string;
}

type TransitionEventHandler<T = Element> = EventHandler<TransitionEvent<T>>;
```

## Types

### Event Type Definitions

```typescript { .api }
// Base event types
type NativeAnimationEvent = AnimationEvent;
type NativeClipboardEvent = ClipboardEvent;
type NativeCompositionEvent = CompositionEvent;
type NativeDragEvent = DragEvent;
type NativeFocusEvent = FocusEvent;
type NativeKeyboardEvent = KeyboardEvent;
type NativeMouseEvent = MouseEvent;
type NativeTouchEvent = TouchEvent;
type NativeTransitionEvent = TransitionEvent;
type NativeUIEvent = UIEvent;
type NativeWheelEvent = WheelEvent;

// UI Event base interface
interface UIEvent<T = Element, E = NativeUIEvent> extends SyntheticEvent<T, E> {
  detail: number;
  view: AbstractView;
}

type UIEventHandler<T = Element> = EventHandler<UIEvent<T>>;

// Pointer events
interface PointerEvent<T = Element> extends MouseEvent<T, NativePointerEvent> {
  pointerId: number;
  width: number;
  height: number;
  pressure: number;
  tangentialPressure: number;
  tiltX: number;
  tiltY: number;
  twist: number;
  pointerType: 'mouse' | 'pen' | 'touch';
  isPrimary: boolean;
}

type PointerEventHandler<T = Element> = EventHandler<PointerEvent<T>>;
```