# Dynamic Loading

Code splitting and dynamic component loading with SSR support and loading states for optimized performance.

## Capabilities

### Dynamic Component Loading

Dynamically import and render React components with code splitting and loading states.

```typescript { .api }
/**
 * Dynamically import a React component with code splitting
 * @param dynamicOptions - Import function or options object
 * @param options - Additional configuration options
 * @returns Dynamically loaded component
 */
function dynamic<P = {}>(
  dynamicOptions: DynamicOptions<P> | Loader<P>,
  options?: DynamicOptions<P>
): React.ComponentType<P>;

interface DynamicOptions<P = {}> {
  /** Component loader function */
  loader?: Loader<P>;
  /** Loading component to show while importing */
  loading?: React.ComponentType<LoadingComponentProps>;
  /** Enable/disable server-side rendering */
  ssr?: boolean;
  /** Use React Suspense for loading states */
  suspense?: boolean;
}

type Loader<P = {}> = () => LoaderComponent<P>;

type LoaderComponent<P = {}> = Promise<
  | React.ComponentType<P>
  | { default: React.ComponentType<P> }
>;

interface LoadingComponentProps {
  /** Whether the component is currently loading */
  isLoading: boolean;
  /** Loading error if any */
  error?: Error | null;
  /** Retry function if loading failed */
  retry?: () => void;
  /** Whether the component failed to load due to timeout */
  timedOut?: boolean;
  /** Whether loading was the result of a "paste" */
  pastDelay?: boolean;
}
```

**Usage Examples:**

```typescript
import dynamic from "next/dynamic";

// Basic dynamic import
const DynamicComponent = dynamic(() => import('../components/HeavyComponent'));

export default function Page() {
  return (
    <div>
      <h1>Page with Dynamic Component</h1>
      <DynamicComponent />
    </div>
  );
}

// With loading component
const DynamicChart = dynamic(
  () => import('../components/Chart'),
  {
    loading: () => <div>Loading chart...</div>,
    ssr: false // Disable SSR for client-only components
  }
);

// With custom loading component
const LoadingSpinner = ({ isLoading, error }: LoadingComponentProps) => {
  if (error) {
    return <div>Error loading component: {error.message}</div>;
  }
  
  if (isLoading) {
    return <div className="spinner">Loading...</div>;
  }
  
  return null;
};

const DynamicModal = dynamic(
  () => import('../components/Modal'),
  {
    loading: LoadingSpinner,
    ssr: false
  }
);

// Named export import
const DynamicButton = dynamic(
  () => import('../components/ui').then(mod => ({ default: mod.Button }))
);

// With Suspense
const DynamicEditor = dynamic(
  () => import('../components/Editor'),
  {
    suspense: true
  }
);

export default function EditorPage() {
  return (
    <Suspense fallback={<div>Loading editor...</div>}>
      <DynamicEditor />
    </Suspense>
  );
}
```

### Conditional Dynamic Loading

Load components conditionally based on runtime conditions.

```typescript { .api }
/**
 * Conditionally load components based on runtime conditions
 */
function conditionalDynamic<P = {}>(
  condition: boolean,
  loader: Loader<P>,
  fallback?: React.ComponentType<P>
): React.ComponentType<P>;
```

**Usage Examples:**

```typescript
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";

// Load different components based on user role
function Dashboard({ userRole }: { userRole: 'admin' | 'user' }) {
  const AdminPanel = dynamic(() => import('../components/AdminPanel'));
  const UserPanel = dynamic(() => import('../components/UserPanel'));
  
  return (
    <div>
      <h1>Dashboard</h1>
      {userRole === 'admin' ? <AdminPanel /> : <UserPanel />}
    </div>
  );
}

// Load components based on feature flags
function FeatureGatedComponent({ features }: { features: string[] }) {
  const [DynamicFeature, setDynamicFeature] = useState<React.ComponentType | null>(null);
  
  useEffect(() => {
    if (features.includes('new-feature')) {
      import('../components/NewFeature').then((mod) => {
        setDynamicFeature(() => mod.default);
      });
    }
  }, [features]);
  
  return DynamicFeature ? <DynamicFeature /> : <div>Feature not available</div>;
}

// Load different implementations based on environment
const MapComponent = dynamic(
  () => {
    if (typeof window !== 'undefined' && window.google) {
      return import('../components/GoogleMap');
    }
    return import('../components/StaticMap');
  },
  {
    ssr: false,
    loading: () => <div>Loading map...</div>
  }
);
```

### Multiple Dynamic Imports

Load multiple components dynamically with proper error handling.

