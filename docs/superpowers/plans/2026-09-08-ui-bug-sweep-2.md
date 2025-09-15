# UI Bug Sweep 2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close the ten defects reported on 2026-09-08 — a split that loses what the
user typed, a crash on a blank amount, a wrong total label, misaligned figures, a
select that still wraps, a delete that can run twice, no loading or success feedback
anywhere, and a back button that walks a growing history loop.

**Architecture:** Six are local repairs to a component or a pure function. Three are
cross-cutting and need a convention rather than a patch: a `pending` state on `Button`
plus a `Skeleton` atom for every screen that currently renders `null` while it loads; a
toast on every mutation, success and failure, through the store that already exists; and
`replace` instead of `push` wherever a form's own page is consumed by navigating away
from it. The split-mode repair introduces per-mode memory in `useExpenseSplitBalancing`,
backed by pure functions in `src/lib/expense-split.ts`.

**Tech Stack:** Next.js 16 App Router, React 19 with the React Compiler, TypeScript 6,
Tailwind v4, Radix UI, react-hook-form + Zod, tRPC v11, next-intl, zustand, Jest,
Playwright.

**Spec:** This document. The reports are the user's own, reproduced on this machine on
2026-09-08; the Findings table below records the evidence and is the spec each task
argues from.

## Global Constraints

- English in identifiers, file names, branch names, commit messages and comments.
  Every user-visible string goes through next-intl, in **both** `messages/vi/` and
  `messages/en-US/`.
- No `any`, no `as`, no `@ts-ignore`, no `@ts-expect-error`.
- Semantic colour tokens only. No hex, no `rgb()`, no Tailwind palette classes.
- Logic in hooks, pure functions in `src/lib` with unit tests; a template's `index.tsx`
  composes and does not hold state.
- Comment only a non-obvious *why*.
- `src/lib/schemas.ts` and `src/trpc` are ported from spliit. Task 3 changes one
  expression in `schemas.ts` because that is where the crash is; it is the only ported
  line this plan touches, and the change is behaviour-preserving for every input that
  did not previously throw.
- Never push, never add a remote, never open a pull request. Work stops at a local
  commit on `fix/ui-bug-sweep-2`.
- Run heavy TypeScript commands one at a time.
- Playwright specs read **English** labels and pin `NEXT_LOCALE=en-US`.

## Findings

Every row was reproduced against the running dev server before this plan was written.

| # | Report | Root cause | Evidence |
| - | ------ | ---------- | -------- |
| 1 | Shares show 2 on load, become 1 after switching tabs | `useExpenseSplitBalancing` re-seeds `paidFor` on **every** mode change, including a return to a mode the user already filled in. Introduced by commit `49be939`. | Edit an expense saved as `BY_SHARES` 2/1/1 → on load `["2","1","1"]`, after `%` → back to Shares `["1","1","1"]` |
| 2 | Typed 2 shares, saved as an even split | Consequence of #1, not a save bug. A create submitted straight after typing stores the right thing. | DB after submit: `splitMode=BY_SHARES`, shares `200/100/100`. The even split appears only after a tab round-trip wipes the values |
| 3 | "Tổng 3 phần" with shares 2/1/1 | `PaidForList` passes `count: paidFor.length` — the number of people — into `splitHint.byShares`, whose text is "Tổng {count} phần" | `src/components/core/templates/ExpenseForm/PaidForList.tsx:214` |
| 4 | Crash while typing an amount | Clearing a `BY_AMOUNT` share writes `""`; `new Decimal("")` throws `DecimalError: Invalid argument`. The string transform above only reports `NaN`, and `Number("")` is `0`, so `""` reaches the refinement | Uncaught at `schemas.ts:156` via `PaidForList[setShares]` |
| 5 | Total `0đ` not aligned with the rows above | The per-row read-only amount carries `px-2.5 py-1`; the footer total carries no padding | `PaidForRow.tsx:74` vs `PaidForList.tsx:219` |
| 6 | "Does not repeat" still wraps | `SelectPrimitive.Value` does not forward `className`, so the `truncate` added on 2026-09-07 never reached the DOM | Computed style on the trigger's value span: `class=""`, `white-space: normal` |
| 7 | Delete runs twice, no pending state | The confirm button is wrapped in `Dialog.Close`, so the dialog closes before the request resolves; nothing disables the trigger, and `remove()` does not guard re-entry | `POST …expenses.delete` → 500, "No record was found for a delete" |
| 8 | No loading state anywhere | Six templates render `null` while their query is pending and `ExpenseList` renders one line of text. No button shows a spinner | `BalanceList:23`, `GroupSummaryAside:32`, `GroupStats:42`, `ActivityLog:42`, `GroupInfo:15`, `ExpenseList:63` |
| 9 | No success feedback | The five mutations resolve and navigate silently. `useToastStore` exists but is used only by "forget group" | `useExpenseForm.ts:180,191`, `useGroupForm.ts:117` |
| 10 | Back button walks a loop | `router.push` after a submit leaves the consumed form in the history, and `BackButton` is a pushing `<Link>`. `MobileTopBar` then calls `router.back()` through those entries | History after list → create → submit → open edit: `[expenses, create, expenses, edit]` |

