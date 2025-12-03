# Ref System

Complete ref system including useRef, forwardRef, and all ref-related utilities with proper type inference. React refs provide a way to access DOM elements and component instances directly.

## Capabilities

### Ref Types

Core reference types for different use cases.

```typescript { .api }
/**
 * Read-only ref object (typically for DOM elements)
 */
interface RefObject<T> {
  readonly current: T | null;
}

/**
 * Mutable ref object (for any mutable value)
 */
interface MutableRefObject<T> {
  current: T;
}

/**
 * Function-based ref callback
 */
type RefCallback<T> = {
  bivarianceHack(instance: T | null): void;
}["bivarianceHack"];

/**
 * Union of all ref types
 */
type Ref<T> = RefCallback<T> | RefObject<T> | null;

/**
 * Legacy string refs (deprecated but still typed)
 */
type LegacyRef<T> = string | Ref<T>;

/**
 * Ref type used in forwardRef render functions
 */
type ForwardedRef<T> = ((instance: T | null) => void) | MutableRefObject<T | null> | null;
```

**Usage Examples:**

```typescript
import React, { RefObject, MutableRefObject, RefCallback, useRef } from "react";

const RefTypesExample: React.FC = () => {
  // RefObject for DOM elements (readonly)
  const inputRef: RefObject<HTMLInputElement> = useRef<HTMLInputElement>(null);
  
  // MutableRefObject for mutable values
  const countRef: MutableRefObject<number> = useRef<number>(0);
  
  // RefCallback for dynamic behavior
  const callbackRef: RefCallback<HTMLDivElement> = (element) => {
    if (element) {
      console.log('Element mounted:', element);
      element.style.backgroundColor = 'lightblue';
    } else {
      console.log('Element unmounted');
    }
  };

  const focusInput = () => {
    inputRef.current?.focus();
  };

  const incrementCount = () => {
    countRef.current += 1;
    console.log('Count:', countRef.current); // Doesn't cause re-render
  };

  return (
    <div>
      <input ref={inputRef} placeholder="Click button to focus" />
      <button onClick={focusInput}>Focus Input</button>
      
      <div ref={callbackRef}>Element with callback ref</div>
      
      <button onClick={incrementCount}>
        Increment Count (check console)
      </button>
    </div>
  );
};
```

### useRef Hook

The useRef hook for creating ref objects and storing mutable values.

```typescript { .api }
/**
 * Creates a mutable ref object with the given initial value
 */
function useRef<T>(initialValue: T): MutableRefObject<T>;

/**
 * Creates a ref object for DOM elements (initial value can be null)
 */
function useRef<T>(initialValue: T | null): RefObject<T>;

/**
 * Creates a ref object without initial value (undefined)
 */
function useRef<T = undefined>(): MutableRefObject<T | undefined>;
```

**Usage Examples:**

```typescript
import React, { useRef, useEffect, useState } from "react";

const UseRefExample: React.FC = () => {
  // DOM element ref
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Mutable value refs (don't trigger re-renders)
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const renderCountRef = useRef<number>(0);
  const previousValueRef = useRef<string>('');
  
  // State for comparison
  const [inputValue, setInputValue] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // Track render count
  renderCountRef.current += 1;

  // Store previous value
  useEffect(() => {
    previousValueRef.current = inputValue;
  });

  const playVideo = () => {
    if (videoRef.current) {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const pauseVideo = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const startTimer = () => {
    if (intervalRef.current) return; // Already running
    
    intervalRef.current = setInterval(() => {
      console.log('Timer tick at:', new Date().toLocaleTimeString());
    }, 1000);
  };

  const stopTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const captureFrame = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const video = videoRef.current;
      
      if (ctx) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0);
        
        // Convert to blob and download
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'frame-capture.png';
            a.click();
            URL.revokeObjectURL(url);
          }
        });
      }
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return (
    <div>
      <h3>useRef Examples</h3>
      
      {/* Render count (doesn't cause re-renders) */}
      <p>Render count: {renderCountRef.current}</p>
      
      {/* Previous value tracking */}
      <div>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Type something..."
        />
        <p>Current: {inputValue}</p>
        <p>Previous: {previousValueRef.current}</p>
      </div>
      
      {/* Video controls */}
      <div>
        <video
          ref={videoRef}
          width="400"
          height="300"
          controls
          src="/sample-video.mp4" // Replace with actual video
        />
        <div>
          <button onClick={playVideo}>Play</button>
          <button onClick={pauseVideo}>Pause</button>
          <button onClick={captureFrame}>Capture Frame</button>
          <span>Status: {isPlaying ? 'Playing' : 'Paused'}</span>
        </div>
      </div>
      
      {/* Timer controls */}
      <div>
        <button onClick={startTimer}>Start Timer</button>
        <button onClick={stopTimer}>Stop Timer</button>
      </div>
      
      {/* Hidden canvas for frame capture */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
};
```

