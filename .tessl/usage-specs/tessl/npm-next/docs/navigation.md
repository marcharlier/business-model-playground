# Navigation and Routing

Comprehensive navigation system supporting both App Router and Pages Router patterns with hooks and utilities for programmatic navigation.

## Capabilities

### App Router Navigation Hooks

Modern navigation hooks for the App Router system with enhanced type safety and performance.

```typescript { .api }
/**
 * App Router hook for programmatic navigation
 * @returns Router instance with navigation methods
 */
function useRouter(): AppRouterInstance;

interface AppRouterInstance {
  /** Navigate to a new route */
  push(href: string, options?: NavigateOptions): void;
  /** Replace current route without adding to history */
  replace(href: string, options?: NavigateOptions): void;
  /** Navigate back in history */
  back(): void;
  /** Navigate forward in history */
  forward(): void;
  /** Refresh the current route */
  refresh(): void;
  /** Prefetch a route for faster navigation */
  prefetch(href: string, options?: PrefetchOptions): void;
}

interface NavigateOptions {
  scroll?: boolean;
}

interface PrefetchOptions {
  kind?: 'auto' | 'full' | 'temporary';
}

/**
 * Get the current pathname
 * @returns Current pathname string
 */
function usePathname(): string;

/**
 * Read URL search parameters
 * @returns ReadonlyURLSearchParams instance
 */
function useSearchParams(): ReadonlyURLSearchParams;

/**
 * Read route parameters
 * @returns Route parameters object
 */
function useParams<T = { [key: string]: string | string[] }>(): T;
```

**Usage Examples:**

```typescript
'use client';
import { useRouter, usePathname, useSearchParams, useParams } from "next/navigation";

function NavigationExample() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const params = useParams();

  // Programmatic navigation
  const handleNavigate = () => {
    router.push('/dashboard');
    // or with options
    router.push('/profile', { scroll: false });
  };

  // Get search parameter
  const query = searchParams.get('q');
  
  // Get dynamic route parameter
  const productId = params.id;

  return (
    <div>
      <p>Current path: {pathname}</p>
      <p>Search query: {query}</p>
      <button onClick={handleNavigate}>Navigate</button>
    </div>
  );
}
```

### Server Navigation Functions

Server-side navigation functions for redirects and error handling.

```typescript { .api }
/**
 * Redirect to a new URL (temporary redirect)
 * @param url - Target URL
 * @throws RedirectError - Terminates execution and redirects
 */
function redirect(url: string): never;

/**
 * Redirect to a new URL (permanent redirect)
 * @param url - Target URL
 * @throws RedirectError - Terminates execution and redirects
 */
function permanentRedirect(url: string): never;

/**
 * Trigger 404 Not Found page
 * @throws NotFoundError - Terminates execution and shows 404
 */
function notFound(): never;
```

**Usage Examples:**

```typescript
import { redirect, permanentRedirect, notFound } from "next/navigation";

// Server component or server action
export default async function ProfilePage({ params }) {
  const user = await getUser(params.id);
  
  if (!user) {
    notFound(); // Shows 404 page
  }
  
  if (user.isPrivate) {
    redirect('/login'); // Temporary redirect
  }
  
  if (user.hasMovedPermanently) {
    permanentRedirect(`/users/${user.newId}`); // Permanent redirect
  }
  
  return <div>User: {user.name}</div>;
}

// In server actions
async function handleFormSubmit(formData: FormData) {
  'use server';
  
  const result = await processForm(formData);
  
  if (result.success) {
    redirect('/success');
  }
}
```

### Pages Router Hook

Legacy router hook for Pages Router applications (still supported).

```typescript { .api }
/**
 * Pages Router hook for navigation (legacy)
 * @returns NextRouter instance
 */
function useRouter(): NextRouter;

interface NextRouter {
  /** Current pathname */
  pathname: string;
  /** Current query parameters */
  query: ParsedUrlQuery;
  /** Current route as shown in browser */
  asPath: string;
  /** Base path prefix */
  basePath: string;
  /** Current locale */
  locale?: string;
  /** Available locales */
  locales?: string[];
  /** Default locale */
  defaultLocale?: string;
  /** Navigate to route */
  push(url: Url, as?: Url, options?: TransitionOptions): Promise<boolean>;
  /** Replace current route */
  replace(url: Url, as?: Url, options?: TransitionOptions): Promise<boolean>;
  /** Reload current route */
  reload(): void;
  /** Navigate back */
  back(): void;
  /** Prefetch route */
  prefetch(url: string, asPath?: string, options?: PrefetchOptions): Promise<void>;
  /** Check if route change is in progress */
  isReady: boolean;
  /** Router events */
  events: RouterEvents;
}

interface TransitionOptions {
  shallow?: boolean;
  locale?: string | false;
  scroll?: boolean;
}

type Url = string | UrlObject;

interface ParsedUrlQuery {
  [key: string]: string | string[] | undefined;
}
```

