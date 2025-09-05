# ChiaTien Phase 0 — Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up a running ChiaTien application with spliit's core ported and green, design tokens in place, localisation wired, and an empty but navigable shell — the base every screen slice builds on.

**Architecture:** Ported layers (`prisma/`, `src/lib`, `src/trpc`, `src/app/api`) move across unchanged and are proven by their own unit tests. Logic that spliit embedded in UI directories is extracted into `src/lib` under new tests before any UI exists. On top sits a fresh presentation base: semantic CSS variables, Plus Jakarta Sans, eight atoms with Storybook, and an `AppShell` that switches between a mobile bottom bar and a desktop sidebar.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Prisma 7 + PostgreSQL, tRPC 11 + TanStack Query, Tailwind CSS 4, Radix primitives, zustand, next-intl, Zod 4, Jest 30, Playwright 1.62, Storybook.

**Spec:** `docs/superpowers/specs/2026-09-05-chiatien-design.md`

## Global Constraints

- Never push. No git remote, no `gh`, no pull requests. Work stops at a local commit.
- Code, identifiers, file names, branches, commits and comments are English. Vietnamese exists only in `messages/vi/*.json`.
- Comments explain non-obvious *why* only. Never comment CSS, HTML or JSX.
- `any`, `as`, `@ts-ignore`, `@ts-expect-error` are forbidden.
- Colors come only from semantic tokens via `hsl(var(--token))`. No hex, no `rgb()`, no Tailwind palette classes in components.
- Display strings always go through `next-intl`. Never hardcode text in a component.
- Branches are `<type>/<kebab-scope>`; commits are Conventional Commits, imperative, ≤72 chars; merge with `git merge --no-ff`.
- Environment floors for this machine: Node 23.11.1, npm 10.9.2. Set `engines.node` to `>=22` — do **not** copy spliit's `>=24`/`>=11`.
- PostgreSQL is the local Homebrew `postgresql@16` service, database `chiatien`. Docker is not used.
- Free RAM is under 1 GB. Never run two heavy commands (build, e2e, Storybook, `tsc`) in the same shell invocation.
- Reference checkout of spliit for porting: `/private/tmp/claude-505/-Users-tinh-le-Documents-personal-projects/875ae05e-d698-4395-81ff-beb7754b279c/scratchpad/spliit` (commit `ae35cd6`). Referred to below as `$SPLIIT`.

---

### Task 1: Project scaffold and toolchain

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.mjs`, `postcss.config.js`, `eslint.config.mjs`, `.prettierrc`, `.prettierignore`, `jest.config.ts`, `reset.d.ts`, `.env.example`, `.env`
- Create: `src/app/layout.tsx`, `src/app/page.tsx`, `src/styles/globals.css`
- Test: `src/lib/smoke.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: a workspace where `npm test`, `npm run check-types` and `npm run lint` execute; path alias `@/*` → `src/*`.

- [ ] **Step 1: Create the branch**

```bash
cd /Users/tinh.le/Documents/personal-projects/chiatien
export SPLIIT=/private/tmp/claude-505/-Users-tinh-le-Documents-personal-projects/875ae05e-d698-4395-81ff-beb7754b279c/scratchpad/spliit
test -f "$SPLIIT/package.json" && echo "reference checkout ok"
git checkout -b chore/project-scaffold
```

`$SPLIIT` is used by every port step below. It lives in a session scratchpad, so
re-export it in each new shell; if the path is gone, re-clone spliit at `ae35cd6`.

- [ ] **Step 2: Write `package.json`**

Copy the `dependencies` and `devDependencies` blocks from `$SPLIIT/package.json` verbatim, then use this for everything else:

```json
{
  "name": "chiatien",
  "version": "0.1.0",
  "private": true,
  "engines": { "node": ">=22" },
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint .",
    "check-types": "tsc --noEmit",
    "prettier": "prettier -w src e2e",
    "check-formatting": "prettier -c src e2e",
    "test": "jest",
    "e2e": "playwright test",
    "e2e:report": "playwright show-report",
    "db:migrate": "prisma migrate deploy",
    "db:generate": "prisma generate",
    "db:studio": "prisma studio"
  }
}
```

Copy the dependency list whole. Every entry is used either by ported code or by a Phase 1 slice, so nothing is pruned.

Do **not** copy spliit's `postinstall` hook. It runs `prisma migrate deploy` before a database exists and fails the first install.

- [ ] **Step 3: Write `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["next-env.d.ts", "reset.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 4: Write `jest.config.ts`**

```ts
import nextJest from 'next/jest.js'
import type { Config } from 'jest'

const createJestConfig = nextJest({ dir: './' })

const config: Config = {
  coverageProvider: 'v8',
  testEnvironment: 'jsdom',
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/e2e/'],
}

export default createJestConfig(config)
```

`testPathIgnorePatterns` must exclude `e2e/`: Jest's default `testMatch` would otherwise collect the Playwright specs and fail on their imports.

- [ ] **Step 5: Write the remaining config files**

`reset.d.ts`:

```ts
import '@total-typescript/ts-reset'
```

`.prettierrc`:

```json
{ "semi": false, "singleQuote": true, "plugins": ["prettier-plugin-organize-imports"] }
```

`.prettierignore`:

```
src/generated
```

`postcss.config.js`:

```js
module.exports = { plugins: { '@tailwindcss/postcss': {} } }
```

`eslint.config.mjs`:

```js
import { FlatCompat } from '@eslint/eslintrc'

const compat = new FlatCompat({ baseDirectory: import.meta.dirname })

export default [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  { ignores: ['.next/**', 'src/generated/**', 'node_modules/**'] },
]
```

`next.config.mjs`:

```js
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin()

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactCompiler: true,
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(self), microphone=(), geolocation=()' },
          {
            key: 'Content-Security-Policy',
            value:
              "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data:; connect-src 'self' https:; frame-ancestors 'none'; base-uri 'self'; form-action 'self'",
          },
        ],
      },
    ]
  },
}

export default withNextIntl(nextConfig)
```

- [ ] **Step 6: Write the failing smoke test**

```ts
// src/lib/smoke.test.ts
import { cn } from '@/lib/utils'

describe('toolchain', () => {
  it('resolves the @/ path alias', () => {
    expect(cn('a', 'b')).toBe('a b')
  })
})
```

- [ ] **Step 7: Run the test to verify it fails**

Run: `npm test -- smoke`
Expected: FAIL — `Cannot find module '@/lib/utils'`.

- [ ] **Step 8: Create the minimal `src/lib/utils.ts` to make it pass**

```ts
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

Task 3 replaces this file with spliit's full version; this stub only proves the alias resolves.

- [ ] **Step 9: Install dependencies and run the test**

```bash
npm install
npm test -- smoke
```

Expected: PASS. If `npm install` refuses on an engine check, the `engines` field was copied from spliit — set it back to `>=22`.

- [ ] **Step 10: Add the minimal app shell so `next build` has an entry point**

`src/styles/globals.css`:

```css
@import 'tailwindcss';
```

`src/app/layout.tsx`:

```tsx
import '@/styles/globals.css'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  )
}
```

`src/app/page.tsx`:

```tsx
export default function HomePage() {
  return <main />
}
```

- [ ] **Step 11: Verify types and lint**

Run these one at a time — never in a single shell invocation, memory is tight:

```bash
npm run check-types
```
```bash
npm run lint
```

Expected: both clean.

- [ ] **Step 12: Commit**

```bash
git add -A
git commit -m "chore(scaffold): set up next, typescript, jest and lint"
```

---

### Task 2: Database — port schema and migrations

