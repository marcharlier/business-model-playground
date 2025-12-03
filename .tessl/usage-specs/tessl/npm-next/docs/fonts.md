# Font Optimization

Font loading and optimization utilities for improved performance and reduced layout shift with Google Fonts and local fonts.

## Capabilities

### Google Fonts Integration

Optimized Google Fonts loading with automatic font display optimization and preloading.

```typescript { .api }
/**
 * Import and configure Google Fonts
 * Each font family is imported as a named export from 'next/font/google'
 */

// Font configuration interface
interface FontDescriptor {
  /** Font weights to load */
  weight?: string | string[];
  /** Font styles to load */
  style?: string | string[];
  /** Character subsets to include */
  subsets?: string[];
  /** Font display strategy */
  display?: 'auto' | 'block' | 'swap' | 'fallback' | 'optional';
  /** Preload the font */
  preload?: boolean;
  /** CSS variable name for the font */
  variable?: string;
  /** Adjust line height automatically */
  adjustFontFallback?: boolean;
  /** Fallback fonts */
  fallback?: string[];
}

// Font object returned by font functions
interface FontObject {
  /** CSS class name */
  className: string;
  /** Inline styles object */
  style: React.CSSProperties;
  /** CSS variable (if specified) */
  variable?: string;
}

/**
 * Inter font from Google Fonts
 */
function Inter(options?: FontDescriptor): FontObject;

/**
 * Roboto font from Google Fonts
 */
function Roboto(options: FontDescriptor & { weight: string | string[] }): FontObject;

/**
 * Open Sans font from Google Fonts
 */
function Open_Sans(options?: FontDescriptor): FontObject;

/**
 * Poppins font from Google Fonts
 */
function Poppins(options: FontDescriptor & { weight: string | string[] }): FontObject;

/**
 * Roboto Mono font from Google Fonts
 */
function Roboto_Mono(options?: FontDescriptor): FontObject;
```

**Usage Examples:**

```typescript
import { Inter, Roboto, Poppins } from 'next/font/google';

// Basic font configuration
const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

// Font with CSS variable
const roboto = Roboto({
  weight: ['300', '400', '500', '700'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  variable: '--font-roboto',
  display: 'swap',
});

// Variable font
const poppins = Poppins({
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  subsets: ['latin'],
  variable: '--font-poppins',
});

// Use in component
export default function MyComponent() {
  return (
    <div className={inter.className}>
      <h1 className={roboto.className}>
        This uses Roboto font
      </h1>
      <p style={poppins.style}>
        This uses Poppins font with inline styles
      </p>
    </div>
  );
}

// Use with CSS variables in global CSS
// globals.css
.font-inter {
  font-family: var(--font-inter);
}

.font-roboto {
  font-family: var(--font-roboto);
}

// _app.tsx with CSS variables
import { Inter, Roboto } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const roboto = Roboto({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: --font-roboto',
});

export default function MyApp({ Component, pageProps }) {
  return (
    <div className={`${inter.variable} ${roboto.variable}`}>
      <Component {...pageProps} />
    </div>
  );
}
```

### Local Font Optimization

Load and optimize locally hosted fonts with performance benefits.

```typescript { .api }
/**
 * Load local fonts with optimization
 * @param options - Local font configuration
 * @returns Font object with className and styles
 */
function localFont(options: LocalFontDescriptor): FontObject;

interface LocalFontDescriptor {
  /** Font source files */
  src: string | Array<{
    path: string;
    weight?: string;
    style?: string;
  }>;
  /** Font weight */
  weight?: string;
  /** Font style */
  style?: string;
  /** Font display strategy */
  display?: 'auto' | 'block' | 'swap' | 'fallback' | 'optional';
  /** Preload the font */
  preload?: boolean;
  /** CSS variable name */
  variable?: string;
  /** Adjust font fallback */
  adjustFontFallback?: boolean;
  /** Fallback fonts */
  fallback?: string[];
  /** Font declarations */
  declarations?: Array<{
    prop: string;
    value: string;
  }>;
}
```

**Usage Examples:**

```typescript
import localFont from 'next/font/local';

// Single font file
const myFont = localFont({
  src: './fonts/my-font.woff2',
  display: 'swap',
  variable: '--font-my-font',
});

// Multiple font files with different weights/styles
const customFont = localFont({
  src: [
    {
      path: './fonts/custom-regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: './fonts/custom-bold.woff2',
      weight: '700',
      style: 'normal',
    },
    {
      path: './fonts/custom-italic.woff2',
      weight: '400',
      style: 'italic',
    },
  ],
  variable: '--font-custom',
  display: 'swap',
});

// Font with custom CSS declarations
const brandFont = localFont({
  src: './fonts/brand-font.woff2',
  variable: '--font-brand',
  declarations: [
    {
      prop: 'font-feature-settings',
      value: '"cv02", "cv03", "cv04", "cv11"',
    },
  ],
});

// Use in component
export default function HomePage() {
  return (
    <div className={myFont.className}>
      <h1 className={customFont.className}>
        Custom Font Heading
      </h1>
      <p className={brandFont.className}>
        Brand font paragraph
      </p>
    </div>
  );
}

// Use with Tailwind CSS
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      fontFamily: {
        'custom': ['var(--font-custom)'],
        'brand': ['var(--font-brand)'],
      },
    },
  },
};

// Component with Tailwind classes
export default function TailwindExample() {
  return (
    <div className={`${customFont.variable} ${brandFont.variable}`}>
      <h1 className="font-custom font-bold text-2xl">
        Custom Font with Tailwind
      </h1>
      <p className="font-brand text-lg">
        Brand font paragraph
      </p>
    </div>
  );
}
```

