# React Hooks

Complete type definitions for all React hooks including state management, effects, performance optimization, and advanced patterns. Hooks provide a way to use state and other React features in function components.

## Capabilities

### State Hooks

Hooks for managing component state with type safety.

```typescript { .api }
/**
 * State management hook with setter function
 */
function useState<S>(initialState: S | (() => S)): [S, Dispatch<SetStateAction<S>>];

/**
 * State setter action type
 */
type SetStateAction<S> = S | ((prevState: S) => S);

/**
 * Dispatcher function type for state updates
 */
type Dispatch<A> = (value: A) => void;

/**
 * Reducer hook for complex state management
 */
function useReducer<R extends Reducer<any, any>, I>(
  reducer: R,
  initializerArg: I & ReducerState<R>,
  initializer: (arg: I & ReducerState<R>) => ReducerState<R>
): [ReducerState<R>, Dispatch<ReducerAction<R>>];

function useReducer<R extends Reducer<any, any>>(
  reducer: R,
  initialState: ReducerState<R>,
  initializer?: undefined
): [ReducerState<R>, Dispatch<ReducerAction<R>>];

/**
 * Reducer function type
 */
type Reducer<S, A> = (prevState: S, action: A) => S;

/**
 * Extract state type from reducer
 */
type ReducerState<R> = R extends Reducer<infer S, any> ? S : never;

/**
 * Extract action type from reducer
 */
type ReducerAction<R> = R extends Reducer<any, infer A> ? A : never;
```

**Usage Examples:**

```typescript
import React, { useState, useReducer } from "react";

// Basic state hook
const Counter: React.FC = () => {
  const [count, setCount] = useState<number>(0);
  const [name, setName] = useState<string>('');

  // Function form for updates
  const increment = () => setCount(prev => prev + 1);
  
  // Direct value form
  const reset = () => setCount(0);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={increment}>+</button>
      <button onClick={reset}>Reset</button>
    </div>
  );
};

// Reducer for complex state
interface TodoState {
  todos: Array<{ id: number; text: string; completed: boolean }>;
  filter: 'all' | 'active' | 'completed';
}

type TodoAction = 
  | { type: 'ADD_TODO'; payload: { id: number; text: string } }
  | { type: 'TOGGLE_TODO'; payload: { id: number } }
  | { type: 'SET_FILTER'; payload: { filter: 'all' | 'active' | 'completed' } };

const todoReducer: Reducer<TodoState, TodoAction> = (state, action) => {
  switch (action.type) {
    case 'ADD_TODO':
      return {
        ...state,
        todos: [...state.todos, { ...action.payload, completed: false }]
      };
    case 'TOGGLE_TODO':
      return {
        ...state,
        todos: state.todos.map(todo =>
          todo.id === action.payload.id ? { ...todo, completed: !todo.completed } : todo
        )
      };
    case 'SET_FILTER':
      return { ...state, filter: action.payload.filter };
    default:
      return state;
  }
};

const TodoApp: React.FC = () => {
  const [state, dispatch] = useReducer(todoReducer, {
    todos: [],
    filter: 'all'
  });

  const addTodo = (text: string) => {
    dispatch({ 
      type: 'ADD_TODO', 
      payload: { id: Date.now(), text } 
    });
  };

  return (
    <div>
      {/* Todo UI */}
    </div>
  );
};
```

### Effect Hooks

Hooks for side effects and lifecycle management.

```typescript { .api }
/**
 * Effect callback function type
 */
type EffectCallback = () => (void | (() => void | undefined));

/**
 * Dependency list for effects
 */
type DependencyList = ReadonlyArray<unknown>;

/**
 * Side effects hook (componentDidMount, componentDidUpdate, componentWillUnmount)
 */
function useEffect(effect: EffectCallback, deps?: DependencyList): void;

/**
 * Synchronous effects hook (runs synchronously after DOM mutations)
 */
function useLayoutEffect(effect: EffectCallback, deps?: DependencyList): void;

/**
 * Insertion effects hook (for CSS-in-JS libraries)
 */
function useInsertionEffect(effect: EffectCallback, deps?: DependencyList): void;
```