## Decisions

Settled with the repository owner before planning:

1. **Loading** — skeletons shaped like the content on every screen that currently
   renders `null`, plus a spinner and a disabled state on every mutation button.
2. **Feedback** — a toast for every mutation: green on success, red on failure. No undo
   for delete (undo would need a new procedure in ported `src/trpc`).
3. **History** — `replace` after a submit, and an in-app back that replaces. No
   parent-route hard navigation.
4. **Split tabs** — each tab remembers what the user typed in it; a tab opened for the
   first time gets the seeded default.

## File Structure

| File | Responsibility | Change |
| ---- | -------------- | ------ |
| `src/lib/expense-split.ts` | Pure share arithmetic | Add `rememberShares`, `restoreShares`, `totalShares` |
| `src/lib/expense-split.test.ts` | Unit tests for the above | Extend |
| `src/lib/schemas.ts` | Ported form schemas | One expression guarded (Task 3) |
| `src/lib/schemas.test.ts` | Regression test for the blank share | Create |
| `src/hooks/expenses/useExpenseSplitBalancing.ts` | Owns per-mode memory | Rewrite the mode-change effect |
| `src/hooks/expenses/useExpenseForm.ts` | Expense mutations | Guard re-entry, toast, `replace` |
| `src/hooks/groups/useGroupForm.ts` | Group mutations | Toast, `replace` |
| `src/hooks/forms/useMutationFeedback.ts` | Wraps a mutation in toast + error handling | Create |
| `src/components/core/atoms/Skeleton/index.tsx` | One shimmering block | Create |
| `src/components/core/atoms/Button/index.tsx` | Adds `pending` | Extend |
| `src/components/core/atoms/BackButton/index.tsx` | Back affordance | `replace` |
| `src/components/core/molecules/Select/index.tsx` | Select | Wrap value and item text |
| `src/components/core/molecules/ConfirmDialog/index.tsx` | Destructive confirmation | Own the pending state |
| `src/components/core/templates/*/Skeleton.tsx` | Per-screen skeletons | Create (6 files) |
| `src/stores/useToastStore.ts` | Toast queue | Add `variant` |
| `src/components/core/molecules/Toast/index.tsx` | Toast rendering | Render the variant |
| `messages/{vi,en-US}/common.json` | `Toast` namespace | Add the six new keys |
| `e2e/split-modes.spec.ts` | Split behaviour | Add the round-trip spec |
| `e2e/expense-edit-delete.spec.ts` | Delete behaviour | Add the confirm spec |
| `e2e/feedback.spec.ts` | Toasts and skeletons | Create |

---

### Task 1: Each split tab remembers what the user typed

**Files:**
- Modify: `src/lib/expense-split.ts`
- Modify: `src/lib/expense-split.test.ts`
- Modify: `src/hooks/expenses/useExpenseSplitBalancing.ts`

**Interfaces:**
- Consumes: `seedSharesForMode(splitMode, paidFor)` — already present.
- Produces:
  - `type SharesByParticipant = Record<string, string>`
  - `rememberShares<T extends PaidForRow>(paidFor: T[]): SharesByParticipant`
  - `restoreShares<T extends PaidForRow>(splitMode: SplitMode, paidFor: T[], remembered: SharesByParticipant | undefined): { rows: T[]; restored: boolean }`

- [ ] **Step 1: Write the failing tests**

Append to `src/lib/expense-split.test.ts`:

