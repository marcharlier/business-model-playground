# Testing and Development

Development tools and testing utilities for building robust Next.js applications with comprehensive testing support.

## Capabilities

### Jest Integration

Next.js provides built-in Jest configuration and utilities for testing React components and application logic.

```typescript { .api }
/**
 * Create Jest configuration for Next.js
 * @param config - Custom Jest configuration
 * @returns Complete Jest configuration
 */
function createJestConfig(config: JestConfig): JestConfig;

interface JestConfig {
  /** Test directory */
  testDir?: string;
  /** Setup files */
  setupFilesAfterEnv?: string[];
  /** Module name mapping */
  moduleNameMapping?: { [key: string]: string };
  /** Test environment */
  testEnvironment?: 'jsdom' | 'node';
  /** Transform configuration */
  transform?: { [key: string]: any };
  /** Module paths */
  modulePaths?: string[];
  /** Test path ignore patterns */
  testPathIgnorePatterns?: string[];
  /** Coverage configuration */
  collectCoverageFrom?: string[];
}
```

**Usage Examples:**

```typescript
// jest.config.js
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: './',
});

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapping: {
    // Handle module aliases (this will be automatically configured for you based on your tsconfig.json paths)
    '^@/components/(.*)$': '<rootDir>/components/$1',
    '^@/pages/(.*)$': '<rootDir>/pages/$1',
  },
  testEnvironment: 'jest-environment-jsdom',
  collectCoverageFrom: [
    'components/**/*.{js,jsx,ts,tsx}',
    'pages/**/*.{js,jsx,ts,tsx}',
    'lib/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig);

// jest.setup.js
import '@testing-library/jest-dom';

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '/',
      query: {},
      asPath: '/',
      push: jest.fn(),
      pop: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn().mockResolvedValue(undefined),
      beforePopState: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
    };
  },
}));
```

### Web Vitals Monitoring

Built-in Web Vitals measurement and reporting for performance monitoring.

```typescript { .api }
/**
 * Web Vitals metric interface
 */
interface NextWebVitalsMetric {
  /** Unique metric ID */
  id: string;
  /** Metric name */
  name: string;
  /** Metric value */
  value: number;
  /** Metric label */
  label: 'web-vital' | 'custom';
  /** Start time */
  startTime: number;
  /** Attribution data */
  attribution?: { [key: string]: unknown };
}

/**
 * Report Web Vitals callback
 */
type ReportWebVitalsCallback = (metric: NextWebVitalsMetric) => void;

// Built-in web vitals
type WebVitalName = 'CLS' | 'FCP' | 'FID' | 'INP' | 'LCP' | 'TTFB';

// Custom metrics
type CustomMetricName = 
  | 'Next.js-hydration'
  | 'Next.js-route-change-to-render'
  | 'Next.js-render';
```

**Usage Examples:**

```typescript
// _app.tsx - Web Vitals reporting
import type { AppProps } from 'next/app';
import type { NextWebVitalsMetric } from 'next/app';

function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}

// Export reportWebVitals function
export function reportWebVitals(metric: NextWebVitalsMetric) {
  console.log(metric);
  
  // Send to analytics
  switch (metric.label) {
    case 'web-vital':
      console.log(`Web Vital: ${metric.name}`, metric.value);
      // Send web vitals to analytics service
      sendToAnalytics({
        name: metric.name,
        value: metric.value,
        id: metric.id,
      });
      break;
    case 'custom':
      console.log(`Custom Metric: ${metric.name}`, metric.value);
      // Send custom metrics to monitoring service
      sendToMonitoring({
        metric: metric.name,
        value: metric.value,
        timestamp: metric.startTime,
      });
      break;
  }
}

export default MyApp;

// Custom Web Vitals reporting
function reportWebVitals(metric: NextWebVitalsMetric) {
  // Google Analytics 4
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', metric.name, {
      custom_map: { metric_id: 'custom_metric' },
      custom_metric: metric.value,
      event_category: 'Web Vitals',
      event_label: metric.id,
      value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      non_interaction: true,
    });
  }
  
  // Vercel Analytics
  if (typeof window !== 'undefined' && window.va) {
    window.va('track', metric.name, {
      value: metric.value,
      id: metric.id,
    });
  }
}
```

