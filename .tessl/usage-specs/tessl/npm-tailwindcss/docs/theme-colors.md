# Theme and Colors

Default theme configuration and comprehensive color system for Tailwind CSS.

## Capabilities

### Default Colors

Complete color palette with semantic color names and numeric scales.

```javascript { .api }
const colors: DefaultColors;

interface DefaultColors {
  inherit: 'inherit';
  current: 'currentColor';
  transparent: 'transparent';
  black: '#000';
  white: '#fff';
  slate: ColorScale;
  gray: ColorScale;
  zinc: ColorScale;
  neutral: ColorScale;
  stone: ColorScale;
  red: ColorScale;
  orange: ColorScale;
  amber: ColorScale;
  yellow: ColorScale;
  lime: ColorScale;
  green: ColorScale;
  emerald: ColorScale;
  teal: ColorScale;
  cyan: ColorScale;
  sky: ColorScale;
  blue: ColorScale;
  indigo: ColorScale;
  violet: ColorScale;
  purple: ColorScale;
  fuchsia: ColorScale;
  pink: ColorScale;
  rose: ColorScale;
}

interface ColorScale {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
  950: string;
}
```

**Usage Examples:**

```javascript
const colors = require('tailwindcss/colors');

// Use in configuration
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: colors.blue,
        secondary: colors.purple,
        danger: colors.red[500],
        success: colors.green[600],
      }
    }
  }
};

// Access specific colors
console.log(colors.blue[500]); // "#3B82F6"
console.log(colors.red[900]);  // "#7F1D1D"
console.log(colors.current);   // "currentColor"

// Use with CSS custom properties
const customColors = {
  brand: {
    light: colors.blue[400],
    DEFAULT: colors.blue[500],
    dark: colors.blue[600],
  }
};
```

### Default Theme

Complete default theme configuration with all design tokens.

```javascript { .api }
const defaultTheme: ThemeConfig;
```

**Key Theme Sections:**

#### Responsive Breakpoints

```javascript { .api }
const screens: {
  sm: '640px';
  md: '768px';
  lg: '1024px';
  xl: '1280px';
  '2xl': '1536px';
};
```

#### Spacing Scale

```javascript { .api }
const spacing: {
  px: '1px';
  0: '0px';
  0.5: '0.125rem';
  1: '0.25rem';
  1.5: '0.375rem';
  2: '0.5rem';
  2.5: '0.625rem';
  3: '0.75rem';
  3.5: '0.875rem';
  4: '1rem';
  // ... up to 96: '24rem'
  auto: 'auto';
  full: '100%';
  screen: '100vh';
  svw: '100svw';
  lvw: '100lvw';
  dvw: '100dvw';
  min: 'min-content';
  max: 'max-content';
  fit: 'fit-content';
};
```

#### Typography

```javascript { .api }
const fontFamily: {
  sans: [
    'ui-sans-serif',
    'system-ui',
    'sans-serif',
    '"Apple Color Emoji"',
    '"Segoe UI Emoji"',
    '"Segoe UI Symbol"',
    '"Noto Color Emoji"'
  ];
  serif: [
    'ui-serif',
    'Georgia',
    'Cambria',
    '"Times New Roman"',
    'Times',
    'serif'
  ];
  mono: [
    'ui-monospace',
    'SFMono-Regular',
    '"Menlo"',
    'Monaco',
    'Consolas',
    '"Liberation Mono"',
    '"Courier New"',
    'monospace'
  ];
};

const fontSize: {
  xs: ['0.75rem', { lineHeight: '1rem' }];
  sm: ['0.875rem', { lineHeight: '1.25rem' }];
  base: ['1rem', { lineHeight: '1.5rem' }];
  lg: ['1.125rem', { lineHeight: '1.75rem' }];
  xl: ['1.25rem', { lineHeight: '1.75rem' }];
  '2xl': ['1.5rem', { lineHeight: '2rem' }];
  '3xl': ['1.875rem', { lineHeight: '2.25rem' }];
  // ... up to '9xl'
};

const fontWeight: {
  thin: '100';
  extralight: '200';
  light: '300';
  normal: '400';
  medium: '500';
  semibold: '600';
  bold: '700';
  extrabold: '800';
  black: '900';
};
```

#### Border Configuration