```ts
describe('rememberShares', () => {
  it('keys the typed values by participant', () => {
    expect(
      rememberShares([
        { participant: 'a', shares: '2' },
        { participant: 'b', shares: '1' },
      ]),
    ).toEqual({ a: '2', b: '1' })
  })
})

describe('restoreShares', () => {
  it('seeds a mode that has never been opened', () => {
    const result = restoreShares('BY_SHARES', rows('a', 'b'), undefined)
    expect(result).toEqual({
      rows: [
        { participant: 'a', shares: '1' },
        { participant: 'b', shares: '1' },
      ],
      restored: false,
    })
  })

  it('gives back exactly what the mode held before', () => {
    const result = restoreShares('BY_SHARES', rows('a', 'b'), {
      a: '2',
      b: '1',
    })
    expect(result.rows.map((row) => row.shares)).toEqual(['2', '1'])
    expect(result.restored).toBe(true)
  })

  // A remembered percentage split adds up to 100 only for the people it was
  // typed for; keeping half of it beside a fresh seed would not.
  it('re-seeds when someone joined since the mode was last open', () => {
    const result = restoreShares('BY_PERCENTAGE', rows('a', 'b', 'c'), {
      a: '50',
      b: '50',
    })
    expect(result.rows.map((row) => row.shares)).toEqual(['34', '33', '33'])
    expect(result.restored).toBe(false)
  })
})
```

- [ ] **Step 2: Run the tests to watch them fail**

Run: `npx jest src/lib/expense-split.test.ts`
Expected: FAIL — `rememberShares is not a function`.

- [ ] **Step 3: Implement the two functions**

Append to `src/lib/expense-split.ts`:

```ts
export type SharesByParticipant = Record<string, string>

export function rememberShares<T extends PaidForRow>(
  paidFor: T[],
): SharesByParticipant {
  return Object.fromEntries(
    paidFor.map((row) => [row.participant, String(row.shares)]),
  )
}

/**
 * What a split tab shows when the user comes back to it.
 *
 * Restoring only works when every current participant was there last time: a
 * percentage split adds up to 100 for the people it was typed for, so half a
 * remembered split beside half a fresh seed would add up to nothing in
 * particular. `restored` tells the caller the values are the user's own, which
 * is what stops `redistributeShares` overwriting a `BY_AMOUNT` tab.
 */
export function restoreShares<T extends PaidForRow>(
  splitMode: SplitMode,
  paidFor: T[],
  remembered: SharesByParticipant | undefined,
): { rows: T[]; restored: boolean } {
  const complete =
    remembered !== undefined &&
    paidFor.every((row) => remembered[row.participant] !== undefined)
  if (!complete)
    return { rows: seedSharesForMode(splitMode, paidFor), restored: false }
  return {
    rows: paidFor.map((row) => ({ ...row, shares: remembered[row.participant] })),
    restored: true,
  }
}
```

- [ ] **Step 4: Run the tests to watch them pass**

Run: `npx jest src/lib/expense-split.test.ts`
Expected: PASS.

- [ ] **Step 5: Give the hook a memory per mode**

Replace the mode-change effect in `src/hooks/expenses/useExpenseSplitBalancing.ts`:

```ts
const remembered = useRef<Partial<Record<SplitMode, SharesByParticipant>>>({})

useEffect(() => {
  const modeChanged = previous.current.splitMode !== splitMode
  const previousMode = previous.current.splitMode
  if (!modeChanged && previous.current.amount === amount) return
  previous.current = { splitMode, amount }

  if (!modeChanged || splitMode === undefined) {
    setManuallyEdited(new Set())
    return
  }

  const paidFor = form.getValues('paidFor')
  if (previousMode !== undefined) {
    remembered.current[previousMode] = rememberShares(paidFor)
  }

  const { rows, restored } = restoreShares(
    splitMode,
    paidFor,
    remembered.current[splitMode],
  )
  // Restored values are the user's own, so `redistributeShares` must treat
  // them as typed rather than spread the total over them again.
  setManuallyEdited(
    restored ? new Set(rows.map((row) => row.participant)) : new Set(),
  )
  if (rows !== paidFor) {
    form.setValue('paidFor', rows, { shouldValidate: true })
  }
}, [splitMode, amount, form])
```

Import `rememberShares`, `restoreShares` and `type SharesByParticipant` from
`@/lib/expense-split`, and `type SplitMode` from `@/generated/prisma/browser`.

- [ ] **Step 6: Verify in the browser at both widths**

Start the dev server. On an expense saved as `BY_SHARES` 2/1/1, at 1440×900 and again
at 390×844:
1. Confirm the inputs read 2, 1, 1 on load.
2. Switch to `%`, then back to Shares. Expected: 2, 1, 1 — not 1, 1, 1.
3. Switch to Amount, then back to `%`. Expected: the percentages you left, not a reseed.
4. Save, reload the edit page. Expected: 2, 1, 1.
5. Console clean.

- [ ] **Step 7: Commit**

```bash
git add src/lib/expense-split.ts src/lib/expense-split.test.ts src/hooks/expenses/useExpenseSplitBalancing.ts
git commit -m "fix(expenses): keep each split tab's own values"
```

---

### Task 2: The shares total counts shares, not people

