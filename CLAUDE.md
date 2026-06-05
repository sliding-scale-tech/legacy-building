# Legacy Building — Claude rules

This file is loaded at the start of every Claude Code session in this repo. **Read the imported rule files below before making any changes to the codebase.** They mirror the cursor rules in `.cursor/rules/` so both editors stay in sync.

If you edit one of the rules below, update the matching `.cursor/rules/*.mdc` file too.

## Repo layout (quick reference)

- `apps/web` — Vite + React + TanStack Router web client. Auth via Clerk, data via Convex.
- `apps/native` — React Native app (Uniwind styling, HeroUI Native primitives).
- `apps/admin` — admin dashboard (shares `packages/ui` tokens with web).
- `packages/ui` — shared shadcn components, design tokens (`src/styles/globals.css`, `src/lib/brand-journal.ts`), shared hooks.
- `packages/backend/convex` — Convex schema, queries, mutations, actions. One folder per domain.
- `packages/env`, `packages/config`, `packages/assets` — shared env, tsconfig/biome, static assets.

## How to work in this repo

- Use `pnpm` (workspace is pnpm + Turbo). Never `npm` / `yarn`.
- Before claiming a web change is done, run `pnpm --filter web check-types` (this also regenerates the TanStack route tree).
- Routes are file-based under `apps/web/src/routes/`. Adding a file there auto-updates `routeTree.gen.ts` on the next build/dev — don't hand-edit the generated tree.
- Centralise route paths in `apps/web/src/lib/routes.ts`; never hardcode `"/dashboard/..."` strings in components.
- Convex schema lives in `packages/backend/convex/schema.ts`. New tables / fields go there first, then the generated types flow into `api.*`.

## Imported rule files

Read these before editing the matching areas of the codebase. The header in each file lists the globs it applies to.

- @.claude/rules/ui-styling.md — shadcn, theme tokens, micro-interactions (applies to all `.tsx` / `.ts` / `.css`).
- @.claude/rules/ux-patterns.md — required UX checklist for every screen / feature in `apps/**`.
- @.claude/rules/convex.md — folder structure, `ConvexError`, internal-vs-public functions for `packages/backend/convex/**`.
- @.claude/rules/forms-zod-react-hook-form.md — required stack and conventions for forms in `apps/web`.
- @.claude/rules/native-uniwind-styling.md — Uniwind styling rules for `apps/native/**`.

## House style (universal)

- TypeScript strict everywhere; no `any` unless justified inline with a comment.
- Tabs for indentation (matches existing files and biome config).
- Imports: package imports first, then `@legacy-building/*` workspace imports, then `@/` aliases, then relative. Biome handles ordering on save.
- Prefer named exports. Default exports only for route files / framework-required entry points.
- Don't create `*.md` documentation files unless the user asks. Don't add emojis to source files unless asked.
- Don't delete or fork generated files (`routeTree.gen.ts`, `_generated/`); regenerate them via the proper tool instead.
