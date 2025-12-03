# Canary Features

Features available in React canary releases including async actions, useOptimistic, server components, and advanced concurrent patterns. These features are available in React 19+ experimental builds and provide cutting-edge capabilities.

## Capabilities

### Async State Management

Advanced hooks for handling asynchronous state and optimistic updates.

```typescript { .api }
/**
 * Hook for consuming promises and context values directly in render
 */
function use<T>(usable: Usable<T>): T;

/**
 * Union type for values that can be used with the use hook
 */
type Usable<T> = Thenable<T> | Context<T>;

/**
 * Enhanced thenable interface with status tracking
 */
interface Thenable<T> {
  then<TResult1 = T, TResult2 = never>(
    onfulfilled?: ((value: T) => TResult1 | Thenable<TResult1>) | undefined | null,
    onrejected?: ((reason: any) => TResult2 | Thenable<TResult2>) | undefined | null
  ): Thenable<TResult1 | TResult2>;
  status?: 'pending' | 'fulfilled' | 'rejected';
  value?: T;
  reason?: any;
}

/**
 * Specific thenable states for better type inference
 */
interface UntrackedThenable<T> extends Thenable<T> {
  status?: undefined;
}

interface PendingThenable<T> extends Thenable<T> {
  status: 'pending';
}

interface FulfilledThenable<T> extends Thenable<T> {
  status: 'fulfilled';
  value: T;
}

interface RejectedThenable<T> extends Thenable<T> {
  status: 'rejected';
  reason: any;
}

/**
 * Hook for optimistic state updates (single state version)
 */
function useOptimistic<State>(
  passthrough: State
): [State, (action: State | ((pendingState: State) => State)) => void];

/**
 * Hook for optimistic state updates (reducer version)
 */
function useOptimistic<State, Action>(
  passthrough: State,
  reducer: (state: State, action: Action) => State
): [State, (action: Action) => void];
```

**Usage Examples:**