### forwardRef

Forward refs from parent components to child components.

```typescript { .api }
/**
 * Render function for forwardRef components
 */
interface ForwardRefRenderFunction<T, P = {}> {
  (props: P, ref: ForwardedRef<T>): ReactElement | null;
  displayName?: string | undefined;
  defaultProps?: never | undefined;
  propTypes?: never | undefined;
}

/**
 * Creates a component that forwards refs to its children
 */
function forwardRef<T, P = {}>(
  render: ForwardRefRenderFunction<T, P>
): ForwardRefExoticComponent<PropsWithoutRef<P> & RefAttributes<T>>;

/**
 * Component type returned by forwardRef
 */
interface ForwardRefExoticComponent<P> extends NamedExoticComponent<P> {
  defaultProps?: never | undefined;
  propTypes?: never | undefined;
}
```

**Usage Examples:**

```typescript
import React, { forwardRef, useRef, useImperativeHandle, ForwardedRef } from "react";

// Basic forwardRef - pass ref to DOM element
interface InputProps {
  placeholder?: string;
  onChange?: (value: string) => void;
}

const FancyInput = forwardRef<HTMLInputElement, InputProps>(
  ({ placeholder, onChange }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e.target.value);
    };

    return (
      <input
        ref={ref}
        className="fancy-input"
        placeholder={placeholder}
        onChange={handleChange}
        style={{
          padding: '8px 12px',
          border: '2px solid #007bff',
          borderRadius: '4px',
          fontSize: '16px'
        }}
      />
    );
  }
);

FancyInput.displayName = 'FancyInput';

// Advanced forwardRef with custom methods
interface VideoPlayerMethods {
  play: () => void;
  pause: () => void;
  seek: (time: number) => void;
  getCurrentTime: () => number;
  getDuration: () => number;
}

interface VideoPlayerProps {
  src: string;
  onTimeUpdate?: (time: number) => void;
}

const VideoPlayer = forwardRef<VideoPlayerMethods, VideoPlayerProps>(
  ({ src, onTimeUpdate }, ref) => {
    const videoRef = useRef<HTMLVideoElement>(null);

    // Expose custom methods through ref
    useImperativeHandle(ref, () => ({
      play: () => {
        videoRef.current?.play();
      },
      pause: () => {
        videoRef.current?.pause();
      },
      seek: (time: number) => {
        if (videoRef.current) {
          videoRef.current.currentTime = time;
        }
      },
      getCurrentTime: () => {
        return videoRef.current?.currentTime || 0;
      },
      getDuration: () => {
        return videoRef.current?.duration || 0;
      }
    }), []);

    const handleTimeUpdate = () => {
      if (videoRef.current && onTimeUpdate) {
        onTimeUpdate(videoRef.current.currentTime);
      }
    };

    return (
      <video
        ref={videoRef}
        src={src}
        onTimeUpdate={handleTimeUpdate}
        controls
        style={{ width: '100%', maxWidth: '600px' }}
      />
    );
  }
);

VideoPlayer.displayName = 'VideoPlayer';

// Usage of forwardRef components
const ForwardRefExample: React.FC = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const videoPlayerRef = useRef<VideoPlayerMethods>(null);
  const [currentTime, setCurrentTime] = useState<number>(0);

  const focusInput = () => {
    inputRef.current?.focus();
  };

  const clearInput = () => {
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const playVideo = () => {
    videoPlayerRef.current?.play();
  };

  const pauseVideo = () => {
    videoPlayerRef.current?.pause();
  };

  const seekToMiddle = () => {
    const duration = videoPlayerRef.current?.getDuration() || 0;
    videoPlayerRef.current?.seek(duration / 2);
  };

  return (
    <div>
      <h3>forwardRef Examples</h3>
      
      {/* Basic forwardRef usage */}
      <div>
        <FancyInput
          ref={inputRef}
          placeholder="Type something..."
          onChange={(value) => console.log('Input changed:', value)}
        />
        <button onClick={focusInput}>Focus</button>
        <button onClick={clearInput}>Clear</button>
      </div>
      
      {/* Advanced forwardRef with custom methods */}
      <div>
        <VideoPlayer
          ref={videoPlayerRef}
          src="/sample-video.mp4"
          onTimeUpdate={setCurrentTime}
        />
        <div>
          <button onClick={playVideo}>Play</button>
          <button onClick={pauseVideo}>Pause</button>
          <button onClick={seekToMiddle}>Seek to Middle</button>
          <p>Current time: {currentTime.toFixed(2)}s</p>
        </div>
      </div>
    </div>
  );
};
```