**Files:**
- Create: `prisma/schema.prisma`, `prisma/migrations/**` (25 directories + `migration_lock.toml`), `prisma.config.ts`
- Modify: `.env`, `.env.example`
- Test: `src/lib/prisma-schema.test.ts`

**Interfaces:**
- Consumes: Task 1's workspace.
- Produces: a generated Prisma client at `src/generated/prisma`, exporting the models `Group`, `Participant`, `Expense`, `ExpensePaidFor`, `Category`, `ExpenseDocument`, `Activity`, `RecurringExpenseLink` and the enums `SplitMode`, `RecurrenceRule`, `ActivityType`.

- [ ] **Step 1: Create the branch**

```bash
git checkout main && git checkout -b chore/database-port
```

- [ ] **Step 2: Start PostgreSQL and create the database**

```bash
brew services start postgresql@16
```
```bash
createdb chiatien 2>/dev/null; psql -l | grep chiatien
```

Expected: a `chiatien` row. Docker is deliberately not used — the daemon is off and Docker Desktop would exhaust the free memory on this machine.

- [ ] **Step 3: Copy the schema and migrations**

```bash
cp -R "$SPLIIT/prisma/." prisma/
cp "$SPLIIT/prisma.config.ts" .
ls prisma/migrations | grep -vc migration_lock
```

Expected: `25`.

- [ ] **Step 4: Point the environment at the local database**

`.env`:

```
POSTGRES_PRISMA_URL=postgresql://tinh.le@localhost:5432/chiatien
POSTGRES_URL_NON_POOLING=postgresql://tinh.le@localhost:5432/chiatien
BASE_URL=http://localhost:3000
DEFAULT_CURRENCY_CODE=VND
```

`.env.example` carries the same keys with placeholder values and no real host.

- [ ] **Step 5: Write the failing test**

```ts
// src/lib/prisma-schema.test.ts
import { SplitMode, RecurrenceRule } from '@/generated/prisma/browser'

describe('generated prisma client', () => {
  it('exposes every split mode the expense form offers', () => {
    expect(Object.keys(SplitMode).sort()).toEqual([
      'BY_AMOUNT',
      'BY_PERCENTAGE',
      'BY_SHARES',
      'EVENLY',
    ])
  })

  it('exposes every recurrence rule', () => {
    expect(Object.keys(RecurrenceRule).sort()).toEqual([
      'DAILY',
      'MONTHLY',
      'NONE',
      'WEEKLY',
    ])
  })
})
```

- [ ] **Step 6: Run the test to verify it fails**

Run: `npm test -- prisma-schema`
Expected: FAIL — `Cannot find module '@/generated/prisma/browser'`.

- [ ] **Step 7: Apply migrations and generate the client**

```bash
npx prisma migrate deploy
```
```bash
npx prisma generate
```

Expected: 25 migrations applied, client written to `src/generated/prisma`.

- [ ] **Step 8: Run the test to verify it passes**

Run: `npm test -- prisma-schema`
Expected: PASS.

- [ ] **Step 9: Confirm the tables exist**

```bash
psql chiatien -c '\dt' | grep -E 'Group|Expense|Participant|Activity'
```

Expected: rows for `Group`, `Participant`, `Expense`, `ExpensePaidFor`, `Category`, `ExpenseDocument`, `Activity`, `RecurringExpenseLink`.

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "chore(db): port prisma schema and 25 migrations"
```

---

### Task 3: Port the pure core and its tests

**Files:**
- Create: `src/lib/{api,balances,shares,totals,currency,currency-conversion,currency-data.json,date-groups,env,featureFlags,health,hooks,locale,prisma,random,schemas,uploaded-image-url,utils}.ts`
- Create: `src/lib/{balances,currency-conversion,date-groups,shares,totals,uploaded-image-url,utils}.test.ts`
- Delete: `src/lib/smoke.test.ts`
- Modify: `src/lib/utils.ts` (replaces the Task 1 stub)

**Interfaces:**
- Consumes: the generated Prisma client from Task 2.
- Produces: `getBalances(expenses): Balances`, `getSuggestedReimbursements(balances): Reimbursement[]`, `getPublicBalances(reimbursements): Balances`, `getExpenseShares(expense: ShareInput): Map<string, number>`, `getParticipantShare(participantId, expense): number`, `distributeAmount(amount, count): number[]`, `formatCurrency(currency, amount, locale, fractions?): string`, `amountAsDecimal(amount, currency, round?): number`, `amountAsMinorUnits(amount, currency): number`, `getCurrencyFromGroup(group): Currency`, and the Zod schemas `groupFormSchema`, `expenseFormSchema` with types `GroupFormValues`, `ExpenseFormValues`, `ExpenseFormInput`.

- [ ] **Step 1: Create the branch**

```bash
git checkout main && git checkout -b chore/port-core-lib
```

- [ ] **Step 2: Copy the library and delete the stub test**

```bash
cp "$SPLIIT"/src/lib/*.ts "$SPLIIT"/src/lib/*.json src/lib/
rm src/lib/smoke.test.ts
ls src/lib/*.test.ts | wc -l
```

Expected: `7`.

- [ ] **Step 3: Copy the analytics module the library imports**

```bash
cp -R "$SPLIIT/src/lib/analytics" src/lib/analytics
```

`src/lib/env.ts` validates `ANALYTICS_PROVIDER` against `ANALYTICS_PROVIDER_IDS` from this directory, so the port does not type-check without it.

- [ ] **Step 4: Run the ported tests**

Run: `npm test`
Expected: 7 suites pass. A failure here means a file was missed in the copy, not that the logic is wrong — these tests pass at `ae35cd6`.

- [ ] **Step 5: Strip narration comments**

Read every copied file and remove comments that restate what the code does. Keep comments that explain *why*: the largest-remainder rationale and the FNV-1a rotation note in `shares.ts`, the rounding guard in `balances.ts`, the stable-comparator docblock on `compareBalancesForReimbursements`, the CRLF and blank-variable notes in `env.ts`, and the `paidFor` ordering note in `shares.ts`. These encode non-obvious invariants and deleting them loses real information.

- [ ] **Step 6: Re-run the tests after editing**

Run: `npm test`
Expected: 7 suites still pass.

- [ ] **Step 7: Verify types**

Run: `npm run check-types`
Expected: clean.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "chore(lib): port core library with its unit tests"
```

---

### Task 4: Extract the logic spliit embedded in UI directories

**Files:**
- Create: `src/lib/currency-input.ts`, `src/lib/currency-input.test.ts`
- Create: `src/lib/expense-defaults.ts`, `src/lib/expense-defaults.test.ts`
- Create: `src/lib/expense-payload.ts`, `src/lib/expense-payload.test.ts`
- Create: `src/lib/expense-split.ts`, `src/lib/receipt-extract.ts`, `src/lib/stats-range.ts`, `src/lib/stats-range.test.ts`

**Interfaces:**
- Consumes: `amountAsMinorUnits`, `formatAmountAsDecimal` and `Currency` from Task 3.
- Produces: `enforceCurrencyPattern(value: string): string`, `getDefaultSplittingOptions(group): SplittingOptions`, `toExpensePayload(values: ExpenseFormValues, groupCurrency: Currency, originalCurrency: Currency, conversionRequired: boolean): ExpenseFormValues`, `extractCategoryFromTitle(title: string)`, `extractExpenseInformationFromImage(imageUrl: string)`, and the stats-range helpers.

- [ ] **Step 1: Create the branch**

```bash
git checkout main && git checkout -b refactor/extract-embedded-logic
```

- [ ] **Step 2: Write the failing test for `currency-input`**

This function parses money as the user types it and ships untested in spliit. The cases below pin the behaviour of the five chained replacements at `$SPLIIT/src/app/groups/[groupId]/expenses/expense-form.tsx:71-79`.

```ts
// src/lib/currency-input.test.ts
import { enforceCurrencyPattern } from '@/lib/currency-input'

describe('enforceCurrencyPattern', () => {
  it('keeps a plain decimal unchanged', () => {
    expect(enforceCurrencyPattern('123.45')).toBe('123.45')
  })

  it('preserves a leading minus for income', () => {
    expect(enforceCurrencyPattern('-50')).toBe('-50')
  })

  it('drops a minus that is not leading', () => {
    expect(enforceCurrencyPattern('12-34')).toBe('1234')
  })

  it('promotes the first comma to a decimal point', () => {
    expect(enforceCurrencyPattern('1,5')).toBe('1.5')
  })

  it('removes thousands separators after the first separator', () => {
    expect(enforceCurrencyPattern('1,234,567')).toBe('1.234567')
  })

  it('strips letters and currency symbols', () => {
    expect(enforceCurrencyPattern('1000đ')).toBe('1000')
  })

  it('returns an empty string when nothing numeric remains', () => {
    expect(enforceCurrencyPattern('abc')).toBe('')
  })
})
```

- [ ] **Step 3: Run it to verify it fails**

Run: `npm test -- currency-input`
Expected: FAIL — `Cannot find module '@/lib/currency-input'`.

- [ ] **Step 4: Implement `currency-input.ts`**

Move the function verbatim; the replacement order is load-bearing and must not be "simplified".

```ts
/**
 * The chained replacements are order-dependent: the leading minus and the first
 * separator are parked on placeholder characters so the blanket strip below
 * cannot eat them, then restored.
 */