**Files:**
- Modify: `src/lib/expense-split.ts`
- Modify: `src/lib/expense-split.test.ts`
- Modify: `src/components/core/templates/ExpenseForm/PaidForList.tsx`

**Interfaces:**
- Produces: `totalShares(paidFor: PaidForRow[]): number`

- [ ] **Step 1: Write the failing test**

```ts
describe('totalShares', () => {
  it('adds the shares up', () => {
    expect(
      totalShares([
        { participant: 'a', shares: '2' },
        { participant: 'b', shares: '1' },
      ]),
    ).toBe(3)
  })

  it('reads a half-typed field as nothing rather than NaN', () => {
    expect(totalShares([{ participant: 'a', shares: '' }])).toBe(0)
  })
})
```

- [ ] **Step 2: Run it and watch it fail**

Run: `npx jest src/lib/expense-split.test.ts -t totalShares`
Expected: FAIL — `totalShares is not a function`.

- [ ] **Step 3: Implement**

```ts
export function totalShares(paidFor: PaidForRow[]): number {
  return paidFor.reduce((sum, row) => sum + (Number(row.shares) || 0), 0)
}
```

- [ ] **Step 4: Run it and watch it pass**

Run: `npx jest src/lib/expense-split.test.ts -t totalShares`
Expected: PASS.

- [ ] **Step 5: Feed the hint the right number**

In `PaidForList.tsx`, replace the hint's argument:

```tsx
<span>
  {t(`splitHint.${HINT_KEYS[splitMode]}`, {
    // "Tổng {count} phần" counts shares; every other hint counts people.
    count:
      splitMode === 'BY_SHARES' ? totalShares(paidFor) : paidFor.length,
  })}
</span>
```

- [ ] **Step 6: Verify**

With shares 2/1/1 the hint reads "4 shares in total" / "Tổng 4 phần". With 1/1/1 it
reads 3. The Evenly hint still reads "between 3 people".

- [ ] **Step 7: Commit**

```bash
git add src/lib/expense-split.ts src/lib/expense-split.test.ts src/components/core/templates/ExpenseForm/PaidForList.tsx
git commit -m "fix(expenses): count shares in the shares total"
```

---

### Task 3: A cleared amount field must not crash validation

**Files:**
- Modify: `src/lib/schemas.ts:156`
- Create: `src/lib/schemas.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { expenseFormSchema } from '@/lib/schemas'

const base = {
  expenseDate: new Date('2026-09-07'),
  title: 'Dinner',
  category: 1,
  amount: 100,
  paidBy: 'a',
  splitMode: 'BY_AMOUNT' as const,
  saveDefaultSplittingOptions: false,
  isReimbursement: false,
  documents: [],
  recurrenceRule: 'NONE' as const,
}

describe('expenseFormSchema', () => {
  // Clearing a by-amount field leaves an empty string in the form for as long
  // as it takes to type the next number; `new Decimal('')` threw instead.
  it('rejects a blank by-amount share without throwing', () => {
    const result = expenseFormSchema.safeParse({
      ...base,
      paidFor: [
        { participant: 'a', shares: '100' },
        { participant: 'b', shares: '' },
      ],
    })
    expect(result.success).toBe(false)
  })

  it('still accepts by-amount shares that add up', () => {
    const result = expenseFormSchema.safeParse({
      ...base,
      paidFor: [
        { participant: 'a', shares: '60' },
        { participant: 'b', shares: '40' },
      ],
    })
    expect(result.success).toBe(true)
  })
})
```

- [ ] **Step 2: Run it and watch it throw**

Run: `npx jest src/lib/schemas.test.ts`
Expected: FAIL — `DecimalError: Invalid argument: ''`, not a returned failure.

- [ ] **Step 3: Guard the one expression**

In `src/lib/schemas.ts`, in the `BY_AMOUNT` branch of the `superRefine`:

```ts
const sum = expense.paidFor.reduce(
  // A field the user has just cleared is an empty string, which Decimal
  // rejects outright; it counts as nothing, and the sum check then reports
  // the mismatch instead of the parse throwing.
  (sum, { shares }) => new Decimal(Number(shares) || 0).add(sum),
  new Decimal(0),
)
```

- [ ] **Step 4: Run it and watch it pass**

Run: `npx jest src/lib/schemas.test.ts`
Expected: PASS, both cases.

- [ ] **Step 5: Verify in the browser**

On the edit form, switch to Amount and clear one field. Expected: the "must add up to
the amount" message, and a clean console — no `Uncaught (in promise)`.

- [ ] **Step 6: Commit**

```bash
git add src/lib/schemas.ts src/lib/schemas.test.ts
git commit -m "fix(expenses): stop a cleared amount throwing in validation"
```

