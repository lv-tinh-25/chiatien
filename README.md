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
percentage or by amount · multi-currency with automatic or manual exchange
rates · recurring expenses · reimbursements with prefilled settlement · income
as a negative expense · receipt scanning and category suggestion behind feature
flags · statistics by participant, category and month with drill-down · an
activity log · CSV and JSON export · installable as a PWA with an offline page.

## Running it

Requirements: Node 24 (pinned in `.nvmrc`) and PostgreSQL 16.

```bash
nvm use
npm install
brew services start postgresql@16   # or any PostgreSQL 16 server
createdb chiatien
cp .env.example .env                # then set POSTGRES_* to your database
npx prisma migrate deploy
npx prisma generate
npm run dev
```

The app is at http://localhost:3000. For a production run use `npm run build`
followed by `npm run start`.

## Configuration

`DEFAULT_CURRENCY_CODE` sets the currency pre-selected on the new-group form
(`VND` by default). The rest of `.env.example` is opt-in: `ENABLE_EXPENSE_DOCUMENTS`
with `S3_*` for receipt attachments, `ENABLE_RECEIPT_EXTRACT` and
`ENABLE_CATEGORY_EXTRACT` with `OPENAI_API_KEY` for the two AI features, and
`ANALYTICS_PROVIDER` for analytics. Every flag is off unless set, and each one
is enforced on the server as well as in the interface.

## Working on it

```bash
npm test              # Jest, covering src/lib
npm run check-types   # tsc --noEmit
npm run lint          # ESLint
npm run e2e           # Playwright; it builds and starts the app itself
npm run storybook     # component states
```

`CLAUDE.md` holds the working rules: what is ported and must not change, the
comment and typing policy, the colour-token rule, and the branch and commit
conventions. `docs/superpowers/specs/` holds the design specification and
`docs/superpowers/plans/` the implementation plans.

## Licence

MIT, as is spliit. See `LICENSE`.