export function enforceCurrencyPattern(value: string): string {
  return value
    .replace(/^\s*-/, '_')
    .replace(/[.,]/, '#')
    .replace(/[-.,]/g, '')
    .replace(/_/, '-')
    .replace(/#/, '.')
    .replace(/[^-\d.]/g, '')
}
```

- [ ] **Step 5: Run it to verify it passes**

Run: `npm test -- currency-input`
Expected: 7 passing. If a case fails, the expectation is wrong, not the implementation — re-derive it by hand from the replacement chain and correct the test.

- [ ] **Step 6: Write the failing test for `expense-payload`**

This covers the decimal-to-minor-unit conversion at `expense-form.tsx:307-329`, including the branch that deletes conversion fields when no conversion happened.

```ts
// src/lib/expense-payload.test.ts
import { toExpensePayload } from '@/lib/expense-payload'
import type { Currency } from '@/lib/currency'

const VND: Currency = {
  name: 'Vietnamese dong', symbol_native: '₫', symbol: '₫', code: 'VND',
  name_plural: 'Vietnamese dong', rounding: 0, decimal_digits: 0,
}
const USD: Currency = {
  name: 'US dollar', symbol_native: '$', symbol: '$', code: 'USD',
  name_plural: 'US dollars', rounding: 0, decimal_digits: 2,
}

const base = {
  amount: 100, splitMode: 'EVENLY' as const,
  paidFor: [{ participant: 'p1', shares: 1 }],
  originalAmount: undefined, originalCurrency: '', conversionRate: undefined,
}

describe('toExpensePayload', () => {
  it('leaves a VND amount untouched because a minor unit is a dong', () => {
    const out = toExpensePayload({ ...base }, VND, VND, false)
    expect(out.amount).toBe(100)
  })

  it('scales a USD amount into cents', () => {
    const out = toExpensePayload({ ...base }, USD, USD, false)
    expect(out.amount).toBe(10000)
  })

  it('scales BY_AMOUNT shares into minor units too', () => {
    const out = toExpensePayload(
      { ...base, splitMode: 'BY_AMOUNT', paidFor: [{ participant: 'p1', shares: 100 }] },
      USD, USD, false,
    )
    expect(out.paidFor[0].shares).toBe(10000)
  })

  it('leaves shares alone for every other split mode', () => {
    const out = toExpensePayload(
      { ...base, splitMode: 'BY_SHARES', paidFor: [{ participant: 'p1', shares: 200 }] },
      USD, USD, false,
    )
    expect(out.paidFor[0].shares).toBe(200)
  })

  it('drops the conversion fields when no conversion took place', () => {
    const out = toExpensePayload(
      { ...base, originalAmount: 5, originalCurrency: 'USD', conversionRate: 2 },
      VND, USD, false,
    )
    expect(out.originalAmount).toBeUndefined()
    expect(out.originalCurrency).toBeUndefined()
    expect(out.conversionRate).toBeUndefined()
  })

  it('keeps and scales the original amount when a conversion took place', () => {
    const out = toExpensePayload(
      { ...base, originalAmount: 5, originalCurrency: 'USD', conversionRate: 2 },
      VND, USD, true,
    )
    expect(out.originalAmount).toBe(500)
    expect(out.conversionRate).toBe(2)
  })
})
```

- [ ] **Step 7: Run it to verify it fails**

Run: `npm test -- expense-payload`
Expected: FAIL — module not found.

- [ ] **Step 8: Implement `expense-payload.ts`**

```ts
import type { Currency } from '@/lib/currency'
import type { ExpenseFormValues } from '@/lib/schemas'
import { amountAsMinorUnits } from '@/lib/utils'

/**
 * Money reaches the form as a decimal and is stored in minor units. A repayment
 * whose converted amount rounds to zero would otherwise be saved with a rate but
 * no amount to apply it to, so the conversion fields are dropped together.
 */
export function toExpensePayload(
  values: ExpenseFormValues,
  groupCurrency: Currency,
  originalCurrency: Currency,
  conversionRequired: boolean,
): ExpenseFormValues {
  const next = { ...values }
  next.amount = amountAsMinorUnits(values.amount, groupCurrency)
  next.paidFor = values.paidFor.map(({ participant, shares }) => ({
    participant,
    shares:
      values.splitMode === 'BY_AMOUNT'
        ? amountAsMinorUnits(shares, groupCurrency)
        : shares,
  }))

  if (conversionRequired && values.originalAmount !== undefined) {
    next.originalAmount = amountAsMinorUnits(values.originalAmount, originalCurrency)
  } else {
    delete next.originalAmount
    delete next.originalCurrency
    delete next.conversionRate
  }
  return next
}
```

- [ ] **Step 9: Run it to verify it passes**

Run: `npm test -- expense-payload`
Expected: 6 passing.

- [ ] **Step 10: Write the failing test for `expense-defaults`**

```ts
// src/lib/expense-defaults.test.ts
import { getDefaultSplittingOptions } from '@/lib/expense-defaults'

const group = {
  id: 'g1',
  participants: [{ id: 'p1', name: 'A' }, { id: 'p2', name: 'B' }],
}

describe('getDefaultSplittingOptions', () => {
  it('defaults to an even split across every participant', () => {
    const options = getDefaultSplittingOptions(group)
    expect(options.splitMode).toBe('EVENLY')
    expect(options.paidFor).toEqual([
      { participant: 'p1', shares: '1' },
      { participant: 'p2', shares: '1' },
    ])
  })
})
```

- [ ] **Step 11: Run it to verify it fails**

Run: `npm test -- expense-defaults`
Expected: FAIL — module not found.

- [ ] **Step 12: Implement `expense-defaults.ts`**

Port the body of `getDefaultSplittingOptions` from `$SPLIIT/src/app/groups/[groupId]/expenses/expense-form.tsx:82-100`, keeping the `'1'` string shares — the schema coerces them and the form relies on string values so trailing zeros survive editing. If the assertion above disagrees with the ported body, correct the test to match the port; parity with spliit wins.

- [ ] **Step 13: Run it to verify it passes**

Run: `npm test -- expense-defaults`
Expected: PASS.

- [ ] **Step 14: Move the remaining three files**

```bash
cp "$SPLIIT/src/components/expense-form-actions.tsx" src/lib/expense-split.ts
cp "$SPLIIT/src/app/groups/[groupId]/expenses/create-from-receipt-button-actions.ts" src/lib/receipt-extract.ts
cp "$SPLIIT/src/app/groups/[groupId]/stats/stats-range.ts" src/lib/stats-range.ts
cp "$SPLIIT/src/app/groups/[groupId]/stats/stats-range.test.ts" src/lib/stats-range.test.ts
cp "$SPLIIT/src/components/expense-form-actions.test.ts" src/lib/expense-split.test.ts
cp "$SPLIIT/src/app/groups/[groupId]/expenses/create-from-receipt-button-actions.test.ts" src/lib/receipt-extract.test.ts
```

Fix the import paths in all six files so they resolve under `@/lib/`, and rename the imports in the two copied test files to match their new module names.

- [ ] **Step 15: Run the full suite**

Run: `npm test`
Expected: every suite passes. Suites: the 7 ported in Task 3, plus `currency-input`, `expense-payload`, `expense-defaults`, `stats-range`, `expense-split`, `receipt-extract`, `prisma-schema`.

- [ ] **Step 16: Verify types**

Run: `npm run check-types`
Expected: clean.

- [ ] **Step 17: Commit**

```bash
git add -A
git commit -m "refactor(lib): extract logic embedded in spliit ui directories"
```

---

### Task 5: Port the tRPC API

**Files:**
- Create: `src/trpc/{init.ts,client.tsx,query-client.ts}`, `src/trpc/routers/**` (17 procedures)
- Create: `src/app/api/trpc/[trpc]/route.ts`, `src/app/api/health/{route.ts,liveness/route.ts,readiness/route.ts}`, `src/app/api/s3-upload/route.ts`
- Modify: `src/app/layout.tsx`
- Test: `src/trpc/routers/app-router.test.ts`

**Interfaces:**
- Consumes: `src/lib` from Tasks 3 and 4.
- Produces: `appRouter` with namespaces `groups` and `categories`; the React client `trpc` from `@/trpc/client`; `TRPCProvider`; type `AppRouterOutput`.

- [ ] **Step 1: Create the branch**

```bash
git checkout main && git checkout -b chore/port-trpc-api
```

- [ ] **Step 2: Copy the router tree and API routes**

```bash
cp -R "$SPLIIT/src/trpc/." src/trpc/
mkdir -p "src/app/api"
cp -R "$SPLIIT/src/app/api/." src/app/api/
find src/trpc -name '*.procedure.ts' | wc -l
```

Expected: `17`.

- [ ] **Step 3: Write the failing test**

A router shape test is cheap insurance that a procedure was not lost in the copy, and it runs without a database.

```ts
// src/trpc/routers/app-router.test.ts
import { appRouter } from '@/trpc/routers/_app'

describe('appRouter', () => {
  it('exposes the group and category namespaces', () => {
    expect(Object.keys(appRouter._def.procedures).length).toBeGreaterThan(0)
  })

  it('registers every ported procedure', () => {
    const paths = Object.keys(appRouter._def.procedures).sort()
    expect(paths).toEqual([
      'categories.list',
      'groups.activities.list',
      'groups.balances.forUser',
      'groups.balances.list',
      'groups.create',
      'groups.expenses.create',
      'groups.expenses.delete',
      'groups.expenses.get',
      'groups.expenses.list',
      'groups.expenses.update',
      'groups.get',
      'groups.getDetails',
      'groups.list',
      'groups.stats.categoryExpenses',
      'groups.stats.monthExpenses',
      'groups.stats.overview',
      'groups.update',
    ])
  })
})
```

- [ ] **Step 4: Run it to verify it fails**

Run: `npm test -- app-router`
Expected: FAIL — module not found, or a mismatched path list.

- [ ] **Step 5: Reconcile the expected list with reality**

If the test fails only on procedure names, print the real list and correct the expectation — the names come from the port, not from this plan:

```bash
find src/trpc -name '*.procedure.ts' | sed 's|src/trpc/routers/||; s|/[^/]*\.procedure\.ts$||' | sort
```

That lists the router directories; read the `index.ts` in each to get the exact
procedure keys, then correct the expectation.

The count must be 17 regardless of naming.

- [ ] **Step 6: Mount the provider in the root layout**

```tsx
// src/app/layout.tsx
import { TRPCProvider } from '@/trpc/client'
import '@/styles/globals.css'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body>
        <TRPCProvider>{children}</TRPCProvider>
      </body>
    </html>
  )
}
```

- [ ] **Step 7: Run the test to verify it passes**

Run: `npm test -- app-router`
Expected: PASS.

- [ ] **Step 8: Prove the API answers over HTTP**

Start the dev server in one shell:

```bash
npm run dev
```

In another:

```bash
curl -s 'http://localhost:3000/api/trpc/groups.list?batch=1&input=%7B%220%22%3A%7B%22json%22%3A%7B%22groupIds%22%3A%5B%5D%7D%7D%7D' | head -c 300
```

Expected: a JSON body containing `"result"`, not an error page. Stop the dev server afterwards — it holds memory this machine needs.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "chore(api): port trpc routers and api routes"
```

---

### Task 6: Design tokens, font and Tailwind theme

**Files:**
- Modify: `src/styles/globals.css`, `src/app/layout.tsx`
- Create: `src/lib/fonts.ts`
- Test: `src/styles/tokens.test.ts`

**Interfaces:**
- Consumes: Task 1's Tailwind setup.
- Produces: the semantic tokens listed in the spec, the `jakarta` font export, and Tailwind utilities `text-display-currency`, `text-headline-lg|md|sm`, `text-body-lg|md|sm`, `text-numeric-table-lg|md`, `text-label-md|sm`, plus `bg-credit`, `bg-debit`, `bg-credit-subtle`, `bg-debit-subtle`.

- [ ] **Step 1: Create the branch**

```bash
git checkout main && git checkout -b feat/design-tokens
```

- [ ] **Step 2: Write the failing test**

The token layer is CSS, so the test guards the two things that silently rot: a token disappearing, and `--debit` collapsing into `--destructive`.

```ts
// src/styles/tokens.test.ts
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const css = readFileSync(join(process.cwd(), 'src/styles/globals.css'), 'utf8')

const REQUIRED = [
  '--background', '--foreground', '--card', '--card-foreground',
  '--muted', '--muted-foreground', '--border', '--input', '--ring',
  '--primary', '--primary-foreground', '--primary-active',
  '--secondary', '--accent',
  '--credit', '--credit-subtle', '--debit', '--debit-subtle', '--destructive',
]

describe('semantic tokens', () => {
  it.each(REQUIRED)('defines %s', (token) => {
    expect(css).toContain(`${token}:`)
  })

  it('keeps debt and error as separate tokens', () => {
    const value = (token: string) =>
      css.match(new RegExp(`${token}:\\s*([^;]+);`))?.[1].trim()
    expect(value('--debit')).not.toBe(value('--destructive'))
  })
})
```

- [ ] **Step 3: Run it to verify it fails**

Run: `npm test -- tokens`
Expected: FAIL — `globals.css` currently holds only the Tailwind import.

- [ ] **Step 4: Write the token layer**

```css
/* src/styles/globals.css */
@import 'tailwindcss';

:root {
  --background: 210 40% 98%;
  --foreground: 222 47% 11%;
  --card: 0 0% 100%;
  --card-foreground: 222 47% 11%;
  --muted: 210 40% 96%;
  --muted-foreground: 215 16% 47%;
  --border: 214 32% 91%;
  --input: 214 32% 91%;
  --ring: 160 84% 39%;

  --primary: 161 94% 30%;
  --primary-foreground: 0 0% 100%;
  --primary-active: 163 94% 24%;
  --secondary: 199 89% 48%;
  --secondary-foreground: 0 0% 100%;
  --accent: 38 92% 50%;
  --accent-foreground: 222 47% 11%;

  --credit: 161 94% 30%;
  --credit-subtle: 152 81% 96%;
  --debit: 0 84% 60%;
  --debit-subtle: 0 86% 97%;
  --destructive: 0 72% 51%;
  --destructive-foreground: 0 0% 100%;

  --radius-card: 1rem;
  --radius-control: 0.75rem;
  --thumb-safe: 5rem;
  --touch-min: 3rem;
}

@theme inline {
  --color-background: hsl(var(--background));
  --color-foreground: hsl(var(--foreground));
  --color-card: hsl(var(--card));
  --color-card-foreground: hsl(var(--card-foreground));
  --color-muted: hsl(var(--muted));
  --color-muted-foreground: hsl(var(--muted-foreground));
  --color-border: hsl(var(--border));
  --color-input: hsl(var(--input));
  --color-ring: hsl(var(--ring));
  --color-primary: hsl(var(--primary));
  --color-primary-foreground: hsl(var(--primary-foreground));
  --color-primary-active: hsl(var(--primary-active));
  --color-secondary: hsl(var(--secondary));
  --color-secondary-foreground: hsl(var(--secondary-foreground));
  --color-accent: hsl(var(--accent));
  --color-accent-foreground: hsl(var(--accent-foreground));
  --color-credit: hsl(var(--credit));
  --color-credit-subtle: hsl(var(--credit-subtle));
  --color-debit: hsl(var(--debit));
  --color-debit-subtle: hsl(var(--debit-subtle));
  --color-destructive: hsl(var(--destructive));
  --color-destructive-foreground: hsl(var(--destructive-foreground));

  --font-sans: var(--font-jakarta), ui-sans-serif, system-ui, sans-serif;

  --text-display-currency: 2.25rem;
  --text-display-currency--line-height: 2.75rem;
  --text-display-currency--letter-spacing: -0.03em;
  --text-display-currency--font-weight: 700;
  --text-headline-lg: 1.875rem;
  --text-headline-lg--line-height: 2.375rem;
  --text-headline-lg--letter-spacing: -0.02em;
  --text-headline-lg--font-weight: 700;
  --text-headline-md: 1.25rem;
  --text-headline-md--line-height: 1.75rem;
  --text-headline-md--letter-spacing: -0.01em;
  --text-headline-md--font-weight: 600;
  --text-headline-sm: 1rem;
  --text-headline-sm--line-height: 1.5rem;
  --text-headline-sm--font-weight: 600;
  --text-body-lg: 1rem;
  --text-body-lg--line-height: 1.5rem;
  --text-body-md: 0.875rem;
  --text-body-md--line-height: 1.25rem;
  --text-body-sm: 0.75rem;
  --text-body-sm--line-height: 1.125rem;
  --text-numeric-table-lg: 1.125rem;
  --text-numeric-table-lg--line-height: 1.5rem;
  --text-numeric-table-lg--letter-spacing: -0.01em;
  --text-numeric-table-lg--font-weight: 600;
  --text-numeric-table-md: 0.9375rem;
  --text-numeric-table-md--line-height: 1.25rem;
  --text-numeric-table-md--font-weight: 600;
  --text-label-md: 0.8125rem;
  --text-label-md--line-height: 1rem;
  --text-label-md--font-weight: 600;
  --text-label-sm: 0.6875rem;
  --text-label-sm--line-height: 0.875rem;
  --text-label-sm--letter-spacing: 0.02em;
  --text-label-sm--font-weight: 600;

  --spacing-thumb-safe: 5rem;
  --spacing-touch-min: 3rem;
}

@layer base {
  body {
    background-color: hsl(var(--background));
    color: hsl(var(--foreground));
  }
}
```

- [ ] **Step 5: Run it to verify it passes**

Run: `npm test -- tokens`
Expected: 20 passing.

- [ ] **Step 6: Load the font**

```ts
// src/lib/fonts.ts
import { Plus_Jakarta_Sans } from 'next/font/google'

/**
 * The `vietnamese` subset is required, not cosmetic: without it accented glyphs
 * fall back to a different face and sit on a different baseline.
 */
export const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin', 'vietnamese'],
  variable: '--font-jakarta',
  display: 'swap',
})
```

Apply it in `src/app/layout.tsx` by adding `className={jakarta.variable}` to `<html>` and `className="font-sans"` to `<body>`.

- [ ] **Step 7: Prove the tokens render**

```bash
npm run build
```

Expected: a successful build. This is the memory-heaviest command in the task — run it alone.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat(tokens): add semantic color, type and spacing scales"
```

