# UI & Styling

**Applies to:** `**/*.{tsx,ts,css}`
**Mirror of:** `.cursor/rules/ui-styling.mdc` — keep in sync.

## shadcn components

Do not overwrite or fork the default shadcn component code. Compose and extend via props / `className` / wrapper components instead. If you need a variant, add it via `cva` variants on a wrapper — leave the generated primitive untouched so future `shadcn add` updates stay clean.

## Colors

Use the CSS variable color tokens (e.g. `bg-background`, `text-foreground`, `bg-primary`, `text-muted-foreground`, `border-border`, `bg-destructive`) — never hardcode hex / `rgb()` / arbitrary `bg-[#...]` values in components.

**Where to add new tokens:**

- Default: add to the shared `packages/ui/src/styles/globals.css`. It's consumed by both `apps/web` and `apps/admin`, so any new color is available everywhere.
- App-specific override only: if the token is explicitly meant for one app and must not leak to the other, add it to that app's `apps/<app>/src/index.css`. Call this out in the PR / commit message.

When in doubt, put it in the shared `packages/ui` `globals.css`.

For the journal/dashboard aesthetic, brand values are exposed as constants in `packages/ui/src/lib/brand-journal.ts` (`brand.primary`, `brand.libraryMint`, etc.) — prefer those constants over duplicating hex values in components.

## Micro interactions

Every interactive element must give subtle visual feedback. Defaults:

- Buttons / links: `transition-colors` + `hover:` and `active:` states; `active:scale-[0.98]` for tactile feel.
- Cards / list rows that are clickable: `transition-all hover:bg-accent hover:shadow-sm`.
- Icon buttons: `transition-transform hover:scale-110`.
- Focus: rely on shadcn's `focus-visible:ring` — do not strip it.
- Use Framer Motion (`motion/react`) for entrance/exit, layout, and shared-element animations. Keep durations short (150–250ms) and easing soft (`ease-out`).

Never ship a clickable element with no hover / active / focus state.
