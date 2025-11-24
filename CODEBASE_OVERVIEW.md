# Business Model Playground - Codebase Overview

**Last Updated:** 2025-11-21

## What This Project Is

Business Model Playground is a web-based financial modeling and business planning tool that helps users create and analyze business models through interactive dashboards and AI-powered insights. Think of it as a sophisticated, user-friendly alternative to Excel spreadsheets for business planning.

## Tech Stack

### Frontend
- **Next.js 15.3** - React framework with App Router (SSR/CSR hybrid)
- **React 18.2** - UI library
- **TypeScript 5** - Type safety throughout
- **Tailwind CSS 3.3** - Utility-first styling
- **Radix UI** - Headless, accessible component primitives (accordion, dialog, popover, slider, tabs)
- **Recharts 2.15** - Interactive financial chart visualizations
- **Lucide React** - Icon library
- **Motion** - Animation library
- **Zod 4.1** - Runtime schema validation and type inference

### Backend/AI Integration
- **Vercel AI SDK** (@ai-sdk/react, @ai-sdk/openai) - Streaming AI responses
- **OpenAI API** - GPT-5-nano model for cost idea generation
- **Supabase JS SDK** - Configured for optional database/auth (not required for core functionality)

### Other Libraries
- **date-fns** - Date utilities
- **Class Variance Authority (CVA)** - Component styling patterns
- **clsx** - Conditional CSS class joining
- **Vercel Analytics** - Usage tracking

## Core Features

### Business Modeling Capabilities
- **Multi-Project Management** - Create unlimited projects with custom names, descriptions
- **Multi-Currency Support** - GBP, USD, EUR with proper formatting
- **Product/Service Definition** - Define offerings with pricing and variable costs
- **Fixed/Operating Costs** - Track recurring expenses (monthly/annual frequency)
- **Upfront Investment Costs** - One-time initial costs separate from operating costs
- **Sales Volume Forecasting** - Daily/monthly sales projections per product

### Financial Dashboard & Analytics
- **Profitability Chart** - Revenue vs. Total Costs visualization over time
- **Cost Breakdown** - Pie/composition charts showing fixed vs variable costs
- **Revenue Breakdown** - Product/service contribution to total revenue
- **Monthly Projections** - Time-based financial forecasting
- **Break-Even Analysis** - Calculate units needed to reach profitability
- **Business Status Summary** - Key metrics and financial health indicators
- **Profit Margin Tracking** - Per-product profitability analysis

### AI-Powered Features
- **Cost Idea Generation** - AI suggests relevant costs based on project context
- **Context-Aware Suggestions** - Uses project description and existing costs
- **Streaming Responses** - Real-time AI output for better UX
- **Structured JSON Output** - Validated against Zod schemas
- **Auto-Categorization** - 8 predefined categories (Premises, Staff, Equipment, Marketing, Professional Services, Transportation, Subscriptions, Other)

### Data Management
- **Client-Side Storage** - LocalStorage as primary persistence layer
- **No Backend Required** - Fully functional without server/database
- **Project Sharing** - Share via unique share IDs
- **Example Templates** - Pre-built examples (e.g., Coffee Shop)
- **Data Validation** - Zod schemas enforce data integrity
- **Version-Aware Migrations** - Schema evolution support

### UI/UX Features
- **Responsive Design** - Mobile-first with adaptive layouts
- **Dark Mode Support** - Theme toggle with persistence
- **Interactive Dialogs/Drawers** - Desktop dialogs, mobile drawers
- **Long-Press Destructive Actions** - Prevent accidental deletions
- **Real-Time Calculations** - Instant financial updates
- **Accessibility-First** - Radix UI provides semantic HTML and ARIA

## Project Structure