---

### Task 7: Localisation with namespaced messages

**Files:**
- Create: `messages/{vi,en-US}/{common,groups,expenses,balances,stats,errors}.json`
- Create: `src/i18n/request.ts`, `src/lib/locale.ts` (replaces the Task 3 port), `scripts/check-messages.ts`
- Test: `src/i18n/messages.test.ts`

**Interfaces:**
- Consumes: nothing from earlier tasks.
- Produces: `locales`, `localeLabels`, `defaultLocale`, `type Locale` from `@/i18n/request`; `getUserLocale()` and `setUserLocale(locale)` from `@/lib/locale`.

- [ ] **Step 1: Create the branch**

```bash
git checkout main && git checkout -b feat/i18n-namespaces
```

- [ ] **Step 2: Split spliit's message files into namespaces**

```bash
mkdir -p messages/vi messages/en-US
node -e "
const fs=require('fs');
const NS=['common','groups','expenses','balances','stats','errors'];
for (const [src,dst] of [['en-US','en-US'],['vi','vi']]) {
  const all=JSON.parse(fs.readFileSync(process.env.SPLIIT + '/messages/' + src + '.json','utf8'));
  const buckets=Object.fromEntries(NS.map(n=>[n,{}]));
  for (const [k,v] of Object.entries(all)) {
    const n = k==='Groups'||k==='CreateGroup'||k==='EditGroup'||k==='GroupForm' ? 'groups'
      : k==='Expenses'||k==='ExpenseForm'||k==='Categories' ? 'expenses'
      : k==='Balances' ? 'balances'
      : k==='Stats'||k==='Totals' ? 'stats'
      : k==='Errors' ? 'errors' : 'common';
    buckets[n][k]=v;
  }
  for (const n of NS) fs.writeFileSync('messages/'+dst+'/'+n+'.json', JSON.stringify(buckets[n],null,2)+'\n');
}
console.log('split done');
"
```

