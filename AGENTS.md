AGENTS: repository agent guidelines

- Build & dev: `pnpm install` then `pnpm run dev` (starts Docker + Next dev).
- Production: `pnpm run build` && `pnpm run start` (or `pnpm run vercel-build`).
- Tests: `pnpm test` (vitest). Single test: `pnpm test -- -t "<name regex>"` or `pnpm test -- tests/path/to/file.test.ts`.
- Lint & format: `pnpm run biome` (lint) and `pnpm run format` (`prettier --write . && biome check . --write`).

- TypeScript: `strict: true`. Add explicit types for exported functions and component props; prefer interfaces for props.
- Runtime validation: use `zod` schemas at server/router boundaries for external data.
- React: functional components only; use explicit prop typings (interfaces/`React.FC`) and call hooks only at top level.
- Naming & files: camelCase for vars/functions; PascalCase for components/types; component files live in `lib/comp`.
- Imports: external packages → `@/comp/*` → `@/util/*` → `@/*` → relative (`./`); use path aliases and let Prettier/Biome organize.
- Formatting: 2-space indentation; run `pnpm run format` before submitting changes.
- Error handling: log errors with context, return `null` where router procedures expect it, and narrow DB errors (e.g., `PrismaClientKnownRequestError`).

- Tests & CI: run `pnpm test` and `pnpm run biome` locally before proposing larger refactors.
- Git rules: agents must not push or modify git config; prepare concise commit messages that explain "why".
- Cursor/Copilot: no `.cursor/rules/`, `.cursorrules`, or `.github/copilot-instructions.md` found.
- Keep changes minimal and focused; ask maintainers before broad refactors.
- When in doubt, run `pnpm run biome` and `pnpm test` and include failing test output in PR.