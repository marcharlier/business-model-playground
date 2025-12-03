# Caching and Data Management

Advanced caching system with revalidation, cache tagging, and cache lifetime management for optimal performance.

## Prerequisites

Some caching APIs require experimental configuration in your `next.config.js`:

```javascript
// next.config.js
module.exports = {
  experimental: {
    useCache: true
  }
};
```

The following APIs require this experimental flag:
- `unstable_cacheLife()` - Cache lifetime management
- `unstable_cacheTag()` - Cache tagging within "use cache" functions

## Capabilities

### Cache Wrapper Function

Wrap functions with caching behavior for improved performance and reduced server load.

```typescript { .api }
/**
 * Cache a function with configurable options
 * @param fn - Function to cache
 * @param keyParts - Additional cache key components
 * @param options - Caching configuration
 * @returns Cached version of the function
 */
function unstable_cache<T extends (...args: any[]) => any>(
  fn: T,
  keyParts?: string[],
  options?: {
    /** Cache duration in seconds, or false to cache indefinitely */
    revalidate?: number | false;
    /** Tags for cache invalidation */
    tags?: string[];
  }
): T;
```

**Usage Examples:**

```typescript
import { unstable_cache } from "next/cache";

// Cache expensive data fetching
const getCachedUser = unstable_cache(
  async (userId: string) => {
    return await fetchUserFromDatabase(userId);
  },
  ['user'], // Key parts
  {
    revalidate: 3600, // Cache for 1 hour
    tags: ['user', 'profile']
  }
);

// Cache API responses
const getCachedWeather = unstable_cache(
  async (city: string) => {
    const response = await fetch(`https://api.weather.com/${city}`);
    return response.json();
  },
  ['weather'],
  {
    revalidate: 600, // Cache for 10 minutes
    tags: ['weather']
  }
);

// Use in server component
export default async function UserProfile({ userId }: { userId: string }) {
  const user = await getCachedUser(userId);
  const weather = await getCachedWeather(user.city);
  
  return (
    <div>
      <h1>{user.name}</h1>
      <p>Weather: {weather.temperature}°F</p>
    </div>
  );
}
```

### Cache Revalidation

Functions to programmatically invalidate cached data by path or tag.

```typescript { .api }
/**
 * Revalidate cached data for a specific path
 * @param originalPath - Path to revalidate
 * @param type - Type of revalidation (default: 'page')
 */
function revalidatePath(originalPath: string, type?: 'layout' | 'page'): void;

/**
 * Revalidate all cached data with a specific tag
 * @param tag - Cache tag to revalidate
 */
function revalidateTag(tag: string): void;

/**
 * Expire cached data for a specific path (experimental)
 * @param originalPath - Path to expire
 * @param type - Type of expiration
 */
function unstable_expirePath(originalPath: string, type?: 'layout' | 'page'): void;

/**
 * Expire all cached data with a specific tag (experimental)
 * @param tag - Cache tag to expire
 */
function unstable_expireTag(tag: string): void;
```

**Usage Examples:**

```typescript
import { revalidatePath, revalidateTag } from "next/cache";

// Server action to update user profile
async function updateUserProfile(userId: string, data: any) {
  'use server';
  
  await updateUserInDatabase(userId, data);
  
  // Revalidate specific user page
  revalidatePath(`/users/${userId}`);
  
  // Revalidate all user-related cached data
  revalidateTag('user');
  
  // Revalidate users listing
  revalidatePath('/users', 'page');
}

// API route with cache invalidation
export async function POST(request: NextRequest) {
  const body = await request.json();
  
  const newPost = await createPost(body);
  
  // Revalidate blog posts
  revalidateTag('posts');
  revalidatePath('/blog');
  
  return NextResponse.json(newPost);
}

// Webhook handler for external data changes
export async function POST(request: NextRequest) {
  const webhook = await request.json();
  
  if (webhook.type === 'user.updated') {
    revalidateTag('user');
    revalidatePath(`/users/${webhook.userId}`);
  }
  
  if (webhook.type === 'product.updated') {
    revalidateTag('products');
    revalidatePath('/products');
  }
  
  return NextResponse.json({ received: true });
}
```

### Cache Control Functions

Functions to control caching behavior at the request level.

```typescript { .api }
/**
 * Disable caching for the current request
 */
function unstable_noStore(): void;

/**
 * Add cache tags to the current request
 * ⚠️ EXPERIMENTAL: Requires experimental.useCache: true in next.config.js
 * Can only be called inside "use cache" functions
 * @param tags - Tags to add for cache invalidation
 */
function unstable_cacheTag(...tags: string[]): void;
```

**Usage Examples:**

```typescript
import { unstable_noStore, unstable_cacheTag } from "next/cache";

// Disable caching for dynamic content
export default async function DynamicPage() {
  unstable_noStore(); // This page will not be cached
  
  const liveData = await fetchRealTimeData();
  
  return (
    <div>
      <p>Live data: {liveData.value}</p>
      <p>Updated at: {new Date().toISOString()}</p>
    </div>
  );
}

// Add cache tags for selective invalidation
export default async function ProductPage({ params }: { params: { id: string } }) {
  unstable_cacheTag('products', `product-${params.id}`);
  // Multiple tags can now be set in a single call
  
  const product = await fetchProduct(params.id);
  
  return (
    <div>
      <h1>{product.name}</h1>
      <p>{product.description}</p>
    </div>
  );
}
```

### Cache Lifetime Profiles

Configure cache lifetimes using predefined profiles or custom configurations.

```typescript { .api }
/**
 * Set cache lifetime using predefined profile: default
 * ⚠️ EXPERIMENTAL: Requires experimental.useCache: true in next.config.js
 * Can only be called inside "use cache" functions
 * stale: 300s (5 min), revalidate: 900s (15 min), expire: never
 */