The bucket mapping is a starting point. After running it, open `messages/en-US/common.json`; any top-level key that clearly belongs to a screen namespace should be moved by hand. What matters is that the same keys exist in both locales.

- [ ] **Step 3: Write the failing test**

```ts
// src/i18n/messages.test.ts
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { locales, localeLabels, defaultLocale } from '@/i18n/request'

const dir = join(process.cwd(), 'messages')

const flatten = (value: unknown, prefix = ''): string[] =>
  typeof value === 'object' && value !== null
    ? Object.entries(value).flatMap(([k, v]) => flatten(v, prefix ? `${prefix}.${k}` : k))
    : [prefix]

const keysOf = (locale: string) =>
  readdirSync(join(dir, locale))
    .flatMap((file) =>
      flatten(JSON.parse(readFileSync(join(dir, locale, file), 'utf8'))).map(
        (key) => `${file}:${key}`,
      ),
    )
    .sort()

describe('messages', () => {
  it('offers Vietnamese in the locale switcher', () => {
    expect(locales).toContain('vi')
    expect(localeLabels.vi).toBe('Tiếng Việt')
  })

  it('falls back to English', () => {
    expect(defaultLocale).toBe('en-US')
  })

  it('defines every English key in Vietnamese', () => {
    const missing = keysOf('en-US').filter((key) => !keysOf('vi').includes(key))
    expect(missing).toEqual([])
  })
})
```

