## Data Model and Schema Unification Plan

### Overview
Current data types are primarily defined in `src/lib/storage/types.ts` and are used across UI and storage. There is an outdated duplicate at `src/lib/types.ts`. LocalStorage is the main persistence for projects; Supabase stores a shared copy as JSON. There is no runtime validation or migrations. Upfront costs exist in two representations (legacy `FixedCost.frequency === 'upfront'` and the newer `upfrontCosts: UpfrontCost[]`). The AI cost ideas schema is independent and not aligned to domain types. An example (`ai/storage-example.json`) may be stale.

### Goals
- Single source of truth for domain schemas and types.
- Runtime validation and migration at persistence boundaries (LocalStorage, Supabase).
- Consolidated, unambiguous upfront costs model.
- Align experimental AI schemas with the domain (currency, cost kinds).
- Remove the outdated duplicate types file.
- Keep documentation and examples in sync.

---

## 1) Introduce unified domain schemas and types

- Create `src/lib/domain/schema.ts` with Zod schemas for:
  - `Currency`, `AssociatedCost`, `Product`, `ProductSales`, `FixedCost`, `UpfrontCost`, `Project`.
  - Add `version: 1` to `Project` and defaults for optional fields (`upfrontCosts`, `productSales`).
- Create `src/lib/domain/types.ts` to export `z.infer` types (e.g., `export type Project = z.infer<typeof Project>`).
- Re-export `Currency` and `formatCurrency` usage remains unchanged, but types should import from `domain/types`.

Example (illustrative):
```ts
import { z } from 'zod';

export const Currency = z.enum(['GBP','USD','EUR']);
export type Currency = z.infer<typeof Currency>;

export const AssociatedCost = z.object({
  id: z.string(),
  name: z.string(),
  amount: z.number().nonnegative(),
  productId: z.string(),
  projectId: z.string(),
});

export const ProductSales = z.object({
  volume: z.number().nonnegative(),
  period: z.enum(['monthly','daily']),
});

export const Product = z.object({
  id: z.string(),
  name: z.string(),
  price: z.number().nonnegative(),
  associatedCosts: z.array(AssociatedCost),
  projectId: z.string(),
});

export const FixedCost = z.object({
  id: z.string(),
  name: z.string(),
  amount: z.number().nonnegative(),
  frequency: z.enum(['monthly','annual']), // 'upfront' deprecated
  category: z.string(),
  projectId: z.string(),
});

export const UpfrontCost = z.object({
  id: z.string(),
  name: z.string(),
  amount: z.number().nonnegative(),
  projectId: z.string(),
});

export const Project = z.object({
  version: z.literal(1),
  id: z.string(),
  name: z.string(),
  currency: Currency,
  createdAt: z.string(),
  updatedAt: z.string(),
  fixedCosts: z.array(FixedCost),
  upfrontCosts: z.array(UpfrontCost).default([]),
  products: z.array(Product),
  productSales: z.record(ProductSales).default({}),
  sharedId: z.string().optional(),
});
export type Project = z.infer<typeof Project>;
```

---

## 2) Enforce in LocalStorage (projectStorage)

- Update `projectStorage.getAllProjects` and `getProjectById` to:
  - Parse raw JSON then validate with the Zod `Project` (or array) schema.
  - Apply migrations (see section 4) to normalize legacy data to the latest schema.
  - Fill defaults for missing fields.
- Ensure `createProject` and `updateProject` always set `updatedAt` and dispatch `projectChange`.
- Create small helpers to avoid ad hoc storage edits:
  - `upfrontCostStorage` with `get`, `create`, `update`, `delete` using `projectStorage.updateProject`.
  - `productSalesStorage` for reading/updating `project.productSales`.
- Refactor `src/app/projects/[id]/upfront-costs/page.tsx` to use `upfrontCostStorage` instead of direct `localStorage` access.

---

## 3) Consolidate upfront costs representation

- Migration rule: move any `FixedCost` with `frequency === 'upfront'` into `Project.upfrontCosts`.
- Remove `'upfront'` from the `FixedCost.frequency` union going forward.
- Keep backward compatibility in charts and calculations only through the migration (not by computing both).

