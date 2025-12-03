# Advanced Components

Higher-order components, lazy loading, memoization, and Suspense with complete type safety. These advanced patterns enable performance optimization and code splitting in React applications.

## Capabilities

### React.memo

Memoization for function components to prevent unnecessary re-renders.

```typescript { .api }
/**
 * Memoizes a function component, preventing re-renders when props haven't changed
 */
function memo<P extends object>(
  Component: FunctionComponent<P>,
  propsAreEqual?: (prevProps: Readonly<P>, nextProps: Readonly<P>) => boolean
): NamedExoticComponent<P>;

/**
 * Component type returned by memo
 */
interface MemoExoticComponent<T extends ComponentType<any>> extends NamedExoticComponent<ComponentProps<T>> {
  readonly type: T;
}

/**
 * Base interface for exotic components
 */
interface ExoticComponent<P = {}> {
  (props: P): ReactElement | null;
  readonly $$typeof: symbol;
}

/**
 * Exotic component with displayName
 */
interface NamedExoticComponent<P = {}> extends ExoticComponent<P> {
  displayName?: string | undefined;
}
```

**Usage Examples:**

```typescript
import React, { memo, useState, useMemo } from "react";

// Basic memoization
interface UserCardProps {
  user: {
    id: number;
    name: string;
    email: string;
    avatar?: string;
  };
  onEdit?: (userId: number) => void;
}

const UserCard = memo<UserCardProps>(({ user, onEdit }) => {
  console.log('UserCard rendered for:', user.name);
  
  return (
    <div style={{
      padding: '16px',
      border: '1px solid #e0e0e0',
      borderRadius: '8px',
      margin: '8px 0'
    }}>
      <h3>{user.name}</h3>
      <p>{user.email}</p>
      {onEdit && (
        <button onClick={() => onEdit(user.id)}>
          Edit User
        </button>
      )}
    </div>
  );
});

UserCard.displayName = 'UserCard';

// Memoization with custom comparison
interface ExpensiveListProps {
  items: Array<{ id: number; value: number; label: string }>;
  multiplier: number;
  sortDirection: 'asc' | 'desc';
}

const ExpensiveList = memo<ExpensiveListProps>(({ items, multiplier, sortDirection }) => {
  console.log('ExpensiveList rendered');
  
  const processedItems = useMemo(() => {
    return items
      .map(item => ({
        ...item,
        processedValue: item.value * multiplier
      }))
      .sort((a, b) => {
        const direction = sortDirection === 'asc' ? 1 : -1;
        return (a.processedValue - b.processedValue) * direction;
      });
  }, [items, multiplier, sortDirection]);

  return (
    <ul>
      {processedItems.map(item => (
        <li key={item.id}>
          {item.label}: {item.processedValue}
        </li>
      ))}
    </ul>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function
  return (
    prevProps.multiplier === nextProps.multiplier &&
    prevProps.sortDirection === nextProps.sortDirection &&
    prevProps.items.length === nextProps.items.length &&
    prevProps.items.every((item, index) => {
      const nextItem = nextProps.items[index];
      return item.id === nextItem.id && 
             item.value === nextItem.value && 
             item.label === nextItem.label;
    })
  );
});

ExpensiveList.displayName = 'ExpensiveList';

// Usage in parent component
const MemoExample: React.FC = () => {
  const [users, setUsers] = useState([
    { id: 1, name: 'Alice', email: 'alice@example.com' },
    { id: 2, name: 'Bob', email: 'bob@example.com' },
    { id: 3, name: 'Charlie', email: 'charlie@example.com' }
  ]);
  
  const [counter, setCounter] = useState(0);
  const [multiplier, setMultiplier] = useState(2);

  const items = useMemo(() => [
    { id: 1, value: 10, label: 'Item A' },
    { id: 2, value: 20, label: 'Item B' },
    { id: 3, value: 15, label: 'Item C' }
  ], []);

  const handleEditUser = (userId: number) => {
    console.log('Editing user:', userId);
  };

  return (
    <div style={{ padding: '16px' }}>
      <h2>React.memo Example</h2>
      
      {/* This will cause parent re-render but UserCard won't re-render */}
      <p>Counter: {counter}</p>
      <button onClick={() => setCounter(c => c + 1)}>
        Increment Counter (won't affect UserCard)
      </button>
      
      <div>
        <h3>Users (memoized)</h3>
        {users.map(user => (
          <UserCard
            key={user.id}
            user={user}
            onEdit={handleEditUser}
          />
        ))}
      </div>
      
      <div>
        <h3>Expensive List (custom comparison)</h3>
        <button onClick={() => setMultiplier(m => m + 1)}>
          Change Multiplier: {multiplier}
        </button>
        
        <ExpensiveList
          items={items}
          multiplier={multiplier}
          sortDirection="asc"
        />
      </div>
    </div>
  );
};
```