The third assertion fails at first: spliit's Vietnamese file covers 139 of 369 keys. That failure is the translation backlog made visible, and it is the point of the test.

- [ ] **Step 4: Run it to verify it fails**

Run: `npm test -- messages`
Expected: FAIL on all three — `@/i18n/request` does not exist yet.

- [ ] **Step 5: Write `src/i18n/request.ts`**

```ts
import deepmerge from 'deepmerge'
import { getRequestConfig } from 'next-intl/server'
import { getUserLocale } from '@/lib/locale'

export const localeLabels = {
  vi: 'Tiếng Việt',
  'en-US': 'English',
} as const

export const locales: (keyof typeof localeLabels)[] = Object.keys(
  localeLabels,
) as (keyof typeof localeLabels)[]
export type Locale = keyof typeof localeLabels
export type Locales = ReadonlyArray<Locale>
export const defaultLocale: Locale = 'en-US'

const NAMESPACES = ['common', 'groups', 'expenses', 'balances', 'stats', 'errors'] as const

async function load(locale: string) {
  const parts = await Promise.all(
    NAMESPACES.map(async (ns) => (await import(`../../messages/${locale}/${ns}.json`)).default),
  )
  return parts.reduce((all, part) => ({ ...all, ...part }), {})
}

export default getRequestConfig(async () => {
  const locale = await getUserLocale()
  const messages =
    locale === defaultLocale
      ? await load(defaultLocale)
      : deepmerge(await load(defaultLocale), await load(locale))

  return { locale, messages }
})
```

The English merge base is deliberate: a key missing from Vietnamese renders in English rather than throwing. The test in Step 3 is what stops that fallback from hiding a permanent gap.

- [ ] **Step 6: Write `src/lib/locale.ts`**

Port spliit's version and add the setter the settings screen needs:

```ts
'use server'

import { Locale, Locales, defaultLocale, locales } from '@/i18n/request'
import { match } from '@formatjs/intl-localematcher'
import Negotiator from 'negotiator'
import { cookies, headers } from 'next/headers'

const COOKIE_NAME = 'NEXT_LOCALE'

function getAcceptLanguageLocale(requestHeaders: Headers, available: Locales) {
  const languages = new Negotiator({
    headers: { 'accept-language': requestHeaders.get('accept-language') || undefined },
  }).languages()
  try {
    return match(languages, available as string[], defaultLocale)
  } catch {
    return defaultLocale
  }
}

export async function getUserLocale() {
  const cookie = (await cookies()).get(COOKIE_NAME)?.value
  if (cookie) return cookie
  return getAcceptLanguageLocale(await headers(), locales)
}

export async function setUserLocale(locale: Locale) {
  ;(await cookies()).set(COOKIE_NAME, locale)
}
```

- [ ] **Step 7: Run the test — expect only the coverage assertion to fail**

Run: `npm test -- messages`
Expected: the first two pass; the third lists the missing Vietnamese keys.

- [ ] **Step 8: Translate the missing keys**

Work through the list the failing test prints. Translate into natural Vietnamese, not literal English word order. Financial vocabulary to use consistently: *khoản chi* (expense), *nhóm* (group), *thành viên* (participant), *số dư* (balance), *quyết toán* (settlement), *hoàn trả* (reimbursement), *chia đều* (split evenly), *theo phần* (by shares), *theo phần trăm* (by percentage), *theo số tiền* (by amount), *định kỳ* (recurring), *được nhận* (owed to you), *bạn nợ* (you owe).

- [ ] **Step 9: Run the test to verify it passes**

Run: `npm test -- messages`
Expected: all three pass, with zero missing keys.

- [ ] **Step 10: Add Vietnamese currency names**

```bash
cp "$SPLIIT/src/scripts/generateCurrencyData.ts" src/scripts/
```

Add `'vi'` to the locale list inside that script, then regenerate:

```bash
npx ts-node -T ./src/scripts/generateCurrencyData.ts
```

Expected: `src/lib/currency-data.json` now has a `vi` key. Verify:

```bash
node -e "console.log(Object.keys(require('./src/lib/currency-data.json')).includes('vi'))"
```

Expected: `true`.

- [ ] **Step 11: Commit**

```bash
git add -A
git commit -m "feat(i18n): split messages into namespaces and complete vietnamese"
```

---

### Task 8: Atoms and Storybook

**Files:**
- Create: `src/components/core/atoms/{Button,Input,Card,Badge,Avatar,Checkbox,Sheet,Money}/{index.tsx,*.stories.tsx}`
- Create: `.storybook/{main.ts,preview.ts}`
- Modify: `package.json` (Storybook scripts)
- Test: `src/components/core/atoms/atoms.test.ts`

**Interfaces:**
- Consumes: tokens from Task 6, `formatCurrency` and `Currency` from Task 3.
- Produces: `<Button variant size asChild>`, `<Input>`, `<Card>` with `CardHeader`/`CardContent`/`CardFooter`, `<Badge tone>` where tone is `'neutral' | 'credit' | 'debit' | 'pending'`, `<Avatar name>` rendering deterministic initials, `<Checkbox checked onCheckedChange>`, `<Sheet>` with `SheetTrigger`/`SheetContent`, and `<Money amount currency tone?>`.

- [ ] **Step 1: Create the branch**

```bash
git checkout main && git checkout -b feat/core-atoms
```

- [ ] **Step 2: Write the failing test**

Two things are worth testing here: that the avatar's initials are deterministic, and that no atom smuggles in a hardcoded color. Everything else is visual and belongs in Storybook.

```ts
// src/components/core/atoms/atoms.test.ts
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { initialsOf } from '@/components/core/atoms/Avatar/initials'

const atomsDir = join(process.cwd(), 'src/components/core/atoms')

describe('initialsOf', () => {
  it('takes the first letter of the first and last word', () => {
    expect(initialsOf('Nguyễn Văn Nam')).toBe('NN')
  })

  it('takes two letters from a single word', () => {
    expect(initialsOf('Nam')).toBe('NA')
  })

  it('uppercases and keeps diacritics', () => {
    expect(initialsOf('đức minh')).toBe('ĐM')
  })

  it('returns a placeholder for an empty name', () => {
    expect(initialsOf('   ')).toBe('?')
  })
})

describe('atom styling', () => {
  const files = readdirSync(atomsDir, { recursive: true, encoding: 'utf8' })
    .filter((f) => f.endsWith('index.tsx'))
    .map((f) => join(atomsDir, f))

  it.each(files)('%s uses no hardcoded color', (file) => {
    const source = readFileSync(file, 'utf8')
    expect(source).not.toMatch(/#[0-9a-fA-F]{3,8}\b/)
    expect(source).not.toMatch(/\brgba?\(/)
    expect(source).not.toMatch(/\b(bg|text|border)-(red|green|blue|slate|gray|emerald|sky|amber)-\d{2,3}\b/)
  })
})
```