```typescript
import React, { use, useOptimistic, useState } from "react";

// Using promises with the use hook
function UserProfile({ userPromise }: { userPromise: Promise<{ id: string; name: string; email: string }> }) {
  // This will suspend until the promise resolves
  const user = use(userPromise);
  
  return (
    <div style={{ padding: '16px', border: '1px solid #ccc' }}>
      <h3>{user.name}</h3>
      <p>Email: {user.email}</p>
      <p>ID: {user.id}</p>
    </div>
  );
}

// Using context with the use hook
const ThemeContext = React.createContext({ theme: 'light', setTheme: (theme: string) => {} });

function ThemedButton() {
  // Alternative to useContext - works the same way
  const { theme, setTheme } = use(ThemeContext);
  
  return (
    <button 
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      style={{
        backgroundColor: theme === 'light' ? '#fff' : '#333',
        color: theme === 'light' ? '#333' : '#fff'
      }}
    >
      Switch to {theme === 'light' ? 'dark' : 'light'} mode
    </button>
  );
}

// Optimistic updates for better UX
interface Message {
  id: string;
  text: string;
  pending?: boolean;
}

function ChatApp() {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: 'Hello!' },
    { id: '2', text: 'How are you?' }
  ]);
  
  // Optimistic state for immediate UI updates
  const [optimisticMessages, addOptimisticMessage] = useOptimistic(
    messages,
    (state, newMessage: string) => [
      ...state,
      { id: Date.now().toString(), text: newMessage, pending: true }
    ]
  );

  const sendMessage = async (text: string) => {
    // Immediately show message optimistically
    addOptimisticMessage(text);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update actual state with real message
      const realMessage: Message = {
        id: Date.now().toString(),
        text: text
      };
      setMessages(prev => [...prev, realMessage]);
    } catch (error) {
      console.error('Failed to send message:', error);
      // Optimistic update will automatically revert on next render
    }
  };

  return (
    <div style={{ padding: '16px', maxWidth: '400px' }}>
      <h3>Chat (Optimistic Updates)</h3>
      
      <div style={{ 
        height: '300px', 
        overflowY: 'auto', 
        border: '1px solid #ccc', 
        padding: '8px',
        marginBottom: '8px'
      }}>
        {optimisticMessages.map(message => (
          <div 
            key={message.id} 
            style={{ 
              marginBottom: '4px',
              opacity: message.pending ? 0.5 : 1,
              fontStyle: message.pending ? 'italic' : 'normal'
            }}
          >
            {message.text} {message.pending && '(sending...)'}
          </div>
        ))}
      </div>
      
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          const text = formData.get('message') as string;
          if (text.trim()) {
            sendMessage(text.trim());
            e.currentTarget.reset();
          }
        }}
      >
        <input
          name="message"
          placeholder="Type a message..."
          style={{ width: '70%', padding: '4px' }}
        />
        <button type="submit" style={{ marginLeft: '8px' }}>Send</button>
      </form>
    </div>
  );
}

// Async state management example
function AsyncDataExample() {
  const [userPromise, setUserPromise] = useState<Promise<any> | null>(null);

  const fetchUser = (userId: string) => {
    const promise = fetch(`/api/users/${userId}`)
      .then(res => res.json())
      .catch(error => {
        console.error('Failed to fetch user:', error);
        // Return mock data for demo
        return {
          id: userId,
          name: `User ${userId}`,
          email: `user${userId}@example.com`
        };
      });
    
    setUserPromise(promise);
  };

  return (
    <div style={{ padding: '16px' }}>
      <h3>Async Data with use Hook</h3>
      
      <div style={{ marginBottom: '16px' }}>
        <button onClick={() => fetchUser('1')}>Load User 1</button>
        <button onClick={() => fetchUser('2')} style={{ marginLeft: '8px' }}>Load User 2</button>
        <button onClick={() => setUserPromise(null)} style={{ marginLeft: '8px' }}>Clear</button>
      </div>

      <React.Suspense fallback={<div>Loading user...</div>}>
        {userPromise && <UserProfile userPromise={userPromise} />}
      </React.Suspense>
    </div>
  );
}
```

### Action State Management

Enhanced state management for form actions and async operations.

```typescript { .api }
/**
 * Hook for managing async action state (no payload)
 */
function useActionState<State>(
  action: (state: Awaited<State>) => State | Promise<State>,
  initialState: Awaited<State>,
  permalink?: string
): [state: Awaited<State>, dispatch: () => void, isPending: boolean];

/**
 * Hook for managing async action state (with payload)
 */
function useActionState<State, Payload>(
  action: (state: Awaited<State>, payload: Payload) => State | Promise<State>,
  initialState: Awaited<State>,
  permalink?: string
): [state: Awaited<State>, dispatch: (payload: Payload) => void, isPending: boolean];
```

**Usage Examples:**

