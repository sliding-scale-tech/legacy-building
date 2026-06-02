# mobile-starter

This project was created with [Better-T-Stack](https://github.com/AmanVarshney01/create-better-t-stack), a modern TypeScript stack that combines React, TanStack Router, React Native, Expo, Convex, Clerk, TailwindCSS, shadcn/ui, Biome, and Turborepo.

## Project Structure

```text
mobile-starter/
├── apps/
│   ├── admin/       # Admin app (React + Vite + TanStack Router)
│   ├── native/      # Mobile app (React Native + Expo)
│   └── web/         # Web app (React + Vite + TanStack Router)
├── packages/
│   ├── backend/     # Convex backend functions and schema
│   ├── config/      # Shared TypeScript config
│   ├── env/         # Shared environment parsing
│   └── ui/          # Shared shadcn/ui components and styles
```

## Prerequisites

- Node.js
- pnpm `10.28.0`
- A Convex account/project
- A Clerk application
- Expo Go or native Android/iOS tooling for the mobile app

## Setup

Install dependencies from the project root:

```bash
pnpm install
```

Set up Convex:

```bash
pnpm run dev:setup
```

Follow the Convex prompts to create or connect a development deployment. This creates `packages/backend/.env.local`.

Create the app environment files:

- `apps/web/.env`
- `apps/admin/.env`
- `apps/native/.env`
- `packages/backend/.env.local`

Use these variables:

```bash
# apps/web/.env
# apps/admin/.env
VITE_CONVEX_URL=
VITE_CLERK_PUBLISHABLE_KEY=

# apps/native/.env
EXPO_PUBLIC_CONVEX_URL=
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=

# packages/backend/.env.local
CONVEX_DEPLOYMENT=
CONVEX_URL=
CONVEX_SITE_URL=
```

For Clerk authentication, follow the [Convex + Clerk guide](https://docs.convex.dev/auth/clerk), then set `CLERK_JWT_ISSUER_DOMAIN` in the Convex dashboard.

## Start The Project

Start everything with Turborepo:

```bash
pnpm run dev
```

Or start one app/service at a time:

```bash
pnpm run dev:server
pnpm run dev:web
pnpm run dev:admin
pnpm run dev:native
```

The web and admin apps run through Vite. Open the local URL shown in the terminal, usually [http://localhost:5173](http://localhost:5173). The native app starts Expo; use Expo Go or an emulator/simulator to open it.

## Available Scripts

- `pnpm run dev`: Start all apps/services in development mode
- `pnpm run dev:server`: Start the Convex backend
- `pnpm run dev:web`: Start the web app
- `pnpm run dev:admin`: Start the admin app
- `pnpm run dev:native`: Start the Expo native app
- `pnpm run dev:setup`: Configure the Convex project
- `pnpm run build`: Build all apps/packages
- `pnpm run check-types`: Check TypeScript types across the workspace
- `pnpm run check`: Run Biome formatting and linting
- `pnpm run prepare`: Initialize Husky git hooks

## UI Customization

React web apps in this stack share shadcn/ui primitives through `packages/ui`.

- Change design tokens and global styles in `packages/ui/src/styles/globals.css`
- Update shared primitives in `packages/ui/src/components/*`
- Adjust shadcn aliases or style config in `packages/ui/components.json`, `apps/web/components.json`, and `apps/admin/components.json`

Import shared components like this:

```tsx
import { Button } from "@mobile-starter/ui/components/button";
```

### shadcn CLI in this monorepo

Shared UI components live in `packages/ui`, but the shadcn CLI must run from a **Vite app workspace** (`apps/web` or `apps/admin`) because `packages/ui` has no framework config (`vite.config.ts`, etc.).

Run shadcn commands from the **project root** with `-c apps/web`:

```bash
# From mobile-starter/
pnpm dlx shadcn@latest <command> -c apps/web
```

`apps/web/components.json` routes shared installs to `@mobile-starter/ui/components` and theme updates to `packages/ui/src/styles/globals.css`.

### Apply a preset from the root

Use `apply` to switch style, theme, fonts, and reinstall detected UI components. Replace the preset code with yours from [shadcn/create](https://ui.shadcn.com/create).

```bash
# Full preset: theme, fonts, and shared UI components
pnpm dlx shadcn@latest apply --preset b3dRfZdAS0 --yes -c apps/web
```

After a successful apply:

1. Sync `style`, `baseColor`, `iconLibrary`, and related fields from `apps/web/components.json` into `packages/ui/components.json` and `apps/admin/components.json` if they drift.
2. Review the diff in `packages/ui` — custom shared files such as `auth-field-error.tsx` and `password-change-form.tsx` are not shadcn primitives and should be kept.
3. Run `pnpm run check-types` and visually check web/admin auth screens.

**Do not** run `apply` with `-c packages/ui`. The CLI will fail with “We could not detect a supported framework”.

`apply` does not support `--overwrite`. If the CLI skips a file because it looks identical, reinstall it with `add`:

```bash
pnpm dlx shadcn@latest add separator --overwrite --yes -c apps/web
```

Apply only theme and fonts without reinstalling components:

```bash
pnpm dlx shadcn@latest apply --preset b3dRfZdAS0 --only theme,font --yes -c apps/web
```

Inspect a preset before applying:

```bash
pnpm dlx shadcn@latest preset decode b3dRfZdAS0
```

### Add shadcn components from the root

Add new shared primitives to `packages/ui` via `apps/web`:

```bash
pnpm dlx shadcn@latest add accordion dialog popover sheet table --yes -c apps/web
```

Force overwrite an existing shared component:

```bash
pnpm dlx shadcn@latest add button --overwrite --yes -c apps/web
```

## Rename For A New App

This repo is a reusable template named `mobile-starter`. To spin up a new app, rename each naming surface intentionally (replace `mobile-starter` / `Mobile Starter` with your app's slug / display name):

- Root package name in `package.json`: `mobile-starter` to your slug
- Workspace package scope: `@mobile-starter/*` to `@your-app/*`
- Imports and TypeScript aliases using `@mobile-starter/...`
- Shared package names in `packages/*/package.json`
- App dependencies in `apps/*/package.json`
- Expo identity in `apps/native/app.json`: `scheme`, `name`, `slug`, and the android `package`
- User-facing branding from `Mobile Starter` (see `packages/ui/src/lib/brand.ts`) to your app name
- shadcn aliases in `components.json` files
- Root folder name, repository name, CI config, deployment project names, and docs if needed

After renaming, refresh the lockfile and verify the workspace:

```bash
pnpm install
pnpm run check-types
pnpm run build
pnpm run dev:native
```

Also check external services that may reference the old name or URL scheme:

- Clerk redirect URLs and publishable keys
- Convex project/deployment name
- Expo/EAS project settings
- App store bundle/package identifiers, if already configured
- Hosting/deployment settings for web and admin apps

## Formatting And Git Hooks

Initialize hooks:

```bash
pnpm run prepare
```

Format and lint:

```bash
pnpm run check
```