- [ ] **Step 3: Run it to verify it fails**

Run: `npm test -- atoms`
Expected: FAIL — `@/components/core/atoms/Avatar/initials` does not exist.

- [ ] **Step 4: Implement the initials helper**

```tsx
// src/components/core/atoms/Avatar/initials.ts
export function initialsOf(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return '?'
  if (words.length === 1) return words[0].slice(0, 2).toLocaleUpperCase('vi')
  return (words[0][0] + words[words.length - 1][0]).toLocaleUpperCase('vi')
}
```

- [ ] **Step 5: Implement the eight atoms**

Add each with `class-variance-authority` for variants and `cn` for merging, styling exclusively through semantic utilities (`bg-primary`, `text-credit`, `border-border`, `rounded-[--radius-control]`). `Button` needs `variant: default | secondary | ghost | outline | destructive` and `size: default | sm | lg | icon`, with `min-h-touch-min` on every size so the 48px floor holds. `Money` renders `formatCurrency` output inside a `tabular-nums` span and takes `tone?: 'credit' | 'debit' | 'neutral'`. `Sheet` wraps `vaul` for the mobile bottom sheet. Give each atom a `.stories.tsx` covering its variants, sizes, disabled state, and — for `Money` — a VND value and a long Vietnamese name in `Avatar`.

- [ ] **Step 6: Run the test to verify it passes**

Run: `npm test -- atoms`
Expected: 4 initials cases plus one styling case per atom, all passing.

- [ ] **Step 7: Configure Storybook**

```bash
npx storybook@latest init --builder webpack5 --type nextjs --yes
```

Then point `.storybook/preview.ts` at the global stylesheet so tokens apply:

```ts
import '../src/styles/globals.css'
import type { Preview } from '@storybook/react'

const preview: Preview = {
  parameters: { layout: 'centered' },
}

export default preview
```

- [ ] **Step 8: Verify Storybook builds**

```bash
npm run build-storybook
```

Expected: a successful build into `storybook-static`. Run this alone; it is memory-heavy.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat(atoms): add eight core atoms with storybook"
```

---

### Task 9: AppShell — responsive navigation

**Files:**
- Create: `src/components/core/templates/AppShell/{index.tsx,BottomNav.tsx,Sidebar.tsx,GroupHeader.tsx,navigation.ts}`
- Create: `src/hooks/useAppNavigation.ts`
- Create: `src/app/groups/layout.tsx`, `src/app/groups/page.tsx`, `src/app/groups/[groupId]/{layout.tsx,page.tsx,expenses/page.tsx,balances/page.tsx,stats/page.tsx,activity/page.tsx,information/page.tsx}`, `src/app/settings/page.tsx`
- Test: `src/components/core/templates/AppShell/navigation.test.ts`

**Interfaces:**
- Consumes: atoms from Task 8, i18n from Task 7.
- Produces: `navigationFor(pathname: string): { scope: 'app' | 'group'; groupId: string | null; items: NavItem[] }` where `NavItem` is `{ key: string; href: string; icon: string; active: boolean }`.

- [ ] **Step 1: Create the branch**

```bash
git checkout main && git checkout -b feat/app-shell
```

- [ ] **Step 2: Write the failing test**

Navigation is the one part of the shell with real branching, so it is pulled into a pure function and tested directly.

```ts
// src/components/core/templates/AppShell/navigation.test.ts
import { navigationFor } from '@/components/core/templates/AppShell/navigation'

describe('navigationFor', () => {
  it('shows no group navigation on the group list', () => {
    const nav = navigationFor('/groups')
    expect(nav.scope).toBe('app')
    expect(nav.groupId).toBeNull()
    expect(nav.items).toEqual([])
  })

  it('shows four destinations inside a group', () => {
    const nav = navigationFor('/groups/abc123/expenses')
    expect(nav.scope).toBe('group')
    expect(nav.groupId).toBe('abc123')
    expect(nav.items.map((i) => i.key)).toEqual([
      'expenses', 'balances', 'stats', 'activity',
    ])
  })

  it('marks the current destination active', () => {
    const nav = navigationFor('/groups/abc123/balances')
    expect(nav.items.find((i) => i.active)?.key).toBe('balances')
  })

  it('keeps expenses active on a nested expense route', () => {
    const nav = navigationFor('/groups/abc123/expenses/create')
    expect(nav.items.find((i) => i.active)?.key).toBe('expenses')
  })

  it('treats the group root as expenses', () => {
    const nav = navigationFor('/groups/abc123')
    expect(nav.items.find((i) => i.active)?.key).toBe('expenses')
  })

  it('builds hrefs under the current group', () => {
    const nav = navigationFor('/groups/abc123/expenses')
    expect(nav.items.find((i) => i.key === 'stats')?.href).toBe('/groups/abc123/stats')
  })

  it('shows no group navigation on settings', () => {
    expect(navigationFor('/settings').scope).toBe('app')
  })
})
```

- [ ] **Step 3: Run it to verify it fails**

Run: `npm test -- navigation`
Expected: FAIL — module not found.

- [ ] **Step 4: Implement `navigation.ts`**

```ts
export type NavItem = {
  key: string
  href: string
  icon: string
  active: boolean
}

export type Navigation = {
  scope: 'app' | 'group'
  groupId: string | null
  items: NavItem[]
}

const GROUP_DESTINATIONS = [
  { key: 'expenses', icon: 'receipt' },
  { key: 'balances', icon: 'scale' },
  { key: 'stats', icon: 'chart' },
  { key: 'activity', icon: 'history' },
] as const

export function navigationFor(pathname: string): Navigation {
  const match = pathname.match(/^\/groups\/([^/]+)(?:\/([^/]+))?/)
  const groupId = match?.[1] ?? null
  if (!groupId || groupId === 'create') {
    return { scope: 'app', groupId: null, items: [] }
  }

  const section = match?.[2] ?? 'expenses'
  return {
    scope: 'group',
    groupId,
    items: GROUP_DESTINATIONS.map(({ key, icon }) => ({
      key,
      icon,
      href: `/groups/${groupId}/${key}`,
      active: section === key,
    })),
  }
}
```

- [ ] **Step 5: Run it to verify it passes**

Run: `npm test -- navigation`
Expected: 7 passing.

- [ ] **Step 6: Build the shell components**

`AppShell/index.tsx` is a client component that calls `usePathname()`, passes it to `navigationFor`, and renders `Sidebar` from `lg` upward and `BottomNav` below it — both from the same items array, so they can never drift. `GroupHeader` shows the group name, links back to `/groups`, and opens a `Sheet` with information, edit, share and export entries. The shell applies `pb-thumb-safe` to its scroll container.

Every visible string comes from `useTranslations('common')`. Icons are `<svg>` elements loaded from `public/icons/`.

- [ ] **Step 7: Create the route stubs**

Each page is metadata plus its template. Screens whose templates arrive in later slices render an empty `<main />` for now, so navigation is walkable end to end:

```tsx
// src/app/groups/[groupId]/balances/page.tsx
import { getTranslations } from 'next-intl/server'

export async function generateMetadata() {
  const t = await getTranslations('balances')
  return { title: t('title') }
}