```typescript
import React, { useActionState } from "react";

// Form with async submission
interface FormState {
  success: boolean;
  error: string | null;
  data: { name: string; email: string } | null;
}

async function submitForm(
  prevState: FormState,
  formData: { name: string; email: string }
): Promise<FormState> {
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (!formData.name || !formData.email) {
      return {
        success: false,
        error: 'Please fill in all fields',
        data: null
      };
    }
    
    if (!formData.email.includes('@')) {
      return {
        success: false,
        error: 'Please enter a valid email',
        data: null
      };
    }
    
    // Success
    return {
      success: true,
      error: null,
      data: formData
    };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to submit form',
      data: null
    };
  }
}

function ActionStateForm() {
  const [state, dispatch, isPending] = useActionState(submitForm, {
    success: false,
    error: null,
    data: null
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    
    dispatch({
      name: formData.get('name') as string,
      email: formData.get('email') as string
    });
  };

  return (
    <div style={{ padding: '16px', maxWidth: '400px' }}>
      <h3>Action State Form</h3>
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '8px' }}>
          <label>
            Name:
            <input
              name="name"
              type="text"
              disabled={isPending}
              style={{ marginLeft: '8px', padding: '4px' }}
            />
          </label>
        </div>
        
        <div style={{ marginBottom: '8px' }}>
          <label>
            Email:
            <input
              name="email"
              type="email"
              disabled={isPending}
              style={{ marginLeft: '8px', padding: '4px' }}
            />
          </label>
        </div>
        
        <button type="submit" disabled={isPending}>
          {isPending ? 'Submitting...' : 'Submit'}
        </button>
      </form>
      
      {state.error && (
        <div style={{ color: 'red', marginTop: '8px' }}>
          Error: {state.error}
        </div>
      )}
      
      {state.success && state.data && (
        <div style={{ color: 'green', marginTop: '8px' }}>
          Success! Submitted: {state.data.name} ({state.data.email})
        </div>
      )}
    </div>
  );
}

// Counter with async increment
async function incrementCounter(prevCount: number): Promise<number> {
  // Simulate async operation
  await new Promise(resolve => setTimeout(resolve, 500));
  return prevCount + 1;
}

function AsyncCounter() {
  const [count, increment, isPending] = useActionState(incrementCounter, 0);

  return (
    <div style={{ padding: '16px' }}>
      <h3>Async Counter</h3>
      <p>Count: {count}</p>
      <button onClick={() => increment()} disabled={isPending}>
        {isPending ? 'Incrementing...' : 'Increment'}
      </button>
    </div>
  );
}
```

### Caching System

Function result caching for performance optimization.

```typescript { .api }
/**
 * Caches function results across renders and components
 */
function cache<CachedFunction extends Function>(fn: CachedFunction): CachedFunction;

/**
 * Hook to refresh cache (unstable)
 */
function unstable_useCacheRefresh(): () => void;
```

**Usage Examples:**

```typescript
import React, { cache, unstable_useCacheRefresh, useState } from "react";

// Expensive computation that benefits from caching
const expensiveCalculation = cache((n: number): number => {
  console.log(`Computing fibonacci(${n})`);
  if (n <= 1) return n;
  return expensiveCalculation(n - 1) + expensiveCalculation(n - 2);
});

// Cached API call
const fetchUserData = cache(async (userId: string) => {
  console.log(`Fetching user data for ${userId}`);
  
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return {
    id: userId,
    name: `User ${userId}`,
    email: `user${userId}@example.com`,
    lastSeen: new Date().toISOString()
  };
});

// Component using cached functions
function CachedCalculation({ number }: { number: number }) {
  const result = expensiveCalculation(number);
  
  return (
    <div style={{ padding: '8px', border: '1px solid #ccc', margin: '4px' }}>
      <strong>Fibonacci({number}) = {result}</strong>
      <br />
      <small>Check console to see if calculation was cached</small>
    </div>
  );
}

function CachedUserData({ userId }: { userId: string }) {
  // This will suspend until the promise resolves
  // Subsequent calls with same userId will use cached result
  const userData = React.use(fetchUserData(userId));
  
  return (
    <div style={{ padding: '8px', border: '1px solid #ccc', margin: '4px' }}>
      <h4>{userData.name}</h4>
      <p>Email: {userData.email}</p>
      <p>Last seen: {new Date(userData.lastSeen).toLocaleString()}</p>
    </div>
  );
}

function CacheExample() {
  const [fibNumber, setFibNumber] = useState(5);
  const [selectedUserId, setSelectedUserId] = useState('1');
  const refreshCache = unstable_useCacheRefresh();

  return (
    <div style={{ padding: '16px' }}>
      <h3>Cache System Example</h3>
      
      {/* Fibonacci calculation caching */}
      <div style={{ marginBottom: '24px' }}>
        <h4>Cached Fibonacci Calculation</h4>
        <div>
          <label>
            Number: 
            <input
              type="number"
              value={fibNumber}
              onChange={(e) => setFibNumber(Number(e.target.value))}
              min="0"
              max="10"
              style={{ marginLeft: '8px' }}
            />
          </label>
        </div>
        
        <div style={{ margin: '8px 0' }}>
          <CachedCalculation number={fibNumber} />
          {fibNumber > 0 && <CachedCalculation number={fibNumber - 1} />}
          {fibNumber > 1 && <CachedCalculation number={fibNumber - 2} />}
        </div>
      </div>

      {/* User data caching */}
      <div>
        <h4>Cached User Data</h4>
        <div style={{ marginBottom: '8px' }}>
          <label>
            User ID: 
            <select 
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              style={{ marginLeft: '8px' }}
            >
              <option value="1">User 1</option>
              <option value="2">User 2</option>
              <option value="3">User 3</option>
            </select>
          </label>
          <button onClick={refreshCache} style={{ marginLeft: '8px' }}>
            Refresh Cache
          </button>
        </div>
        
        <React.Suspense fallback={<div>Loading user data...</div>}>
          <CachedUserData userId={selectedUserId} />
        </React.Suspense>
        
        <p style={{ fontSize: '12px', color: '#666' }}>
          Switch between users - first load will fetch data, subsequent loads use cache
        </p>
      </div>
    </div>
  );
}
```