### React.lazy

Code splitting and lazy loading for components.

```typescript { .api }
/**
 * Creates a lazy-loaded component for code splitting
 */
function lazy<T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>
): LazyExoticComponent<T>;

/**
 * Component type returned by lazy
 */
interface LazyExoticComponent<T extends ComponentType<any>> extends ExoticComponent<ComponentProps<T>> {
  readonly _result: T;
}
```

**Usage Examples:**

```typescript
import React, { lazy, Suspense, useState } from "react";

// Lazy-loaded components
const LazyDashboard = lazy(() => import('./Dashboard'));
const LazyUserProfile = lazy(() => import('./UserProfile'));
const LazySettings = lazy(() => 
  import('./Settings').then(module => ({ default: module.SettingsPage }))
);

// Heavy component that will be code-split
const LazyChart = lazy(() => 
  // Simulate dynamic import
  new Promise<{ default: React.ComponentType<{ data: number[] }> }>(resolve => {
    setTimeout(() => {
      // This would typically be: import('./Chart')
      const Chart: React.FC<{ data: number[] }> = ({ data }) => (
        <div style={{ padding: '16px', border: '2px solid blue' }}>
          <h3>Heavy Chart Component</h3>
          <p>Data points: {data.join(', ')}</p>
          <div>📊 Imagine a complex chart here</div>
        </div>
      );
      resolve({ default: Chart });
    }, 1000); // Simulate loading time
  })
);

// Loading components
const SimpleLoader: React.FC = () => (
  <div style={{ padding: '16px', textAlign: 'center' }}>
    Loading...
  </div>
);

const DetailedLoader: React.FC<{ message?: string }> = ({ message = 'Loading component...' }) => (
  <div style={{ 
    padding: '32px', 
    textAlign: 'center', 
    border: '1px dashed #ccc',
    borderRadius: '8px',
    backgroundColor: '#f9f9f9'
  }}>
    <div>⏳</div>
    <p>{message}</p>
  </div>
);

// Error boundary for lazy components
class LazyErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode; fallback?: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Lazy loading error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div style={{ padding: '16px', color: 'red' }}>
          <h3>Failed to load component</h3>
          <p>{this.state.error?.message}</p>
          <button onClick={() => this.setState({ hasError: false })}>
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Route-based lazy loading
type Route = 'dashboard' | 'profile' | 'settings' | 'chart';

const LazyExample: React.FC = () => {
  const [currentRoute, setCurrentRoute] = useState<Route>('dashboard');
  const [chartData] = useState([10, 20, 15, 30, 25]);

  const renderRoute = () => {
    switch (currentRoute) {
      case 'dashboard':
        return (
          <Suspense fallback={<DetailedLoader message="Loading dashboard..." />}>
            <LazyDashboard />
          </Suspense>
        );
      case 'profile':
        return (
          <Suspense fallback={<DetailedLoader message="Loading profile..." />}>
            <LazyUserProfile />
          </Suspense>
        );
      case 'settings':
        return (
          <Suspense fallback={<DetailedLoader message="Loading settings..." />}>
            <LazySettings />
          </Suspense>
        );
      case 'chart':
        return (
          <Suspense fallback={<DetailedLoader message="Loading heavy chart component..." />}>
            <LazyChart data={chartData} />
          </Suspense>
        );
      default:
        return <div>404 - Route not found</div>;
    }
  };

  return (
    <div style={{ padding: '16px' }}>
      <h2>React.lazy Example</h2>
      
      <nav style={{ marginBottom: '16px' }}>
        <button 
          onClick={() => setCurrentRoute('dashboard')}
          disabled={currentRoute === 'dashboard'}
        >
          Dashboard
        </button>
        <button 
          onClick={() => setCurrentRoute('profile')}
          disabled={currentRoute === 'profile'}
          style={{ margin: '0 8px' }}
        >
          Profile
        </button>
        <button 
          onClick={() => setCurrentRoute('settings')}
          disabled={currentRoute === 'settings'}
        >
          Settings
        </button>
        <button 
          onClick={() => setCurrentRoute('chart')}
          disabled={currentRoute === 'chart'}
          style={{ marginLeft: '8px' }}
        >
          Heavy Chart
        </button>
      </nav>

      <LazyErrorBoundary>
        {renderRoute()}
      </LazyErrorBoundary>
    </div>
  );
};

// Mock components (normally these would be in separate files)
const Dashboard: React.FC = () => (
  <div style={{ padding: '16px', border: '1px solid green' }}>
    <h3>Dashboard Component</h3>
    <p>This component was loaded lazily!</p>
  </div>
);

const UserProfile: React.FC = () => (
  <div style={{ padding: '16px', border: '1px solid orange' }}>
    <h3>User Profile Component</h3>
    <p>Another lazy-loaded component!</p>
  </div>
);

const SettingsPage: React.FC = () => (
  <div style={{ padding: '16px', border: '1px solid purple' }}>
    <h3>Settings Component</h3>
    <p>Settings loaded with named export!</p>
  </div>
);
```