```
/
├── /src
│   ├── /app                          # Next.js App Router
│   │   ├── /api
│   │   │   └── /ai/cost-ideas       # AI endpoint for generating cost suggestions
│   │   ├── /projects/[id]/
│   │   │   ├── /dashboard           # Financial dashboard & visualizations
│   │   │   ├── /products            # Product management interface
│   │   │   ├── /fixed-costs         # Operating costs configuration
│   │   │   ├── /upfront-costs       # Initial investment costs
│   │   │   ├── /ai-lab              # AI features integration
│   │   │   └── layout.tsx           # Project layout with navigation
│   │   ├── /share/[id]              # Shared project viewing (read-only)
│   │   ├── /projects                # Projects listing page
│   │   ├── page.tsx                 # Home/landing page
│   │   └── layout.tsx               # Root layout with providers
│   │
│   ├── /components                   # Reusable React components (46 TSX files)
│   │   ├── /dashboard               # Financial charts & analytics components
│   │   │   ├── BreakEvenStatement.tsx
│   │   │   ├── BusinessStatusSummary.tsx
│   │   │   ├── CostBreakdownChart.tsx
│   │   │   ├── MonthlyProjectionChart.tsx
│   │   │   ├── ProfitabilityChart.tsx
│   │   │   ├── ProductControls.tsx
│   │   │   └── RevenueBreakdownChart.tsx
│   │   ├── /ui                      # Shadcn-style UI primitives
│   │   ├── /products                # Product-related components
│   │   ├── /project                 # Project-specific components
│   │   ├── /fixed-costs             # Fixed cost components
│   │   ├── /upfront-costs           # Upfront cost components
│   │   ├── /onboarding              # Setup/progress components
│   │   └── /theme-toggle.tsx        # Dark mode toggle
│   │
│   ├── /lib                          # Core business logic & utilities
│   │   ├── /storage                 # Data persistence layer (localStorage)
│   │   │   ├── projectStorage.ts    # Project CRUD operations
│   │   │   ├── productStorage.ts    # Product management
│   │   │   ├── fixedCostStorage.ts  # Fixed cost management
│   │   │   ├── upfrontCostStorage.ts
│   │   │   ├── productSalesStorage.ts
│   │   │   ├── types.ts             # Storage type definitions
│   │   │   └── sharedProjectStorage.ts
│   │   ├── /domain                  # Domain models & business rules
│   │   │   ├── schema.ts            # Zod validation schemas (SOURCE OF TRUTH)
│   │   │   ├── types.ts             # TypeScript type exports
│   │   │   └── migrations.ts        # Data migration logic
│   │   ├── /context                 # React context providers
│   │   │   └── ProjectContext.tsx   # Global project state management
│   │   ├── /utils                   # Utility functions
│   │   │   ├── financial.ts         # Profit margin, cost calculations
│   │   │   ├── currency.ts          # Currency formatting
│   │   │   └── break-even.ts        # Break-even analysis
│   │   ├── /constants               # Configuration constants
│   │   │   ├── fixedCostCategories.ts  # Cost category taxonomy
│   │   │   └── cost-suggestions.ts
│   │   ├── /hooks                   # Custom React hooks
│   │   └── /examples                # Example project data
│   │
│   ├── /context                      # Additional context providers
│   │   └── ThemeContext.tsx         # Theme state management
│   │
│   └── /public                       # Static assets
│
├── /ai                               # AI implementation documentation
├── tailwind.config.js                # Tailwind customization
├── tsconfig.json                     # TypeScript configuration
├── next.config.ts                    # Next.js configuration
├── components.json                   # Shadcn configuration
├── CODEBASE_OVERVIEW.md              # This file
├── KNOWLEDGE.md                      # Domain knowledge
├── RULES.md                          # Development rules
└── AGENTS.md                         # Agent instructions
```

## Key Architectural Patterns

### 1. Client-First Architecture
- **LocalStorage as primary data store** - No backend required for core functionality
- **Full offline capability** - Works without internet after initial load
- **Optional cloud sync** - Supabase configured for future enhancement
- **Static deployment friendly** - Can deploy to any CDN/static host

### 2. Zod-Driven Type Safety
- **Schema-first approach** - `/lib/domain/schema.ts` is the single source of truth
- **Runtime validation** - All data operations validated at runtime
- **Automatic type inference** - TypeScript types derived from Zod schemas
- **Type-safe storage** - Storage layer enforces schema compliance

### 3. React Context State Management
- **ProjectContext** - Global project state accessible throughout app
- **Eliminates prop drilling** - Deep component access without passing props
- **Refresh patterns** - Cache invalidation via refresh functions
- **Custom hooks** - `useProject()` hook for easy consumption