export default function BalancesPage() {
  return <main />
}
```

`/groups/[groupId]/page.tsx` redirects to `./expenses`.

- [ ] **Step 8: Verify the build**

```bash
npm run build
```

Expected: every route compiles. Run alone.

- [ ] **Step 9: Walk the shell by hand**

```bash
npm run dev
```

Visit `/groups`, then a group URL. Confirm: no bottom bar on `/groups`; four destinations inside a group; the sidebar replaces the bottom bar when the window is widened past 1024px; the language switcher changes the interface language. Stop the server afterwards.

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "feat(shell): add responsive app shell and route stubs"
```

---

### Task 10: Playwright harness

**Files:**
- Create: `playwright.config.ts`, `e2e/{fixtures.ts,ui.ts,app.ts,shell.spec.ts}`
- Create: `scripts/e2e-db.sh`

**Interfaces:**
- Consumes: the running application from Task 9.
- Produces: `npm run e2e` executing specs against a locally started server; the fixtures `seedActiveUser` and `exchangeRate`.

- [ ] **Step 1: Create the branch**

```bash
git checkout main && git checkout -b test/playwright-harness
```

- [ ] **Step 2: Port the helpers**

```bash
cp "$SPLIIT/e2e/ui.ts" "$SPLIIT/e2e/fixtures.ts" "$SPLIIT/e2e/app.ts" e2e/
```

These already pin `NEXT_LOCALE=en-US`, seed the active user, and stub `api.frankfurter.dev`. Do not reimplement any of that.

- [ ] **Step 3: Write `playwright.config.ts`**

Spliit starts the app with docker compose. This machine has the daemon off and under a gigabyte free, so Playwright starts the server itself instead:

```ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  outputDir: './test-results',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-report' }]],
  webServer: {
    command: 'npm run start',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
    timeout: 120_000,
  },
  use: {
    baseURL: 'http://localhost:3000',
    navigationTimeout: 30_000,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'off',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 900 },
        locale: 'en-US',
        timezoneId: 'UTC',
      },
    },
  ],
})
```

`workers: 1` and `fullyParallel: false` depart from spliit's four workers: parallel Chromium instances will not fit in the available memory. `video: 'off'` for the same reason.

- [ ] **Step 4: Write the failing shell spec**

```ts
// e2e/shell.spec.ts
import { expect } from '@playwright/test'
import { test } from './fixtures'

test('the group list has no in-group navigation', async ({ page }) => {
  await page.goto('/groups')
  await expect(page.getByRole('navigation', { name: 'Group sections' })).toBeHidden()
})

test('a group shows four destinations on desktop', async ({ page }) => {
  await page.goto('/groups')
  await expect(page).toHaveURL(/\/groups$/)
})
```

- [ ] **Step 5: Build, then run it to verify it fails**

```bash
npm run build
```
```bash
npm run e2e -- shell
```

Expected: the first test fails until `AppShell` labels its group navigation `Group sections`.

- [ ] **Step 6: Add the accessible name**

Give the group navigation element `aria-label` sourced from `common.nav.groupSections` in both locales, and re-run.

- [ ] **Step 7: Run it to verify it passes**

```bash
npm run e2e -- shell
```

Expected: both pass.

- [ ] **Step 8: Capture the baseline screenshots**

```bash
npx playwright screenshot --viewport-size=390,844 http://localhost:3000/groups docs/screenshots/groups-390.png
```
```bash
npx playwright screenshot --viewport-size=1440,900 http://localhost:3000/groups docs/screenshots/groups-1440.png
```

Review both against the design reference: emerald primary, slate ground, hairline cards, no clipped diacritics.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "test(e2e): add playwright harness with local web server"
```

---

## Phase 0 exit criteria

All of the following must hold before slice work begins:

- `npm test` green, covering the 7 ported suites plus `currency-input`, `expense-payload`, `expense-defaults`, `stats-range`, `expense-split`, `receipt-extract`, `prisma-schema`, `app-router`, `tokens`, `messages`, `atoms`, `navigation`.
- `npm run check-types` and `npm run lint` clean.
- `npm run build` succeeds.
- `npm run e2e -- shell` passes.
- `messages/vi` covers every key in `messages/en-US`.
- `git remote -v` is empty.

## What comes next

Each Phase 1 slice gets its own plan document, written immediately before it is
executed so it can account for what the previous slice actually produced:

1. `GroupList` and `GroupForm` — gated by `group-management`, `global-balance`
2. `ExpenseList` — gated by `core`
3. `ExpenseForm` — gated by `split-modes`, `expense-variants`, `expense-edit-delete`, `multi-currency`, `repayment-currency`, `recurrence`
4. `BalanceList` — gated by `reimbursements`
5. `GroupStats` — gated by `stats`, `stats-breakdown`
6. `ActivityLog` and `GroupInfo`
7. `Settings` and the active-user modal — gated by `active-user`
8. PWA and service worker — gated by `pwa`

---

## Execution record

Phase 0 is complete. Every exit criterion holds: 20 Jest suites / 242 tests green,
`check-types` and `lint` clean, `next build` compiles 17 routes, 6 Playwright specs
pass, `messages/vi` covers all 369 English keys, and `git remote -v` is empty.

Nine deviations from the plan, all forced by what the code or the machine actually
required:

1. **Node 24 was installed.** Prisma 7 refuses odd-numbered Node releases outright, so
   the machine's 23.11.1 could not install it. Node 24.20.0 was added through nvm and
   pinned per-project with `.nvmrc`. The user's `default` alias resolves through
   `node -> stable`, so it now points at 24 as a side effect; 23.11.1 remains installed.
2. **npm 11 blocks install scripts.** `prisma`, `@prisma/engines`, `@swc/core`,
   `unrs-resolver`, `@parcel/watcher` and `esbuild` had to be approved explicitly with
   `npm install-scripts approve` before the Prisma engine would download.
3. **`deepmerge` and `decimal.js` were added as direct dependencies.** spliit imports
   both but declares neither, relying on transitive resolution.
4. **The ESLint config uses spliit's `defineConfig` form.** The `FlatCompat` config in
   the plan crashes against eslint-config-next 16 with a circular-reference error.
5. **`src/i18n/locales.ts` was pulled forward into Task 3, and the message split and
   `request.ts` into Task 5.** `currency.ts` and `locale.ts` do not type-check without
   the locale union, and next-intl refuses to load `next.config.mjs` without a request
   configuration module. The locale constants live in their own module rather than in
   `request.ts` so importing the `Locale` type does not drag in server-only code.
6. **The currency data generator was rewritten as plain Node.** `ts-node -T` failed on
   this tsconfig; `scripts/generate-currency-data.mjs` reads the locales and currency
   codes out of the source files so the three cannot drift.
7. **Three inherited workarounds were fixed rather than carried across.**
   `useMediaQuery` and `useBaseUrl` are now built on `useSyncExternalStore`, so
   `react-hooks/set-state-in-effect` does not have to be disabled as spliit disables it;
   `useActiveUser` was dropped, since the spec replaces it with a store. `prisma.ts` uses
   `server-only` plus a typed global instead of `undefined as any as PrismaClient`.
   `SplittingOptions` is typed against `ExpenseFormInput`, removing the `'1' as any`.
8. **The perf-instrumentation harness was dropped.** It belongs to spliit's
   `compose.perf.yaml` benchmark suite, which is not part of the port.
9. **`output: 'standalone'` was removed and Playwright starts its own server.**
   Next refuses to serve a standalone build through `next start`, and Docker is not
   available on this machine. Jest also needed `superjson`, `copy-anything`, `is-what`
   and `nanoid` spliced into next/jest's `transformIgnorePatterns`: they ship ESM only
   and the suite runs as CommonJS.
