# Configuration and Build

Next.js configuration system and build-time utilities for customizing framework behavior and optimizing applications.

## Capabilities

### Next.js Configuration

Main configuration interface for customizing Next.js behavior in `next.config.js` or `next.config.ts`.

```typescript { .api }
/**
 * Next.js configuration object
 */
interface NextConfig {
  /** Experimental features configuration */
  experimental?: ExperimentalConfig;
  /** ESLint configuration */
  eslint?: ESLintConfig;
  /** TypeScript configuration */
  typescript?: TypeScriptConfig;
  /** Webpack configuration customization */
  webpack?: WebpackConfigFunction;
  /** Environment variables */
  env?: { [key: string]: string };
  /** Base path for the application */
  basePath?: string;
  /** CDN prefix for static assets */
  assetPrefix?: string;
  /** Add trailing slash to URLs */
  trailingSlash?: boolean;
  /** Enable React Strict Mode */
  reactStrictMode?: boolean;
  /** Use SWC minifier */
  swcMinify?: boolean;
  /** Compiler configuration */
  compiler?: CompilerConfig;
  /** Image optimization configuration */
  images?: ImageConfig;
  /** Custom redirects */
  redirects?: () => Promise<Redirect[]>;
  /** URL rewrites */
  rewrites?: () => Promise<Rewrite[] | RewriteObject>;
  /** Custom headers */
  headers?: () => Promise<Header[]>;
  /** Output configuration */
  output?: 'standalone' | 'export' | undefined;
  /** Disable powered by header */
  poweredByHeader?: boolean;
  /** Generate ETags for pages */
  generateEtags?: boolean;
  /** Compression configuration */
  compress?: boolean;
  /** Development indicators */
  devIndicators?: {
    buildActivity?: boolean;
    buildActivityPosition?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  };
  /** Internationalization */
  i18n?: I18NConfig;
  /** Page extensions */
  pageExtensions?: string[];
  /** Disable X-Powered-By header */
  xPoweredBy?: boolean;
}

interface ExperimentalConfig {
  /** Enable App Router */
  appDir?: boolean;
  /** Server Components configuration */
  serverComponents?: boolean;
  /** Turbopack bundler */
  turbo?: TurboConfig;
  /** PPR (Partial Prerendering) */
  ppr?: boolean;
  /** React compiler */
  reactCompiler?: boolean | ReactCompilerConfig;
  /** Static exports */
  staticExports?: boolean;
  /** Instrumentation */
  instrumentationHook?: boolean;
  /** MDXRS */
  mdxRs?: boolean;
  /** Server Actions */
  serverActions?: boolean;
  /** Web Vitals attribution */
  webVitalsAttribution?: string[];
}

interface CompilerConfig {
  /** Styled-jsx configuration */
  styledJsx?: boolean;
  /** Remove console statements */
  removeConsole?: boolean | {
    exclude?: string[];
  };
  /** React configuration */
  reactRemoveProperties?: boolean | {
    properties?: string[];
  };
  /** Relay configuration */
  relay?: RelayConfig;
  /** SWC plugins */
  swcPlugins?: Array<[string, any]>;
}

interface ImageConfig {
  /** Image domains */
  domains?: string[];
  /** Remote patterns */
  remotePatterns?: RemotePattern[];
  /** Device sizes */
  deviceSizes?: number[];
  /** Image sizes */
  imageSizes?: number[];
  /** Image formats */
  formats?: ('image/webp' | 'image/avif')[];
  /** Disable static images */
  disableStaticImages?: boolean;
  /** Minimize delay */
  minimumCacheTTL?: number;
}

interface RemotePattern {
  protocol?: 'http' | 'https';
  hostname: string;
  port?: string;
  pathname?: string;
}
```

**Usage Examples:**

```typescript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // Environment variables
  env: {
    CUSTOM_KEY: 'my-value',
  },
  
  // Image configuration
  images: {
    domains: ['example.com', 'cdn.example.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'assets.example.com',
        pathname: '/images/**',
      }
    ],
    formats: ['image/webp', 'image/avif'],
  },
  
  // Redirects
  async redirects() {
    return [
      {
        source: '/old-path',
        destination: '/new-path',
        permanent: true,
      },
      {
        source: '/blog/:slug*',
        destination: '/posts/:slug*',
        permanent: false,
      }
    ];
  },
  
  // Rewrites
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://api.example.com/:path*',
      }
    ];
  },
  
  // Custom headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Custom-Header',
            value: 'my-custom-value',
          }
        ],
      }
    ];
  },
  
  // Webpack customization
  webpack: (config, { buildId, dev, isServer, defaultLoaders }) => {
    // Custom webpack configuration
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack']
    });
    
    return config;
  },
  
  // Experimental features
  experimental: {
    appDir: true,
    serverActions: true,
    turbo: {
      loaders: {
        '.svg': ['@svgr/webpack'],
      }
    }
  }
};

module.exports = nextConfig;
```

### TypeScript Configuration

TypeScript-specific configuration and type checking options.