### 4. Event-Based Reactivity
- **Custom `projectChange` events** - Cross-tab/window synchronization
- **Automatic UI updates** - No polling required
- **Server-side guards** - `isBrowser` checks prevent SSR errors
- **localStorage events** - Native browser sync across tabs

### 5. Layered Data Flow
```
Components (UI)
    ↕
Context Layer (State Management)
    ↕
Storage Layer (Data Access)
    ↕
Domain Layer (Validation & Types)
    ↕
LocalStorage (Persistence)
```

### 6. Structured AI Integration
- **Zod schemas define AI output** - `costIdeasSchema` enforces response shape
- **Streaming API responses** - Better UX with progressive loading
- **Category validation** - AI output validated against predefined categories
- **Error handling** - Graceful fallbacks for AI failures

### 7. Financial Calculation Memoization
- **useMemo in dashboard charts** - Prevents unnecessary recalculations
- **Pure utility functions** - Stateless for composability and testing
- **Derived state pattern** - Calculations based on source data, not stored

### 8. Responsive Component Patterns
- **Media query hooks** - `useMediaQuery` for adaptive rendering
- **Desktop/Mobile variants** - Dialog on desktop, Drawer on mobile
- **Conditional rendering** - `isDesktop` checks for layout decisions
- **Mobile-first approach** - Base styles for mobile, enhanced for desktop

### 9. Data Validation & Migration
- **Migration system** - `migrateProject()` handles schema evolution
- **Version field** - Future compatibility (currently v1)
- **Safe parsing** - Fallback handling in storage layer
- **Backwards compatibility** - Older data structures gracefully handled

### 10. Component Organization
- **UI primitives** - Reusable Shadcn-style components in `/components/ui`
- **Feature components** - Domain-specific in `/components/products`, `/components/fixed-costs`
- **Page components** - In `/app` directory with App Router conventions
- **Composition over inheritance** - Small, composable components

## Important Design Decisions

### Why LocalStorage?
- **Zero backend complexity** - Simplifies deployment and hosting
- **Instant responsiveness** - No network latency
- **Privacy-first** - Data never leaves user's browser (unless shared)
- **Free hosting** - Deploy to Vercel/Netlify/GitHub Pages for free

### Why Zod?
- **Runtime safety** - TypeScript only validates at compile time
- **Schema evolution** - Easy to add fields with defaults
- **Validation errors** - User-friendly error messages
- **Type inference** - DRY - define schema once, get types free

### Why Next.js App Router?
- **File-based routing** - Intuitive project structure
- **Server components** - Performance optimization where needed
- **API routes** - AI endpoint without separate backend
- **Static export capable** - Can export to pure static HTML/JS

### Why Radix UI?
- **Accessibility built-in** - WCAG compliance out of the box
- **Headless components** - Full styling control with Tailwind
- **Keyboard navigation** - Power user friendly
- **Battle-tested** - Used by major companies

### Currency Handling
- **Separate from amounts** - Currency stored at project level
- **Display-only in UI** - Calculations currency-agnostic
- **Formatted with Intl.NumberFormat** - Proper locale formatting
- **No conversion logic** - User responsible for currency consistency

### Cost Frequency Separation
- **Fixed costs** - Monthly or annual frequency options
- **Upfront costs** - One-time only, no frequency
- **Clear UI distinction** - Different forms and displays
- **Calculation logic** - Normalized to monthly for projections

## Data Models

### Project
```typescript
{
  id: string
  name: string
  description: string
  currency: 'GBP' | 'USD' | 'EUR'
  createdAt: string
  updatedAt: string
  shareId?: string  // For public sharing
}
```

### Product
```typescript
{
  id: string
  projectId: string
  name: string
  price: number
  variableCosts: Array<{ name: string, amount: number }>
  createdAt: string
  updatedAt: string
}
```

### Fixed Cost
```typescript
{
  id: string
  projectId: string
  name: string
  amount: number
  frequency: 'monthly' | 'annual'
  category: string  // One of 8 predefined categories
  createdAt: string
  updatedAt: string
}
```

### Upfront Cost
```typescript
{
  id: string
  projectId: string
  name: string
  amount: number
  category: string
  createdAt: string
  updatedAt: string
}
```