---

## 4) Migrations and normalization

- Create `src/lib/domain/migrations.ts` with:
  - `migrateProject(input: unknown): Project` that:
    - Validates input shape with permissive schema (or safe parsing).
    - Converts legacy fields: upfront fixed costs → `upfrontCosts`.
    - Adds `version` if missing; sets defaults for `upfrontCosts` and `productSales`.
    - Returns an object conforming to the latest `Project` schema.
- Call `migrateProject` inside `projectStorage` load functions and Supabase reads.

Example (sketch):
```ts
export function migrateProject(raw: unknown): Project {
  // parse unknown → partial, then normalize
  // 1) coerce currency to allowed enum
  // 2) move legacy upfront fixed costs into upfrontCosts
  // 3) ensure defaults and version
  // 4) validate with final Project schema (throws on irrecoverable data)
}
```

---

## 5) Supabase boundary safety

- On write: validate `project` with `Project` schema before upserting to Supabase `shared_projects.project_data`.
- On read: validate and migrate `project_data`, persist updated data back if a migration occurred (optional) and return normalized `Project` object.
- Include `version` in the stored `project_data`.

---

## 6) AI schema alignment

- Update `src/app/api/ai/cost-ideas/schema.ts`:
  - `currency` → `z.enum(['GBP','USD','EUR'])` to match domain `Currency`.
  - Consider adding `kind: 'annual'` or document mapping: `'one-time'` → `UpfrontCost`, `'monthly'` → monthly `FixedCost`.
- If/when AI suggestions are ingested into projects, add a small translation layer that converts AI output into domain entities validated by the domain schema before persistence.

---

## 7) Remove duplicate legacy types

- Replace `src/lib/types.ts` with re-exports from `src/lib/domain/types.ts` (or remove it) to prevent drift.

---

## 8) Fix product duplication bug

- In `productStorage.duplicateProduct`, set the copied `associatedCosts[].productId` to the new product id before saving.

---

## 9) Documentation and examples

- Update `ai/storage-example.json` to reflect the unified model:
  - Include `version`, `upfrontCosts`, and `productSales` fields.
  - Ensure `FixedCost.frequency` excludes `'upfront'`.
- Add `docs/data-model.md` explaining the domain model, persistence boundaries, and migration policy.

---

## 10) Rollout plan (incremental, safe)

1. Add `domain/schema.ts`, `domain/types.ts`, and `domain/migrations.ts` (no functional change yet).
2. Update `projectStorage` to validate + migrate on load and validate on write.
3. Introduce `upfrontCostStorage` and `productSalesStorage`; refactor the upfront-costs page to use them.
4. Migrate upfront fixed costs → `upfrontCosts`; remove `'upfront'` from `FixedCost.frequency` in types and UI forms.
5. Fix `productStorage.duplicateProduct` to set `associatedCosts[].productId`.
6. Validate Supabase read/write with schema; persist `version`.
7. Align AI schema currency and document mapping for `kind`.
8. Replace/remove `src/lib/types.ts` to avoid duplication.
9. Update `ai/storage-example.json` and add `docs/data-model.md`.

Each step should compile and run independently; favor small PRs with UI sanity checks.

---

## Acceptance criteria

- All type imports come from `src/lib/domain/types`.
- LocalStorage and Supabase data load paths validate and migrate to the latest `Project` schema.
- Upfront costs exist only in `Project.upfrontCosts`; no UI or logic depends on `FixedCost.frequency === 'upfront'`.
- Product duplication sets correct `associatedCosts[].productId`.
- AI cost ideas schema uses domain currency enum; ingestion (if implemented) produces valid domain entities.
- `ai/storage-example.json` matches the unified model.
- Docs exist for the data model and migrations.

---

## Risks and mitigations

- Legacy data variance: implement tolerant migration with logging and safe defaults.
- Runtime validation overhead: Zod parsing only at IO boundaries (LocalStorage/Supabase) to minimize cost.
- Type import churn: provide temporary re-exports to ease refactors.