### Suspense

Suspense boundaries for handling loading states in lazy-loaded components.

```typescript { .api }
/**
 * Suspense component for handling loading states
 */
interface SuspenseProps {
  children?: ReactNode | undefined;
  fallback?: ReactNode | undefined;
}

const Suspense: ExoticComponent<SuspenseProps>;
```

**Usage Examples:**

```typescript
import React, { Suspense, lazy, useState, useEffect } from "react";

// Async data fetching component
const AsyncDataComponent: React.FC<{ delay: number }> = ({ delay }) => {
  const [data, setData] = useState<string | null>(null);

  // Simulate throwing a promise (React 18 Suspense for data fetching)
  if (data === null) {
    throw new Promise<void>(resolve => {
      setTimeout(() => {
        setData(`Data loaded after ${delay}ms`);
        resolve();
      }, delay);
    });
  }

  return (
    <div style={{ padding: '16px', border: '1px solid blue' }}>
      <h4>Async Data Component</h4>
      <p>{data}</p>
    </div>
  );
};

// Multiple Suspense boundaries
const SuspenseExample: React.FC = () => {
  const [showComponent, setShowComponent] = useState(false);
  const [showNestedComponents, setShowNestedComponents] = useState(false);

  return (
    <div style={{ padding: '16px' }}>
      <h2>Suspense Example</h2>
      
      <div style={{ marginBottom: '16px' }}>
        <button onClick={() => setShowComponent(!showComponent)}>
          {showComponent ? 'Hide' : 'Show'} Async Component
        </button>
        <button 
          onClick={() => setShowNestedComponents(!showNestedComponents)}
          style={{ marginLeft: '8px' }}
        >
          {showNestedComponents ? 'Hide' : 'Show'} Nested Components
        </button>
      </div>

      {/* Single Suspense boundary */}
      {showComponent && (
        <Suspense fallback={
          <div style={{ padding: '16px', backgroundColor: '#fffbf0', border: '1px dashed orange' }}>
            ⏳ Loading async component...
          </div>
        }>
          <AsyncDataComponent delay={1500} />
        </Suspense>
      )}

      {/* Nested Suspense boundaries */}
      {showNestedComponents && (
        <div style={{ marginTop: '16px' }}>
          <h3>Nested Suspense Boundaries</h3>
          
          <Suspense fallback={
            <div style={{ padding: '16px', backgroundColor: '#f0f8ff', border: '1px dashed blue' }}>
              ⏳ Loading outer boundary...
            </div>
          }>
            <div style={{ border: '2px solid #e0e0e0', padding: '16px', margin: '8px 0' }}>
              <h4>Outer Boundary Content</h4>
              
              <Suspense fallback={
                <div style={{ padding: '8px', backgroundColor: '#f0fff0', border: '1px dashed green' }}>
                  ⏳ Loading inner component 1...
                </div>
              }>
                <AsyncDataComponent delay={1000} />
              </Suspense>

              <Suspense fallback={
                <div style={{ padding: '8px', backgroundColor: '#fff0f5', border: '1px dashed pink' }}>
                  ⏳ Loading inner component 2...
                </div>
              }>
                <AsyncDataComponent delay={2000} />
              </Suspense>
            </div>
          </Suspense>
        </div>
      )}
    </div>
  );
};
```

### Profiler

Performance measurement component for React applications.