### Server Components

Enhanced support for server-side rendering and server components.

```typescript { .api }
/**
 * Server context interface for server-side rendering
 */
interface ServerContext<T> {
  Provider: ServerContextProvider<T>;
  displayName?: string | undefined;
}

/**
 * Server context provider component type
 */
interface ServerContextProvider<T> {
  (props: { value: T; children: ReactNode }): ReactElement | null;
}

/**
 * Creates a context for server-side rendering
 */
function createServerContext<T>(
  globalName: string,
  defaultValue: T
): ServerContext<T>;

/**
 * Hook to consume server context (extends useContext for server contexts)
 */
function useContext<T>(context: ServerContext<T>): T;

/**
 * Valid JSON values for server context
 */
type ServerContextJSONValue =
  | string
  | boolean
  | number
  | null
  | ServerContextJSONArray
  | ServerContextJSONObject;

interface ServerContextJSONArray extends ReadonlyArray<ServerContextJSONValue> {}

interface ServerContextJSONObject {
  readonly [key: string]: ServerContextJSONValue;
}

/**
 * Awaited version of ReactNode for server components
 */
type AwaitedReactNode = ReactNode | Promise<ReactNode>;
```

**Usage Examples:**

```typescript
import React, { createServerContext, useContext } from "react";

// Server-side theme context
interface ServerTheme {
  primaryColor: string;
  backgroundColor: string;
  textColor: string;
}

const ServerThemeContext = createServerContext<ServerTheme>(
  'ServerTheme',
  {
    primaryColor: '#007bff',
    backgroundColor: '#ffffff',
    textColor: '#333333'
  }
);

// Server component (would run on server)
function ServerThemedHeader({ title }: { title: string }) {
  const theme = useContext(ServerThemeContext);
  
  return (
    <header style={{
      backgroundColor: theme.primaryColor,
      color: theme.backgroundColor,
      padding: '16px',
      textAlign: 'center'
    }}>
      <h1>{title}</h1>
    </header>
  );
}

// Server-side user context
interface ServerUser {
  id: string;
  name: string;
  preferences: {
    language: string;
    timezone: string;
  };
}

const ServerUserContext = createServerContext<ServerUser | null>(
  'ServerUser',
  null
);

function ServerUserProfile() {
  const user = useContext(ServerUserContext);
  
  if (!user) {
    return <div>Please log in</div>;
  }
  
  return (
    <div style={{ padding: '16px' }}>
      <h2>Welcome, {user.name}</h2>
      <p>Language: {user.preferences.language}</p>
      <p>Timezone: {user.preferences.timezone}</p>
    </div>
  );
}

// App with server contexts
function ServerComponentExample() {
  const [serverTheme, setServerTheme] = React.useState<ServerTheme>({
    primaryColor: '#007bff',
    backgroundColor: '#ffffff',
    textColor: '#333333'
  });

  const [serverUser, setServerUser] = React.useState<ServerUser | null>({
    id: '1',
    name: 'John Doe',
    preferences: {
      language: 'en',
      timezone: 'UTC'
    }
  });

  return (
    <div>
      <h3>Server Component Context Example</h3>
      
      <div style={{ marginBottom: '16px' }}>
        <button 
          onClick={() => setServerTheme({
            primaryColor: '#dc3545',
            backgroundColor: '#ffffff',
            textColor: '#333333'
          })}
        >
          Red Theme
        </button>
        <button 
          onClick={() => setServerTheme({
            primaryColor: '#28a745',
            backgroundColor: '#ffffff',
            textColor: '#333333'
          })}
          style={{ marginLeft: '8px' }}
        >
          Green Theme
        </button>
        <button 
          onClick={() => setServerUser(serverUser ? null : {
            id: '1',
            name: 'John Doe',
            preferences: { language: 'en', timezone: 'UTC' }
          })}
          style={{ marginLeft: '8px' }}
        >
          {serverUser ? 'Logout' : 'Login'}
        </button>
      </div>

      <ServerThemeContext.Provider value={serverTheme}>
        <ServerUserContext.Provider value={serverUser}>
          <ServerThemedHeader title="Server Component Demo" />
          <ServerUserProfile />
        </ServerUserContext.Provider>
      </ServerThemeContext.Provider>
    </div>
  );
}
```