---

### Task 4: The total lines up with the amounts above it

**Files:**
- Modify: `src/components/core/templates/ExpenseForm/PaidForList.tsx`

- [ ] **Step 1: Give the total the row's own padding**

The per-row read-only amount is `rounded-[0.5625rem] px-2.5 py-1`. Match its horizontal
padding on the footer figure so the right edges agree:

```tsx
<span className="px-2.5 py-1 text-numeric-table-md text-credit tabular">
  {formatCurrency(currency, Math.abs(total), locale)}
</span>
```

- [ ] **Step 2: Verify by measurement, not by eye**

In the browser, on the Evenly tab, compare `getBoundingClientRect().right` of the last
row's amount and of the footer total. Expected: equal. Check at 390 and 1440.

- [ ] **Step 3: Commit**

```bash
git add src/components/core/templates/ExpenseForm/PaidForList.tsx
git commit -m "fix(expenses): align the split total with the rows above it"
```

---

### Task 5: One line per option, everywhere a select appears

**Files:**
- Modify: `src/components/core/molecules/Select/index.tsx`
- Modify: `src/components/core/molecules/Select/Select.stories.tsx`

- [ ] **Step 1: Wrap the two primitives that swallow `className`**

`SelectPrimitive.Value` and `SelectPrimitive.ItemText` render their own element and
ignore the class we hand them, which is why the fix of 2026-09-07 never applied. Wrap
each in a span we control:

```tsx
<span className="min-w-0 flex-1 truncate text-left">
  <SelectPrimitive.Value placeholder={placeholder} />
</span>
<SelectPrimitive.Icon className="shrink-0">
  <ChevronDown className="size-4 opacity-60" aria-hidden />
</SelectPrimitive.Icon>
```

and, on the item:

```tsx
<span className="min-w-0 flex-1 truncate">
  <SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
</span>
```

Cap the list so a long option ellipsizes rather than running off the viewport:

```tsx
className="glass-modal z-50 max-h-72 min-w-[var(--radix-select-trigger-width)] max-w-[min(24rem,calc(100vw-2rem))] overflow-hidden rounded-control"
```

- [ ] **Step 2: Add the case that reproduced it to Storybook**

Add a story rendering the select in a `w-40` container with a long option, so the
regression is visible without a running database.

- [ ] **Step 3: Verify by computed style**

In the browser, read the trigger's value span: expected `white-space: nowrap`,
`text-overflow: ellipsis`, and a height equal to one line. Check "Repeats" at 390 (where
the column is narrowest) and at 1440. Open the list and confirm every option is one line.

- [ ] **Step 4: Commit**

```bash
git add src/components/core/molecules/Select
git commit -m "fix(ui): truncate select values instead of wrapping them"
```

---

### Task 6: A delete asks once and cannot run twice

**Files:**
- Modify: `src/components/core/molecules/ConfirmDialog/index.tsx`
- Modify: `src/components/core/templates/ExpenseForm/ExpenseFormFooter.tsx`
- Modify: `src/hooks/expenses/useExpenseForm.ts`
- Modify: `e2e/expense-edit-delete.spec.ts`

**Interfaces:**
- `ConfirmDialog`'s `onConfirm` becomes `() => void | Promise<void>`; the dialog stays
  open, disabled, until the promise settles.
- `Button` gains `pending?: boolean` in Task 7. Until then use `disabled`.

- [ ] **Step 1: Write the failing spec**

In `e2e/expense-edit-delete.spec.ts`:

```ts
test('asks before deleting and cannot be confirmed twice', async ({ page }) => {
  // …open an expense's edit page…
  await page.getByRole('button', { name: 'Delete' }).click()
  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible()

  let deletes = 0
  await page.route('**/api/trpc/**expenses.delete**', async (route) => {
    deletes += 1
    await new Promise((resolve) => setTimeout(resolve, 500))
    await route.continue()
  })

  const confirm = dialog.getByRole('button', { name: 'Yes' })
  await confirm.click()
  await expect(confirm).toBeDisabled()
  await page.waitForURL(/\/expenses$/)
  expect(deletes).toBe(1)
})
```

- [ ] **Step 2: Run it and watch it fail**

Run: `npm run build && npx playwright test e2e/expense-edit-delete.spec.ts`
Expected: FAIL — the dialog closes on the first click, so `confirm` is detached.

- [ ] **Step 3: Let the dialog own the request**

