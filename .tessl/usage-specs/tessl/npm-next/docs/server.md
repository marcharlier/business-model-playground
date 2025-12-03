# Server-Side APIs

Server-side functionality including middleware, API routes, request/response handling, and edge runtime support.

## Capabilities

### Enhanced Request Object

Extended Request object with Next.js-specific properties and methods.

```typescript { .api }
/**
 * Enhanced request object for Next.js server-side code
 */
class NextRequest extends Request {
  /** Geographic information about the request */
  geo?: {
    /** Country code (e.g., 'US') */
    country?: string;
    /** Region code (e.g., 'CA') */
    region?: string;
    /** City name */
    city?: string;
    /** Latitude coordinate */
    latitude?: string;
    /** Longitude coordinate */
    longitude?: string;
  };
  
  /** Client IP address */
  ip?: string;
  
  /** Enhanced URL object with Next.js utilities */
  nextUrl: NextURL;
  
  /** User agent information */
  ua?: UserAgent;
  
  /** Request cookies */
  cookies: RequestCookies;
}

/**
 * Enhanced URL object with pathname utilities
 */
class NextURL extends URL {
  /** Base path from Next.js config */
  basePath: string;
  /** Build ID for cache busting */
  buildId?: string;
  /** Default locale */
  defaultLocale?: string;
  /** Domain locale configuration */
  domainLocale?: DomainLocale;
  /** Current locale */
  locale?: string;
  /** Clone URL with modifications */
  clone(): NextURL;
}

interface UserAgent {
  isBot: boolean;
  browser: { name?: string; version?: string };
  device: { model?: string; type?: string; vendor?: string };
  engine: { name?: string; version?: string };
  os: { name?: string; version?: string };
  cpu: { architecture?: string };
}

interface DomainLocale {
  defaultLocale: string;
  domain: string;
  http?: boolean;
  locales?: string[];
}
```

**Usage Examples:**

```typescript
import { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Access geographic information
  const country = request.geo?.country;
  const city = request.geo?.city;
  
  // Get client IP
  const clientIP = request.ip;
  
  // Access enhanced URL
  const pathname = request.nextUrl.pathname;
  const searchParams = request.nextUrl.searchParams;
  
  // Check user agent
  const isBot = request.ua?.isBot;
  const browserName = request.ua?.browser.name;
  
  // Access cookies
  const sessionToken = request.cookies.get('session')?.value;
  
  console.log(`Request from ${country}/${city} - IP: ${clientIP}`);
  console.log(`Path: ${pathname}, Bot: ${isBot}`);
  
  return NextResponse.next();
}
```

### Enhanced Response Object

Extended Response object with Next.js-specific static methods and utilities.

```typescript { .api }
/**
 * Enhanced response object for Next.js server-side code
 */
class NextResponse extends Response {
  /** Response cookies */
  cookies: ResponseCookies;
  
  /**
   * Create JSON response
   * @param object - Object to serialize as JSON
   * @param init - Response initialization options
   */
  static json(object: any, init?: ResponseInit): NextResponse;
  
  /**
   * Create redirect response
   * @param url - Target URL
   * @param status - HTTP status code (default: 307)
   */
  static redirect(url: string | URL, status?: number): NextResponse;
  
  /**
   * Create rewrite response (internal redirect)
   * @param destination - Target URL for rewrite
   * @param init - Response initialization options
   */
  static rewrite(destination: string | URL, init?: ResponseInit): NextResponse;
  
  /**
   * Continue with next middleware/handler
   * @param init - Response initialization options
   */
  static next(init?: NextFetchRequestConfig): NextResponse;
}

interface NextFetchRequestConfig {
  request?: {
    headers?: HeadersInit;
  };
}

interface ResponseCookies {
  /** Set a cookie */
  set(name: string, value: string, options?: CookieOptions): this;
  /** Set multiple cookies */
  set(options: CookieOptions & { name: string; value: string }): this;
  /** Get cookie value */
  get(name: string): { name: string; value: string } | undefined;
  /** Get all cookies */
  getAll(): { name: string; value: string }[];
  /** Delete a cookie */
  delete(name: string): boolean;
  /** Check if cookie exists */
  has(name: string): boolean;
  /** Clear all cookies */
  clear(): this;
}

interface CookieOptions {
  domain?: string;
  expires?: Date;
  httpOnly?: boolean;
  maxAge?: number;
  path?: string;
  priority?: 'low' | 'medium' | 'high';
  sameSite?: boolean | 'lax' | 'strict' | 'none';
  secure?: boolean;
}
```