```typescript { .api }
/**
 * Profiler component props
 */
interface ProfilerProps {
  children?: ReactNode | undefined;
  id: string;
  onRender: ProfilerOnRenderCallback;
}

/**
 * Profiler callback function type
 */
type ProfilerOnRenderCallback = (
  id: string,
  phase: "mount" | "update" | "nested-update",
  actualDuration: number,
  baseDuration: number,
  startTime: number,
  commitTime: number
) => void;

/**
 * Profiler component for performance measurement
 */
const Profiler: ExoticComponent<ProfilerProps>;
```

**Usage Examples:**

```typescript
import React, { Profiler, useState, useMemo } from "react";

// Performance monitoring
const performanceData: Array<{
  id: string;
  phase: "mount" | "update" | "nested-update";
  actualDuration: number;
  baseDuration: number;
  startTime: number;
  commitTime: number;
  timestamp: Date;
}> = [];

const onRenderCallback: ProfilerOnRenderCallback = (
  id,
  phase,
  actualDuration,
  baseDuration,
  startTime,
  commitTime
) => {
  // Log performance data
  const data = {
    id,
    phase,
    actualDuration,
    baseDuration,
    startTime,
    commitTime,
    timestamp: new Date()
  };
  
  performanceData.push(data);
  
  // Log to console for development
  console.log(`[Profiler] ${id}:`, {
    phase,
    'actual duration (ms)': actualDuration.toFixed(2),
    'base duration (ms)': baseDuration.toFixed(2)
  });

  // Send to analytics in production
  if (process.env.NODE_ENV === 'production') {
    // analytics.track('component-render', data);
  }
};

// Heavy computational component
const ExpensiveCalculation: React.FC<{ 
  iterations: number; 
  complexity: number;
}> = ({ iterations, complexity }) => {
  const result = useMemo(() => {
    console.log('Computing expensive calculation...');
    let sum = 0;
    
    for (let i = 0; i < iterations; i++) {
      for (let j = 0; j < complexity; j++) {
        sum += Math.sqrt(i * j);
      }
    }
    
    return sum;
  }, [iterations, complexity]);

  return (
    <div style={{ padding: '16px', border: '1px solid #ccc' }}>
      <h4>Expensive Calculation Component</h4>
      <p>Iterations: {iterations}</p>
      <p>Complexity: {complexity}</p>
      <p>Result: {result.toFixed(2)}</p>
    </div>
  );
};

// List component with many items
const ItemList: React.FC<{ items: string[] }> = ({ items }) => {
  return (
    <ul style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #ccc' }}>
      {items.map((item, index) => (
        <li key={index} style={{ padding: '4px' }}>
          {item}
        </li>
      ))}
    </ul>
  );
};

// Main profiler example
const ProfilerExample: React.FC = () => {
  const [iterations, setIterations] = useState(1000);
  const [complexity, setComplexity] = useState(100);
  const [itemCount, setItemCount] = useState(10);
  
  const items = useMemo(() => 
    Array.from({ length: itemCount }, (_, i) => `Item ${i + 1} - ${Date.now()}`),
    [itemCount]
  );

  const [showPerformanceData, setShowPerformanceData] = useState(false);

  return (
    <div style={{ padding: '16px' }}>
      <h2>Profiler Example</h2>
      
      <div style={{ marginBottom: '16px' }}>
        <button onClick={() => setShowPerformanceData(!showPerformanceData)}>
          {showPerformanceData ? 'Hide' : 'Show'} Performance Data
        </button>
      </div>

      {showPerformanceData && (
        <div style={{ 
          marginBottom: '16px', 
          padding: '8px', 
          backgroundColor: '#f5f5f5',
          maxHeight: '200px',
          overflowY: 'auto'
        }}>
          <h4>Performance Data</h4>
          {performanceData.slice(-10).map((data, index) => (
            <div key={index} style={{ fontSize: '12px', marginBottom: '4px' }}>
              <strong>{data.id}</strong> ({data.phase}): 
              {data.actualDuration.toFixed(2)}ms at {data.timestamp.toLocaleTimeString()}
            </div>
          ))}
        </div>
      )}

      {/* Profiled expensive component */}
      <Profiler id="ExpensiveCalculation" onRender={onRenderCallback}>
        <div style={{ marginBottom: '16px' }}>
          <h3>Expensive Calculation (Profiled)</h3>
          <div style={{ marginBottom: '8px' }}>
            <label>
              Iterations: 
              <input 
                type="number" 
                value={iterations} 
                onChange={(e) => setIterations(Number(e.target.value))}
                style={{ marginLeft: '8px', width: '80px' }}
              />
            </label>
            <label style={{ marginLeft: '16px' }}>
              Complexity: 
              <input 
                type="number" 
                value={complexity} 
                onChange={(e) => setComplexity(Number(e.target.value))}
                style={{ marginLeft: '8px', width: '80px' }}
              />
            </label>
          </div>
          <ExpensiveCalculation iterations={iterations} complexity={complexity} />
        </div>
      </Profiler>

      {/* Profiled list component */}
      <Profiler id="ItemList" onRender={onRenderCallback}>
        <div>
          <h3>Dynamic List (Profiled)</h3>
          <div style={{ marginBottom: '8px' }}>
            <label>
              Item Count: 
              <input 
                type="number" 
                value={itemCount} 
                onChange={(e) => setItemCount(Number(e.target.value))}
                style={{ marginLeft: '8px', width: '80px' }}
              />
            </label>
          </div>
          <ItemList items={items} />
        </div>
      </Profiler>
    </div>
  );
};
```