function unstable_cacheLife(profile: 'default'): void;

/**
 * Set cache lifetime using predefined profile: seconds
 * ⚠️ EXPERIMENTAL: Requires experimental.useCache: true in next.config.js
 * Can only be called inside "use cache" functions
 * stale: 30s, revalidate: 1s, expire: 60s (1 min)
 */
function unstable_cacheLife(profile: 'seconds'): void;

/**
 * Set cache lifetime using predefined profile: minutes
 * ⚠️ EXPERIMENTAL: Requires experimental.useCache: true in next.config.js
 * Can only be called inside "use cache" functions
 * stale: 300s (5 min), revalidate: 60s (1 min), expire: 3600s (1 hour)
 */
function unstable_cacheLife(profile: 'minutes'): void;

/**
 * Set cache lifetime using predefined profile: hours
 * ⚠️ EXPERIMENTAL: Requires experimental.useCache: true in next.config.js
 * Can only be called inside "use cache" functions
 * stale: 300s (5 min), revalidate: 3600s (1 hour), expire: 86400s (1 day)
 */
function unstable_cacheLife(profile: 'hours'): void;

/**
 * Set cache lifetime using predefined profile: days
 * ⚠️ EXPERIMENTAL: Requires experimental.useCache: true in next.config.js
 * Can only be called inside "use cache" functions
 * stale: 300s (5 min), revalidate: 86400s (1 day), expire: 604800s (1 week)
 */
function unstable_cacheLife(profile: 'days'): void;

/**
 * Set cache lifetime using predefined profile: weeks
 * ⚠️ EXPERIMENTAL: Requires experimental.useCache: true in next.config.js
 * Can only be called inside "use cache" functions
 * stale: 300s (5 min), revalidate: 604800s (1 week), expire: 2592000s (30 days)
 */
function unstable_cacheLife(profile: 'weeks'): void;

/**
 * Set cache lifetime using predefined profile: max
 * ⚠️ EXPERIMENTAL: Requires experimental.useCache: true in next.config.js
 * Can only be called inside "use cache" functions
 * stale: 300s (5 min), revalidate: 2592000s (30 days), expire: never
 */
function unstable_cacheLife(profile: 'max'): void;

/**
 * Set cache lifetime using custom profile name (defined in next.config.js)
 * @param profile - Custom profile name
 */
function unstable_cacheLife(profile: string): void;

/**
 * Set cache lifetime using custom configuration
 * @param config - Custom cache lifetime configuration
 */
function unstable_cacheLife(config: {
  /** Cache may be stale on clients for ... seconds before checking with server */
  stale?: number;
  /** Server starts revalidating after ... seconds */
  revalidate?: number;
  /** Cache expires after ... seconds of no traffic */
  expire?: number;
}): void;
```

**Usage Examples:**

```typescript
import { unstable_cacheLife } from "next/cache";

// Use predefined profiles
export default async function NewsPage() {
  unstable_cacheLife('minutes'); // Cache for minutes
  
  const news = await fetchLatestNews();
  
  return (
    <div>
      <h1>Latest News</h1>
      {news.map(article => (
        <article key={article.id}>
          <h2>{article.title}</h2>
          <p>{article.summary}</p>
        </article>
      ))}
    </div>
  );
}

// Use custom cache configuration
export default async function StaticContent() {
  unstable_cacheLife({
    stale: 0,        // Always fresh
    revalidate: 3600, // Revalidate every hour
    expire: 86400    // Expire after 24 hours
  });
  
  const content = await fetchStaticContent();
  
  return <div dangerouslySetInnerHTML={{ __html: content.html }} />;
}

// Use different profiles for different data
export default async function DashboardPage() {
  // Critical data - short cache
  unstable_cacheLife('seconds');
  const criticalData = await fetchCriticalData();
  
  // Regular updates
  unstable_cacheLife('minutes');
  const regularData = await fetchRegularData();
  
  // Static content
  unstable_cacheLife('hours');
  const staticContent = await fetchStaticContent();
  
  return (
    <div>
      <div>Critical: {criticalData.value}</div>
      <div>Regular: {regularData.value}</div>
      <div>Static: {staticContent.value}</div>
    </div>
  );
}
```

### Data Fetching with Caching

Built-in fetch behavior with Next.js caching integration.

```typescript { .api }
/**
 * Enhanced fetch with Next.js caching support
 * @param input - Request URL or Request object
 * @param init - Fetch options with Next.js extensions
 * @returns Promise<Response>
 */
function fetch(input: RequestInfo | URL, init?: RequestInit & {
  /** Cache the request */
  cache?: 'default' | 'no-store' | 'reload' | 'no-cache' | 'force-cache' | 'only-if-cached';
  /** Revalidate interval in seconds */
  next?: {
    revalidate?: number | false;
    tags?: string[];
  };
}): Promise<Response>;
```

**Usage Examples:**

```typescript
// Default caching (follows fetch cache semantics)
const response = await fetch('https://api.example.com/data');
const data = await response.json();

// Disable caching
const liveResponse = await fetch('https://api.example.com/live-data', {
  cache: 'no-store'
});

// Cache with revalidation
const cachedResponse = await fetch('https://api.example.com/products', {
  next: {
    revalidate: 3600, // Revalidate every hour
    tags: ['products']
  }
});

// Force cache (never revalidate)
const staticResponse = await fetch('https://api.example.com/config', {
  cache: 'force-cache'
});

// Combined with error handling
async function fetchUserData(userId: string) {
  try {
    const response = await fetch(`https://api.example.com/users/${userId}`, {
      next: {
        revalidate: 300, // 5 minutes
        tags: ['users', `user-${userId}`]
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch user');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
}
```