### Testing Utilities

Utilities and helpers for testing Next.js applications.

```typescript { .api }
/**
 * Testing utilities for Next.js components
 */
interface TestingUtilities {
  /** Mock Next.js router */
  mockRouter: (router?: Partial<NextRouter>) => void;
  /** Mock Next.js Image component */
  mockImage: () => void;
  /** Mock API routes */
  mockApiRoute: (handler: any) => any;
  /** Create test server */
  createTestServer: (options?: any) => any;
}

/**
 * API route testing handler
 */
function testApiHandler(options: {
  handler: any;
  test: (params: { fetch: typeof fetch }) => Promise<void>;
  url?: string;
  method?: string;
  headers?: Record<string, string>;
  body?: any;
}): Promise<void>;
```

**Usage Examples:**

```typescript
// __tests__/api/users.test.ts - API route testing
import { testApiHandler } from 'next-test-api-route-handler';
import handler from '../../pages/api/users';

describe('/api/users', () => {
  it('returns user list', async () => {
    await testApiHandler({
      handler,
      test: async ({ fetch }) => {
        const res = await fetch({ method: 'GET' });
        const data = await res.json();
        
        expect(res.status).toBe(200);
        expect(data).toHaveProperty('users');
        expect(Array.isArray(data.users)).toBe(true);
      },
    });
  });
  
  it('creates new user', async () => {
    await testApiHandler({
      handler,
      test: async ({ fetch }) => {
        const res = await fetch({
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            name: 'John Doe',
            email: 'john@example.com',
          }),
        });
        const data = await res.json();
        
        expect(res.status).toBe(201);
        expect(data).toHaveProperty('id');
        expect(data.name).toBe('John Doe');
      },
    });
  });
});

// __tests__/components/Header.test.tsx - Component testing
import { render, screen } from '@testing-library/react';
import { useRouter } from 'next/router';
import Header from '../components/Header';

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

const mockRouter = useRouter as jest.MockedFunction<typeof useRouter>;

describe('Header Component', () => {
  beforeEach(() => {
    mockRouter.mockImplementation(() => ({
      route: '/',
      pathname: '/',
      query: {},
      asPath: '/',
      push: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
      },
    }));
  });
  
  it('renders navigation links', () => {
    render(<Header />);
    
    expect(screen.getByRole('link', { name: /home/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /about/i })).toBeInTheDocument();
  });
  
  it('highlights active route', () => {
    mockRouter.mockImplementation(() => ({
      route: '/about',
      pathname: '/about',
      query: {},
      asPath: '/about',
      push: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
      },
    }));
    
    render(<Header />);
    
    const aboutLink = screen.getByRole('link', { name: /about/i });
    expect(aboutLink).toHaveClass('active');
  });
});

// __tests__/pages/index.test.tsx - Page testing
import { render, screen } from '@testing-library/react';
import Home from '../pages/index';

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => <img {...props} />,
}));

describe('Home Page', () => {
  it('renders welcome message', () => {
    render(<Home />);
    
    expect(screen.getByRole('heading', { name: /welcome/i })).toBeInTheDocument();
  });
  
  it('renders hero image', () => {
    render(<Home />);
    
    const heroImage = screen.getByRole('img', { name: /hero/i });
    expect(heroImage).toBeInTheDocument();
  });
});
```

### Development Tools

Development utilities and debugging tools for Next.js applications.

```typescript { .api }
/**
 * Development indicators configuration
 */
interface DevIndicators {
  /** Show build activity indicator */
  buildActivity?: boolean;
  /** Position of build activity indicator */
  buildActivityPosition?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}

/**
 * Error overlay configuration
 */
interface ErrorOverlay {
  /** Enable error overlay in development */
  enabled?: boolean;
  /** Custom error reporting */
  onError?: (error: Error) => void;
}

/**
 * Development configuration
 */
interface DevConfig {
  /** Development indicators */
  devIndicators?: DevIndicators;
  /** Error overlay */
  onDemandEntries?: {
    maxInactiveAge?: number;
    pagesBufferLength?: number;
  };
}
```