**Usage Examples:**

```typescript
import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  // JSON response
  if (request.nextUrl.pathname.startsWith('/api/status')) {
    return NextResponse.json({ 
      status: 'ok', 
      timestamp: Date.now() 
    });
  }
  
  // Redirect response
  if (request.nextUrl.pathname === '/old-path') {
    return NextResponse.redirect(new URL('/new-path', request.url));
  }
  
  // Rewrite (internal redirect)
  if (request.nextUrl.pathname.startsWith('/legacy')) {
    return NextResponse.rewrite(new URL('/modern', request.url));
  }
  
  // Set cookies
  const response = NextResponse.next();
  response.cookies.set('visited', 'true', {
    httpOnly: true,
    secure: true,
    maxAge: 86400 // 24 hours
  });
  
  return response;
}

// API Route example
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q');
  
  const data = await fetchData(query);
  
  return NextResponse.json(data, {
    status: 200,
    headers: {
      'Cache-Control': 'public, max-age=3600'
    }
  });
}
```

### Middleware

Middleware system for intercepting and modifying requests before they reach page components or API routes.

```typescript { .api }
/**
 * Middleware function type
 * @param request - Enhanced request object
 * @param event - Fetch event context
 * @returns Response or null to continue
 */
type NextMiddleware = (
  request: NextRequest,
  event: NextFetchEvent
) => NextResponse | Response | null | undefined | Promise<NextResponse | Response | null | undefined>;

/**
 * Middleware configuration
 */
interface MiddlewareConfig {
  /** Path patterns to match */
  matcher?: string | string[] | {
    source: string;
    has?: HasMatcher[];
    missing?: HasMatcher[];
  }[];
}

interface HasMatcher {
  type: 'header' | 'cookie' | 'query' | 'host';
  key: string;
  value?: string;
}

/**
 * Fetch event context for middleware
 */
interface NextFetchEvent extends Event {
  /** Wait until promise resolves before finishing */
  waitUntil(promise: Promise<any>): void;
  /** Extend middleware execution beyond request lifecycle */
  passThroughOnException(): void;
}
```

**Usage Examples:**

```typescript
// middleware.ts
import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  // Authentication check
  const token = request.cookies.get('auth-token')?.value;
  
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    
    // Verify token and add user info to headers
    const userInfo = verifyToken(token);
    const response = NextResponse.next();
    response.headers.set('x-user-id', userInfo.id);
    return response;
  }
  
  // A/B testing
  if (request.nextUrl.pathname === '/') {
    const variant = Math.random() > 0.5 ? 'a' : 'b';
    const response = NextResponse.rewrite(new URL(`/home-${variant}`, request.url));
    response.cookies.set('ab-variant', variant);
    return response;
  }
  
  return NextResponse.next();
}

// Middleware configuration
export const config: MiddlewareConfig = {
  matcher: [
    // Match all paths except static files
    '/((?!_next/static|_next/image|favicon.ico).*)',
    // Match specific paths
    '/dashboard/:path*',
    '/api/:path*'
  ]
};
```

### API Routes

Type definitions for API route handlers in both App Router and Pages Router.

```typescript { .api }
// App Router API Routes
export type RouteHandler = (
  request: NextRequest,
  context: RouteContext
) => Response | Promise<Response>;

interface RouteContext {
  params: { [key: string]: string | string[] };
}

// HTTP method handlers
export function GET(request: NextRequest, context: RouteContext): Response | Promise<Response>;
export function POST(request: NextRequest, context: RouteContext): Response | Promise<Response>;
export function PUT(request: NextRequest, context: RouteContext): Response | Promise<Response>;
export function PATCH(request: NextRequest, context: RouteContext): Response | Promise<Response>;
export function DELETE(request: NextRequest, context: RouteContext): Response | Promise<Response>;
export function HEAD(request: NextRequest, context: RouteContext): Response | Promise<Response>;
export function OPTIONS(request: NextRequest, context: RouteContext): Response | Promise<Response>;

// Pages Router API Routes (legacy)
type NextApiHandler<T = any> = (
  req: NextApiRequest,
  res: NextApiResponse<T>
) => unknown | Promise<unknown>;

interface NextApiRequest extends IncomingMessage {
  query: ParsedUrlQuery;
  cookies: { [key: string]: string };
  body: any;
  env: Env;
  preview?: boolean;
  previewData?: PreviewData;
}

interface NextApiResponse<T = any> extends ServerResponse {
  status(statusCode: number): NextApiResponse<T>;
  json(body: T): NextApiResponse<T>;
  send(body: T): void;
  redirect(statusOrUrl: number | string, url?: string): NextApiResponse<T>;
  setPreviewData(data: object | string, options?: PreviewOptions): NextApiResponse<T>;
  clearPreviewData(): NextApiResponse<T>;
  revalidate(urlPath: string, opts?: RevalidateOptions): Promise<void>;
  unstable_revalidate(urlPath: string): Promise<void>;
}
```