**Usage Examples:**

```typescript
import React, { useState, useEffect, useLayoutEffect, useInsertionEffect } from "react";

const DataFetcher: React.FC<{ userId: number }> = ({ userId }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Effect with cleanup
  useEffect(() => {
    let cancelled = false;

    const fetchUser = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/users/${userId}`);
        const userData = await response.json();
        
        if (!cancelled) {
          setUser(userData);
          setLoading(false);
        }
      } catch (error) {
        if (!cancelled) {
          console.error('Failed to fetch user:', error);
          setLoading(false);
        }
      }
    };

    fetchUser();

    // Cleanup function
    return () => {
      cancelled = true;
    };
  }, [userId]); // Dependencies array

  // Effect without cleanup (no return value)
  useEffect(() => {
    document.title = user ? `User: ${user.name}` : 'Loading...';
  }, [user]);

  if (loading) return <div>Loading...</div>;
  return user ? <div>Hello, {user.name}</div> : <div>User not found</div>;
};

// Layout effect for DOM measurements
const MeasuredComponent: React.FC = () => {
  const [height, setHeight] = useState<number>(0);
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (ref.current) {
      setHeight(ref.current.getBoundingClientRect().height);
    }
  }, []); // Run only once

  return <div ref={ref}>Height: {height}px</div>;
};

// Insertion effect for CSS-in-JS
const StyledComponent: React.FC = () => {
  useInsertionEffect(() => {
    // Insert CSS before any layout effects
    const style = document.createElement('style');
    style.textContent = '.my-component { color: red; }';
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return <div className="my-component">Styled content</div>;
};
```

### Performance Hooks

Hooks for optimizing component performance through memoization.

```typescript { .api }
/**
 * Memoization hook for expensive calculations
 */
function useMemo<T>(factory: () => T, deps: DependencyList): T;

/**
 * Callback memoization hook for stable function references
 */
function useCallback<T extends Function>(callback: T, deps: DependencyList): T;
```

**Usage Examples:**

```typescript
import React, { useMemo, useCallback, useState } from "react";

interface ExpensiveComponentProps {
  items: Array<{ id: number; value: number }>;
  multiplier: number;
}

const ExpensiveComponent: React.FC<ExpensiveComponentProps> = ({ items, multiplier }) => {
  // Expensive calculation memoized
  const processedItems = useMemo(() => {
    console.log('Processing items...'); // Only runs when items or multiplier change
    
    return items.map(item => ({
      ...item,
      processedValue: item.value * multiplier,
      expensiveCalculation: Math.pow(item.value, multiplier) // Expensive operation
    }));
  }, [items, multiplier]);

  // Stable callback reference
  const handleItemClick = useCallback((id: number) => {
    console.log(`Clicked item ${id}`);
    // This function will only be recreated if its dependencies change
  }, []); // No dependencies, so function never changes

  return (
    <div>
      {processedItems.map(item => (
        <div key={item.id} onClick={() => handleItemClick(item.id)}>
          {item.processedValue}
        </div>
      ))}
    </div>
  );
};

// Parent component
const ParentComponent: React.FC = () => {
  const [items, setItems] = useState([
    { id: 1, value: 10 },
    { id: 2, value: 20 }
  ]);
  const [multiplier, setMultiplier] = useState(2);
  const [otherState, setOtherState] = useState('');

  // This callback is memoized and won't cause ExpensiveComponent to re-render
  const handleAddItem = useCallback(() => {
    setItems(prev => [...prev, { id: Date.now(), value: Math.random() * 100 }]);
  }, []);

  return (
    <div>
      <ExpensiveComponent items={items} multiplier={multiplier} />
      <button onClick={handleAddItem}>Add Item</button>
      <input 
        value={otherState} 
        onChange={(e) => setOtherState(e.target.value)} 
        placeholder="This won't affect ExpensiveComponent"
      />
    </div>
  );
};
```

### Ref Hooks

Hooks for managing references to DOM elements and mutable values.

```typescript { .api }
/**
 * Ref hook for mutable values that persist across renders
 */
function useRef<T>(initialValue: T): MutableRefObject<T>;
function useRef<T>(initialValue: T | null): RefObject<T>;
function useRef<T = undefined>(): MutableRefObject<T | undefined>;

/**
 * Customizes the instance value exposed when using forwardRef
 */
function useImperativeHandle<T, R extends T>(
  ref: Ref<T> | undefined,
  init: () => R,
  deps?: DependencyList
): void;
```

**Usage Examples:**

```typescript
import React, { useRef, useImperativeHandle, forwardRef } from "react";

// Basic ref usage
const FocusInput: React.FC = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const countRef = useRef<number>(0);

  const focusInput = () => {
    inputRef.current?.focus();
  };

  const incrementCount = () => {
    countRef.current += 1;
    console.log('Count:', countRef.current); // Doesn't trigger re-render
  };

  return (
    <div>
      <input ref={inputRef} placeholder="Click button to focus" />
      <button onClick={focusInput}>Focus Input</button>
      <button onClick={incrementCount}>Increment Count</button>
    </div>
  );
};

// useImperativeHandle with forwardRef
interface CustomInputMethods {
  focus: () => void;
  clear: () => void;
  getValue: () => string;
}

const CustomInput = forwardRef<CustomInputMethods, { placeholder?: string }>((props, ref) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useImperativeHandle(ref, () => ({
    focus: () => {
      inputRef.current?.focus();
    },
    clear: () => {
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    },
    getValue: () => {
      return inputRef.current?.value || '';
    }
  }), []); // No dependencies

  return <input ref={inputRef} placeholder={props.placeholder} />;
});