### Product Sales
```typescript
{
  id: string
  projectId: string
  productId: string
  volume: number
  period: 'daily' | 'monthly'
  createdAt: string
  updatedAt: string
}
```

## Common Development Workflows

### Adding a New Feature
1. Define Zod schema in `/lib/domain/schema.ts`
2. Export TypeScript type from `/lib/domain/types.ts`
3. Create storage functions in `/lib/storage/`
4. Add context provider if needed in `/lib/context/`
5. Build UI components in `/components/`
6. Create page/route in `/app/`

### Modifying Financial Calculations
1. Update pure functions in `/lib/utils/financial.ts`
2. Add unit tests if complex
3. Update dashboard components in `/components/dashboard/`
4. Verify memoization for performance

### Adding New AI Features
1. Define Zod output schema
2. Create API route in `/app/api/ai/`
3. Use Vercel AI SDK streaming
4. Add UI in `/app/projects/[id]/ai-lab/`

### Updating Data Schema
1. Update Zod schema in `/lib/domain/schema.ts`
2. Increment version if breaking change
3. Add migration logic in `/lib/domain/migrations.ts`
4. Test with old data format

## Key Files to Know

### Critical Files (Don't Break These!)
- `src/lib/domain/schema.ts` - **All data validation schemas**
- `src/lib/storage/projectStorage.ts` - **Core CRUD operations**
- `src/lib/context/ProjectContext.tsx` - **Global state management**
- `src/lib/utils/financial.ts` - **All financial calculations**

### Entry Points
- `src/app/page.tsx` - Landing page
- `src/app/projects/page.tsx` - Projects list
- `src/app/projects/[id]/dashboard/page.tsx` - Main dashboard

### Configuration
- `tailwind.config.js` - Tailwind customization, theme colors
- `components.json` - Shadcn component configuration
- `next.config.ts` - Next.js build settings
- `tsconfig.json` - TypeScript compiler options

### AI Integration
- `src/app/api/ai/cost-ideas/route.ts` - Cost generation endpoint
- `src/lib/domain/schema.ts` (costIdeasSchema) - AI output validation

## Common Gotchas

1. **SSR vs Client Components** - LocalStorage only works client-side, use `'use client'` directive
2. **Event Listeners** - Remember to clean up `projectChange` event listeners
3. **Zod Parsing** - Always use `.parse()` for validation or `.safeParse()` with error handling
4. **Memoization** - Dashboard calculations are memoized, dependencies matter
5. **Currency Display** - Use `formatCurrency()` from `/lib/utils/currency.ts`, don't hardcode symbols
6. **ID Generation** - Use `crypto.randomUUID()` for unique IDs
7. **Date Handling** - Use `date-fns` for consistency, store ISO strings
8. **Type Imports** - Import types from `/lib/domain/types.ts`, not storage files

## Testing Considerations

- **LocalStorage mocking** - Required for unit tests
- **Zod schema tests** - Validate edge cases and migrations
- **Financial calculations** - Pure functions are easy to test
- **Component tests** - Use React Testing Library
- **E2E tests** - Consider Playwright for critical flows

## Performance Optimizations

1. **Memoized calculations** - Dashboard charts use `useMemo`
2. **Lazy loading** - Components loaded on-demand where possible
3. **Code splitting** - Next.js automatic route-based splitting
4. **Image optimization** - Next.js Image component
5. **Font optimization** - Next.js font loading

## Future Considerations

- **Cloud sync** - Supabase infrastructure in place
- **Collaboration** - Multi-user editing
- **Export formats** - PDF, CSV, Excel
- **More AI features** - Revenue predictions, market analysis
- **Advanced analytics** - Cash flow, runway calculations
- **Templates** - More example projects

## Getting Help

- **Type errors** - Check `/lib/domain/schema.ts` for canonical types
- **Storage issues** - Debug with browser DevTools → Application → LocalStorage
- **Calculation bugs** - Review `/lib/utils/financial.ts`
- **UI components** - Reference Radix UI docs and `/components/ui/`
- **AI integration** - Check Vercel AI SDK docs

---

**Version:** 1.0
**Maintained by:** Project contributors
**Feedback:** Update this file as the codebase evolves
