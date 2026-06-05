# Convex

**Applies to:** `packages/backend/convex/**/*.ts`
**Mirror of:** `.cursor/rules/convex.mdc` — keep in sync.

## Folder structure

Group by domain. Each domain folder contains separate files per function kind:

```
convex/
  users/
    queries.ts
    mutations.ts
    actions.ts
  posts/
    queries.ts
    mutations.ts
    actions.ts
```

Do not dump everything into one `users.ts`. Split by `queries.ts` / `mutations.ts` / `actions.ts`.

## Components

Prefer official Convex components (rate limiting, workflows, agents, sharded counter, etc.) over hand-rolled equivalents. Register them in `convex.config.ts`. Check https://www.convex.dev/components before building from scratch.

## ConvexError for client-consumed functions

Any `query` / `mutation` / `action` called from the client MUST throw `ConvexError`, not `Error`. The frontend reads `error.data` to render messages — plain `Error` is swallowed in production.

```ts
import { ConvexError } from "convex/values"

if (!user) throw new ConvexError({ code: "NOT_FOUND", message: "User not found" })
```

Plain `throw new Error(...)` is only acceptable inside `internal*` functions or helpers never reached by the client.

## Internal functions

If a function is not consumed by the client, define it as `internalQuery` / `internalMutation` / `internalAction` and call it via `internal.module.fn`. Never expose backend-only logic via public `query` / `mutation` / `action`.

Rule of thumb: if no React component imports it through `api.*`, it must be `internal*`.

## Schema changes

Schema lives in `packages/backend/convex/schema.ts`. When adding fields:

- Make new fields `v.optional(...)` if existing rows won't have them, otherwise the deploy will fail.
- Add indexes (`.index(...)`) for any field you query by — Convex won't full-scan for you in production safely.
- Re-run dev so `_generated/api.d.ts` and `_generated/dataModel.d.ts` regenerate before importing the new types in app code.
