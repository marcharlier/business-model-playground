# Data, Types, and Schemas: How This App Manages State and Persistence

This document explains how domain data is modeled, validated, and persisted across the app. It is written for future contributors and LLM agents adding new features or fields.

Use this as the source of truth for making changes to data structures.

---

## Source of Truth: Domain Schemas and Types

- Zod schemas live in `src/lib/domain/schema.ts` and are the canonical definition of the domain.
- TypeScript types are inferred from those schemas in `src/lib/domain/types.ts`.
- App code typically imports types via `src/lib/storage/types.ts`, which re-exports from the domain layer to keep import paths stable.

Key entities:
- `Project` (with `version: 1`), `Product`, `AssociatedCost`, `FixedCost`, `UpfrontCost`, `ProductSales`, `Currency`.
- The unified model stores all upfront expenses in `project.upfrontCosts` and excludes `'upfront'` from `FixedCost.frequency`.
- `FixedCost.frequency` is strictly `'monthly' | 'annual'`. Upfront costs are represented only via `project.upfrontCosts`.

---

## Runtime Validation and Migrations

- All untrusted data (LocalStorage, Supabase) is validated and normalized at IO boundaries using Zod and a migration helper.
- Migration entry point: `src/lib/domain/migrations.ts` (`migrateProject(raw)`), which:
  - Moves legacy `FixedCost.frequency === 'upfront'` to `project.upfrontCosts`.
  - Adds defaults (`upfrontCosts: []`, `productSales: {}`) and `version: 1`.
  - Coerces `currency` to allowed enum (`GBP`, `USD`, `EUR`).
  - Returns a valid `Project` per the schema or throws if unrecoverable.

Design rule:
- Validate and migrate at the moment data crosses the boundary (read from LocalStorage/Supabase; before writing back).
 - Do not reintroduce `'upfront'` into `FixedCost.frequency` in any new code.

---

## LocalStorage Persistence

- Storage key: `business-model-playground-projects` (array of `Project`).
- Wrapper: `src/lib/storage/projectStorage.ts` centralizes all access.
  - `getAllProjects` reads, parses, migrates, validates, and returns `Project[]`.
  - `getProjectById` uses `getAllProjects` and selects by `id`.
  - `createProject` creates a new validated `Project` (`version: 1`, defaults filled) and persists it.
  - `updateProject` migrates + validates the payload, updates `updatedAt`, persists, and dispatches a custom `projectChange` event.
  - `deleteProject` removes the project and dispatches `projectChange`.
- Do not write directly to `localStorage`. Always go through `projectStorage` or the dedicated helpers below.

Supporting helpers:
- `fixedCostStorage.ts`, `productStorage.ts`, `upfrontCostStorage.ts`, `productSalesStorage.ts` all read via `projectStorage`, modify the project object, and persist via `projectStorage.updateProject`.

Events and refresh:
- `projectStorage` dispatches `window` event `projectChange` on writes.
- `src/lib/hooks/use-projects.ts` listens to `storage` (for cross-tab) and `projectChange` (same-tab) to refresh lists.
- `ProjectProvider` in `src/lib/context/ProjectContext.tsx` loads a single project by id and exposes `project`, `isLoading`, and `refreshProject`.

---

## UI State Flow During User Interaction

- Screens use `ProjectProvider` to access the current `project` and `refreshProject`.
- When a user edits data (e.g., product price, upfront cost):
  - The page/component calls the appropriate storage helper (`productStorage.updateProduct`, `upfrontCostStorage.createUpfrontCost`, etc.).
  - The helper updates the project via `projectStorage.updateProject`, which validates, persists, updates `updatedAt`, and dispatches `projectChange`.
  - The page may call `refreshProject()` if it needs immediate in-memory sync (often used right after updates).
- Dashboard sales volumes (`ProductSales`) are kept in component state and persisted back to the project (via `projectStorage.updateProject`) when changed.

Principles:
- All writes go through storage helpers → `projectStorage.updateProject` → validation/migration → event dispatch.
- Components read through context/hooks to get consistent, validated data.

Cost calculation semantics:
- Operating metrics (e.g., monthly fixed/running costs) exclude upfront costs and include monthly costs plus annual costs amortized monthly.
- Upfront costs are considered separately: they are added once (e.g., month 1) for projections and used for break-even analysis to compute months to recoup.