```typescript { .api }
/**
 * Load multiple components dynamically
 */
function loadMultipleComponents<T extends Record<string, any>>(
  loaders: { [K in keyof T]: Loader<T[K]> }
): Promise<{ [K in keyof T]: React.ComponentType<T[K]> }>;
```

**Usage Examples:**

```typescript
import dynamic from "next/dynamic";

// Load multiple related components
const DynamicComponents = {
  Header: dynamic(() => import('../components/Header')),
  Sidebar: dynamic(() => import('../components/Sidebar')),
  Footer: dynamic(() => import('../components/Footer'))
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <DynamicComponents.Header />
      <div className="main-content">
        <DynamicComponents.Sidebar />
        <main>{children}</main>
      </div>
      <DynamicComponents.Footer />
    </div>
  );
}

// Load components with shared loading state
function DashboardLayout() {
  const [loading, setLoading] = useState(true);
  const [components, setComponents] = useState<any>({});
  
  useEffect(() => {
    Promise.all([
      import('../components/Chart'),
      import('../components/DataTable'),
      import('../components/Controls')
    ]).then(([Chart, DataTable, Controls]) => {
      setComponents({
        Chart: Chart.default,
        DataTable: DataTable.default,
        Controls: Controls.default
      });
      setLoading(false);
    });
  }, []);
  
  if (loading) {
    return <div>Loading dashboard components...</div>;
  }
  
  const { Chart, DataTable, Controls } = components;
  
  return (
    <div>
      <Controls />
      <Chart />
      <DataTable />
    </div>
  );
}
```

### Dynamic Imports with Props

Pass props to dynamically loaded components with type safety.

```typescript { .api }
/**
 * Dynamic component with typed props
 */
function dynamicWithProps<P extends object>(
  loader: Loader<P>,
  options?: DynamicOptions<P>
): React.ComponentType<P>;
```

**Usage Examples:**

```typescript
import dynamic from "next/dynamic";

interface ChartProps {
  data: Array<{ x: number; y: number }>;
  title: string;
  color: string;
}

// Type-safe dynamic component
const DynamicChart = dynamic<ChartProps>(
  () => import('../components/Chart'),
  {
    loading: () => <div>Loading chart...</div>,
    ssr: false
  }
);

export default function Analytics() {
  const chartData = [
    { x: 1, y: 10 },
    { x: 2, y: 25 },
    { x: 3, y: 15 }
  ];
  
  return (
    <div>
      <h1>Analytics Dashboard</h1>
      <DynamicChart
        data={chartData}
        title="Sales Data"
        color="#3b82f6"
      />
    </div>
  );
}

// Dynamic component with optional props
interface ModalProps {
  isOpen: boolean;
  title?: string;
  onClose: () => void;
  children: React.ReactNode;
}

const DynamicModal = dynamic<ModalProps>(
  () => import('../components/Modal'),
  {
    ssr: false
  }
);

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  return (
    <div>
      <button onClick={() => setIsModalOpen(true)}>
        Open Modal
      </button>
      
      <DynamicModal
        isOpen={isModalOpen}
        title="Dynamic Modal"
        onClose={() => setIsModalOpen(false)}
      >
        <p>This modal was loaded dynamically!</p>
      </DynamicModal>
    </div>
  );
}
```

### Error Handling

Handle dynamic import errors gracefully with fallback components.

```typescript { .api }
/**
 * Dynamic import with error boundary
 */
function dynamicWithErrorBoundary<P = {}>(
  loader: Loader<P>,
  ErrorFallback: React.ComponentType<{ error: Error; retry: () => void }>
): React.ComponentType<P>;
```

**Usage Examples:**

```typescript
import dynamic from "next/dynamic";

// Error boundary for dynamic imports
const ErrorFallback = ({ error, retry }: { error: Error; retry: () => void }) => (
  <div className="error-boundary">
    <h2>Failed to load component</h2>
    <p>{error.message}</p>
    <button onClick={retry}>Retry</button>
  </div>
);

// Dynamic component with error handling
const DynamicWidget = dynamic(
  () => import('../components/Widget'),
  {
    loading: () => <div>Loading widget...</div>,
    ssr: false
  }
);

// Wrapper with error boundary
function SafeDynamicWidget(props: any) {
  return (
    <ErrorBoundary fallback={ErrorFallback}>
      <DynamicWidget {...props} />
    </ErrorBoundary>
  );
}

// Custom error handling
const DynamicFeature = dynamic(
  () => import('../components/Feature').catch(() => {
    // Fallback to default component if import fails
    return import('../components/DefaultFeature');
  }),
  {
    loading: () => <div>Loading...</div>
  }
);
```