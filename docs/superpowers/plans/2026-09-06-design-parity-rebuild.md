# Design-parity rebuild implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild every ChiaTien screen to match the owner's mockup on mobile and desktop, and cut the category taxonomy to the six the mockup shows.

**Architecture:** Tokens first, then the shell, then screens outward from the most-used. New presentational primitives (chip, segmented control, emoji lens, payer picker) land as atoms/molecules so the screens that follow only compose. All state stays in `src/hooks`; templates read one hook and render.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript 6 strict, Tailwind v4 `@theme inline`/`@utility`, Radix primitives, vaul, next-intl, tRPC v11, Prisma 7, Playwright.

**Spec:** `docs/superpowers/specs/2026-09-06-design-parity-rebuild-design.md`

## Global Constraints

- Never push. No remote, no `gh`, no pull request. Work stops at a local commit.
- No `any`, no `as`, no `@ts-ignore`, no `@ts-expect-error` in code written here.
- English in identifiers, files, branches, commits. Vietnamese only in `messages/vi/*.json`. No hardcoded display text in a component.
- Semantic tokens only in components — no hex, no `rgb()`, no `bg-green-100`.
- Logic in hooks; a template's `index.tsx` has no `useState`, no `useEffect`, no data shaping.
- Run heavy TypeScript commands one at a time; this machine has limited free RAM.
- Never add a Claude co-author trailer.
- `data-testid` values `expense-card`, `paid-by`, `split-mode`, `balance-row`, `reimbursement-row` must survive on their new hosts.
- Breakpoints: mobile below 1024px, desktop at 1024px, second expense column at 1280px.
- Mobile is a 480px column centred in the viewport; every fixed mobile layer is clipped to `min(100%, 480px)` and centred with it.

---

### Task 1: Category taxonomy

**Files:**
- Create: `prisma/migrations/20260906120000_reduce_categories/migration.sql`
- Create: `src/constants/categories.ts`
- Create: `src/components/core/atoms/CategoryEmoji/index.tsx`
- Delete: `src/components/core/atoms/CategoryIcon/index.tsx`
- Modify: `messages/en-US/expenses.json`, `messages/vi/expenses.json`
- Modify: `src/lib/category-extract.ts`, `src/lib/category-extract.test.ts`
- Modify: `e2e/screenshots.capture.ts`
- Test: `src/lib/categories.test.ts`

**Interfaces:**
- Produces: `CATEGORY_EMOJI: Record<number, string>`, `CATEGORY_HUE: Record<number, string>`, `categoryEmoji(id: number): string`, `categoryHueVar(id: number): string` from `@/constants/categories`; `<CategoryEmoji categoryId={number} size="sm" | "md" | "lg" />`.

- [ ] **Step 1: Write the migration**

```sql
-- The mockup this UI follows shows six categories. spliit seeded 42; the
-- extras have no chip to live in, so they go. Expenses pointing at a removed
-- row fall back to 0 (Other) before the delete so no foreign key is orphaned.
UPDATE "Expense" SET "categoryId" = 0 WHERE "categoryId" NOT IN (0, 1, 2, 7, 11, 27);
DELETE FROM "Category" WHERE "id" NOT IN (0, 1, 2, 7, 11, 27);

UPDATE "Category" SET "grouping" = 'Other',         "name" = 'Other'         WHERE "id" = 0;
UPDATE "Category" SET "grouping" = 'Settlement',    "name" = 'Settlement'    WHERE "id" = 1;
UPDATE "Category" SET "grouping" = 'Leisure',       "name" = 'Leisure'       WHERE "id" = 2;
UPDATE "Category" SET "grouping" = 'Food',          "name" = 'Food'          WHERE "id" = 7;
UPDATE "Category" SET "grouping" = 'Accommodation', "name" = 'Accommodation' WHERE "id" = 11;
UPDATE "Category" SET "grouping" = 'Transport',     "name" = 'Transport'     WHERE "id" = 27;
```

- [ ] **Step 2: Write `src/constants/categories.ts`**

Ids are the contract with the database. `ACCOMMODATION = 11`, `FOOD = 7`, `TRANSPORT = 27`, `LEISURE = 2`, `SETTLEMENT = 1`, `OTHER = 0`. Export `CATEGORY_IDS` in mockup order (accommodation, food, transport, leisure, settlement, other), `categoryEmoji(id)` returning 🏨 🍜 🛵 🎫 💸 🧩 with 🧩 as the fallback, and `categoryHueVar(id)` returning the CSS custom property name for that category's tint hue.