### StrictMode

Development mode component for identifying potential problems.

```typescript { .api }
/**
 * StrictMode component for development checks
 */
const StrictMode: ExoticComponent<{ children?: ReactNode | undefined }>;
```

**Usage Examples:**

```typescript
import React, { StrictMode, useState, useEffect } from "react";

// Component that demonstrates StrictMode effects
const StrictModeDemo: React.FC = () => {
  const [count, setCount] = useState(0);
  const [mounted, setMounted] = useState(false);

  // This effect will run twice in StrictMode (development only)
  useEffect(() => {
    console.log('Effect running - count:', count);
    setMounted(true);
    
    // Cleanup function
    return () => {
      console.log('Effect cleanup - count:', count);
    };
  }, [count]);

  // This will log twice per render in StrictMode
  console.log('Component rendering - count:', count, 'mounted:', mounted);

  return (
    <div style={{ padding: '16px', border: '1px solid #ccc' }}>
      <h3>StrictMode Demo Component</h3>
      <p>Count: {count}</p>
      <p>Mounted: {mounted.toString()}</p>
      <button onClick={() => setCount(c => c + 1)}>
        Increment
      </button>
      <p style={{ fontSize: '12px', color: '#666' }}>
        Check console - effects and renders happen twice in StrictMode (dev only)
      </p>
    </div>
  );
};

// App with StrictMode wrapper
const StrictModeExample: React.FC = () => {
  const [enableStrictMode, setEnableStrictMode] = useState(true);

  const AppContent = () => (
    <div style={{ padding: '16px' }}>
      <h2>StrictMode Example</h2>
      
      <div style={{ marginBottom: '16px' }}>
        <label>
          <input
            type="checkbox"
            checked={enableStrictMode}
            onChange={(e) => setEnableStrictMode(e.target.checked)}
          />
          Enable StrictMode (check console for differences)
        </label>
      </div>

      <StrictModeDemo />
      
      <div style={{ marginTop: '16px', padding: '8px', backgroundColor: '#f0f8ff' }}>
        <h4>What StrictMode Does:</h4>
        <ul style={{ fontSize: '14px' }}>
          <li>Intentionally double-invokes functions (constructors, render methods, state updaters)</li>
          <li>Runs effects twice to detect missing cleanup</li>
          <li>Warns about deprecated lifecycle methods</li>
          <li>Warns about legacy string ref usage</li>
          <li>Warns about deprecated findDOMNode usage</li>
          <li>Only affects development builds - no impact in production</li>
        </ul>
      </div>
    </div>
  );

  // Conditionally wrap with StrictMode
  return enableStrictMode ? (
    <StrictMode>
      <AppContent />
    </StrictMode>
  ) : (
    <AppContent />
  );
};
```

### Fragment

Component for grouping elements without adding extra DOM nodes.

```typescript { .api }
/**
 * Fragment component for grouping children without wrapper DOM node
 */
const Fragment: ExoticComponent<{ children?: ReactNode | undefined }>;
```

**Usage Examples:**