```tsx
export function ConfirmDialog({ … onConfirm }: ConfirmDialogProps) {
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState(false)

  // The dialog, not the caller, is what stops a second confirmation: closing on
  // click would put the trigger back under the user's finger while the request
  // is still in flight, and the second delete answers 500.
  const confirm = async () => {
    setPending(true)
    try {
      await onConfirm()
      setOpen(false)
    } finally {
      setPending(false)
    }
  }

  return (
    <DialogPrimitive.Root
      open={open}
      onOpenChange={(next) => {
        if (!pending) setOpen(next)
      }}
    >
      …
      <Button variant="ghost" disabled={pending} onClick={() => setOpen(false)}>
        {cancelLabel}
      </Button>
      <Button
        variant={destructive ? 'destructive' : 'primary'}
        disabled={pending}
        onClick={() => void confirm()}
      >
        {confirmLabel}
      </Button>
    </DialogPrimitive.Root>
  )
}
```

Both buttons stop being `DialogPrimitive.Close` children.

- [ ] **Step 4: Guard the hook and the trigger**

In `useExpenseForm`:

```ts
const remove = async () => {
  if (!expense || deleteExpense.isPending) return
  …
}
```

In `ExpenseFormFooter`, pass `disabled={isSubmitting}` to the delete trigger button.

- [ ] **Step 5: Run the spec and watch it pass**

Run: `npm run build && npx playwright test e2e/expense-edit-delete.spec.ts`
Expected: PASS, and the existing delete spec still green.

- [ ] **Step 6: Verify the dialog on a phone**

At 390×844, confirm the dialog is on screen, inside the viewport, and both buttons are
reachable — the reporter saw no dialog at all, which this step either reproduces or
disproves. Record which.

- [ ] **Step 7: Commit**

```bash
git add src/components/core/molecules/ConfirmDialog src/components/core/templates/ExpenseForm/ExpenseFormFooter.tsx src/hooks/expenses/useExpenseForm.ts e2e/expense-edit-delete.spec.ts
git commit -m "fix(expenses): hold the delete dialog open until it finishes"
```

---

### Task 7: Every request says it is running

**Files:**
- Create: `src/components/core/atoms/Skeleton/index.tsx`
- Modify: `src/components/core/atoms/Button/index.tsx`
- Create: `src/components/core/templates/ExpenseList/Skeleton.tsx`
- Create: `src/components/core/templates/BalanceList/Skeleton.tsx`
- Create: `src/components/core/templates/GroupStats/Skeleton.tsx`
- Create: `src/components/core/templates/ActivityLog/Skeleton.tsx`
- Create: `src/components/core/templates/GroupInfo/Skeleton.tsx`
- Create: `src/components/core/templates/GroupScreen/AsideSkeleton.tsx`
- Modify: those six templates' `index.tsx`
- Modify: `src/components/core/templates/ExpenseForm/ExpenseFormFooter.tsx`,
  `src/components/core/templates/GroupForm/GroupFormFooter.tsx`,
  `src/components/core/molecules/ConfirmDialog/index.tsx`

**Interfaces:**
- Produces: `<Skeleton className?>` — one block.
- Produces: `Button` accepts `pending?: boolean`; it implies `disabled` and prepends a
  spinning `Loader2`.

- [ ] **Step 1: The atom**

```tsx
import { cn } from '@/lib/utils'

/**
 * A block standing in for content that has not arrived. It is shaped by the
 * caller: a skeleton that does not match what replaces it moves the page when
 * the data lands, which is worse than showing nothing.
 */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn('animate-pulse rounded-control bg-foreground/8', className)}
    />
  )
}
```

Confirm `--foreground` exists as a token; do not introduce a palette class.

- [ ] **Step 2: `pending` on Button**

```tsx
export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean; pending?: boolean }

// …inside the component, when `asChild` is false:
<Component
  ref={ref}
  disabled={disabled || pending}
  aria-busy={pending || undefined}
  className={cn(buttonVariants({ variant, size }), className)}
  {...props}
>
  {pending && <Loader2 aria-hidden className="animate-spin" />}
  {children}
</Component>
```

`pending` is ignored when `asChild` is set — a `Slot` takes exactly one child. Assert
that in the story rather than in a comment.

- [ ] **Step 3: One skeleton per screen**

Each mirrors the real layout. `ExpenseList/Skeleton.tsx`:

```tsx
export function ExpenseListSkeleton() {
  return (
    <div className="flex flex-col gap-2" aria-hidden>
      <Skeleton className="h-4 w-24" />
      {Array.from({ length: 4 }, (_, index) => (
        <Skeleton key={index} className="h-16 rounded-card" />
      ))}
    </div>
  )
}
```

