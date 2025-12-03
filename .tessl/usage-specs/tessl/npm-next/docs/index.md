# Next.js

Next.js is a comprehensive React framework that enables developers to build full-stack web applications with server-side rendering, static site generation, and modern web development features. It provides an integrated development experience with automatic code splitting, optimized performance, built-in CSS support, API routes, and deployment capabilities.

## Package Information

- **Package Name**: next
- **Package Type**: npm
- **Language**: JavaScript/TypeScript
- **Installation**: `npm install next react react-dom`

## Core Imports

```typescript
import Link from "next/link";
import Image from "next/image";
import Head from "next/head";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { redirect, notFound } from "next/navigation";
import dynamic from "next/dynamic";
```

For configuration:
```typescript
import type { NextConfig } from "next";
```

For API routes and middleware:
```typescript
import { NextRequest, NextResponse } from "next/server";
import type { NextApiRequest, NextApiResponse } from "next";
```

For server-side utilities:
```typescript
import { headers, cookies, draftMode, after, connection } from "next/headers";
```

## Basic Usage

```typescript
// Basic Next.js page component (App Router)
export default function HomePage() {
  return (
    <div>
      <h1>Welcome to Next.js</h1>
      <Link href="/about">About</Link>
      <Image 
        src="/logo.png" 
        alt="Logo" 
        width={200} 
        height={100} 
      />
    </div>
  );
}

// API route handler
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ message: "Hello World" });
}

// Middleware
import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  return NextResponse.redirect(new URL('/login', request.url));
}
```

## Architecture

Next.js is built around several key architectural patterns:

- **App Router**: Modern routing system with file-system based routing and layouts
- **Pages Router**: Legacy routing system (still supported)
- **Server Components**: React Server Components for server-side rendering
- **Client Components**: Interactive components that run in the browser
- **API Routes**: Backend API endpoints within the same application
- **Middleware**: Request/response interception for authentication, redirects, etc.
- **Image Optimization**: Automatic image optimization and lazy loading
- **Build System**: Integrated build pipeline with Webpack/Turbopack

## Capabilities

### React Components

Essential React components for building Next.js applications with optimized performance and developer experience.

```typescript { .api }
// Image component with optimization
interface ImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  priority?: boolean;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
}

// Link component for client-side navigation
interface LinkProps {
  href: string | URL;
  as?: string;
  replace?: boolean;
  scroll?: boolean;
  shallow?: boolean;
  prefetch?: boolean;
  children: React.ReactNode;
}

// Script component for optimized script loading
interface ScriptProps {
  src?: string;
  strategy?: 'beforeInteractive' | 'afterInteractive' | 'lazyOnload';
  onLoad?: () => void;
  onError?: () => void;
  onReady?: () => void;
  children?: string;
}
```

[React Components](./components.md)

### Navigation and Routing

Comprehensive navigation system supporting both App Router and Pages Router patterns with hooks and utilities for programmatic navigation.

```typescript { .api }
// App Router navigation hooks
function useRouter(): AppRouterInstance;
function usePathname(): string;
function useSearchParams(): ReadonlyURLSearchParams;
function useParams(): Params;

// Navigation functions
function redirect(url: string): never;
function permanentRedirect(url: string): never;
function notFound(): never;
```

[Navigation and Routing](./navigation.md)

### Server-Side APIs

Server-side functionality including middleware, API routes, request/response handling, and edge runtime support.

```typescript { .api }
// Enhanced request/response objects
class NextRequest extends Request {
  geo?: {
    country?: string;
    region?: string;
    city?: string;
  };
  ip?: string;
  nextUrl: NextURL;
}

class NextResponse extends Response {
  static json(object: any, init?: ResponseInit): NextResponse;
  static redirect(url: string | URL, init?: ResponseInit): NextResponse;
  static rewrite(destination: string | URL, init?: ResponseInit): NextResponse;
}

// Middleware function type
type NextMiddleware = (
  request: NextRequest,
  event: NextFetchEvent
) => NextResponse | Response | null | undefined | Promise<NextResponse | Response | null | undefined>;
```

[Server-Side APIs](./server.md)

### Caching and Data Management

Advanced caching system with revalidation, cache tagging, and cache lifetime management for optimal performance.

```typescript { .api }
// Cache wrapper function
function unstable_cache<T extends (...args: any[]) => any>(
  fn: T,
  keyParts?: string[],
  options?: {
    revalidate?: number | false;
    tags?: string[];
  }
): T;

// Revalidation functions
function revalidatePath(originalPath: string, type?: 'layout' | 'page'): void;
function revalidateTag(tag: string): void;

// Cache lifetime profiles
function unstable_cacheLife(profile: 'default' | 'seconds' | 'minutes' | 'hours' | 'days' | 'weeks' | 'max' | string): void;
```

[Caching and Data Management](./caching.md)

### Dynamic Loading

Code splitting and dynamic component loading with SSR support and loading states.

```typescript { .api }
function dynamic<P = {}>(
  dynamicOptions: DynamicOptions<P> | Loader<P>,
  options?: DynamicOptions<P>
): React.ComponentType<P>;

interface DynamicOptions<P = {}> {
  loading?: React.ComponentType;
  loader?: Loader<P>;
  ssr?: boolean;
  suspense?: boolean;
}

type LoaderComponent<P = {}> = Promise<React.ComponentType<P> | { default: React.ComponentType<P> }>;
```

[Dynamic Loading](./dynamic.md)

### Configuration and Build

Next.js configuration system and build-time utilities for customizing framework behavior.

```typescript { .api }
interface NextConfig {
  experimental?: ExperimentalConfig;
  eslint?: ESLintConfig;
  typescript?: TypeScriptConfig;
  webpack?: WebpackConfigFunction;
  env?: { [key: string]: string };
  basePath?: string;
  assetPrefix?: string;
  trailingSlash?: boolean;
  reactStrictMode?: boolean;
  swcMinify?: boolean;
  compiler?: CompilerConfig;
  images?: ImageConfig;
  redirects?: () => Promise<Redirect[]>;
  rewrites?: () => Promise<Rewrite[]>;
  headers?: () => Promise<Header[]>;
}
```

[Configuration and Build](./configuration.md)

### Font Optimization

Font loading and optimization utilities for improved performance and reduced layout shift.

```typescript { .api }
// Google Fonts integration
import { Inter, Roboto_Mono } from 'next/font/google';

// Local font optimization
import localFont from 'next/font/local';

interface FontDescriptor {
  weight?: string | string[];
  style?: string | string[];
  subsets?: string[];
  display?: 'auto' | 'block' | 'swap' | 'fallback' | 'optional';
  preload?: boolean;
  variable?: string;
}
```

[Font Optimization](./fonts.md)

### Testing and Development

Development tools and testing utilities for building robust Next.js applications.

```typescript { .api }
// Jest configuration
function createJestConfig(config: any): any;

// Development utilities
interface NextWebVitalsMetric {
  id: string;
  name: string;
  value: number;
  label: 'web-vital' | 'custom';
  startTime: number;
  attribution?: { [key: string]: unknown };
}
```

[Testing and Development](./development.md)