```typescript { .api }
interface TypeScriptConfig {
  /** Ignore TypeScript errors during build */
  ignoreBuildErrors?: boolean;
  /** Custom TypeScript configuration file */
  tsconfigPath?: string;
}

// TypeScript configuration in next.config.ts
import type { NextConfig } from 'next';

const config: NextConfig = {
  typescript: {
    // Ignore TypeScript errors during build (not recommended for production)
    ignoreBuildErrors: false,
  },
  // Other configuration options...
};

export default config;
```

### Runtime Configuration

Runtime configuration utilities for accessing configuration values.

```typescript { .api }
/**
 * Get runtime configuration
 * @returns Runtime config object
 */
function getConfig(): {
  serverRuntimeConfig: { [key: string]: any };
  publicRuntimeConfig: { [key: string]: any };
};
```

**Usage Examples:**

```typescript
// next.config.js
const nextConfig = {
  serverRuntimeConfig: {
    // Server-only configuration
    mySecret: 'secret-value',
    dbUrl: process.env.DATABASE_URL,
  },
  publicRuntimeConfig: {
    // Available on both server and client
    staticFolder: '/static',
    apiUrl: process.env.NEXT_PUBLIC_API_URL,
  },
};

// Using runtime config
import getConfig from 'next/config';

const { serverRuntimeConfig, publicRuntimeConfig } = getConfig();

export default function MyComponent() {
  // Only available on server-side
  const secret = serverRuntimeConfig.mySecret;
  
  // Available on both server and client
  const apiUrl = publicRuntimeConfig.apiUrl;
  
  return <div>API URL: {apiUrl}</div>;
}
```

### Build Analysis

Analyze bundle size and performance with Next.js bundle analyzer.

```typescript { .api }
/**
 * Bundle analyzer configuration
 */
interface BundleAnalyzerConfig {
  enabled?: boolean;
  openAnalyzer?: boolean;
  analyzeServer?: boolean;
  analyzeBrowser?: boolean;
}

// Bundle analyzer plugin
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer({
  // Next.js configuration
});
```

### Custom Webpack Configuration

Extend and customize the webpack configuration.

```typescript { .api }
type WebpackConfigFunction = (
  config: any,
  context: WebpackConfigContext
) => any;

interface WebpackConfigContext {
  /** Build ID */
  buildId: string;
  /** Development mode */
  dev: boolean;
  /** Server-side build */
  isServer: boolean;
  /** Default loaders */
  defaultLoaders: {
    babel: any;
  };
  /** Next.js version */
  nextRuntime?: 'edge' | 'nodejs';
  /** Webpack version */
  webpack: any;
}
```

**Usage Examples:**

```typescript
// next.config.js
const path = require('path');

const nextConfig = {
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Add custom loaders
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack']
    });
    
    // Add aliases
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, 'src'),
      '@components': path.resolve(__dirname, 'src/components'),
    };
    
    // Modify existing rules
    config.module.rules.forEach((rule) => {
      if (rule.oneOf) {
        rule.oneOf.forEach((oneOf) => {
          if (oneOf.test && oneOf.test.toString().includes('css')) {
            oneOf.use.forEach((use) => {
              if (use.loader && use.loader.includes('css-loader')) {
                use.options.modules = {
                  localIdentName: dev 
                    ? '[path][name]__[local]--[hash:base64:5]'
                    : '[hash:base64:8]'
                };
              }
            });
          }
        });
      }
    });
    
    // Add plugins
    config.plugins.push(
      new webpack.DefinePlugin({
        __BUILD_ID__: JSON.stringify(buildId),
        __IS_SERVER__: JSON.stringify(isServer),
      })
    );
    
    // Performance optimization
    if (!dev && !isServer) {
      config.optimization.splitChunks.cacheGroups = {
        ...config.optimization.splitChunks.cacheGroups,
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
      };
    }
    
    return config;
  },
};

module.exports = nextConfig;
```

### Internationalization Configuration

Configure internationalization (i18n) support.

```typescript { .api }
interface I18NConfig {
  /** Supported locales */
  locales: string[];
  /** Default locale */
  defaultLocale: string;
  /** Domain-specific locales */
  domains?: DomainLocale[];
  /** Locale detection */
  localeDetection?: boolean;
}

interface DomainLocale {
  domain: string;
  defaultLocale: string;
  locales?: string[];
  http?: boolean;
}
```

**Usage Examples:**

```typescript
// next.config.js
const nextConfig = {
  i18n: {
    locales: ['en', 'fr', 'es', 'de'],
    defaultLocale: 'en',
    domains: [
      {
        domain: 'example.com',
        defaultLocale: 'en',
      },
      {
        domain: 'example.fr',
        defaultLocale: 'fr',
      },
      {
        domain: 'example.es',
        defaultLocale: 'es',
      }
    ],
    localeDetection: true,
  },
};

// Using locale in components
import { useRouter } from 'next/router';

export default function LocalizedComponent() {
  const router = useRouter();
  const { locale, locales, defaultLocale } = router;
  
  return (
    <div>
      <p>Current locale: {locale}</p>
      <p>Available locales: {locales?.join(', ')}</p>
      <p>Default locale: {defaultLocale}</p>
    </div>
  );
}
```