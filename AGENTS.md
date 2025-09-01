AGENTS: repository agent guidelines

- Build / run: `pnpm install` then `pnpm run dev` (runs `docker compose up -d && next dev --turbopack`).
- Production build: `pnpm run build` then `pnpm run start` (or `pnpm run vercel-build` for Vercel).
- Tests: `pnpm test` (runs `vitest`).
- Run a single test: `pnpm test -- -t "<test name regex>"` or `pnpm test -- tests/path/to/file.test.ts`.
- Lint / format: `pnpm run biome` (linter) and `pnpm run format` (runs `prettier --write . && biome check . --write`).

- Editor / tooling: project uses TypeScript (`tsconfig.json`) with path aliases (`@/comp/*`, `@/util/*`, `@/types/*`). Use those aliases when importing internal modules.
- Prettier: `importOrder` is configured (see `.prettierrc`) - imports should be grouped: `@/comp/*`, `@/util/*`, `@/*`, then local (`^\./`). Keep `importOrderSeparation` and `importOrderSortSpecifiers` behavior.
- Biome: `.biome.json` enforces linter rules and auto-organize imports; prefer `biome check` and honor its `assist.organizeImports` groups.

- TypeScript: `strict: true` is enabled. Always add precise types for exported functions and component props. Prefer `zod` schemas for runtime validation when interacting with external data (server/routers follow this pattern).
- React: use functional components, prefer explicit `React.FC`-style prop typing or interface props. Keep hooks usage idiomatic (top-level only).
- Naming: use camelCase for variables and functions, PascalCase for React components and types/interfaces. Files for components live under `lib/comp`.
- Imports: use path aliases for internal imports (`@/comp/...`, `@/util/...`), group external packages before aliases, then relative imports. Let Prettier/biome reorder imports automatically.
- Error handling: log errors with context (see existing `console.log` usage) and return null where router procedures expect it. For DB errors, prefer narrowing by instance checks (e.g., `PrismaClientKnownRequestError`).
- Formatting: 2-space indentation, spaces not tabs (enforced by Biome/Prettier).

- Cursor / Copilot rules: no `.cursor/rules/` or `.cursorrules` found; no Copilot instructions in `.github/`. Agents should not expect special Cursor/Copilot rules.

- Commit / PR: agents should not push or modify git config. If making changes, prepare a concise commit message explaining the "why" (follow repo style) and ask the human to commit or approve.

Keep changes minimal and focused; run `pnpm run biome` and `pnpm test` locally before proposing large refactors.