### Enhanced Transitions

Async transition support for concurrent features.

```typescript { .api }
/**
 * Enhanced transition start function supporting async operations
 */
type TransitionStartFunction = (callback: () => void | Promise<void>) => void;

/**
 * Start async transition without hook
 */
function startTransition(scope: () => Promise<void>): void;
```

**Usage Examples:**

```typescript
import React, { useTransition, startTransition, useState } from "react";

// Heavy computation component
function HeavyList({ items }: { items: string[] }) {
  // Simulate heavy rendering
  const startTime = Date.now();
  while (Date.now() - startTime < 100) {
    // Block for 100ms
  }
  
  return (
    <ul style={{ border: '1px solid #ccc', padding: '8px', maxHeight: '200px', overflow: 'auto' }}>
      {items.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  );
}

function AsyncTransitionExample() {
  const [items, setItems] = useState<string[]>([]);
  const [isPending, startAsyncTransition] = useTransition();
  const [filter, setFilter] = useState('');

  // Generate items asynchronously
  const generateItems = async (count: number) => {
    const newItems: string[] = [];
    
    // Simulate async data generation
    for (let i = 0; i < count; i++) {
      await new Promise(resolve => setTimeout(resolve, 1));
      newItems.push(`Item ${i + 1} - ${Date.now()}`);
    }
    
    return newItems;
  };

  const handleGenerateItems = () => {
    startAsyncTransition(async () => {
      const newItems = await generateItems(100);
      setItems(newItems);
    });
  };

  const filteredItems = items.filter(item => 
    item.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div style={{ padding: '16px' }}>
      <h3>Async Transitions Example</h3>
      
      <div style={{ marginBottom: '16px' }}>
        <button onClick={handleGenerateItems} disabled={isPending}>
          {isPending ? 'Generating Items...' : 'Generate 100 Items'}
        </button>
        
        <input
          type="text"
          placeholder="Filter items..."
          value={filter}
          onChange={(e) => {
            // Non-urgent update - use transition
            startTransition(() => {
              setFilter(e.target.value);
            });
          }}
          style={{ marginLeft: '8px', padding: '4px' }}
        />
      </div>

      <p>
        Total items: {items.length} | 
        Filtered items: {filteredItems.length} | 
        {isPending && 'Updating...'}
      </p>

      <HeavyList items={filteredItems.slice(0, 50)} />
    </div>
  );
}
```

### Enhanced Ref Callbacks

Ref callbacks with cleanup support in canary builds.