- [ ] **Step 3: Write the unit test and run it**

`src/lib/categories.test.ts` asserts every id in `CATEGORY_IDS` has an emoji and a hue, that an unknown id falls back to 🧩 and the neutral hue, and that `CATEGORY_IDS` has exactly six entries in mockup order.

Run: `npx jest src/lib/categories.test.ts`

- [ ] **Step 4: Replace CategoryIcon with CategoryEmoji**

`CategoryEmoji` renders the glyph inside a circular lens tinted from the category hue. Keep the glyph in a `<span aria-hidden>` — the category name is stated in text beside it everywhere it appears, so the emoji is decoration. Sizes `sm` 26px (stats rows), `md` 42px (mobile expense row), `lg` 44px (desktop expense row). Delete `CategoryIcon`.

- [ ] **Step 5: Trim the message catalogues**

Both locales keep only `Categories.search`, `Categories.noCategory`, and the six `<grouping>.heading` / `<grouping>.<name>` pairs. Vietnamese labels: Chỗ ở, Ăn uống, Di chuyển, Giải trí, Trả nợ, Khác. English: Accommodation, Food, Transport, Leisure, Settlement, Other.

- [ ] **Step 6: Update category-extract and its tests**

The prompt lists the six surviving categories. Test fixtures that used id 4 use id 7; the "id that does not exist" case keeps a value outside the six.

Run: `npm test`

- [ ] **Step 7: Update the screenshot harness**

`e2e/screenshots.capture.ts` swaps category 34 → 27 and 32 → 11.

- [ ] **Step 8: Apply the migration and commit**

```bash
npx prisma migrate dev
git add -A && git commit -m "refactor(categories): reduce the taxonomy to the six the design shows"
```

---

### Task 2: Tokens

**Files:**
- Modify: `src/styles/globals.css`
- Modify: `src/app/layout.tsx`
- Create: `src/components/core/atoms/Aurora/index.tsx`

**Interfaces:**
- Produces: `--primary-gradient`, `--chip-surface`, `--chip-border`, `--chip-text`, `--chip-surface-selected`, `--chip-border-selected`, `--chip-text-selected`, `--radius-hero`, `--shadow-action`; `<Aurora />`.

- [ ] **Step 1: Move the palette back to the design's values**

`--primary: 161 94% 30%`, `--credit: 161 94% 26%`, `--ring: 161 94% 30%`. Replace the contrast comment with one recording that white on this primary measures 3.86:1 and that the owner chose the design's value over the AA floor.

- [ ] **Step 2: Add the new tokens**

Primary gradient stops, chip surfaces, `--radius-hero: 1.25rem`, and retune `--radius-control` to `0.75rem` and `--radius-card` to `1.125rem` to match the mockup's 12/18px.

- [ ] **Step 3: Replace the aurora utility with a blob component**

The mockup paints three blurred circles, not flat radial gradients. `Aurora` renders a fixed clipped layer holding three absolutely-positioned circles with `filter: blur(70px)`; the desktop set is 560/560/600px at the viewport corners, the mobile set 340/320/360px inside the 480px column. Both live in one component switched by Tailwind breakpoints so no media query is duplicated in JS.

- [ ] **Step 4: Mount it in the layout and verify**

Replace the `aurora` div in `src/app/layout.tsx` with `<Aurora />`.