### useImperativeHandle

Customize the instance value exposed when using forwardRef.

```typescript { .api }
/**
 * Customizes the instance value exposed to parent components when using forwardRef
 */
function useImperativeHandle<T, R extends T>(
  ref: Ref<T> | undefined,
  init: () => R,
  deps?: DependencyList
): void;
```

**Usage Examples:**

```typescript
import React, { 
  forwardRef, 
  useImperativeHandle, 
  useRef, 
  useState, 
  ForwardedRef 
} from "react";

// Counter component with custom methods
interface CounterMethods {
  increment: () => void;
  decrement: () => void;
  reset: () => void;
  getCount: () => number;
  setCount: (value: number) => void;
}

interface CounterProps {
  initialValue?: number;
  onCountChange?: (count: number) => void;
}

const Counter = forwardRef<CounterMethods, CounterProps>(
  ({ initialValue = 0, onCountChange }, ref) => {
    const [count, setCount] = useState(initialValue);

    // Expose custom methods through ref
    useImperativeHandle(ref, () => ({
      increment: () => {
        setCount(prev => {
          const newCount = prev + 1;
          onCountChange?.(newCount);
          return newCount;
        });
      },
      decrement: () => {
        setCount(prev => {
          const newCount = prev - 1;
          onCountChange?.(newCount);
          return newCount;
        });
      },
      reset: () => {
        setCount(initialValue);
        onCountChange?.(initialValue);
      },
      getCount: () => count,
      setCount: (value: number) => {
        setCount(value);
        onCountChange?.(value);
      }
    }), [count, initialValue, onCountChange]); // Dependencies

    return (
      <div style={{ 
        padding: '16px', 
        border: '1px solid #ccc', 
        borderRadius: '4px',
        textAlign: 'center'
      }}>
        <h3>Count: {count}</h3>
      </div>
    );
  }
);

// Form component with validation methods
interface FormMethods {
  validate: () => boolean;
  reset: () => void;
  getValues: () => { name: string; email: string };
  setValues: (values: { name?: string; email?: string }) => void;
  focus: (field: 'name' | 'email') => void;
}

interface FormProps {
  onSubmit?: (values: { name: string; email: string }) => void;
}

const CustomForm = forwardRef<FormMethods, FormProps>(({ onSubmit }, ref) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});
  
  const nameInputRef = useRef<HTMLInputElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);

  const validateForm = (): boolean => {
    const newErrors: { name?: string; email?: string } = {};
    
    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Invalid email format';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Expose methods through ref
  useImperativeHandle(ref, () => ({
    validate: validateForm,
    reset: () => {
      setName('');
      setEmail('');
      setErrors({});
    },
    getValues: () => ({ name, email }),
    setValues: (values) => {
      if (values.name !== undefined) setName(values.name);
      if (values.email !== undefined) setEmail(values.email);
    },
    focus: (field) => {
      if (field === 'name') {
        nameInputRef.current?.focus();
      } else if (field === 'email') {
        emailInputRef.current?.focus();
      }
    }
  }), [name, email]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit?.({ name, email });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ marginBottom: '16px' }}>
        <input
          ref={nameInputRef}
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ 
            padding: '8px', 
            borderColor: errors.name ? 'red' : '#ccc',
            width: '100%'
          }}
        />
        {errors.name && <div style={{ color: 'red', fontSize: '12px' }}>{errors.name}</div>}
      </div>
      
      <div style={{ marginBottom: '16px' }}>
        <input
          ref={emailInputRef}
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ 
            padding: '8px', 
            borderColor: errors.email ? 'red' : '#ccc',
            width: '100%'
          }}
        />
        {errors.email && <div style={{ color: 'red', fontSize: '12px' }}>{errors.email}</div>}
      </div>
      
      <button type="submit">Submit</button>
    </form>
  );
});

// Parent component using imperative handles
const ImperativeHandleExample: React.FC = () => {
  const counterRef = useRef<CounterMethods>(null);
  const formRef = useRef<FormMethods>(null);

  const handleCounterActions = () => {
    const counter = counterRef.current;
    if (counter) {
      console.log('Current count:', counter.getCount());
      counter.increment();
      counter.increment();
      console.log('After increments:', counter.getCount());
    }
  };

  const handleFormActions = () => {
    const form = formRef.current;
    if (form) {
      // Pre-fill form
      form.setValues({ name: 'John Doe', email: 'john@example.com' });
      
      // Validate
      if (form.validate()) {
        console.log('Form is valid:', form.getValues());
      } else {
        console.log('Form has errors');
        form.focus('name');
      }
    }
  };

  const resetForm = () => {
    formRef.current?.reset();
  };

  return (
    <div>
      <h3>useImperativeHandle Examples</h3>
      
      <div style={{ marginBottom: '24px' }}>
        <Counter
          ref={counterRef}
          initialValue={0}
          onCountChange={(count) => console.log('Count changed to:', count)}
        />
        <button onClick={handleCounterActions}>Test Counter Methods</button>
      </div>
      
      <div>
        <CustomForm
          ref={formRef}
          onSubmit={(values) => console.log('Form submitted:', values)}
        />
        <div style={{ marginTop: '8px' }}>
          <button onClick={handleFormActions}>Pre-fill & Validate</button>
          <button onClick={resetForm} style={{ marginLeft: '8px' }}>Reset Form</button>
        </div>
      </div>
    </div>
  );
};
```