```javascript { .api }
const borderRadius: {
  none: '0px';
  sm: '0.125rem';
  DEFAULT: '0.25rem';
  md: '0.375rem';
  lg: '0.5rem';
  xl: '0.75rem';
  '2xl': '1rem';
  '3xl': '1.5rem';
  full: '9999px';
};

const borderWidth: {
  DEFAULT: '1px';
  0: '0px';
  2: '2px';
  4: '4px';
  8: '8px';
};
```

#### Effects and Shadows

```javascript { .api }
const boxShadow: {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)';
  DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)';
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)';
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)';
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)';
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)';
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)';
  none: 'none';
};

const opacity: {
  0: '0';
  5: '0.05';
  10: '0.1';
  20: '0.2';
  25: '0.25';
  30: '0.3';
  40: '0.4';
  50: '0.5';
  60: '0.6';
  70: '0.7';
  75: '0.75';
  80: '0.8';
  90: '0.9';
  95: '0.95';
  100: '1';
};
```

**Usage Examples:**

```javascript
const defaultTheme = require('tailwindcss/defaultTheme');

// Extend font families
module.exports = {
  theme: {
    extend: {
      fontFamily: {
        'heading': ['Inter', ...defaultTheme.fontFamily.sans],
        'body': [...defaultTheme.fontFamily.sans],
      },
      screens: {
        'xs': '475px',
        ...defaultTheme.screens,
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        ...defaultTheme.spacing,
      }
    }
  }
};

// Access specific theme values
console.log(defaultTheme.spacing['4']); // "1rem"
console.log(defaultTheme.colors.blue[500]); // "#3B82F6"
console.log(defaultTheme.screens.md); // "768px"

// Create custom theme extensions
const customTheme = {
  ...defaultTheme,
  extend: {
    colors: {
      brand: {
        50: '#eff6ff',
        500: '#3b82f6',
        900: '#1e3a8a',
      }
    },
    animation: {
      'fade-in': 'fadeIn 0.5s ease-in-out',
    },
    keyframes: {
      fadeIn: {
        '0%': { opacity: '0' },
        '100%': { opacity: '1' },
      },
    },
  }
};
```

### Default Configuration

Complete default configuration object used as the base for all Tailwind installations.

```javascript { .api }
const defaultConfig: Config;
```

**Usage Examples:**

```javascript
const defaultConfig = require('tailwindcss/defaultConfig');

// Examine default configuration structure
console.log(defaultConfig.theme);
console.log(defaultConfig.corePlugins);
console.log(defaultConfig.variants);

// Use as base for custom configuration
module.exports = {
  ...defaultConfig,
  content: ['./src/**/*.{html,js}'],
  theme: {
    ...defaultConfig.theme,
    extend: {
      colors: {
        primary: '#3B82F6',
      }
    }
  },
  plugins: [
    ...defaultConfig.plugins,
    // Add custom plugins
  ]
};
```

## Color System Details

### Color Naming Convention

Tailwind uses a consistent naming system:
- **Semantic names**: `red`, `blue`, `green`, etc.
- **Numeric scale**: `50` (lightest) to `950` (darkest)
- **Special values**: `inherit`, `current`, `transparent`

### Color Accessibility

The color system is designed with accessibility in mind:
- **Sufficient contrast**: Default color combinations meet WCAG guidelines
- **Consistent lightness**: Same numeric values have similar perceived lightness across hues
- **Semantic grouping**: Related colors are grouped logically

### Custom Color Integration

```javascript { .api }
// Add custom colors to the palette
const customColors = {
  brand: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9',
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
    950: '#082f49',
  },
  accent: {
    light: '#fbbf24',
    DEFAULT: '#f59e0b',
    dark: '#d97706',
  }
};
```

### Advanced Theme Customization

```javascript { .api }
interface ThemeExtension {
  // Container configuration
  container: {
    center: boolean;
    padding: string | Record<string, string>;
    screens: Record<string, string>;
  };
  
  // Animation system
  animation: Record<string, string>;
  keyframes: Record<string, Record<string, Record<string, string>>>;
  
  // Advanced typography
  textIndent: Record<string, string>;
  textDecorationThickness: Record<string, string>;
  textUnderlineOffset: Record<string, string>;
  
  // Advanced effects
  backdropBlur: Record<string, string>;
  backdropBrightness: Record<string, string>;
  dropShadow: Record<string, string | string[]>;
  
  // Grid system
  gridTemplateColumns: Record<string, string>;
  gridTemplateRows: Record<string, string>;
  gridAutoColumns: Record<string, string>;
  gridAutoRows: Record<string, string>;
}
```