Do the same for balances (avatar row + bar), stats (a total card, a chart block, two
breakdown cards), activity (a date heading and four rows), information (a title and
three lines) and the group aside. Keep every block's height within 4px of the real
content's — measure the real screen first.

- [ ] **Step 4: Swap the `null` returns**

In each template replace `if (isPending) return null` with the skeleton. Where the guard
also covers missing data (`isPending || !currency`), split it: render the skeleton while
pending, and keep returning `null` for the impossible case.

Add a live region so the wait is announced once rather than silently:

```tsx
<p role="status" className="sr-only">{t('loading')}</p>
```

New key `loading` in both locales, per namespace that needs it.

- [ ] **Step 5: Buttons**

`ExpenseFormFooter` and `GroupFormFooter` pass `pending={isSubmitting}` instead of
`disabled={isSubmitting}`; `ConfirmDialog`'s confirm passes `pending={pending}`. The
label text still switches to "Saving…" — the spinner is in addition, not instead.

- [ ] **Step 6: Verify**

At 390 and 1440, throttle the network to "Slow 4G" and load each of: group list,
expenses, balances, stats, activity, information. Expected: a skeleton, no blank frame,
no layout jump greater than 4px when the data lands. Submit each form and confirm the
spinner appears and the button cannot be pressed twice.

- [ ] **Step 7: Commit**

```bash
git add src/components/core/atoms/Skeleton src/components/core/atoms/Button src/components/core/templates messages
git commit -m "feat(ui): show a skeleton while a screen loads"
```

---

### Task 8: Every mutation reports how it went

**Files:**
- Modify: `src/stores/useToastStore.ts`
- Modify: `src/components/core/molecules/Toast/index.tsx`
- Create: `src/hooks/forms/useMutationFeedback.ts`
- Modify: `src/hooks/expenses/useExpenseForm.ts`
- Modify: `src/hooks/groups/useGroupForm.ts`
- Modify: `messages/vi/common.json`, `messages/en-US/common.json`
- Create: `e2e/feedback.spec.ts`

**Interfaces:**
- `Toast` gains `variant?: 'success' | 'error'`; absent keeps today's neutral card.
- Produces: `useMutationFeedback()` returning
  `run(action: () => Promise<void>, messages: { success: string; failure: string }): Promise<boolean>`
  — shows the matching toast and returns whether it succeeded, so the caller only
  navigates on success.

- [ ] **Step 1: Write the failing spec**

`e2e/feedback.spec.ts`:

```ts
test('confirms an expense was saved', async ({ page }) => {
  // …create an expense…
  await expect(page.getByRole('status')).toContainText('Expense created')
})

test('says so when a save fails', async ({ page }) => {
  await page.route('**/api/trpc/**expenses.create**', (route) =>
    route.fulfill({ status: 500, body: '{}' }),
  )
  // …submit…
  await expect(page.getByRole('alert')).toContainText('could not be saved')
  await expect(page).toHaveURL(/\/expenses\/create$/)
})
```

- [ ] **Step 2: Run it and watch it fail**

Run: `npm run build && npx playwright test e2e/feedback.spec.ts`
Expected: FAIL — no toast is rendered.

- [ ] **Step 3: Add the variant**

In `useToastStore`, add `variant?: 'success' | 'error'` to `Toast`. In `ToastViewport`,
map it to semantic tokens only — success borders `border-credit`, error borders
`border-destructive`, neither introduces a hex or a palette class — and give an error
toast `role="alert"` while success keeps `role="status"`.

- [ ] **Step 4: The hook**

```ts
export function useMutationFeedback() {
  const show = useToastStore((state) => state.show)

  return {
    run: async (
      action: () => Promise<void>,
      messages: { success: string; failure: string },
    ) => {
      try {
        await action()
        show({ title: messages.success, variant: 'success' })
        return true
      } catch {
        // The reason is not shown: a tRPC error message is written for a
        // developer, and the recovery is the same whatever it says.
        show({ title: messages.failure, variant: 'error' })
        return false
      }
    },
  }
}
```

- [ ] **Step 5: Wire the five mutations**

In `useExpenseForm.submit`, `useExpenseForm.remove` and `useGroupForm.submit`, wrap the
`mutateAsync` call and only navigate when `run` returns `true`. Keys, added to the
`Toast` namespace in both locales:

| Key | en-US | vi |
| --- | ----- | -- |
| `expenseCreated` | Expense created | Đã thêm khoản chi |
| `expenseUpdated` | Expense saved | Đã lưu khoản chi |
| `expenseDeleted` | Expense deleted | Đã xoá khoản chi |
| `groupCreated` | Group created | Đã tạo nhóm |
| `groupUpdated` | Group saved | Đã lưu nhóm |
| `failed` | That could not be saved. Try again. | Không lưu được. Vui lòng thử lại. |