```typescript { .api }
/**
 * Enhanced ref callback that can return cleanup function
 */
type RefCallback<T> = (instance: T | null) => void | (() => void);
```

**Usage Examples:**

```typescript
import React, { useCallback } from "react";

function EnhancedRefExample() {
  // Ref callback with cleanup
  const observerRef = useCallback((element: HTMLDivElement | null) => {
    if (element) {
      console.log('Element mounted');
      
      // Set up intersection observer
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            console.log('Visibility changed:', entry.isIntersecting);
            element.style.backgroundColor = entry.isIntersecting ? 'lightgreen' : 'lightcoral';
          });
        },
        { threshold: 0.5 }
      );
      
      observer.observe(element);
      
      // Return cleanup function (canary feature)
      return () => {
        console.log('Element cleanup');
        observer.disconnect();
      };
    }
  }, []);

  // Resize observer ref callback
  const resizeRef = useCallback((element: HTMLTextAreaElement | null) => {
    if (element) {
      const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          console.log('Element resized:', entry.contentRect);
        }
      });
      
      resizeObserver.observe(element);
      
      // Cleanup function
      return () => {
        resizeObserver.disconnect();
      };
    }
  }, []);

  return (
    <div style={{ padding: '16px' }}>
      <h3>Enhanced Ref Callbacks (Canary)</h3>
      
      <div style={{ height: '400px', overflow: 'auto', border: '1px solid #ccc' }}>
        <div style={{ height: '200px', padding: '16px' }}>
          Scroll down to see intersection observer in action...
        </div>
        
        <div
          ref={observerRef}
          style={{
            height: '100px',
            margin: '16px',
            padding: '16px',
            border: '2px solid #333',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          Intersection Observer Target
          <br />
          (Color changes based on visibility)
        </div>
        
        <div style={{ height: '200px', padding: '16px' }}>
          Scroll more...
        </div>
      </div>

      <textarea
        ref={resizeRef}
        placeholder="Resize me! (Check console for resize events)"
        style={{
          width: '100%',
          minHeight: '100px',
          marginTop: '16px',
          resize: 'both',
          padding: '8px'
        }}
      />
    </div>
  );
}
```

## Types

### Canary Type Definitions

```typescript { .api }
// Usable types for the use hook
type Usable<T> = Thenable<T> | Context<T>;

interface Thenable<T> {
  then<TResult1 = T, TResult2 = never>(
    onfulfilled?: ((value: T) => TResult1 | Thenable<TResult1>) | undefined | null,
    onrejected?: ((reason: any) => TResult2 | Thenable<TResult2>) | undefined | null
  ): Thenable<TResult1 | TResult2>;
  status?: 'pending' | 'fulfilled' | 'rejected';
  value?: T;
  reason?: any;
}

interface UntrackedThenable<T> extends Thenable<T> {
  status?: undefined;
}

interface PendingThenable<T> extends Thenable<T> {
  status: 'pending';
}

interface FulfilledThenable<T> extends Thenable<T> {
  status: 'fulfilled';
  value: T;
}

interface RejectedThenable<T> extends Thenable<T> {
  status: 'rejected';
  reason: any;
}

// Server context types
interface ServerContext<T> {
  Provider: ServerContextProvider<T>;
  displayName?: string | undefined;
}

interface ServerContextProvider<T> {
  (props: { value: T; children: ReactNode }): ReactElement | null;
}

type ServerContextJSONValue =
  | string
  | boolean
  | number
  | null
  | ServerContextJSONArray
  | ServerContextJSONObject;

interface ServerContextJSONArray extends ReadonlyArray<ServerContextJSONValue> {}

interface ServerContextJSONObject {
  readonly [key: string]: ServerContextJSONValue;
}

// Enhanced types
type AwaitedReactNode = ReactNode | Promise<ReactNode>;
type TransitionStartFunction = (callback: () => void | Promise<void>) => void;

// Enhanced ref callback with cleanup
type RefCallback<T> = (instance: T | null) => void | (() => void);
```