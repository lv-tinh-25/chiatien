# Spec Conformance Update Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement
> this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close every gap between the shipped application and
`docs/superpowers/specs/2026-09-05-chiatien-design.md`, found by auditing the code against
the spec rather than against the plan that implemented it.

**Architecture:** Twelve independent branches, each one gap or one cluster of gaps that
share a component. No change to `src/lib` or `src/trpc`.

**Tech Stack:** Unchanged. Every dependency the missing features need is already installed
and currently unused: `@radix-ui/react-toast`, `next-s3-upload`, `html5-qrcode`, `cmdk`,
`@radix-ui/react-popover`.

**Spec:** `docs/superpowers/specs/2026-09-05-chiatien-design.md`

## Global Constraints

- Never push. No git remote, no `gh`, no pull requests.
- Identifiers, files, branches, commits, comments in English. Vietnamese only in
  `messages/vi/*.json`.
- No display string hardcoded in a component; everything through `next-intl`.
- No `any`, no `as`, no `@ts-ignore`, no `@ts-expect-error`.
- Semantic colour tokens only. `--debit` and `--destructive` stay distinct.
- Logic in hooks and `src/lib`; templates compose.
- `src/lib` and `src/trpc` are a ported contract and must not change.
- The five `data-testid` values, the routes, and the English strings stay stable; all 57
  Playwright tests and 292 unit tests must still pass.

---

## How the gaps were found

Every message key in `messages/en-US/` was matched against every `.ts`/`.tsx` file in
`src` and `e2e`. 43 of 381 keys are never referenced. A key that exists but is never
rendered means the affordance spliit had was not rebuilt — the audit therefore reads the
translations as an inventory of features. Each unreferenced key was then traced back to
the spliit component that renders it, and the spec re-read to decide whether its absence
is deliberate.

Two keys are legitimately absent: `Footer.*` and `Homepage.*` belong to spliit's marketing
site, which §5's route table does not include. Everything else is a gap.

| # | Gap | Spec authority |
| - | --- | -------------- |
| 1 | `/settings` is linked only from the desktop sidebar, which renders only inside a group. On mobile, and anywhere outside a group, the language switcher cannot be reached at all. | §5: "settings reachable from the header" |
| 2 | Negotiation falls back to `en-US` when the browser states no preference. | §1 "Vietnamese-first"; CLAUDE.md "Vietnamese is the primary display language" |
| 3 | Stats totals never use `groupEarnings`/`yourEarnings`; a net income renders as negative spending. Your-spending and your-share are not toned credit/debit. | §1 parity |
| 4 | `ActivityLog` renders a flat list. Spliit groups activities under nine date headings and drops the date on today's and yesterday's rows. | §1 parity; `lib/date-groups.ts` is ported and unit-tested but unused |
| 5 | No toast infrastructure, so removing a recent group cannot be undone. | §1 parity |
| 6 | `CurrencySelect` is a plain listbox: no search across 34 currencies, no custom-currency option, and the symbol field never hides. | §1 parity |
| 7 | The exchange-rate feedback states are missing: five `conversionRateState.*`, `conversionUnavailable`, `conversionRateField.useApi`. | §6 lists the conversion hook as owning them |
| 8 | Expense documents are entirely absent: the `ENABLE_EXPENSE_DOCUMENTS` flag, `/api/s3-upload`, `lib/uploaded-image-url.ts` and `next-s3-upload` are all ported and unused. | §1 "expense documents"; §6 lists `ExpenseDocumentsField` |
| 9 | Create-from-receipt is entirely absent: `ENABLE_RECEIPT_EXTRACT` and `lib/receipt-extract.ts` are ported and unused. | §1 "receipt … extraction behind feature flags" |
| 10 | No QR scanner for joining by URL, no QR download or native share on the share sheet. | §1 parity |
| 11 | `ExpenseCard` shows nothing when the viewer is a participant with no stake in an expense. | §1 parity |
| 12 | The root layout exports no metadata, so the app has no title or description. `offline.html` is English-only with `lang="en"`. The service worker names its caches `spliit-*`. `Footer.madeIn` still credits spliit's author. | §1; CLAUDE.md rule 2 |

`Nav.mainSections` is unused because neither the sidebar nor the bottom bar labels its
`nav` landmark; folded into task 1.

---

## Task 1: Reach the settings screen

**Files:**
- Modify: `src/components/core/templates/GroupList/index.tsx`
- Modify: `src/components/core/templates/GroupHeader/index.tsx`
- Modify: `src/components/core/templates/AppShell/BottomNav.tsx`
- Modify: `src/components/core/templates/AppShell/Sidebar.tsx`
- Test: `e2e/settings.spec.ts`

