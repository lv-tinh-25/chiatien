# CLAUDE.md

Guidance for Claude Code when working in this repository.

## What this is

ChiaTien is a self-hosted group expense splitter. Its core — database schema, split
algorithms, settlement suggestions, tRPC API — is ported from
[spliit](https://github.com/spliit-app/spliit) (MIT). The entire UI is written from
scratch. Feature parity with spliit is deliberate: nothing added, nothing removed.

Vietnamese is the primary display language; English is the fallback locale and the
language of the codebase.

## Absolute rules

### 1. Never push. Ever.

This repository must not leave this machine. Do not add a git remote, do not run
`git push`, do not use `gh`, do not open pull requests on any host. Work stops at a
local commit. This is a policy constraint, not a preference.

### 2. English in code, Vietnamese in `messages/vi/`

Identifiers, file names, branch names, commit messages, documentation and comments are
English. Vietnamese exists only as translated strings in `messages/vi/*.json`. Never
hardcode display text in a component — every user-visible string goes through
`next-intl`.

### 3. Comment only non-obvious *why*

A comment earns its place when it explains an invariant, a workaround, or a deliberate
deviation from the obvious approach. Never narrate what the code does. Never comment
CSS, HTML or JSX structure. When in doubt, delete it.

### 4. No `any`, no type assertions, no error suppression

`any`, `as`, `@ts-ignore` and `@ts-expect-error` are forbidden. Narrow with type guards
and `unknown` instead.

### 5. Semantic colors only

Never write a hex value, an `rgb()`, or a Tailwind palette class such as `bg-green-100`
in a component. Use the semantic tokens defined in `src/styles/globals.css`
(`bg-primary`, `text-credit`, `border-border`, …). `--debit` and `--destructive` are
distinct tokens even though they render the same red: debt is not an error.

### 6. Logic lives in hooks, components only compose

A component in `templates/` reads like a layout: it destructures from one hook and
renders. No `useState`, no `useEffect`, no data transformation in a template's
`index.tsx`. Pure functions belong in `src/lib/` where they can be unit-tested.

## Commands

```bash
npm run dev            # Next.js dev server
npm test               # Jest unit tests (src/lib)
npm run check-types    # tsc --noEmit
npm run lint           # ESLint
npm run e2e            # Playwright, against a docker compose stack
npm run storybook      # Component states
npx prisma migrate dev # Create and apply a migration
npx prisma studio      # Inspect the database
```

Run heavy TypeScript commands one at a time — this machine has limited free RAM and
three of them in one shell will crash it.

## Git workflow

Branch names are `<type>/<kebab-scope>`:

| Prefix      | Use for                                 |
| ----------- | --------------------------------------- |
| `feat/`     | a new screen or capability              |
| `update/`   | changing something that already exists  |
| `fix/`      | a bug fix                               |
| `refactor/` | restructuring without behaviour change  |
| `chore/`    | config, dependencies, tooling           |
| `test/`     | tests only                              |
| `docs/`     | documentation only                      |

Commits follow Conventional Commits: `type(scope): subject`, imperative mood, 72
characters or fewer. The commit author is the repository owner; never add a Claude
co-author trailer.

Merge into `main` with `git merge --no-ff` so each slice keeps its own history. The
merge message uses the pull-request format even though no pull request is ever opened:

```
type(scope): subject

## What
## Why
## Test
```

Before merging, all of these must hold: `npm test` green, `npm run check-types` green,
`npm run lint` green, the e2e specs covering the slice green, no `any`/`as`, no
hardcoded colors or display strings.

## Architecture

```
prisma/              schema + migrations, ported unchanged
messages/{vi,en-US}/ namespaced translations
e2e/                 Playwright specs ported from spliit
src/
  app/               routing, metadata and providers only — no business components
  components/core/   atoms/ molecules/ templates/
  hooks/             all screen state and logic, grouped by feature
  lib/               pure functions and data access, ported unchanged, unit-tested
  trpc/              routers and procedures, ported unchanged
  stores/            zustand, persisted to localStorage
  i18n/ constants/ types/ utils/ styles/
```

`src/lib` and `src/trpc` are ported code. Treat them as a stable contract: changing
them means changing behaviour, which is out of scope. If a screen seems to need a
change there, stop and raise it.

## Testing

Unit tests cover `src/lib` only. Templates and atoms are verified through Playwright
and Storybook, not through component unit tests — the logic they would test lives in
hooks and lib.

Playwright specs are written against **English** labels and run with `NEXT_LOCALE=en-US`
pinned in `e2e/fixtures.ts`. Three things must therefore stay stable: the routes, the
`data-testid` attributes (`expense-card`, `paid-by`, `split-mode`, `balance-row`,
`reimbursement-row`), and the English strings in `messages/en-US/`. A red spec means
behaviour broke, not that the test is outdated.

The Playwright viewport is 1280×900. `useMediaQuery` swaps Radix Dialog for Vaul Drawer
below 768px, so a narrower viewport renders a different component tree.

## Design

The visual language is specified in `docs/superpowers/specs/`. Colors, type scale,
radii and spacing come from a design reference; the implementation maps them to semantic
CSS variables. Plus Jakarta Sans must be loaded with the `vietnamese` subset or
diacritics fall back to a different font and break the baseline.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