**Usage Examples:**

```typescript
// next.config.js - Development configuration
const nextConfig = {
  // Development indicators
  devIndicators: {
    buildActivity: true,
    buildActivityPosition: 'bottom-right',
  },
  
  // Webpack configuration for development
  webpack: (config, { dev, isServer }) => {
    if (dev) {
      // Add development-specific webpack plugins
      config.plugins.push(
        new webpack.DefinePlugin({
          __DEV__: JSON.stringify(true),
        })
      );
    }
    
    return config;
  },
  
  // Development-specific settings
  ...(process.env.NODE_ENV === 'development' && {
    // Enable source maps in development
    productionBrowserSourceMaps: false,
    
    // Disable webpack cache in development if needed
    experimental: {
      webpackBuildWorker: false,
    },
  }),
};

// Development error boundary
import { ErrorBoundary } from 'react-error-boundary';

function ErrorFallback({ error, resetErrorBoundary }: any) {
  return (
    <div role="alert" className="error-fallback">
      <h2>Something went wrong:</h2>
      <pre>{error.message}</pre>
      <button onClick={resetErrorBoundary}>Try again</button>
    </div>
  );
}

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error, errorInfo) => {
        console.error('Error caught by boundary:', error, errorInfo);
        // Send error to monitoring service in development
        if (process.env.NODE_ENV === 'development') {
          console.log('Error details:', errorInfo);
        }
      }}
    >
      <Component {...pageProps} />
    </ErrorBoundary>
  );
}

// Development debugging utilities
export function useDevTools() {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // Add debug utilities to window object
      (window as any).__NEXT_DEBUG__ = {
        router: useRouter(),
        version: process.env.__NEXT_VERSION__,
        buildId: process.env.__NEXT_BUILD_ID__,
      };
    }
  }, []);
}
```

### Testing Server Components

Testing utilities for App Router server components and server actions.

```typescript { .api }
/**
 * Server component testing utilities
 */
interface ServerTestingUtils {
  /** Render server component for testing */
  renderServerComponent: <T>(
    Component: React.ComponentType<T>,
    props?: T
  ) => Promise<string>;
  
  /** Test server action */
  testServerAction: (
    action: (...args: any[]) => any,
    ...args: any[]
  ) => Promise<any>;
}
```

**Usage Examples:**

```typescript
// __tests__/app/page.test.tsx - Server component testing
import { expect, test } from '@jest/globals';
import { render } from '@testing-library/react';
import Page from '../app/page';

// Mock fetch for server components
global.fetch = jest.fn();

test('server component renders correctly', async () => {
  // Mock server-side data
  (fetch as jest.Mock).mockResolvedValueOnce({
    ok: true,
    json: async () => ({ message: 'Hello from server' }),
  });
  
  // Server components are async, so we need to handle the promise
  const Component = await Page();
  const { container } = render(Component);
  
  expect(container.textContent).toContain('Hello from server');
});

// __tests__/server-actions.test.ts - Server action testing
import { testServerAction } from '../lib/test-utils';
import { createUser } from '../app/actions';

test('createUser server action', async () => {
  const formData = new FormData();
  formData.append('name', 'John Doe');
  formData.append('email', 'john@example.com');
  
  const result = await testServerAction(createUser, formData);
  
  expect(result).toHaveProperty('id');
  expect(result.name).toBe('John Doe');
  expect(result.email).toBe('john@example.com');
});

// Custom testing utilities
// lib/test-utils.ts
export async function testServerAction(action: any, ...args: any[]) {
  // Create a mock request context for server actions
  const mockHeaders = new Headers();
  const mockCookies = new Map();
  
  // Mock Next.js server context
  jest.mock('next/headers', () => ({
    headers: () => mockHeaders,
    cookies: () => ({
      get: (name: string) => mockCookies.get(name),
      set: (name: string, value: string) => mockCookies.set(name, value),
    }),
  }));
  
  return await action(...args);
}
```