**Interfaces:**
- Produces: nothing other components consume.

- [ ] **Step 1: Write the failing spec**

```ts
test('reaches the language switcher from the group list', async ({ page }) => {
  await page.goto('/groups')
  await page.getByRole('link', { name: 'Settings' }).click()
  await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible()
})
```

- [ ] **Step 2: Run it and watch it fail** — `npx playwright test settings`
- [ ] **Step 3: Add a settings link to the `GroupList` header** beside "Create group",
  labelled `Nav.settings`, rendering a `Settings` icon plus text.
- [ ] **Step 4: Add a settings entry to the group overflow sheet** in `GroupHeader`, after
  the export entries, so the switcher is reachable on mobile from inside a group too.
- [ ] **Step 5: Label both nav landmarks** with `aria-label={t('mainSections')}` from `Nav`.
- [ ] **Step 6: Run the spec and the suite** — `npx playwright test settings core`
- [ ] **Step 7: Commit** `fix(navigation): reach settings from the group list and overflow sheet`

## Task 2: Default to Vietnamese when the browser has no preference

**Files:**
- Modify: `src/i18n/locales.ts`
- Modify: `src/lib/locale.ts`
- Test: `src/i18n/messages.test.ts`

**Interfaces:**
- Produces: `displayLocale: Locale` exported from `@/i18n/locales`, the locale chosen when
  Accept-Language matches nothing. `defaultLocale` keeps its meaning — the merge base and
  the language every key is guaranteed to exist in.

- [ ] **Step 1: Write the failing test**

```ts
it('shows Vietnamese to a browser that states no preference', () => {
  expect(displayLocale).toBe('vi')
})

it('merges every locale on top of English', () => {
  expect(defaultLocale).toBe('en-US')
})
```

- [ ] **Step 2: Run it and watch it fail** — `npx jest src/i18n`
- [ ] **Step 3: Export `displayLocale = 'vi'`** from `locales.ts` with a comment recording
  why it differs from `defaultLocale`.
- [ ] **Step 4: Pass `displayLocale` to `match()`** in `getAcceptLanguageLocale`, and use it
  as the final fallback of `getUserLocale`. `request.ts` keeps merging onto `defaultLocale`.
- [ ] **Step 5: Run the tests** — `npx jest src/i18n && npx playwright test core`
  (the e2e fixtures pin the `NEXT_LOCALE` cookie, so specs are unaffected).
- [ ] **Step 6: Commit** `update(i18n): default to Vietnamese without an Accept-Language match`

## Task 3: Earnings in the stats totals

**Files:**
- Create: `src/components/core/templates/GroupStats/TotalsCard.tsx`
- Modify: `src/components/core/templates/GroupStats/index.tsx`

**Interfaces:**
- Consumes: `stats` from `useGroupStats`.
- Produces: `TotalsCard`, props
  `{ totalGroupSpendings: number; totalParticipantSpendings?: number; totalParticipantShare?: number; currency: Currency; locale: Locale }`.

- [ ] **Step 1: Move the totals card into `TotalsCard.tsx`** unchanged, so `index.tsx` keeps
  composing only.
- [ ] **Step 2: Flip the label on a negative total.** `totalGroupSpendings < 0` selects
  `Totals.groupEarnings`, `totalParticipantSpendings < 0` selects `Totals.yourEarnings`, and
  both render `Math.abs()`.
- [ ] **Step 3: Tone your-spending and your-share** `credit` when negative, `debit` when
  positive, through `Money`'s existing `tone` prop.
- [ ] **Step 4: Verify** — `npx playwright test stats`
- [ ] **Step 5: Commit** `fix(stats): label a negative total as earnings`

## Task 4: Date headings in the activity log

**Files:**
- Create: `src/lib/activity-groups.ts`
- Create: `src/lib/activity-groups.test.ts`
- Modify: `src/hooks/activities/useActivityLog.ts`
- Modify: `src/components/core/templates/ActivityLog/index.tsx`

**Interfaces:**
- Consumes: `getWeekStartsOn`, `isSameWeek` from `@/lib/date-groups`.
- Produces:

```ts
export const ACTIVITY_DATE_GROUPS = ['today','yesterday','earlierThisWeek','lastWeek','earlierThisMonth','lastMonth','earlierThisYear','lastYear','older'] as const
export type ActivityDateGroup = (typeof ACTIVITY_DATE_GROUPS)[number]
export function activityDateGroup(time: Date, today: Date, weekStartsOn: number): ActivityDateGroup
export function groupActivitiesByDate<T extends { time: Date }>(activities: T[], weekStartsOn: number, today?: Date): { group: ActivityDateGroup; activities: T[] }[]
```