```typescript
import React, { Fragment, useState } from "react";

// Table component demonstrating Fragment usage
const TableRowsFragment: React.FC<{ users: Array<{ id: number; name: string; email: string }> }> = ({ users }) => {
  return (
    <Fragment>
      {users.map(user => (
        <Fragment key={user.id}>
          <tr>
            <td>{user.name}</td>
            <td>{user.email}</td>
          </tr>
          <tr>
            <td colSpan={2} style={{ fontSize: '12px', color: '#666' }}>
              User ID: {user.id}
            </td>
          </tr>
        </Fragment>
      ))}
    </Fragment>
  );
};

// List component with conditional rendering
const ConditionalFragment: React.FC<{ 
  showHeader: boolean; 
  showFooter: boolean; 
  items: string[] 
}> = ({ showHeader, showFooter, items }) => {
  return (
    <Fragment>
      {showHeader && (
        <Fragment>
          <h3>Item List</h3>
          <p>Total items: {items.length}</p>
        </Fragment>
      )}
      
      <ul>
        {items.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
      
      {showFooter && (
        <Fragment>
          <hr />
          <p style={{ fontSize: '12px' }}>End of list</p>
        </Fragment>
      )}
    </Fragment>
  );
};

// Fragment example with short syntax
const FragmentExample: React.FC = () => {
  const [users] = useState([
    { id: 1, name: 'Alice', email: 'alice@example.com' },
    { id: 2, name: 'Bob', email: 'bob@example.com' }
  ]);
  
  const [items] = useState(['Apple', 'Banana', 'Cherry']);
  const [showHeader, setShowHeader] = useState(true);
  const [showFooter, setShowFooter] = useState(true);

  return (
    <div style={{ padding: '16px' }}>
      <h2>Fragment Examples</h2>
      
      {/* Long syntax */}
      <div style={{ marginBottom: '24px' }}>
        <h3>Table with Fragment (long syntax)</h3>
        <table style={{ border: '1px solid #ccc', borderCollapse: 'collapse', width: '100%' }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid #ccc', padding: '8px' }}>Name</th>
              <th style={{ border: '1px solid #ccc', padding: '8px' }}>Email</th>
            </tr>
          </thead>
          <tbody>
            <TableRowsFragment users={users} />
          </tbody>
        </table>
      </div>

      {/* Short syntax */}
      <div style={{ marginBottom: '24px' }}>
        <h3>Multiple Elements (short syntax)</h3>
        <>
          <p>This paragraph is inside a Fragment using short syntax.</p>
          <p>So is this one.</p>
          <div>And this div too.</div>
        </>
      </div>

      {/* Conditional rendering */}
      <div>
        <h3>Conditional Fragment</h3>
        <div style={{ marginBottom: '8px' }}>
          <label>
            <input
              type="checkbox"
              checked={showHeader}
              onChange={(e) => setShowHeader(e.target.checked)}
            />
            Show Header
          </label>
          <label style={{ marginLeft: '16px' }}>
            <input
              type="checkbox"
              checked={showFooter}
              onChange={(e) => setShowFooter(e.target.checked)}
            />
            Show Footer
          </label>
        </div>
        
        <ConditionalFragment 
          showHeader={showHeader}
          showFooter={showFooter}
          items={items}
        />
      </div>
    </div>
  );
};
```

## Types

### Advanced Component Type Definitions

```typescript { .api }
// Exotic component base types
interface ExoticComponent<P = {}> {
  (props: P): ReactElement | null;
  readonly $$typeof: symbol;
}

interface NamedExoticComponent<P = {}> extends ExoticComponent<P> {
  displayName?: string | undefined;
}

// Memo types
interface MemoExoticComponent<T extends ComponentType<any>> extends NamedExoticComponent<ComponentProps<T>> {
  readonly type: T;
}

// Lazy types  
interface LazyExoticComponent<T extends ComponentType<any>> extends ExoticComponent<ComponentProps<T>> {
  readonly _result: T;
}

// ForwardRef types
interface ForwardRefExoticComponent<P> extends NamedExoticComponent<P> {
  defaultProps?: never | undefined;
  propTypes?: never | undefined;
}

// Suspense types
interface SuspenseProps {
  children?: ReactNode | undefined;
  fallback?: ReactNode | undefined;
}

// Profiler types
interface ProfilerProps {
  children?: ReactNode | undefined;
  id: string;
  onRender: ProfilerOnRenderCallback;
}

type ProfilerOnRenderCallback = (
  id: string,
  phase: "mount" | "update" | "nested-update",
  actualDuration: number,
  baseDuration: number,
  startTime: number,
  commitTime: number
) => void;

// Built-in exotic components
const Fragment: ExoticComponent<{ children?: ReactNode | undefined }>;
const StrictMode: ExoticComponent<{ children?: ReactNode | undefined }>;
const Suspense: ExoticComponent<SuspenseProps>;
const Profiler: ExoticComponent<ProfilerProps>;
```