### createRef

Class-based ref creation (primarily for class components).

```typescript { .api }
/**
 * Creates a ref object (primarily used in class components)
 */
function createRef<T>(): RefObject<T>;
```

**Usage Examples:**

```typescript
import React, { Component, createRef } from "react";

// Class component using createRef
class ClassComponentExample extends Component<{}, { message: string }> {
  private inputRef = createRef<HTMLInputElement>();
  private divRef = createRef<HTMLDivElement>();

  constructor(props: {}) {
    super(props);
    this.state = { message: '' };
  }

  componentDidMount() {
    // Focus input when component mounts
    this.inputRef.current?.focus();
  }

  focusInput = () => {
    this.inputRef.current?.focus();
  };

  changeBackgroundColor = () => {
    if (this.divRef.current) {
      const colors = ['lightblue', 'lightgreen', 'lightcoral', 'lightyellow'];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      this.divRef.current.style.backgroundColor = randomColor;
    }
  };

  handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ message: e.target.value });
  };

  render() {
    return (
      <div ref={this.divRef} style={{ padding: '16px', minHeight: '200px' }}>
        <h3>Class Component with createRef</h3>
        
        <input
          ref={this.inputRef}
          type="text"
          value={this.state.message}
          onChange={this.handleInputChange}
          placeholder="Type a message..."
          style={{ padding: '8px', marginRight: '8px' }}
        />
        
        <button onClick={this.focusInput}>Focus Input</button>
        <button onClick={this.changeBackgroundColor} style={{ marginLeft: '8px' }}>
          Change Background
        </button>
        
        <p>Message: {this.state.message}</p>
      </div>
    );
  }
}

// Functional component wrapper for comparison
const CreateRefExample: React.FC = () => {
  return (
    <div>
      <ClassComponentExample />
    </div>
  );
};
```

### Ref Callback Patterns

Advanced patterns using ref callbacks for dynamic behavior.

```typescript { .api }
/**
 * Ref callback function that can return cleanup
 */
type RefCallback<T> = (instance: T | null) => void;
```

**Usage Examples:**