- [ ] **Step 1: Write the failing test**

```ts
const today = new Date('2026-09-05T12:00:00Z')
const at = (iso: string) => ({ time: new Date(iso) })

describe('activityDateGroup', () => {
  it('names the day itself', () => {
    expect(activityDateGroup(new Date('2026-09-05T01:00:00Z'), today, 1)).toBe('today')
  })
  it('names the day before', () => {
    expect(activityDateGroup(new Date('2026-09-04T23:00:00Z'), today, 1)).toBe('yesterday')
  })
  it('separates earlier this week from last week', () => {
    expect(activityDateGroup(new Date('2026-08-31T10:00:00Z'), today, 1)).toBe('earlierThisWeek')
    expect(activityDateGroup(new Date('2026-08-28T10:00:00Z'), today, 1)).toBe('lastWeek')
  })
  it('falls back to older', () => {
    expect(activityDateGroup(new Date('2019-01-01T00:00:00Z'), today, 1)).toBe('older')
  })
})

describe('groupActivitiesByDate', () => {
  it('keeps the spec order and drops empty groups', () => {
    const result = groupActivitiesByDate([at('2019-01-01'), at('2026-09-05T02:00:00Z')], 1, today)
    expect(result.map((entry) => entry.group)).toEqual(['today', 'older'])
  })
})
```

- [ ] **Step 2: Run it and watch it fail** — `npx jest activity-groups`
- [ ] **Step 3: Implement `activity-groups.ts`** following `expense-groups.ts`: dayjs
  comparisons, `isSameWeek` for the two week buckets, `ACTIVITY_DATE_GROUPS` order preserved.
- [ ] **Step 4: Run the test** — `npx jest activity-groups`
- [ ] **Step 5: Return `sections` from `useActivityLog`** instead of a flat `activities`
  array, calling `groupActivitiesByDate` with `getWeekStartsOn(locale)`.
- [ ] **Step 6: Render a heading per section** in the template, reusing the `ExpenseList`
  section heading treatment, and pass `dateStyle: undefined` for today and yesterday so
  those rows show a time instead of a date.
- [ ] **Step 7: Verify** — `npm test && npx playwright test core`
- [ ] **Step 8: Commit** `feat(activity): group the log under date headings`

## Task 5: Toasts, and undo when a group is forgotten

**Files:**
- Create: `src/components/core/molecules/Toast/index.tsx`
- Create: `src/stores/useToastStore.ts`
- Modify: `src/app/layout.tsx`
- Modify: `src/components/core/templates/GroupList/index.tsx`
- Modify: `src/hooks/groups/useGroupList.ts`

**Interfaces:**
- Produces:

```ts
export type Toast = { id: string; title: string; description?: string; action?: { label: string; onAction: () => void } }
export const useToastStore: UseBoundStore<StoreApi<{ toasts: Toast[]; show: (toast: Omit<Toast, 'id'>) => void; dismiss: (id: string) => void }>>
export function ToastViewport(): ReactNode
```

- [ ] **Step 1: Build `useToastStore`** on zustand, not persisted — a toast must not survive
  a reload. `show` generates an id with `nanoid`, already a dependency.
- [ ] **Step 2: Build `ToastViewport`** on `@radix-ui/react-toast`, positioned above
  `--spacing-thumb-safe` so it clears the bottom bar, with `--card`/`--border` tokens.
- [ ] **Step 3: Mount `ToastViewport`** in the root layout inside `NextIntlClientProvider`.
- [ ] **Step 4: Show a toast from `forget`** in `GroupList`, titled
  `Groups.RecentRemovedToast.title` with an action labelled `RecentRemovedToast.undo` that
  restores the group through `visit`.
- [ ] **Step 5: Verify** — `npm run check-types && npx playwright test group-management`
- [ ] **Step 6: Commit** `feat(toast): add toast notifications and undo a forgotten group`

## Task 6: Searchable currency select with a custom option

**Files:**
- Modify: `src/components/core/molecules/CurrencySelect/index.tsx`
- Modify: `src/components/core/templates/GroupForm/GroupDetailsFields.tsx`

**Interfaces:**
- Consumes: `defaultCurrencyList(locale, customChoice)` — the second parameter is already
  in the ported `lib/currency.ts` and prepends an entry whose `code` is `''`.
- Produces: `CurrencySelect` gains `customLabel?: string` and `emptyLabel: string`.

