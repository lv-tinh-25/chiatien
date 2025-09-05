# ChiaTien — Design Specification

Date: 2026-09-05
Status: approved for planning

## 1. Goal and scope

Build a self-hosted group expense splitter with a Vietnamese-first interface by porting
the proven core of [spliit](https://github.com/spliit-app/spliit) into a fresh
repository and writing an entirely new UI on top of it.

**In scope.** Feature parity with spliit, exactly: groups shared by URL with no
authentication, participants scoped to a group, expenses with four split modes,
multi-currency with conversion, recurring expenses, expense documents, receipt and
category extraction behind feature flags, balances with suggested reimbursements,
statistics, an activity log, CSV/JSON export, and PWA support.

**Out of scope.** Anything spliit does not already do. Specifically excluded: user
accounts, VietQR or any payment integration, rounding settlements to the nearest
thousand đồng, group cover images, participant photo avatars, two-way settlement
confirmation. These appeared in the visual reference, which is a source of style, not of
requirements.

Spliit is MIT licensed. The obligation is to retain the copyright notice; there is no
requirement to open-source this work.

## 2. What is ported and what is rebuilt

Measured against spliit at commit `ae35cd6`:

| Layer                    | Lines  | Disposition        |
| ------------------------ | -----: | ------------------ |
| `src/lib`                |  4,599 | ported unchanged   |
| `src/trpc` (17 procedures) |   630 | ported unchanged   |
| `src/app/**/*.ts`        |    956 | ported unchanged   |
| `prisma/` (25 migrations) |      — | ported unchanged   |
| `src/components/**`      |  4,217 | discarded, rebuilt |
| `src/app/**/*.tsx`       |  5,990 | discarded, rebuilt |

Roughly 6,200 lines are inherited and 10,200 are written new. The inherited part
contains the hard, well-tested logic: Hamilton apportionment in `shares.ts` guaranteeing
that shares sum exactly to the expense amount, the stable greedy settlement comparator
in `balances.ts`, lazy materialisation of recurring expenses, and minor-unit money
arithmetic throughout.

### 2.1 Logic currently embedded in UI directories

Four files sit under UI paths in spliit but contain no presentation. They are extracted
into `src/lib` (or `src/stores`) during the port, before any UI is written, and their
existing tests move with them:

| Source                                            | Destination                 |
| ------------------------------------------------- | --------------------------- |
| `components/expense-form-actions.tsx`             | `lib/expense-split.ts`      |
| `app/groups/[groupId]/stats/stats-range.ts`       | `lib/stats-range.ts`        |
| `app/groups/recent-groups-helpers.ts`             | `stores/useRecentGroupsStore.ts` |
| `.../create-from-receipt-button-actions.ts`       | `lib/receipt-extract.ts`    |

### 2.2 Client state

Spliit reads `localStorage` directly from components in several places. This becomes two
persisted zustand stores: `useActiveUserStore` (which participant the viewer is, keyed
per group) and `useRecentGroupsStore` (recent, starred and archived group ids). A third,
`useSplittingOptionsStore`, holds the remembered default split configuration.

## 3. Repository structure

```
chiatien/
├── prisma/                       schema.prisma + 25 migrations
├── messages/{vi,en-US}/          common groups expenses balances stats errors .json
├── e2e/                          14 Playwright specs + app.ts fixtures.ts ui.ts
├── public/icons/                 standalone SVG files
└── src/
    ├── app/                      routing, metadata, providers — no business components
    │   ├── api/{trpc,s3-upload,health}/
    │   └── groups/…
    ├── components/core/
    │   ├── atoms/                Button Input Card Badge Avatar Checkbox Money …
    │   ├── molecules/            FormInput FormSelect Modal Sheet EmptyState BottomNav …
    │   └── templates/            one folder per screen
    ├── hooks/{groups,expenses,balances,stats}/
    ├── lib/                      ported, unit-tested
    ├── trpc/                     ported
    ├── stores/                   zustand + persist
    └── i18n/ constants/ types/ utils/ styles/
```

`src/app` holds no business component. Each `page.tsx` is roughly fifteen lines:
metadata plus one template. This is the main structural departure from spliit, which
colocates about forty components beside their routes.

Routes stay in English (`/groups/[groupId]/…`). A URL is not display text, and keeping
spliit's paths lets the ported e2e specs navigate unchanged.

## 4. Design system

### 4.1 Semantic tokens

Defined once in `src/styles/globals.css` as HSL triples, consumed only through
`hsl(var(--token))`:

```css
:root {
  --background: 210 40% 98%;
  --foreground: 222 47% 11%;
  --card: 0 0% 100%;             --card-foreground: 222 47% 11%;
  --muted: 210 40% 96%;          --muted-foreground: 215 16% 47%;
  --border: 214 32% 91%;
  --input: 214 32% 91%;          --ring: 160 84% 39%;

  --primary: 161 94% 30%;        --primary-foreground: 0 0% 100%;
  --primary-active: 163 94% 24%;
  --secondary: 199 89% 48%;
  --accent: 38 92% 50%;

  --credit: 161 94% 30%;         --credit-subtle: 152 81% 96%;
  --debit: 0 84% 60%;            --debit-subtle: 0 86% 97%;
  --destructive: 0 72% 51%;
}
```

Two deliberate separations. `--debit` (money the viewer owes) and `--destructive` (a
system error) are distinct tokens despite rendering the same red, so the two meanings can
diverge later and misuse is greppable. `--credit` is not an alias of `--primary`; a
button and a positive balance merely happen to share a hue today.

Dark mode is deferred. The token structure accommodates a `.dark` block without
rework; phase one ships light only and hides the theme toggle.

### 4.2 Typography

Plus Jakarta Sans, loaded through `next/font/google` with `subsets: ['latin',
'vietnamese']`. Omitting the `vietnamese` subset makes accented glyphs fall back to a
different face and shifts the baseline.

Scale, as Tailwind `fontSize` entries: `display-currency` 36/44 at -0.03em,
`headline-lg` 30/38, `headline-md` 20/28, `headline-sm` 16/24, `body-lg` 16/24,
`body-md` 14/20, `body-sm` 12/18, `numeric-table-lg` 18/24, `numeric-table-md` 15/20,
`label-md` 13/16, `label-sm` 11/14.

### 4.3 Money

A `<Money>` atom wraps the ported `formatCurrency` and always applies
`font-variant-numeric: tabular-nums`, so figures stay in column while a list scrolls.
VND needs no special handling: `currency-data.json` gives it `decimal_digits: 0`, so
`amountAsDecimal` divides by one and a minor unit is a đồng.

### 4.4 Shape, depth, ergonomics

Cards `1rem`, controls `0.75–1rem`, status pills fully round, bottom sheets `1.5rem` on
the top corners. Four elevation levels from a hairline card shadow to a floating action
bar. Minimum tap target `3rem`; scroll containers pad `5rem` at the bottom so the
navigation bar never covers the last row.

## 5. Screens and navigation

| Route                                 | Template      |
| ------------------------------------- | ------------- |
| `/groups`                             | `GroupList`   |
| `/groups/create`                      | `GroupForm`   |
| `/groups/[id]`                        | redirect to `/expenses` |
| `/groups/[id]/expenses`               | `ExpenseList` |
| `/groups/[id]/expenses/create`        | `ExpenseForm` |
| `/groups/[id]/expenses/[eid]/edit`    | `ExpenseForm` |
| `/groups/[id]/balances`               | `BalanceList` |
| `/groups/[id]/stats`                  | `GroupStats`  |
| `/groups/[id]/activity`               | `ActivityLog` |
| `/groups/[id]/information`            | `GroupInfo`   |
| `/groups/[id]/edit`                   | `GroupForm`   |
| `/settings`                           | `Settings`    |

Navigation adapts at `lg` (1024px) and is context-aware rather than a fixed set of tabs:

- Outside a group there is no bottom bar. `GroupList` is single-purpose, with a floating
  "create group" action and settings reachable from the header.
- Inside a group the bottom bar carries four destinations — expenses, balances, stats,
  activity. The header shows the group name and returns to the list; an overflow button
  opens a sheet with information, edit, share and export.
- From `lg` upward a fixed left sidebar replaces the bottom bar and adds information as a
  fifth entry. Content is capped at 1080px.

`AppShell` owns this decision by reading the pathname. No screen manages its own
navigation chrome.

The floating "add expense" action sits above the bottom bar on mobile and becomes a
primary button in the `ExpenseList` header on desktop.

## 6. Decomposing the expense form

`expense-form.tsx` is 1,445 lines: about 90 of pure helpers, 350 of state
synchronisation across five `useEffect` blocks, and 950 of JSX across sixteen form
fields. It is split along those seams.

**To `src/lib`, gaining unit tests.** `enforceCurrencyPattern` → `lib/currency-input.ts`
(this function parses user-entered money and currently has no test at all);
`getDefaultSplittingOptions` → `lib/expense-defaults.ts`; the decimal-to-minor-unit
conversion inside `submit` → `lib/expense-payload.ts`.

**To `src/hooks/expenses/`.** `useExpenseForm` orchestrates: form setup, default values,
submission. `useExpenseCurrencyConversion` owns the three exchange-rate effects —
fetching the rate, converting original currency to group currency, and the reverse
direction used by repayments. `useExpenseSplitBalancing` owns auto-balancing under
`BY_AMOUNT` together with the set of manually edited participants.
`useExpenseCategorySuggestion` owns the AI category call and its loading flag.

**To `templates/ExpenseForm/`.** `index.tsx` composes only, around 80 lines and with no
`useState` or `useEffect`. Beside it: `ExpenseTitleField`, `ExpenseAmountField`,
`ExpenseCurrencyBlock`, `ExpenseMetaFields`, `ExpenseRecurrenceField`, `SplitModeTabs`,
`PaidForList`, `PaidForRow`, `ShareInput` (one file, matching on split mode),
`ExpenseDocumentsField`, `AdvancedSplitCollapsible`, `ExpenseFormFooter`. No file
exceeds 150 lines.

**Risk.** The five effects currently work partly because of their declaration order in a
single file; they communicate through `form.watch()`. Splitting them into hooks preserves
behaviour only if `useExpenseForm` invokes them in the original order. Getting this wrong
fails silently — the two currency fields overwrite each other, or auto-balancing clobbers
a value the user just typed. The specs `multi-currency`, `repayment-currency` and
`split-modes` must pass before work moves on.

## 7. Localisation

`next-intl` is retained: it works in server components, and 369 message keys already
exist. Messages are split into namespaces per locale rather than one file each:

```
messages/{vi,en-US}/{common,groups,expenses,balances,stats,errors}.json
```

Three defects in spliit's Vietnamese support are fixed. Vietnamese is absent from
`localeLabels`, so despite `vi.json` existing it can never be selected — it is added.
That file covers 139 of 369 keys, and `deepmerge` silently falls back to English for the
rest, producing mixed-language screens — the remaining 230 are translated. And
`currency-data.json` carries 24 locales without `vi`, so currency names fall back to
English — `vi` is added to the generator and the data regenerated.

Each vertical slice translates its own namespace. A final pass scripts a diff of key sets
between locales, because the merge fallback reports nothing.

## 8. Testing

**Jest** covers `src/lib` only. The seven existing test files port unchanged; three new
ones cover the functions extracted from the expense form. Green unit tests gate the start
of UI work.

**Playwright** provides the behavioural safety net: 14 specs, written against English
labels, with `NEXT_LOCALE=en-US` already pinned in `e2e/fixtures.ts` alongside a seeded
active user and a stubbed exchange-rate endpoint. Selector usage is 74 `getByRole`, 18
`getByTestId`, 11 `getByText`, 4 `getByLabel`, so the specs survive a visual rewrite
provided that routes, the five `data-testid` attributes and the English strings stay
stable, and that form controls keep real `label`/`htmlFor` associations for
`fieldByLabel`.

The Playwright viewport is 1280×900 and must stay at or above 768px: `useMediaQuery`
swaps Radix Dialog for Vaul Drawer below that width, producing a different component
tree.

**Storybook** documents each atom and molecule across its states and is where token
misuse and clipped diacritics surface.

**Screenshots** at 390, 768 and 1440 accompany each finished screen for human review.
Visual regression baselines are recorded only after a screen is approved.

Component unit tests are deliberately absent: the logic they would exercise lives in
hooks and `lib`. `useExpenseSplitBalancing` is the one hook with enough branching to test
directly.

## 9. Execution order

**Phase 0 — foundation.** Initialise the project; port `prisma/` and stand up Postgres
via docker compose; port `lib`, `trpc` and `app/api` with their seven test files and get
`npm test` green; extract the four embedded-logic files and add their three new tests;
build the token layer, font, Tailwind configuration, the eight atoms every screen
needs (Button, Input, Card, Badge, Avatar, Checkbox, Sheet, Money) and Storybook; build
`AppShell`, wire the namespaced i18n, enable `vi` in `localeLabels` and regenerate
currency data. Phase 0 ends with an application that runs, routes and switches language.

**Phase 1 — vertical slices.** Each slice finishes its namespace translation and turns
its specs green before the next begins.

| # | Screen                        | Gating specs                                                                              |
| - | ----------------------------- | ----------------------------------------------------------------------------------------- |
| 1 | `GroupList`, `GroupForm`      | `group-management`, `global-balance`                                                        |
| 2 | `ExpenseList`                 | `core`                                                                                      |
| 3 | `ExpenseForm`                 | `split-modes`, `expense-variants`, `expense-edit-delete`, `multi-currency`, `repayment-currency`, `recurrence` |
| 4 | `BalanceList`                 | `reimbursements`                                                                            |
| 5 | `GroupStats`                  | `stats`, `stats-breakdown`                                                                  |
| 6 | `ActivityLog`, `GroupInfo`    | —                                                                                           |
| 7 | `Settings`, active-user modal | `active-user`                                                                               |
| 8 | PWA and service worker        | `pwa`                                                                                       |

Slice 3 gates six of the fourteen specs, which is where the risk concentrates.

**Phase 2 — completion.** Script a missing-key sweep across locales, check diacritic
rendering at every type size, and run the full e2e suite.

## 10. Inherited defects

Two known problems come across with the ported core and are not addressed here, because
fixing them would change behaviour and therefore fall outside the parity scope. They are
recorded so they are not mistaken for new bugs.

`calculateNextDate` advances monthly recurrences by clamping the day downward, so a
series starting on 31 January moves permanently to the 28th. Spliit's own comment
proposes replacing it with `rrule`.

`getGroupExpenses` calls `createRecurringExpenses()` on every read, placing write cost on
the read path; a group left idle for a long time pays for the whole catch-up on its next
page load.
