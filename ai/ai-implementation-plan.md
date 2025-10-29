### LLM Integration: First Test Plan (Vercel AI SDK + OpenAI)

This plan introduces a minimal, safe, and testable LLM feature using the Vercel AI SDK with OpenAI. It adds a new project-level page where a user can input a business idea, click a button to “Get ideas for costs,” and see structured, streamed responses rendered as simple cards.

References:
- AI SDK overview: [ai-sdk.dev/docs/introduction](https://ai-sdk.dev/docs/introduction)
- Object generation UI: [ai-sdk.dev/docs/ai-sdk-ui/object-generation](https://ai-sdk.dev/docs/ai-sdk-ui/object-generation)

### Decisions Confirmed
- Model: `openai('gpt-5-nano')`.
- Page route: `projects/[id]/ai-lab`.
- API route: global `api/ai/cost-ideas`.
- Currency: default `USD` for first test.
- Constraints: none for now; keep `maxDuration = 30s` for streaming.

### Scope (First Test)
- Client page at `projects/[id]/ai-lab` with:
  - A textarea for freeform business idea input.
  - A “Get ideas for costs” button.
  - A simple list of cards rendering the streamed, structured response.
- Server API endpoint using AI SDK’s `streamObject` to return strongly-typed JSON via a `zod` schema.
- Minimal prompt that asks the model to produce plausible cost ideas for a business.
- Basic loading/error states; no persistence, auth changes, or navigation changes.

### Architecture Overview
- Client: React component uses AI SDK UI `useObject` (experimental) to stream structured object output that is validated with `zod` on the server.
- Server: Next.js App Router API route calls OpenAI via AI SDK Core `streamObject`, returning a streamed text response (AI SDK’s text stream response protocol).
- Schema: Shared `zod` schema in a co-located file so both client and server import the same types.

### Data Contract (Zod Schema)
Server schema module (imported by both client and server):
- `CostIdea` fields (initial version):
  - `title: string` — short, human-readable name.
  - `category: string` — e.g., “software”, “rent”, “marketing”, “equipment.”
  - `kind: 'one-time' | 'monthly'` — cost type.
  - `estimate: { amount: number; currency: string }` — rough estimate; currency initially fixed to `USD`.
  - `description: string` — one or two sentences rationale.
  - `confidence: 'low' | 'medium' | 'high'` — optional model confidence.
- Root shape:
  - `{ costIdeas: CostIdea[] }`

This shape is deliberately simple so we can quickly render cards. We can later map categories to the app’s `fixedCostCategories` or enrich with product context.

### File/Module Additions
Packages to add:
- `ai` (Vercel AI SDK Core)
- `@ai-sdk/react` (AI SDK UI)
- `@ai-sdk/openai` (OpenAI provider)
- `zod`

Environment:
- Add `OPENAI_API_KEY` to `.env.local` (do not prefix with `NEXT_PUBLIC_`). No other config required for first test.

New files:
- `src/app/api/ai/cost-ideas/schema.ts`
  - Exports `costIdeasSchema` (root) and `costIdeaSchema` (item) using `zod`.
- `src/app/api/ai/cost-ideas/route.ts`
  - Exposes `POST` handler.
  - Uses `streamObject` with `openai(modelName)` to produce a validated streamed object matching `costIdeasSchema`.
  - Accepts JSON body: `{ idea: string }` and optional `{ currency?: string }`.
  - Returns `result.toTextStreamResponse()` (per AI SDK pattern).
  - `export const maxDuration = 30` to allow streaming.
- `src/app/projects/[id]/ai-lab/page.tsx`
  - Client component using `experimental_useObject as useObject` from `@ai-sdk/react`.
  - Imports `costIdeasSchema` from the API schema module.
  - Renders: textarea, button, and streamed `object?.costIdeas` as cards using existing `src/components/ui/card.tsx`.
  - Handles `isLoading`, `error`, and `stop()` (optional) per docs.

### Prompting (Initial)
System/Instructions (in server route):
- “You generate plausible startup cost ideas. Output must strictly match the provided JSON schema. Do not include extra fields. If unsure, leave short descriptions but keep the structure valid.”

User content:
- Business idea text from the form.

Guidance:
- Ask for 6–12 items with a mix of one-time and monthly costs.
- Keep descriptions concise; constrain amounts to be reasonable ranges.

### UX Flow
1) User navigates to `projects/[id]/ai-lab`.
2) Enters a business idea (textarea).
3) Clicks “Get ideas for costs.”
4) The client triggers `useObject.submit(idea)` to `POST /api/ai/cost-ideas`.
5) Cards render progressively as `object.costIdeas` streams in.
6) On completion, the user sees the full set; they can adjust the idea and retry.

### Error, Loading, and Cancel
- Display a single generic error message. Avoid leaking server details.
- Disable the button while loading; show a simple loading indicator.
- Optional “Stop” button that calls `stop()` to cancel streaming (supported by `useObject`).

### Model Choice & Settings (Initial)
- Default: `openai('gpt-5-nano')` per preference.
- Temperature: ~0.7 to encourage variety.
- Max output tokens: modest, since schema constrains size.

### Security & Safety
- No PII expected; still avoid echoing secrets.
- Server validates output via `zod`; if validation fails, return a generic error.
- Enforce reasonable `maxDuration` (30s) and consider minimal input length checks.
- Client never calls OpenAI directly; it only calls the internal `/api/ai/cost-ideas` endpoint.
- The API route runs exclusively server-side; `OPENAI_API_KEY` lives only in server env and is never sent to the client.
- Do not use `NEXT_PUBLIC_` for secrets; keep them unprefixed so Next.js does not bundle them.
- Sanitize errors returned to the client; log minimal metadata server-side (e.g., timestamps, request ids) without provider responses.
- Keep prompts free of secrets; do not inject any secret or internal config values into model prompts.
- Consider simple rate limiting and auth checks in future iterations; default same-origin helps restrict access during testing.

### Test Plan
- Local run with `.env.local` containing `OPENAI_API_KEY`.
- Try several ideas (e.g., coffee shop, SaaS tool, food truck) and verify:
  - Streamed cards appear progressively.
  - All fields match schema and render without undefined errors.
  - Error path: simulate network failure and confirm generic error renders.

### Future Enhancements (Post-Pilot)
- Map `category` to `lib/constants/fixedCostCategories` to standardize.
- Add CTA to convert selected cost ideas into actual fixed costs via existing storage.
- Add project context (e.g., known products, location) to the prompt.
- Persist the last response on a per-project basis.
- Add telemetry and rate limiting.

### Implementation Steps Checklist
1) Install deps: `ai`, `@ai-sdk/react`, `@ai-sdk/openai`, `zod`.
2) Add `OPENAI_API_KEY` to `.env.local`.
3) Create `schema.ts` under `api/ai/cost-ideas` with the `zod` schemas.
4) Create `route.ts` using AI SDK `streamObject` with OpenAI provider.
5) Create `projects/[id]/ai-lab/page.tsx` using `useObject` and render cards.
6) Manual test locally and iterate on the schema/prompt for quality.