Run: `npm run dev`, load `/groups`, confirm the wash is visible behind the glass at 390 and 1440.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "update(tokens): move the palette and aurora onto the design's values"
```

---

### Task 3: Shell

**Files:**
- Create: `src/components/core/templates/AppShell/AppTopBar.tsx`
- Create: `src/components/core/templates/AppShell/GroupOverflowMenu.tsx`
- Create: `src/components/core/templates/AppShell/ActiveUserCard.tsx`
- Create: `src/components/core/templates/AppShell/MobileTopBar.tsx`
- Create: `src/components/core/templates/AppShell/Fab.tsx`
- Modify: `src/components/core/templates/AppShell/index.tsx`, `Sidebar.tsx`, `BottomNav.tsx`, `navigation.ts`
- Modify: `src/components/core/templates/GroupHeader/index.tsx` (becomes the mobile title source)
- Modify: `messages/{en-US,vi}/common.json` for the new nav strings
- Create: `src/lib/group-emoji.ts`
- Test: `src/lib/group-emoji.test.ts`

**Interfaces:**
- Consumes: `<Aurora />` from Task 2.
- Produces: `<AppTopBar />`, `<MobileTopBar title back subtitle trailing />`, `<GroupOverflowMenu groupId variant="menu" | "sheet" />`, `<Fab href label />`, `NavItem` gains an `information` key, `groupEmoji(groupId: string): string` — a stable pick from a fixed palette of eight glyphs, so a group keeps its face without a database column.

- [ ] **Step 1: Extend the navigation model**

`navigationFor` returns five destinations inside a group — expenses, balances, stats, activity, information. `BottomNav` renders the first four; `Sidebar` renders all five.

- [ ] **Step 2: Build the desktop top bar**

Fixed, 60px, `glass-bar`. Brand button linking to `/groups`; breadcrumb `Nhóm / <group name>` when inside a group; on the right the group overflow menu (a Radix Popover of the five items) and a settings icon button. Hidden below `lg`.

- [ ] **Step 3: Write group-emoji and its test, then rebuild the sidebar**

`groupEmoji(groupId)` picks deterministically from 🌲 🏠 🍱 ☕ 🎂 🏔️ 🎒 🎉. Its test asserts stability for one id, membership in the palette, and that different ids can differ.

Run: `npx jest src/lib/group-emoji.test.ts`

Fixed at `top-15 left-0 bottom-0 w-62`, flush with a right border, not floating. Group identity block on top — emoji tile derived from the group id, name, `<n> thành viên · <currency>`. Five nav items as full-width buttons; the active one takes a white glass surface and a soft shadow rather than a left rail. `ActiveUserCard` pinned to the bottom, naming the active participant with a link to `/groups/<id>/edit`.

- [ ] **Step 4: Build the mobile top bar**

Fixed inside the 480px column, 56px, `glass-bar`. Back button when not on the group list, brand mark on the group list, a title block of up to two lines, one trailing action.

- [ ] **Step 5: Rebuild the bottom nav and the FAB**

Bottom nav becomes a flat glass bar clipped to the column, four items as icon-over-label, the active one tinted primary — no pill. `Fab` is 58px, `rounded-[19px]`, gradient, positioned with `left-1/2` and a translate that keeps it inside the column.

- [ ] **Step 6: Rewire AppShell**

`AppShell` renders `AppTopBar`, the sidebar when in a group, `MobileTopBar`, the content column, `BottomNav`, and the FAB. Content padding is `pt-17 pb-28 px-4` on mobile inside a `max-w-[480px]` centred column, and `pt-21 pb-12 px-8 lg:pl-70` with a `max-w-[1080px]` inner column on desktop.

- [ ] **Step 7: Verify and commit**

Run: `npm run check-types` then `npm run lint`. Load every route at 390 and 1440; confirm no horizontal overflow and that the sidebar and top bar do not overlap content.

```bash
git add -A && git commit -m "update(shell): rebuild the app shell to the design's chrome"
```

---

### Task 4: Group list

**Files:**
- Modify: `src/lib/api.ts` (`getGroups` `_count`)
- Modify: `src/hooks/groups/useGroupList.ts`
- Modify: `src/components/core/templates/GroupList/index.tsx`, `GroupCard.tsx`, `GroupSection.tsx`, `GlobalBalanceCard.tsx`, `AddGroupByUrl.tsx`
- Create: `src/components/core/templates/GroupList/GroupCardMenu.tsx`

**Interfaces:**
- Consumes: `groupEmoji` from Task 3, `<Chip>` is not needed here.

- [ ] **Step 1: Add the expense count**

`getGroups` gains `expenses: true` inside the existing `_count` select. Nothing else in `src/lib` changes.

- [ ] **Step 2: Rebuild the group card**

One link containing: emoji tile, name, `<n> thành viên · <m> khoản chi`, balance chip. Star, archive and forget move into `GroupCardMenu`, a Radix Popover triggered by an icon button positioned outside the link. Desktop puts the chip top-right beside the tile; mobile puts it under the meta line.

- [ ] **Step 3: Rebuild the list layout**

Desktop: heading row with subtitle and create button, then an auto-fit row holding the balance hero and the join card, then sections as `repeat(auto-fill, minmax(230px, 1fr))`. Mobile: hero, sections as two-column grids, join card, archived, and the create action on the FAB.

- [ ] **Step 4: Verify and commit**

Run: `npm run check-types`, then `npx playwright test e2e/group-management.spec.ts` after a build.

```bash
git add -A && git commit -m "update(groups): rebuild the group list to the design"
```

---

### Task 5: Expense list

**Files:**
- Modify: `src/components/core/templates/ExpenseList/index.tsx`, `ExpenseCard.tsx`
- Modify: `src/components/core/templates/GroupScreen/index.tsx`, `GroupSummaryAside.tsx`
- Modify: `src/hooks/expenses/useExpenseList.ts` if the row needs a payer label it does not already expose

- [ ] **Step 1: Rebuild the expense row**

`ExpenseCard` keeps `data-testid="expense-card"` and becomes a row, not a card: `CategoryEmoji` lens, title, `<payer> trả · chia <n> người · <date>` or the reimbursement variant, then amount over the viewer's-stake chip. Rows sit inside one `glass-raised` section card with `divide-y divide-border/60`.

- [ ] **Step 2: Rebuild the list layout**

Desktop: a heading row holding the title, the search field capped at 420px, and the create button. Mobile: search only, create on the FAB.

- [ ] **Step 3: Rebuild the wide aside**

At `xl` the aside gains a compact balance list with a link to the balances screen and settlement suggestions with a working mark-as-paid button, matching the design. Reuse the balances hook rather than duplicating the calculation.

- [ ] **Step 4: Verify and commit**

Run: build, then `npx playwright test e2e/expense-list.spec.ts`.

```bash
git add -A && git commit -m "update(expenses): rebuild the expense list to the design"
```

---

### Task 6: Expense form

**Files:**
- Create: `src/components/core/atoms/Chip/index.tsx`
- Create: `src/components/core/molecules/SegmentedControl/index.tsx`
- Create: `src/components/core/molecules/CategoryChips/index.tsx`
- Create: `src/components/core/molecules/PayerPicker/index.tsx`
- Delete: `src/components/core/molecules/CategorySelect/index.tsx`
- Delete: `src/components/core/templates/ExpenseForm/AdvancedSplitCollapsible.tsx`
- Modify: `src/components/core/templates/ExpenseForm/index.tsx`, `ExpenseMetaFields.tsx`, `PaidForList.tsx`, `PaidForRow.tsx`, `ExpenseAmountField.tsx`, `ExpenseFormFooter.tsx`
- Modify: `messages/{en-US,vi}/expenses.json`

**Interfaces:**
- Produces: `<Chip selected onClick>`, `<SegmentedControl testId value options onValueChange>`, `<CategoryChips value onValueChange categories>`, `<PayerPicker testId value participants onValueChange>`.

- [ ] **Step 1: Build Chip and SegmentedControl**

`Chip` is a pill button carrying the chip tokens and a `selected` state. `SegmentedControl` is a Radix RadioGroup styled as the mockup's inset track: the selected option takes a white surface and a soft shadow. It accepts `testId` so `split-mode` survives, and each option renders with `role="radio"` plus an `option` role alias is not needed — the harness selects by accessible name on the radio.

- [ ] **Step 2: Build CategoryChips**

Six chips in `CATEGORY_IDS` order, each `<Chip>` with the emoji and the translated name, `role="option"` inside a `role="listbox"` so `selectRadixOption` can still find them by name without a popover. The row wraps.

- [ ] **Step 3: Build PayerPicker**

Shows up to four chips with the selected participant first, each name truncated at 72px with the full name on `title`. The remainder collapses into a pill of three stacked avatars and `+n` that carries `data-testid="paid-by"` and `role="combobox"`. Opening it renders a Radix Popover at `lg` and a vaul Drawer below, both containing a name filter, a list of `role="option"` rows capped at 260px of scroll, and an empty state. Chips themselves are `role="option"` so a group small enough to show every participant needs no popover.

- [ ] **Step 4: Rebuild PaidForRow**

Name first in the DOM, avatar second and positioned left with `order-first`, so `innerText` still starts with the participant name. Checkbox stays a Radix Checkbox. Keep `data-id`. Share input unchanged.

- [ ] **Step 5: Rebuild PaidForList**

Header row: title and the split-mode `SegmentedControl`. Second row: `<k>/<n> người` and a single select-all toggle that flips to deselect-all when everyone is checked. Then the rows in a `max-h-66 overflow-y-auto` region. Then the pinned hint and total.

- [ ] **Step 6: Delete the collapsible and rewire the form**

`splitMode` moves to `PaidForList`; `saveDefaultSplittingOptions` moves into the same card as a checkbox under the total. `ExpenseForm` becomes two auto-fit columns at `lg` — fields left, paid-for and footer right — and one column below.

- [ ] **Step 7: Verify and commit**

Run: `npm run check-types`, `npm run lint`, build, then `npx playwright test e2e/expense-variants.spec.ts e2e/core.spec.ts`.

```bash
git add -A && git commit -m "update(expense-form): rebuild the form to the design's chips and segmented split"
```

---

### Task 7: Remaining screens

**Files:**
- Modify: `src/components/core/templates/BalanceList/index.tsx`, `BalanceRow.tsx`, `ReimbursementRow.tsx`
- Modify: `src/components/core/templates/GroupStats/*`
- Modify: `src/components/core/templates/ActivityLog/index.tsx`
- Modify: `src/components/core/templates/GroupInfo/index.tsx`
- Modify: `src/components/core/templates/GroupForm/*`
- Modify: `src/components/core/templates/Settings/index.tsx`
- Modify: `src/components/core/templates/ActiveUserPrompt/index.tsx`

- [ ] **Step 1: Balances**

Keep `balance-row` and `reimbursement-row`. Bars diverge from a centre axis with an explicit 2px rule; the row states the amount in text so colour is never the only signal. Desktop lays the balance card and the suggestion column side by side as auto-fit columns.

- [ ] **Step 2: Stats**

Range control becomes a `SegmentedControl`. Grid becomes three columns at `lg`: totals spanning two with recurring beside it, the time series spanning three, per-member spanning two as a two-column list, per-category alongside. One column below `lg`. Bars keep their drill-downs.

- [ ] **Step 3: Activity, information, group form, settings**

Activity: day sections as single cards of hairline rows with a coloured tag. Information: prose card, authorship footer, edit affordance. Group form: details card, members card with inline add, save. Settings: two language option rows with a radio dot, and a version card.

- [ ] **Step 4: Active-user prompt**

Restyle to the sheet/dialog language the rest of the app now uses; no behaviour change.

- [ ] **Step 5: Verify and commit**

Run: `npm run check-types`, `npm run lint`.

```bash
git add -A && git commit -m "update(screens): rebuild balances, stats, activity, info, group form and settings"
```

---

### Task 8: Harness and delivery

**Files:**
- Modify: `e2e/app.ts`, `e2e/expense-variants.spec.ts`
- Modify: `docs/screenshots/*`
- Modify: `design-system/chiatien/MASTER.md`

- [ ] **Step 1: Update the fill helper**

Category selection targets the chip listbox. Payer selection targets the chip or the picker. Split mode targets the segmented control directly — remove the "Advanced splitting options" click.

- [ ] **Step 2: Replace the category-search spec**

The six-chip row has no search. Delete `searches the category list` and add a spec that opens the payer picker in a group with more than four participants, filters by name, selects a match, and asserts the saved expense names that payer.

- [ ] **Step 3: Full verification**

Run one at a time: `npm test`, `npm run check-types`, `npm run lint`, `npm run build`, `npm run e2e`.

- [ ] **Step 4: Browser pass**

Every screen at 390, 768, 1280, 1440: no horizontal overflow, no console output, measured contrast recorded, the known primary-on-white result named explicitly.

- [ ] **Step 5: Regenerate screenshots, document, merge**

```bash
npx playwright test --config playwright.screenshots.config.ts
git add -A && git commit -m "test(e2e): drive the rebuilt form and refresh the screenshots"
git checkout main && git merge --no-ff update/design-parity-rebuild
```

---

## Self-review

**Spec coverage.** Categories → Task 1. Tokens → Task 2. Shell, both breakpoints → Task 3. Group list and `_count.expenses` → Task 4. Expense list and the wide aside → Task 5. Expense form, payer picker, always-visible split mode → Task 6. Balances, stats, activity, information, group form, settings → Task 7. Testing contract and verification → Task 8. The mockup's two rendering bugs are named in the spec as not-to-copy and need no task.

**Placeholders.** None: every task names exact files and the behaviour its deliverable must show.

**Type consistency.** `categoryEmoji`/`categoryHueVar` (Task 1) are consumed by `CategoryEmoji` and `CategoryChips` (Tasks 1, 6). `groupEmoji` lands in Task 3 with the sidebar identity block that first needs it, and Task 4's group card consumes the same helper. `SegmentedControl` (Task 6) is consumed by the stats range control (Task 7).
