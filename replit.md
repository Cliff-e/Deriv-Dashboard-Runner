# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally
- `pnpm --filter @workspace/ddbot-app run dev` — run imported DDBOt dashboard locally

## Imported Projects

- `artifacts/ddbot-app` contains the imported DDBOt Deriv trading bot dashboard from `https://github.com/Cliff-e/DDBOt`.
- DDBOt is a client-side React/TypeScript Rsbuild app. Main entry: `index.html` → `src/main.tsx`.
- Deriv WebSocket connection is created in `src/external/bot-skeleton/services/api/appId.js` using `wss://<server>/websockets/v3?app_id=<app_id>`.
- The app is registered as the root web artifact and runs with `rsbuild dev` on the Replit-assigned `PORT`.
- Deriv UI/runtime dependencies are pinned to versions compatible with the imported app, including `@deriv-com/translations@1.4.0` and `@deriv/quill-icons@2.4.10`.
- Google Drive integration is optional in this environment; when Google credentials are not configured, the dashboard continues to run and Google Drive actions show a configuration notice instead of blocking startup.

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