**Usage Examples:**

```typescript
import { useRouter } from "next/router";

function PagesRouterExample() {
  const router = useRouter();
  
  // Access current route info
  const { pathname, query, asPath } = router;
  
  // Navigate programmatically
  const handleNavigate = async () => {
    await router.push('/dashboard');
    // or with options
    await router.push('/profile', undefined, { shallow: true });
  };
  
  // Handle dynamic routes
  const productId = router.query.id;
  
  // Listen to route changes
  useEffect(() => {
    const handleRouteChange = (url) => {
      console.log('Route changed to:', url);
    };
    
    router.events.on('routeChangeStart', handleRouteChange);
    return () => {
      router.events.off('routeChangeStart', handleRouteChange);
    };
  }, [router]);
  
  return (
    <div>
      <p>Current path: {pathname}</p>
      <p>Product ID: {productId}</p>
      <button onClick={handleNavigate}>Navigate</button>
    </div>
  );
}
```

### Router Events (Pages Router)

Event system for monitoring route changes in Pages Router.

```typescript { .api }
interface RouterEvents {
  /** Listen to route change events */
  on(type: RouteEventType, handler: (...args: any[]) => void): void;
  /** Remove event listener */
  off(type: RouteEventType, handler: (...args: any[]) => void): void;
}

type RouteEventType = 
  | 'routeChangeStart'
  | 'routeChangeComplete'
  | 'routeChangeError'
  | 'beforeHistoryChange'
  | 'hashChangeStart'
  | 'hashChangeComplete';
```

**Usage Examples:**

```typescript
import { useRouter } from "next/router";
import { useEffect } from "react";

function RouteListener() {
  const router = useRouter();
  
  useEffect(() => {
    const handleStart = (url) => {
      console.log('Route change started:', url);
    };
    
    const handleComplete = (url) => {
      console.log('Route change completed:', url);
    };
    
    const handleError = (err, url) => {
      console.error('Route change error:', err, url);
    };
    
    router.events.on('routeChangeStart', handleStart);
    router.events.on('routeChangeComplete', handleComplete);
    router.events.on('routeChangeError', handleError);
    
    return () => {
      router.events.off('routeChangeStart', handleStart);
      router.events.off('routeChangeComplete', handleComplete);
      router.events.off('routeChangeError', handleError);
    };
  }, [router]);
  
  return null;
}
```

### ReadonlyURLSearchParams

Read-only interface for accessing URL search parameters in App Router.

```typescript { .api }
/**
 * Read-only URL search parameters interface
 */
class ReadonlyURLSearchParams {
  /** Get parameter value by name */
  get(name: string): string | null;
  /** Get all values for parameter name */
  getAll(name: string): string[];
  /** Check if parameter exists */
  has(name: string): boolean;
  /** Get all parameter names */
  keys(): IterableIterator<string>;
  /** Get all parameter values */
  values(): IterableIterator<string>;
  /** Get all parameter entries */
  entries(): IterableIterator<[string, string]>;
  /** Iterate over parameters */
  forEach(callback: (value: string, key: string, parent: ReadonlyURLSearchParams) => void): void;
  /** Get parameters size */
  size: number;
  /** Convert to string */
  toString(): string;
}
```

**Usage Examples:**

```typescript
'use client';
import { useSearchParams } from "next/navigation";

function SearchParamsExample() {
  const searchParams = useSearchParams();
  
  // Get single parameter
  const query = searchParams.get('q');
  const page = searchParams.get('page');
  
  // Get all values for parameter
  const categories = searchParams.getAll('category');
  
  // Check if parameter exists
  const hasFilter = searchParams.has('filter');
  
  // Iterate over all parameters
  const allParams = {};
  searchParams.forEach((value, key) => {
    allParams[key] = value;
  });
  
  return (
    <div>
      <p>Search query: {query}</p>
      <p>Current page: {page}</p>
      <p>Categories: {categories.join(', ')}</p>
      <p>Has filter: {hasFilter ? 'Yes' : 'No'}</p>
    </div>
  );
}
```