```typescript
import React, { useState, useCallback } from "react";

const RefCallbackExample: React.FC = () => {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [observedElements, setObservedElements] = useState<Element[]>([]);

  // ResizeObserver ref callback
  const measuredRef = useCallback((node: HTMLDivElement | null) => {
    if (node) {
      const resizeObserver = new ResizeObserver((entries) => {
        const entry = entries[0];
        if (entry) {
          setDimensions({
            width: entry.contentRect.width,
            height: entry.contentRect.height
          });
        }
      });
      
      resizeObserver.observe(node);
      
      // Cleanup function (conceptual - would need to store observer reference)
      return () => {
        resizeObserver.unobserve(node);
        resizeObserver.disconnect();
      };
    }
  }, []);

  // Intersection Observer ref callback
  const intersectionRef = useCallback((node: HTMLDivElement | null) => {
    if (node) {
      const intersectionObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              console.log('Element is visible:', entry.target);
              entry.target.classList.add('visible');
            } else {
              console.log('Element is hidden:', entry.target);
              entry.target.classList.remove('visible');
            }
          });
        },
        { threshold: 0.5 }
      );
      
      intersectionObserver.observe(node);
      
      // Store reference for tracking
      setObservedElements(prev => [...prev, node]);
    }
  }, []);

  // Auto-focus ref callback
  const autoFocusRef = useCallback((node: HTMLInputElement | null) => {
    if (node) {
      // Focus after a small delay to ensure it's rendered
      setTimeout(() => {
        node.focus();
        node.select(); // Also select all text
      }, 100);
    }
  }, []);

  // Dynamic styling ref callback
  const dynamicStyleRef = useCallback((node: HTMLDivElement | null) => {
    if (node) {
      // Apply random gradient background
      const colors = [
        'linear-gradient(45deg, #ff6b6b, #ffa726)',
        'linear-gradient(45deg, #4ecdc4, #44a08d)',
        'linear-gradient(45deg, #a8edea, #fed6e3)',
        'linear-gradient(45deg, #ff9a9e, #fecfef)'
      ];
      
      const randomGradient = colors[Math.floor(Math.random() * colors.length)];
      node.style.background = randomGradient;
      node.style.transition = 'all 0.3s ease';
      
      // Add hover effects
      const handleMouseEnter = () => {
        node.style.transform = 'scale(1.05)';
        node.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
      };
      
      const handleMouseLeave = () => {
        node.style.transform = 'scale(1)';
        node.style.boxShadow = 'none';
      };
      
      node.addEventListener('mouseenter', handleMouseEnter);
      node.addEventListener('mouseleave', handleMouseLeave);
      
      // Cleanup listeners (conceptual)
      return () => {
        node.removeEventListener('mouseenter', handleMouseEnter);
        node.removeEventListener('mouseleave', handleMouseLeave);
      };
    }
  }, []);

  return (
    <div>
      <h3>Ref Callback Patterns</h3>
      
      {/* Measured element */}
      <div
        ref={measuredRef}
        style={{
          resize: 'both',
          overflow: 'auto',
          border: '2px dashed #ccc',
          padding: '16px',
          minWidth: '200px',
          minHeight: '100px',
          marginBottom: '16px'
        }}
      >
        <p>Resize me!</p>
        <p>Width: {dimensions.width.toFixed(0)}px</p>
        <p>Height: {dimensions.height.toFixed(0)}px</p>
      </div>
      
      {/* Auto-focus input */}
      <input
        ref={autoFocusRef}
        placeholder="I will auto-focus and select"
        style={{ padding: '8px', marginBottom: '16px', width: '300px' }}
      />
      
      {/* Dynamic styled element */}
      <div
        ref={dynamicStyleRef}
        style={{
          width: '200px',
          height: '100px',
          borderRadius: '8px',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: 'bold',
          cursor: 'pointer'
        }}
      >
        Hover me!
      </div>
      
      {/* Intersection observed elements */}
      <div style={{ height: '400px', overflow: 'auto', border: '1px solid #ccc' }}>
        <div style={{ height: '300px', padding: '16px' }}>Scroll down...</div>
        
        <div
          ref={intersectionRef}
          style={{
            height: '100px',
            backgroundColor: '#f0f0f0',
            margin: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'opacity 0.3s ease'
          }}
        >
          I'll log when visible!
        </div>
        
        <div style={{ height: '300px', padding: '16px' }}>Keep scrolling...</div>
      </div>
      
      <p>Observed elements: {observedElements.length}</p>
    </div>
  );
};
```

## Types

### Ref Type Definitions

```typescript { .api }
// Core ref types
interface RefObject<T> {
  readonly current: T | null;
}

interface MutableRefObject<T> {
  current: T;
}

type RefCallback<T> = {
  bivarianceHack(instance: T | null): void;
}["bivarianceHack"];

type Ref<T> = RefCallback<T> | RefObject<T> | null;
type LegacyRef<T> = string | Ref<T>;

// ForwardRef types
type ForwardedRef<T> = ((instance: T | null) => void) | MutableRefObject<T | null> | null;

interface ForwardRefRenderFunction<T, P = {}> {
  (props: P, ref: ForwardedRef<T>): ReactElement | null;
  displayName?: string | undefined;
  defaultProps?: never | undefined;
  propTypes?: never | undefined;
}

interface ForwardRefExoticComponent<P> extends NamedExoticComponent<P> {
  defaultProps?: never | undefined;
  propTypes?: never | undefined;
}

// Ref attributes
interface RefAttributes<T> extends Attributes {
  ref?: Ref<T> | undefined;
}

interface ClassAttributes<T> extends Attributes {
  ref?: LegacyRef<T> | undefined;
}
```