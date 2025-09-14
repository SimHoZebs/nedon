AGENTS: repository agent guidelines

- Build & dev: `pnpm install` then `pnpm run dev` (starts Docker + Next dev).
- Production: `pnpm run build` && `pnpm run start` (or `pnpm run vercel-build`).

- Lint & format: `pnpm run format` (`biome check . --write`).
- Type Check: `pnpm tsc`.

- TypeScript: `strict: true`. Add explicit types for exported functions and component props; prefer interfaces for props.
- Runtime validation: use `zod` schemas at server/router boundaries for external data.
- React: functional components only; use explicit prop typings (interfaces/`React.FC`) and call hooks only at top level.
- Naming & files: camelCase for vars/functions; PascalCase for components/types; component files live in `lib/comp`.
- Imports: external packages → `@/comp/*` → `@/util/*` → `@/types/*` → relative (`./`); use path aliases.
  - Note: Path aliases are limited to the ones defined in `tsconfig.json`.
- Formatting: 2-space indentation; run `pnpm run format` before submitting changes.
- Error handling: log errors with context, return `null` where router procedures expect it, and narrow DB errors (e.g., `PrismaClientKnownRequestError`).

- Lint & CI: run `pnpm run format` locally before proposing larger refactors.
- Git rules: agents must not push or modify git config; prepare concise commit messages that explain "why".
- Cursor/Copilot: no `.cursor/rules/`, `.cursorrules`, or `.github/copilot-instructions.md` found.
- Keep changes minimal and focused; ask maintainers before broad refactors.
- When in doubt, run `pnpm run format` and include linter output in PR if applicable.

## Project Overview

Nedon is a full-stack finance tracker application built with Next.js, TypeScript, and tRPC. It aims to provide a more detailed and accurate way to track expenses compared to traditional banking apps. Key features include:

*   **Transaction Splitting:** Split transactions with other users or groups.
*   **Multi-category Transactions:** Assign multiple categories to a single transaction.
*   **Group Spending Overview:** Visualize and manage spending for a group of users.
*   **Plaid Integration:** Connect to bank accounts via Plaid to automatically import transactions.
*   **Receipt Scanning:** (Planned) AI-powered receipt scanning to automatically extract transaction details.

The application uses a PostgreSQL database with Prisma as the ORM. The frontend is built with React and Tailwind CSS.

## Development Conventions

- **API:** The API is built with tRPC. The main router is in `server/routers/_app.ts`, and individual routers are in the `server/routers` directory.
- **Database:** The database schema is defined in `prisma/schema.prisma`. Use `prisma migrate dev` to create and apply migrations.
- **Input Validation:** Zod schemas are used for type-safe input validation in tRPC routers. These schemas are often generated from the Prisma schema.

## Documentation

Architectural decisions are documented in the `/docs` directory. Please follow these conventions:
*   **Location:** Key decisions are stored in `docs/architecture.md`.
*   **Format:** Use a concise, question-and-answer (FAQ) format.
*   **Focus:** Prioritize explaining the "why" behind a decision, not just the "what".
