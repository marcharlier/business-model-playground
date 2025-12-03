# React Components

Essential React components for building Next.js applications with optimized performance, accessibility, and developer experience.

## Capabilities

### Image Component

Optimized image component with automatic optimization, lazy loading, and responsive behavior.

```typescript { .api }
/**
 * Next.js Image component with automatic optimization
 * @param src - Image source URL or import
 * @param alt - Alternative text for accessibility
 * @param width - Image width in pixels
 * @param height - Image height in pixels
 * @param fill - Fill the parent container
 * @param priority - Load image with high priority
 * @param quality - Image quality (1-100)
 * @param placeholder - Placeholder behavior
 * @param blurDataURL - Data URL for blur placeholder
 * @param sizes - Responsive image sizes
 * @param style - CSS styles object
 * @param className - CSS class name
 * @param onLoad - Callback when image loads
 * @param onError - Callback when image fails to load
 * @param loader - Custom image loader function
 * @param unoptimized - Disable image optimization
 */
function Image(props: ImageProps): React.ReactElement;

interface ImageProps {
  src: string | StaticImageData;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  priority?: boolean;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  sizes?: string;
  style?: React.CSSProperties;
  className?: string;
  onLoad?: () => void;
  onError?: () => void;
  loader?: ImageLoader;
  unoptimized?: boolean;
}

interface StaticImageData {
  src: string;
  height: number;
  width: number;
  blurDataURL?: string;
}

type ImageLoader = (resolverProps: ImageLoaderProps) => string;

interface ImageLoaderProps {
  src: string;
  width: number;
  quality?: number;
}
```

**Usage Examples:**

```typescript
import Image from "next/image";
import profilePic from "../public/profile.jpg";

// Basic usage
<Image
  src="/hero.jpg"
  alt="Hero image"
  width={800}
  height={400}
/>

// Fill container
<div style={{ position: 'relative', width: '100%', height: '400px' }}>
  <Image
    src="/background.jpg"
    alt="Background"
    fill
    style={{ objectFit: 'cover' }}
  />
</div>

// With static import
<Image
  src={profilePic}
  alt="Profile picture"
  placeholder="blur"
/>

// Responsive with sizes
<Image
  src="/responsive.jpg"
  alt="Responsive image"
  width={800}
  height={400}
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
/>
```

### Link Component

Client-side navigation component for routing between pages with prefetching and optimization.

```typescript { .api }
/**
 * Next.js Link component for client-side navigation
 * @param href - Target URL or route
 * @param as - Display URL in browser address bar
 * @param replace - Replace current history entry instead of adding new one
 * @param scroll - Scroll to top of page after navigation
 * @param shallow - Update URL without running data fetching methods
 * @param prefetch - Prefetch page in background
 * @param children - Link content
 */
function Link(props: LinkProps): React.ReactElement;

interface LinkProps {
  href: string | UrlObject;
  as?: string | UrlObject;
  replace?: boolean;
  scroll?: boolean;
  shallow?: boolean;
  prefetch?: boolean;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
  onMouseEnter?: React.MouseEventHandler<HTMLAnchorElement>;
  onTouchStart?: React.TouchEventHandler<HTMLAnchorElement>;
  onFocus?: React.FocusEventHandler<HTMLAnchorElement>;
}

interface UrlObject {
  pathname?: string;
  query?: string | null | { [key: string]: any };
  hash?: string;
  href?: string;
}
```

**Usage Examples:**

```typescript
import Link from "next/link";

// Basic navigation
<Link href="/about">About Us</Link>

// Dynamic route
<Link href={`/posts/${post.id}`}>
  Read Post
</Link>

// With query parameters
<Link href={{
  pathname: "/products",
  query: { category: "electronics" }
}}>
  Electronics
</Link>

// External link (no prefetch)
<Link href="https://example.com" prefetch={false}>
  External Site
</Link>

// Custom styling
<Link 
  href="/contact"
  className="btn btn-primary"
  style={{ textDecoration: 'none' }}
>
  Contact
</Link>
```

### Script Component

Optimized script loading component with loading strategies and performance optimization.

```typescript { .api }
/**
 * Next.js Script component for optimized script loading
 * @param src - Script source URL
 * @param strategy - Loading strategy
 * @param onLoad - Callback when script loads successfully
 * @param onError - Callback when script fails to load
 * @param onReady - Callback when script is ready to use
 * @param id - Script element ID
 * @param children - Inline script content
 */
function Script(props: ScriptProps): React.ReactElement;

interface ScriptProps {
  src?: string;
  strategy?: 'beforeInteractive' | 'afterInteractive' | 'lazyOnload' | 'worker';
  onLoad?: () => void;
  onError?: () => void;
  onReady?: () => void;
  id?: string;
  children?: string;
  async?: boolean;
  defer?: boolean;
  crossOrigin?: string;
  integrity?: string;
  nonce?: string;
  referrerPolicy?: string;
}
```

**Usage Examples:**

```typescript
import Script from "next/script";

// External script with strategy
<Script
  src="https://www.google-analytics.com/analytics.js"
  strategy="afterInteractive"
  onLoad={() => console.log('GA loaded')}
/>

// Inline script
<Script id="analytics">
  {`
    gtag('config', 'GA_MEASUREMENT_ID');
  `}
</Script>

// Critical script (loads before page becomes interactive)
<Script
  src="/critical-script.js"
  strategy="beforeInteractive"
/>

// Lazy loaded script
<Script
  src="/lazy-feature.js"
  strategy="lazyOnload"
  onReady={() => {
    // Script is ready to use
    window.lazyFeature.init();
  }}
/>
```

### Head Component (Pages Router)

Component for modifying the document head in Pages Router applications.

```typescript { .api }
/**
 * Next.js Head component for modifying document head (Pages Router only)
 * @param children - Head elements (title, meta, link, etc.)
 */
function Head(props: { children: React.ReactNode }): React.ReactElement;
```

**Usage Examples:**

```typescript
import Head from "next/head";

// Basic head modification
<Head>
  <title>My Page Title</title>
  <meta name="description" content="Page description" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <link rel="icon" href="/favicon.ico" />
</Head>

// SEO meta tags
<Head>
  <title>{post.title}</title>
  <meta name="description" content={post.excerpt} />
  <meta property="og:title" content={post.title} />
  <meta property="og:description" content={post.excerpt} />
  <meta property="og:image" content={post.coverImage} />
  <meta name="twitter:card" content="summary_large_image" />
</Head>

// Custom CSS and scripts
<Head>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="stylesheet" href="/custom.css" />
  <script async src="https://example.com/widget.js" />
</Head>
```