- [ ] **Step 6: Run the spec and watch it pass**

Run: `npm run build && npx playwright test e2e/feedback.spec.ts`
Expected: PASS.

- [ ] **Step 7: Verify by hand at both widths**

At 390 the toast must clear the bottom bar (`--spacing-thumb-safe` already accounts for
it); at 1440 it sits bottom-right. Save a group from the settings screen and confirm the
message appears rather than silence.

- [ ] **Step 8: Commit**

```bash
git add src/stores/useToastStore.ts src/components/core/molecules/Toast src/hooks messages e2e/feedback.spec.ts
git commit -m "feat(ui): confirm every mutation with a toast"
```

---

### Task 9: Back walks up, not backwards through submitted forms

**Files:**
- Modify: `src/hooks/expenses/useExpenseForm.ts`
- Modify: `src/hooks/groups/useGroupForm.ts`
- Modify: `src/components/core/atoms/BackButton/index.tsx`
- Create: `e2e/navigation.spec.ts`

- [ ] **Step 1: Write the failing spec**

```ts
test('back does not walk through submitted forms', async ({ page }) => {
  await page.goto(`/groups/${groupId}/expenses`)
  await page.getByRole('link', { name: 'Add expense' }).first().click()
  // …fill and submit…
  await page.waitForURL(/\/expenses$/)
  await page.getByTestId('expense-card').first().click()
  await page.waitForURL(/\/edit$/)

  await page.goBack()
  await expect(page).toHaveURL(/\/expenses$/)
  await page.goBack()
  await expect(page).toHaveURL(/\/groups$/)
})
```

- [ ] **Step 2: Run it and watch it fail**

Expected: the second `goBack` lands on `/expenses/create`.

- [ ] **Step 3: Replace instead of push**

In `useExpenseForm` (both `submit` and `remove`) and `useGroupForm.submit`, change
`router.push(destination)` to `router.replace(destination)`:

```ts
// The form's own entry is spent once it has been submitted; leaving it in the
// history is what made the back button walk create → list → create.
router.replace(`/groups/${groupId}/expenses`)
```

`useReceiptExtract` keeps its `push`: it opens a form rather than closing one.

- [ ] **Step 4: Make the in-app back replace too**

`BackButton` renders a `<Link>`, which pushes; add `replace`:

```tsx
<Link href={href} replace aria-label={t('back')} … >
```

`MobileTopBar` keeps `router.back()` — with the history no longer growing, it now does
the right thing.

- [ ] **Step 5: Run the spec and watch it pass**

Run: `npm run build && npx playwright test e2e/navigation.spec.ts`
Expected: PASS.

- [ ] **Step 6: Verify by hand, mobile and desktop**

At 390: expenses → add → submit → open an expense → edit → tap the header back once
(reaches the list), then the browser/system back once (reaches the group list). Repeat
the loop five times and confirm the number of backs needed does not grow. Repeat the
whole check at 1440 with the browser back button — the reporter had not tested desktop.

- [ ] **Step 7: Commit**

```bash
git add src/hooks/expenses/useExpenseForm.ts src/hooks/groups/useGroupForm.ts src/components/core/atoms/BackButton e2e/navigation.spec.ts
git commit -m "fix(nav): replace a submitted form instead of stacking it"
```

---

### Task 10: Full verification and handover

**Files:**
- Modify: `docs/screenshots/*` (regenerated)

- [ ] **Step 1: The gates, one at a time**

```bash
npm test
npm run check-types
npm run lint
npm run build
npm run e2e
```

All green. The e2e count must be at least its current 78 plus the specs this plan adds.

- [ ] **Step 2: The manual matrix**

Ten screens × {390×844 mobile emulation, 768, 1280, 1440}. For each: no horizontal
overflow (`document.documentElement.scrollWidth <= innerWidth`), no console error or
warning, a skeleton on first load, and a toast after any mutation.

- [ ] **Step 3: Re-check every original report**

Walk the Findings table top to bottom in the browser and record pass/fail per row, at
both a phone and a desktop width. A row that cannot be reproduced any more is a pass; a
row that changed shape is a new finding, not a pass.

- [ ] **Step 4: Regenerate the screenshots**

```bash
npx playwright test --config playwright.screenshots.config.ts
```

- [ ] **Step 5: Commit and report**

```bash
git add docs/screenshots next-env.d.ts
git commit -m "docs(screenshots): regenerate after the second bug sweep"
```

Report the ten rows with their evidence. Do not merge into `main`: the repository owner
approves the merge.