// Using the custom input
const ParentWithCustomInput: React.FC = () => {
  const customInputRef = useRef<CustomInputMethods>(null);

  const handleFocus = () => {
    customInputRef.current?.focus();
  };

  const handleClear = () => {
    customInputRef.current?.clear();
  };

  const handleGetValue = () => {
    const value = customInputRef.current?.getValue();
    alert(`Current value: ${value}`);
  };

  return (
    <div>
      <CustomInput ref={customInputRef} placeholder="Custom input" />
      <button onClick={handleFocus}>Focus</button>
      <button onClick={handleClear}>Clear</button>
      <button onClick={handleGetValue}>Get Value</button>
    </div>
  );
};
```

### Utility Hooks

Additional hooks for debugging, IDs, and other utilities.

```typescript { .api }
/**
 * Generates a unique ID that is stable across server and client
 */
function useId(): string;

/**
 * Debug value hook for development tools
 */
function useDebugValue<T>(value: T, format?: (value: T) => any): void;
```

**Usage Examples:**

```typescript
import React, { useId, useDebugValue, useState } from "react";

const FormField: React.FC<{ label: string; placeholder?: string }> = ({ label, placeholder }) => {
  const id = useId(); // Generates unique ID like ":r1:"
  const [value, setValue] = useState('');

  return (
    <div>
      <label htmlFor={id}>{label}</label>
      <input 
        id={id}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
};

// Custom hook with debug value
function useToggle(initialValue: boolean = false) {
  const [value, setValue] = useState(initialValue);
  
  // Show debug information in React DevTools
  useDebugValue(value ? 'On' : 'Off');
  
  const toggle = useCallback(() => setValue(v => !v), []);
  
  return [value, toggle] as const;
}

// Custom hook with formatted debug value
function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  // Format debug value for better display
  useDebugValue(storedValue, (value) => `${key}: ${JSON.stringify(value)}`);

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error saving to localStorage:`, error);
    }
  };

  return [storedValue, setValue] as const;
}

const ComponentWithCustomHooks: React.FC = () => {
  const [isVisible, toggleVisible] = useToggle();
  const [name, setName] = useLocalStorage('user-name', '');

  return (
    <div>
      <button onClick={toggleVisible}>
        {isVisible ? 'Hide' : 'Show'} Content
      </button>
      {isVisible && (
        <div>
          <FormField label="Name" />
          <p>Stored name: {name}</p>
        </div>
      )}
    </div>
  );
};
```

### Concurrent Features

Hooks for React's concurrent features and performance optimization.

```typescript { .api }
/**
 * Defers value updates to improve performance
 */
function useDeferredValue<T>(value: T): T;

/**
 * Transition hook for marking state updates as transitions
 */
function useTransition(): [boolean, TransitionStartFunction];

/**
 * Function to start a transition
 */
type TransitionStartFunction = (callback: () => void) => void;

/**
 * Transition function type for React concurrent features
 */
type TransitionFunction = () => void;

/**
 * Start transition without hook
 */
function startTransition(scope: TransitionFunction): void;

/**
 * Synchronize with external store
 */
function useSyncExternalStore<Snapshot>(
  subscribe: (onStoreChange: () => void) => () => void,
  getSnapshot: () => Snapshot,
  getServerSnapshot?: () => Snapshot
): Snapshot;
```

**Usage Examples:**

```typescript
import React, { useState, useDeferredValue, useTransition, useSyncExternalStore } from "react";

// Deferred value for performance
const SearchResults: React.FC<{ query: string }> = ({ query }) => {
  const deferredQuery = useDeferredValue(query);
  
  // This will use the deferred query, allowing input to stay responsive
  const results = useSearchResults(deferredQuery);
  
  return (
    <div>
      {results.map(result => (
        <div key={result.id}>{result.title}</div>
      ))}
    </div>
  );
};

// Transition for non-urgent updates
const TabContainer: React.FC = () => {
  const [activeTab, setActiveTab] = useState('tab1');
  const [isPending, startTransition] = useTransition();
  
  const handleTabClick = (tabId: string) => {
    startTransition(() => {
      // Mark this state update as non-urgent
      setActiveTab(tabId);
    });
  };
  
  return (
    <div>
      <div>
        <button onClick={() => handleTabClick('tab1')}>Tab 1</button>
        <button onClick={() => handleTabClick('tab2')}>Tab 2</button>
        {isPending && <span>Loading...</span>}
      </div>
      <TabContent tabId={activeTab} />
    </div>
  );
};

// External store synchronization
const useOnlineStatus = () => {
  return useSyncExternalStore(
    (callback) => {
      // Subscribe to online/offline events
      window.addEventListener('online', callback);
      window.addEventListener('offline', callback);
      
      // Return cleanup function
      return () => {
        window.removeEventListener('online', callback);
        window.removeEventListener('offline', callback);
      };
    },
    () => navigator.onLine, // Get current value
    () => true // Server snapshot (assume online)
  );
};

const NetworkStatus: React.FC = () => {
  const isOnline = useOnlineStatus();
  
  return (
    <div>
      Status: {isOnline ? 'Online' : 'Offline'}
    </div>
  );
};
```

## Types

### Hook Type Definitions

```typescript { .api }
// Effect callback types
type EffectCallback = () => (void | Destructor);
type Destructor = () => void | { [UNDEFINED_VOID_ONLY]: never };

// Dependency list
type DependencyList = ReadonlyArray<unknown>;

// Dispatch and actions
type Dispatch<A> = (value: A) => void;
type SetStateAction<S> = S | ((prevState: S) => S);

// Reducer types
type Reducer<S, A> = (prevState: S, action: A) => S;
type ReducerState<R> = R extends Reducer<infer S, any> ? S : never;
type ReducerAction<R> = R extends Reducer<any, infer A> ? A : never;

// Ref types
interface RefObject<T> {
  readonly current: T | null;
}

interface MutableRefObject<T> {
  current: T;
}

// Transition types
type TransitionStartFunction = (callback: () => void) => void;

// External store types
type Subscribe = (callback: () => void) => () => void;
type GetSnapshot<T> = () => T;
```