---

## Supabase: Shared Project Storage

- Table: `shared_projects`, field `project_data` stores the entire `Project` JSON.
- Wrapper: `src/lib/storage/sharedProjectStorage.ts`.
  - `createSharedProject(project)` → migrate + validate, insert.
  - `getSharedProject(id)` → fetch, migrate + validate result; return normalized object.
  - `updateSharedProject(id, project)` → migrate + validate payload, update, return normalized object.
- RLS context: `withUserContext` in `src/lib/supabase/client.ts` sets a per-request context for policies (using avatar as a simple identifier).

Design rule:
- Treat Supabase as an untrusted boundary. Always run migration/validation on both read and write.

---

## AI Schemas

- Experimental route `src/app/api/ai/cost-ideas/` uses Zod for response validation.
- The `currency` field is the domain `Currency` enum to align with the app.
- If AI output is ever ingested into `Project`, add a translator that maps AI fields to domain entities and validate with domain schemas before persisting.

---

## Adding or Changing Fields: Checklist

When a new feature needs to add a field (e.g., `Product.taxRate`) or change an existing one:

1) Update domain schema and types
- Edit `src/lib/domain/schema.ts` to add/modify the field with appropriate Zod constraints and sensible defaults.
- Rebuild types are inferred automatically in `src/lib/domain/types.ts`.

2) Write or update migrations
- In `src/lib/domain/migrations.ts`, set defaults for older data and transform legacy structures.
- Keep migrations idempotent and safe for partially-valid data.

3) Ensure storage creation includes the new field
- Update `projectStorage.createProject` or relevant helper to ensure the field is set on new records (when applicable).

4) Validate at boundaries
- `projectStorage` already validates/migrates on read/write. Confirm it covers the new field.
- `sharedProjectStorage` should validate/migrate on create/update/get (already wired).

5) Update UI reads/writes
- Adjust components to read the new field via context.
- When writing, go through the correct storage helper or `projectStorage.updateProject`.

6) Tests and examples
- Update any example data (e.g., `src/lib/examples/coffee-shop.ts`, `ai/storage-example.json`) to include the new field.

7) Communicate breaking changes
- If the change is not backward-compatible, increment a schema `version` and extend migrations accordingly.

Do’s and Don’ts:
- Do: keep all schema changes in `domain/schema.ts` + `migrations.ts`.
- Do: validate/migrate on every IO boundary.
- Don’t: write directly to `localStorage` from UI code.
- Don’t: bypass storage helpers or `projectStorage`.

---

## File Map (reference)

- Domain
  - `src/lib/domain/schema.ts`: Zod schemas (single source of truth).
  - `src/lib/domain/types.ts`: Types inferred from Zod.
  - `src/lib/domain/migrations.ts`: Migration and normalization helpers.

- Storage (LocalStorage)
  - `src/lib/storage/projectStorage.ts`: Centralized LocalStorage CRUD, validation, events.
  - `src/lib/storage/types.ts`: Re-exports domain types for stable imports.
  - `src/lib/storage/fixedCostStorage.ts`: Fixed cost CRUD.
  - `src/lib/storage/productStorage.ts`: Product CRUD (duplication fix sets copied cost `productId`).
- `src/lib/storage/upfrontCostStorage.ts`: Upfront cost CRUD.
  - `src/lib/storage/productSalesStorage.ts`: Sales volume CRUD.

- Supabase
  - `src/lib/storage/sharedProjectStorage.ts`: Create/read/update shared project data with validation/migration.
  - `src/lib/supabase/client.ts`: Supabase client and `withUserContext` helper.

- UI state
  - `src/lib/context/ProjectContext.tsx`: Current project context.
  - `src/lib/hooks/use-projects.ts`: Projects list hook with cross-tab and in-tab updates.
  - Example pages: `src/app/projects/[id]/dashboard/page.tsx`, `src/app/projects/[id]/upfront-costs/page.tsx`.

---

## Rationale and Benefits

- Fewer regressions: One canonical schema + migration path.
- Safety at edges: All external data is normalized before use.
- Clear extension pattern: Adding fields is a routine change with a predictable checklist.
- Consistent UI: Centralized updates trigger refresh via events/contexts.