- [ ] **Step 1: Rebuild `CurrencySelect` as a `cmdk` combobox in a `Popover`**, filtering on
  name and code, rendering `Currencies.noCurrency` when nothing matches, keeping the
  existing `id`/`aria-describedby` contract so `fieldByLabel` still resolves it.
- [ ] **Step 2: Pass `t('CurrencyCodeField.customOption')`** as `customLabel` from
  `GroupDetailsFields`.
- [ ] **Step 3: Hide the symbol field** while `currencyCode` is non-empty, matching spliit:
  the symbol is derived from the code and only editable for a custom currency.
- [ ] **Step 4: Verify** — `npx playwright test group-management multi-currency`
- [ ] **Step 5: Commit** `feat(currency): search the currency list and allow a custom one`

## Task 7: Exchange-rate feedback

**Files:**
- Modify: `src/hooks/expenses/useExpenseCurrencyConversion.ts`
- Modify: `src/components/core/templates/ExpenseForm/ExpenseCurrencyBlock.tsx`

**Interfaces:**
- Produces: `useExpenseCurrencyConversion` additionally returns
  `rateState: { key: 'staleRate' | 'noRate' | 'currencyNotFound' | 'noDate' | 'dateMismatch'; values?: { date: string } } | null`
  and `canConvert: boolean`.