**Usage Examples:**

```typescript
// App Router API route (app/api/users/route.ts)
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = searchParams.get('page') || '1';
  
  const users = await fetchUsers(parseInt(page));
  
  return NextResponse.json(users);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  
  const newUser = await createUser(body);
  
  return NextResponse.json(newUser, { status: 201 });
}

// Dynamic API route (app/api/users/[id]/route.ts)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await fetchUser(params.id);
  
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }
  
  return NextResponse.json(user);
}

// Pages Router API route (pages/api/users.ts)
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    const users = await fetchUsers();
    res.status(200).json(users);
  } else if (req.method === 'POST') {
    const newUser = await createUser(req.body);
    res.status(201).json(newUser);
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
```

### Headers and Cookies Utilities

Server-side utilities for working with headers and cookies.

```typescript { .api }
/**
 * Get request headers (App Router only)
 * @returns Promise resolving to ReadonlyHeaders instance
 */
function headers(): Promise<ReadonlyHeaders>;

/**
 * Get and manipulate cookies (App Router only)
 * @returns Promise resolving to RequestCookies instance
 */
function cookies(): Promise<RequestCookies>;

/**
 * Get draft mode status (App Router only)
 * @returns Promise resolving to draft mode utilities
 */
function draftMode(): Promise<{
  isEnabled: boolean;
  enable(): void;
  disable(): void;
}>;

/**
 * Schedule callback to run after the request completes
 * @param callback - Function to execute after response
 */
function after(callback: () => void | Promise<void>): void;

/**
 * Get connection information for the current request
 * @returns Promise resolving to connection details
 */
function connection(): Promise<{
  ip?: string;
  geo?: {
    country?: string;
    region?: string;
    city?: string;
    latitude?: string;
    longitude?: string;
  };
}>;

interface ReadonlyHeaders {
  get(name: string): string | null;
  has(name: string): boolean;
  keys(): IterableIterator<string>;
  values(): IterableIterator<string>;
  entries(): IterableIterator<[string, string]>;
  forEach(callback: (value: string, key: string) => void): void;
}

interface RequestCookies {
  get(name: string): { name: string; value: string } | undefined;
  getAll(): { name: string; value: string }[];
  has(name: string): boolean;
  set(name: string, value: string, options?: CookieOptions): void;
  delete(name: string): void;
}
```

**Usage Examples:**

```typescript
import { headers, cookies, draftMode, after, connection } from "next/headers";

// Server component or server action
export default async function ServerExample() {
  // Access headers (now async)
  const headersList = await headers();
  const userAgent = headersList.get('user-agent');
  const referer = headersList.get('referer');
  
  // Access cookies (now async)
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('session')?.value;
  const theme = cookieStore.get('theme')?.value || 'light';
  
  // Check draft mode (now async)
  const { isEnabled } = await draftMode();
  
  // Get connection info
  const conn = await connection();
  const clientIP = conn.ip;
  const country = conn.geo?.country;
  
  return (
    <div>
      <p>User Agent: {userAgent}</p>
      <p>Theme: {theme}</p>
      <p>Draft Mode: {isEnabled ? 'Enabled' : 'Disabled'}</p>
      <p>Client IP: {clientIP}</p>
      <p>Country: {country}</p>
    </div>
  );
}

// Server action
async function handleFormSubmit(formData: FormData) {
  'use server';
  
  const cookieStore = await cookies();
  
  // Set cookie
  cookieStore.set('user-preference', formData.get('preference') as string, {
    httpOnly: true,
    secure: true,
    maxAge: 86400
  });
  
  // Enable draft mode
  const { enable } = await draftMode();
  enable();
  
  // Schedule cleanup after request completes
  after(async () => {
    await logFormSubmission(formData.get('preference') as string);
    console.log('Form submission logged');
  });
}
```