### Font Performance Optimization

Advanced font optimization techniques and best practices.

```typescript { .api }
/**
 * Font optimization utilities and types
 */

interface FontMetrics {
  /** Font size adjustment */
  sizeAdjust?: string;
  /** Ascent override */
  ascentOverride?: string;
  /** Descent override */
  descentOverride?: string;
  /** Line gap override */
  lineGapOverride?: string;
}

interface FontFallbackOptions {
  /** Enable automatic fallback adjustment */
  adjustFontFallback?: boolean;
  /** Custom fallback metrics */
  fallbackMetrics?: FontMetrics;
}
```

**Usage Examples:**

```typescript
import { Inter } from 'next/font/google';
import localFont from 'next/font/local';

// Optimized font with fallback adjustment
const optimizedInter = Inter({
  subsets: ['latin'],
  display: 'swap',
  adjustFontFallback: true, // Automatically adjust fallback fonts
  preload: true, // Preload the font
});

// Custom font with manual fallback adjustment
const customFont = localFont({
  src: './fonts/custom.woff2',
  display: 'swap',
  adjustFontFallback: false,
  fallback: ['system-ui', 'Arial', 'sans-serif'],
});

// Multiple fonts for different purposes
const fonts = {
  // Heading font - preloaded for above-the-fold content
  heading: Inter({
    subsets: ['latin'],
    weight: ['600', '700', '800'],
    display: 'swap',
    preload: true,
    variable: '--font-heading',
  }),
  
  // Body font - optimized for readability
  body: Inter({
    subsets: ['latin'],
    weight: ['400', '500'],
    display: 'swap',
    variable: '--font-body',
  }),
  
  // Monospace font - loaded on demand
  mono: localFont({
    src: './fonts/mono.woff2',
    display: 'swap',
    preload: false,
    variable: '--font-mono',
  }),
};

// Font loading strategy component
export default function OptimizedLayout({ children }) {
  return (
    <div className={`
      ${fonts.heading.variable} 
      ${fonts.body.variable} 
      ${fonts.mono.variable}
    `}>
      <style jsx global>{`
        :root {
          --font-heading: ${fonts.heading.style.fontFamily};
          --font-body: ${fonts.body.style.fontFamily};
          --font-mono: ${fonts.mono.style.fontFamily};
        }
        
        h1, h2, h3, h4, h5, h6 {
          font-family: var(--font-heading);
        }
        
        body, p, span, div {
          font-family: var(--font-body);
        }
        
        code, pre {
          font-family: var(--font-mono);
        }
      `}</style>
      {children}
    </div>
  );
}
```

### Font Loading Strategies

Different strategies for loading fonts based on performance requirements.

```typescript { .api }
/**
 * Font loading strategies
 */
type FontDisplay = 'auto' | 'block' | 'swap' | 'fallback' | 'optional';

interface FontStrategy {
  /** Critical fonts - load immediately */
  critical: FontDescriptor[];
  /** Important fonts - load with high priority */
  important: FontDescriptor[];
  /** Optional fonts - load when bandwidth allows */
  optional: FontDescriptor[];
}
```

**Usage Examples:**

```typescript
import { Inter, Roboto } from 'next/font/google';
import localFont from 'next/font/local';

// Critical fonts - for above-the-fold content
const criticalFont = Inter({
  subsets: ['latin'],
  weight: ['400', '600'],
  display: 'swap',
  preload: true, // Preload critical fonts
});

// Important fonts - for main content
const importantFont = Roboto({
  weight: ['300', '400', '500'],
  subsets: ['latin'],
  display: 'swap',
  preload: false,
});

// Optional fonts - for secondary content
const optionalFont = localFont({
  src: './fonts/decorative.woff2',
  display: 'optional', // Don't block if slow to load
  preload: false,
});

// Progressive font loading
export default function ProgressiveApp() {
  const [fontsLoaded, setFontsLoaded] = useState({
    critical: true, // Critical fonts are always loaded
    important: false,
    optional: false,
  });
  
  useEffect(() => {
    // Load important fonts after initial render
    document.fonts.load('400 16px Roboto').then(() => {
      setFontsLoaded(prev => ({ ...prev, important: true }));
    });
    
    // Load optional fonts with delay
    setTimeout(() => {
      document.fonts.load('400 16px MyDecorativeFont').then(() => {
        setFontsLoaded(prev => ({ ...prev, optional: true }));
      });
    }, 2000);
  }, []);
  
  return (
    <div className={criticalFont.className}>
      <h1>Critical Content</h1>
      
      <div className={fontsLoaded.important ? importantFont.className : ''}>
        <p>Important content that can wait for font</p>
      </div>
      
      <div className={fontsLoaded.optional ? optionalFont.className : ''}>
        <p>Optional decorative content</p>
      </div>
    </div>
  );
}
```