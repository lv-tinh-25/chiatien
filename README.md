# ChiaTien

A self-hosted group expense splitter with a Vietnamese-first interface.

Create a group, share its link, record who paid for what, and see who owes whom
and the shortest set of transfers that clears every debt. No accounts: a group
is reached by its URL, and each browser remembers the groups it has visited.

The database schema, split algorithms, settlement suggestions and API are
ported from [spliit](https://github.com/spliit-app/spliit) (MIT). The interface
is written from scratch.

## Features

Groups shared by URL with a QR code · expenses split evenly, by shares, by
percentage or by amount · one currency per group, fixed once the group holds
expenses · recurring expenses · reimbursements with prefilled settlement ·
income as a negative expense · receipt scanning and category suggestion behind
feature flags · statistics by participant, category and month with
drill-down · an activity log · CSV and JSON export · installable as a PWA
with an offline page.

## Running it

Requirements: Node 24 (pinned in `.nvmrc`) and PostgreSQL 16.

```bash
nvm use
npm install                         # postinstall generates the Prisma client
brew services start postgresql@16   # or any PostgreSQL 16 server
createdb chiatien
cp .env.example .env                # then set POSTGRES_* to your database
npm run db:migrate
npm run dev
```

The app is at http://localhost:3000. For a production run use `npm run build`
followed by `npm run start`.

## Configuration

`POSTGRES_PRISMA_URL` and `POSTGRES_URL_NON_POOLING` are the only required
variables: the app connects through the first, migrations through the second.
`BASE_URL` is the address the app puts in the links and QR codes it hands out,
and defaults to `http://localhost:3000` — a deployed instance has to set it.
`DEFAULT_CURRENCY_CODE` sets the currency pre-selected on the new-group form
(`VND` by default).

The rest of `.env.example` is opt-in: `ENABLE_EXPENSE_DOCUMENTS` with `S3_*`
for receipt attachments, `ENABLE_RECEIPT_EXTRACT` and
`ENABLE_CATEGORY_EXTRACT` with `OPENAI_API_KEY` for the two AI features, and
`ANALYTICS_PROVIDER` for analytics. Every flag is off unless set, and each one
is enforced on the server as well as in the interface.

## Deploying

A host needs the repository, Node, and a reachable PostgreSQL — nothing else.
`npm install` generates the Prisma client, which is not committed, and
`.vercelignore` keeps the development files out of an upload. Run migrations as
part of the build, as `prisma migrate deploy && next build`, and set the three
variables above.

## Working on it

```bash
npm test              # Jest, covering src/lib
npm run check-types   # tsc --noEmit
npm run lint          # ESLint
npm run build         # e2e serves this build, so it has to come first
npm run e2e           # Playwright, against the build above
npm run storybook     # component states

# Regenerate docs/screenshots and the app icons after a visual change
npx playwright test --config playwright.screenshots.config.ts
```

`CLAUDE.md` holds the working rules: what is ported and must not change, the
comment and typing policy, the colour-token rule, and the branch and commit
conventions. `docs/superpowers/specs/` holds the design specification and
`docs/superpowers/plans/` the implementation plans.

## Licence

MIT, as is spliit. See `LICENSE`.