- [ ] **Step 1: Derive `rateState` in the hook** from the same conditions spliit checks in
  `expense-form.tsx:505-540`: a rate whose date differs from the expense date
  (`dateMismatch`, carrying the rate's date), a rate older than the expense
  (`staleRate`), no rate at all (`noRate`), a currency the API does not know
  (`currencyNotFound`), and an expense with no date yet (`noDate`).
- [ ] **Step 2: Render the message** under the conversion-rate field as a
  `text-muted-foreground` note, and disable the field with `conversionRateField.useApi` as
  its hint while a fetched rate is in use.
- [ ] **Step 3: Render `conversionUnavailable`** in place of the conversion controls when
  the group has no `currencyCode`, since there is nothing to convert into.
- [ ] **Step 4: Verify** — `npx playwright test multi-currency repayment-currency`
- [ ] **Step 5: Commit** `feat(expenses): explain why an exchange rate was or was not used`

## Task 8: Expense documents

**Files:**
- Create: `src/components/core/templates/ExpenseForm/ExpenseDocumentsField.tsx`
- Create: `src/hooks/expenses/useExpenseDocuments.ts`
- Modify: `src/components/core/templates/ExpenseForm/index.tsx`
- Modify: `src/hooks/expenses/useExpenseForm.ts`
- Modify: `src/app/groups/[groupId]/expenses/create/page.tsx`
- Modify: `src/app/groups/[groupId]/expenses/[expenseId]/edit/page.tsx`
- Modify: `src/components/core/templates/ExpenseList/ExpenseCard.tsx`

**Interfaces:**
- Consumes: `useS3Upload` from `next-s3-upload`; `getUploadedImageUrl` from
  `@/lib/uploaded-image-url`; `documents` on `expenseFormSchema`, already present.
- Produces: `useExpenseDocuments(form)` returning
  `{ documents, isUploading, upload: (file: File) => Promise<void>, remove: (index: number) => void, error: string | null }`.

- [ ] **Step 1: Build the hook.** Upload through `useS3Upload`, append
  `{ url, width, height }` to the `documents` field array, and keep the last error so the
  field can offer `ExpenseDocumentsInput.ErrorToast.retry`.
- [ ] **Step 2: Build the field.** A labelled file input plus a thumbnail grid with a
  remove button per document, using `attachDocuments` as the heading and
  `${Expense|Income}.attachDescription` as the description.
- [ ] **Step 3: Render it behind the flag.** Thread `documentsEnabled` from
  `getRuntimeFeatureFlags()` through both pages into `ExpenseForm`, matching how
  `categoryExtractEnabled` already travels.
- [ ] **Step 4: Show the count on the card** — a paperclip and `_count.documents` beside
  the date, hidden at zero.
- [ ] **Step 5: Verify** — `npm run check-types && npx playwright test expense-variants`
  (the flag is off in the harness, so the field must not appear).
- [ ] **Step 6: Commit** `feat(expenses): attach documents to an expense`

## Task 9: Create an expense from a receipt

**Files:**
- Create: `src/components/core/templates/ExpenseList/CreateFromReceipt.tsx`
- Create: `src/hooks/expenses/useReceiptExtract.ts`
- Modify: `src/components/core/templates/ExpenseList/index.tsx`
- Modify: `src/app/groups/[groupId]/expenses/page.tsx`

**Interfaces:**
- Consumes: `extractExpenseInformationFromImage` from `@/lib/receipt-extract`;
  `useS3Upload`.
- Produces: `useReceiptExtract(groupId)` returning
  `{ open, setOpen, isUploading, isExtracting, result, error, pick: (file: File) => Promise<void>, editNext: () => void }`.

- [ ] **Step 1: Build the hook.** Upload the image, call the extractor, hold the returned
  title/amount/date, and navigate to the create form with them as query parameters —
  the same mechanism the balance screen already uses for a settlement.
- [ ] **Step 2: Build the dialog** with `Dialog.triggerTitle`, `selectImage`, the three
  read-back labels and `editNext`.
- [ ] **Step 3: Read the query parameters** in `useExpenseForm`'s default values, beside
  the existing `reimbursement` handling.
- [ ] **Step 4: Render the trigger behind the flag** in the `ExpenseList` header.
- [ ] **Step 5: Verify** — `npm run check-types && npx playwright test core`
- [ ] **Step 6: Commit** `feat(expenses): create an expense from a receipt photo`

## Task 10: QR codes

**Files:**
- Create: `src/components/core/templates/GroupList/QrScanner.tsx`
- Modify: `src/components/core/templates/GroupList/AddGroupByUrl.tsx`
- Modify: `src/components/core/templates/GroupHeader/ShareSheet.tsx`

**Interfaces:**
- Consumes: `Html5Qrcode` from `html5-qrcode`.
- Produces: `QrScanner`, props `{ onScan: (text: string) => void; labels: { start: string; stop: string; permissionDenied: string; noCamera: string; cameraError: string; permissionError: string } }`.

- [ ] **Step 1: Add the two modes to `AddGroupByUrl`** — paste a URL, or scan — labelled
  `urlMode` and `qrMode`.
- [ ] **Step 2: Build `QrScanner`.** Start on demand, stop on unmount, and map each camera
  failure onto its `scanner.*` message.
- [ ] **Step 3: Add a download button to the share sheet** that saves the QR canvas as a
  PNG, labelled `Share.qrCode.download`.
- [ ] **Step 4: Offer the native share sheet** with `navigator.share` when it exists,
  titled `Share.shareLink`, falling back to copy.
- [ ] **Step 5: Verify** — `npm run check-types && npx playwright test group-management`
- [ ] **Step 6: Commit** `feat(groups): scan a group QR code and share one`

## Task 11: Not involved

**Files:**
- Modify: `src/components/core/templates/ExpenseList/ExpenseCard.tsx`

- [ ] **Step 1: Render `notInvolved`** when an active user is set and has neither paid for
  nor owes anything on the expense, in place of the balance line.
- [ ] **Step 2: Verify** — `npx playwright test core active-user`
- [ ] **Step 3: Commit** `fix(expenses): say when the viewer is not involved in an expense`

## Task 12: Metadata, offline page, branding

**Files:**
- Modify: `src/app/layout.tsx`
- Modify: `src/app/manifest.ts`
- Modify: `public/offline.html`
- Modify: `public/sw.js`
- Modify: `messages/{vi,en-US}/common.json`

- [ ] **Step 1: Replace the orphaned keys.** Delete `Footer.*` and `Homepage.*`; add
  `Common.appName` and `Common.appDescription`, translated.
- [ ] **Step 2: Export `generateMetadata` from the root layout**, reading those two keys
  through `getTranslations`, with a `%s · ChiaTien` template so every page title composes.
- [ ] **Step 3: Read the same keys in `manifest.ts`** instead of the hardcoded Vietnamese
  description.
- [ ] **Step 4: Make `offline.html` bilingual.** Both languages in the markup, each in a
  `[lang]` element, with a four-line inline script that reveals the one matching
  `navigator.language` and defaults to English — a static file has no other way to
  localise, and the English default keeps `pwa.spec.ts` green.
- [ ] **Step 5: Rename the service-worker caches** from `spliit-*` to `chiatien-*` and bump
  `CACHE_VERSION`, so a client holding spliit-named caches drops them.
- [ ] **Step 6: Verify** — `npm test && npx playwright test pwa`
- [ ] **Step 7: Commit** `fix(app): give the app a title and drop spliit's branding`

---

## Closing out

- [ ] Re-run the key audit; expect zero unreferenced keys apart from none.
- [ ] `npm test`, `npm run check-types`, `npm run lint`, `npm run build`, `npm run e2e`.
- [ ] Append an execution record to this file listing every deviation from the plan.
- [ ] Update the spec's §7 to record that the audit ran and what it found, and CLAUDE.md if
  any rule changed.
