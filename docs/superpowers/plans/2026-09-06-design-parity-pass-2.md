# Design Parity Pass 2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close every remaining gap between the shipped UI and the owner's own
design, measured screen by screen at 390 px and 1440 px.

**Architecture:** The first parity pass rebuilt the layout skeleton but kept the
old type scale, the old copy, and several pre-design components (stats table,
tracked balance bar, currency field, helper paragraphs). This pass corrects the
scale at the token layer, then rewrites the components whose *shape* still
differs from the mockup, then deletes the message keys the rewrite orphans.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript 6 strict, Tailwind
CSS v4 (`@theme inline`), Radix UI, vaul, next-intl, tRPC v11.

**Spec:** `docs/superpowers/specs/2026-09-06-design-parity-rebuild-design.md`
(the source of truth stays `ChiaTien Responsive.dc.html` in
`ChiaTiền webapp design (1).zip`). Task 9 folds this pass's findings back into
that spec.

## Global Constraints

- Never push. No remote, no `gh`, no pull request. Work stops at a local commit.
- No `any`, no `as`, no `@ts-ignore`, no `@ts-expect-error`.
- English in code, identifiers, file names, branches, commits and docs.
  Vietnamese only in `messages/vi/*.json`; never hardcode display text.
- Semantic colour tokens only — no hex, no `rgb()`, no Tailwind palette classes
  in components.
- Logic in `src/hooks` and `src/lib`; templates only compose.
- `src/lib` and `src/trpc` are ported contract code. Only `src/lib/avatar.ts`
  (new) and `src/lib/stats-range.ts` are touched here, both listed explicitly.
- A message key no component renders is a defect: every removed string is
  removed from **both** `messages/vi/` and `messages/en-US/`.
- Run heavy TypeScript commands one at a time.
- Commit author is the repository owner; never add a Claude co-author trailer.

---

## How this audit was run

The design file is a working prototype: its `<script type="text/x-dc">` block
carries real state, and `data-props` exposes a `startScreen` enum. Rendering it
per screen therefore needs no mocking — only that prop rewritten.

1. Seven copies of `ChiaTien Responsive.dc.html` were written, one per
   `startScreen` value, and served over a local static server. The expense form,
   the edit form, the group form, the desktop group menu and the mobile sheet
   were reached by clicking through the live prototype.
2. Each design screen was captured at 390×900 and 1440×900, full page, at
   `deviceScaleFactor: 2`.
3. The app was seeded with the mockup's own fixture — group `Đà Lạt 2026`, ten
   members, the same seven expenses, plus five secondary groups — then captured
   on the same routes at the same two widths with the same settings.
4. Pairs were composited side by side and read screen by screen. Computed
   `font-size` / `font-weight` / `color` were sampled in the browser for the
   rows where the difference looked like scale rather than layout.

The bottom-left dark circle in every app capture is the Next.js dev-tools
indicator, not app UI. The expense date buckets (`TUẦN NÀY` / `THÁNG TRƯỚC`
against the mockup's `HÔM NAY` / `HÔM QUA`) are the same ported grouping
reacting to different fixture dates — not a deviation.

---

## Findings

### A. Cross-cutting

| # | Finding | Design | Shipped |
| - | ------- | ------ | ------- |
| A1 | Mobile type scale is uniformly oversized | expense title 14 px, amount 14.5 px, sub 11.5 px, section label 12 px | 16 px, 19 px, 12 px, 14 px |
| A2 | Muted text is too dark | `#64748B`, with `#94A3B8` for the faintest tier | one tier, `hsl(215 19% 42%)` |
| A3 | Avatar initials | one letter (`M`, `L`, `T`), two only to break a tie (`Th`) | always two (`MI`, `LA`, `TU`, `HƯ`) |
| A4 | Participant hues | ten, per the mockup's `M[]` | eight |
| A5 | Brand wordmark | `ChiaTiền` | `ChiaTien` |
| A6 | Row separators inside list cards | none; rows separate by padding alone | 1 px divider between every row |
| A7 | Helper paragraphs | none anywhere | under most fields and card headers |

### B. Groups list

| # | Finding | Design | Shipped |
| - | ------- | ------ | ------- |
| B1 | Page title | `Nhóm của bạn` | `Nhóm của tôi` |
| B2 | Section titles | `Gắn sao` / `Gần đây` / `Đã lưu trữ` | `Nhóm đánh dấu` / `Nhóm gần đây` / `Nhóm đã lưu trữ` |
| B3 | Balance card label | `Tổng số dư của bạn · mọi nhóm` (desktop), `Tổng số dư của bạn` (mobile) | `Tổng số dư của bạn` both |
| B4 | Balance tile labels | `Được nhận` / `Đang nợ` | `Bạn được nhận` / `Bạn nợ` |
| B5 | Balance tile sub-line | `+ 24 US$ · 2 nhóm`, `1 nhóm` | absent |
| B6 | Balance tile size | 22 px mobile / 30 px desktop | 28 px / 34 px |
| B7 | Card chip when settled | `Đã cân bằng` pill, always present | no chip at all |
| B8 | Mobile card order | emoji → name → meta → chip (chip last) | emoji + chip + ⋮ on one row, then name |
| B9 | Per-card overflow menu | none; the card is one button | ⋮ menu with star / archive / forget |
| B10 | Archived entry | compact muted row, emoji + name + `đã tất toán` | full card like every other |
| B11 | Join-group block | dashed card, one input + 44 px QR icon button | tabs `Nhập link` / `Quét QR`, input, `Thêm bằng URL` button |
| B12 | Join block position (mobile) | between `Gần đây` and `Đã lưu trữ` | last on the page |
| B13 | Desktop card grid | `repeat(auto-fill, minmax(230px, 1fr))` | two columns |

### C. Expense list

| # | Finding | Design | Shipped |
| - | ------- | ------ | ------- |
| C1 | Primary action | `Thêm khoản chi` | `Tạo chi tiêu` |
| C2 | Search placeholder | `Tìm khoản chi…` | `Tìm kiếm chi tiêu...` |
| C3 | Balance chip copy | `Bạn nhận +1.800.000 ₫` / `Bạn nợ −120.000 ₫` / `Không liên quan` | bare amount, label `sr-only` below `lg` |
| C4 | Row sub-line | `Minh trả · 10 người · 6 thg 9` (mobile), `Minh trả · chia 10 người · 6 thg 9` (desktop) | `Minh trả · 10 người · 6 thg 9, 2026` — year always shown |
| C5 | Reimbursement sub-line | `Trả nợ` / `Trả nợ · Lan → Minh` | generic summary |
| C6 | Footer hint | `Kéo xuống để tải thêm…` / `Cuộn xuống để tải thêm…` | absent |
| C7 | Wide aside | shown only at ≥ 1280, `minmax(0,1fr) 340px` | present, width drifts |
| C8 | Aside settlement row | `→` between avatars, amount right-aligned green, short button `Đã trả` | two-line row |

### D. Expense form

| # | Finding | Design | Shipped |
| - | ------- | ------ | ------- |
| D1 | Title | `Khoản chi mới` / `Sửa khoản chi`, with a back button | `Tạo khoản chi`, no back button |
| D2 | Currency control | segmented `₫ \| $` inline to the right of the amount input | a separate `Đơn vị tiền tệ` select field below |
| D3 | Amount input | 24 px mobile / 26 px desktop, weight 800 | body-sized |
| D4 | Field labels | `Ngày`, `Định kỳ`, `Người trả` | `Ngày chi`, `Chi tiêu định kỳ`, `Thanh toán bởi` |
| D5 | Recurrence default | `Không lặp lại` | `Không có` |
| D6 | Default category | `Ăn uống` | `Khác` |
| D7 | Per-person share | pill on every row: amount / `1 phần` / `n %` | absent |
| D8 | Split footer | `Chia đều cho 10 người` + total, right-aligned green | absent |
| D9 | Deselect label | `Bỏ chọn tất cả` | `Bỏ chọn hết` |
| D10 | Submit | one full-width gradient button `Thêm khoản chi` (`Lưu` when editing), `Xoá` beside it when editing | `Tạo` + `Huỷ` link |
| D11 | Reimbursement toggle | none — the `💸 Trả nợ` category carries it | `Đây là khoản hoàn trả` checkbox |
| D12 | Helper text | none | under every field |

### E. Balances

| # | Finding | Design | Shipped |
| - | ------- | ------ | ------- |
| E1 | Diverging bar | no track; gradient fill, 12 px mobile / 14 px desktop, 2 px centre tick | grey track with a thin fill |
| E2 | Amount sign | explicit `+` and `−` | `−` only |
| E3 | Active participant | `Minh (bạn)` | `Minh` |
| E4 | Settlement copy | `Tuấn trả cho Minh` | `Vy nợ Minh` |
| E5 | Settlement row | avatars → text + green amount stacked → button, one line | text and amount on separate lines |
| E6 | Settled state | row dims to `.55`, button becomes `✓ Đã trả` | no dimmed state |
| E7 | Section heading | `Gợi ý quyết toán · 7 lượt chuyển` | `Gợi ý quyết toán` |

### F. Stats

| # | Finding | Design | Shipped |
| - | ------- | ------ | ------- |
| F1 | Range tabs | four: `Tháng này`, `3 tháng`, `Năm nay`, `Tất cả` | five: `Tháng này`, `30 ngày qua`, `Năm nay`, `Toàn bộ`, `Tùy chọn` |
| F2 | Totals card | `Tổng chi tiêu · {range}` + 34/44 px number + three inline metrics (`Bạn đã trả`, `Phần của bạn`, `Chênh lệch`) | two metrics, no `Chênh lệch`, plus a description |
| F3 | Time chart | vertical columns, value label above, month label below, 78 px mobile / 120 px desktop, clickable | horizontal bars |
| F4 | Member breakdown | avatar + name + amount + progress bar + `n khoản · phần phải chịu …`, two columns on desktop | a data table |
| F5 | Recurring card | `Chi tiêu định kỳ` with per-year estimate | absent |
| F6 | Summary card | absent | `Tóm tắt` card |
| F7 | Card labels | one 12 px label per card | label plus a description paragraph |

### G. Activity, group info, group form, settings

| # | Finding | Design | Shipped |
| - | ------- | ------ | ------- |
| G1 | Activity aside | none; content capped at 760 px | the balances aside is rendered here too |
| G2 | Activity day label | `Hôm nay · 6 thg 9` | `Hôm nay` |
| G3 | Activity tag | pill, tinted per kind (`Tạo` green, `Sửa` blue, `Xoá` red) | plain coloured text |
| G4 | Info title / action | `Thông tin nhóm`, ghost button `Sửa` | `Thông tin`, button `Cài đặt nhóm` |
| G5 | Info footer | `Tạo bởi Minh · 3 thg 9 2026 · cập nhật 5 thg 9` | a helper paragraph |
| G6 | Info width | 760 px | full 1080 px |
| G7 | Group form title | `Tạo nhóm mới` / `Cài đặt nhóm`, with a back button | `Tạo nhóm`, no back button |
| G8 | Group information field | textarea on the create form | missing on create, present only on edit |
| G9 | Currency picker | three chips `₫ VND \| $ USD \| € EUR` | a full searchable select |
| G10 | Member rows | avatar + name + `✕`, then one `Tên thành viên mới…` input and a `+ Thêm` button | numbered `Thành viên n` labels, one text input per member |
| G11 | Group form submit | right-aligned gradient `Tạo nhóm` / `Lưu` | `Hủy bỏ` + `Tạo` |
| G12 | Settings back button | present, content capped at 640 px | absent, full width |
| G13 | Sidebar active item | white fill, white border, soft shadow | tinted green fill |

---

## Decisions — settled by the owner on 2026-09-06

These three were the only places where following the mockup literally would drop
a capability the app has. The owner chose the mockup in all three.

1. **Expense currency (D2).** Two chips, `₫` and `$`, exactly as the mockup
   draws them. No `…` escape hatch. An expense can therefore be entered in the
   group currency or in USD, and nothing else.
2. **Group currency (G9).** Two chips, not the mockup's three: **`₫ VND` and
   `$ USD` only** — the owner dropped EUR as well. A group can be created in
   Vietnamese dong or US dollars.
3. **Stats custom range (F1).** The four design tabs, with `Tùy chọn` kept as a
   fifth.

**Consequences of 1 and 2 — carried in Task 4 and Task 7:**

- `src/components/core/molecules/CurrencySelect/` is deleted along with its
  stories, and so is `src/lib/currency-data.json` if nothing else reads it.
- The `Currencies.*` keys (`search`, `noCurrency`, `custom.heading`,
  `common.heading`, `other.heading`) are deleted from both locales.
- `SUPPORTED_CURRENCIES` in `src/lib/currency.ts` narrows to `VND` and `USD`.
  This is a change to ported code and is deliberate; record it in the spec.
- Groups already stored with another currency keep rendering — the code reads
  the stored symbol — but they can no longer be edited to a third currency. The
  database is dev-only and pre-public, so no migration is written.
- `e2e/app.ts` loses `selectRadixOption` for currency; the chips get their own
  driver.
- `CurrencyChips` therefore takes a fixed two-option list and needs no `…` chip
  or `moreLabel` prop.

---

## File structure

| File | Responsibility |
| ---- | -------------- |
| `src/styles/globals.css` | the corrected type scale and the second muted tier |
| `src/lib/avatar.ts` *(new)* | initials rule, unit-tested |
| `src/lib/avatar.test.ts` *(new)* | its tests |
| `src/components/core/atoms/Avatar/index.tsx` | consume `avatarInitials` |
| `src/components/core/atoms/Money/index.tsx` | optional explicit `+` sign |
| `src/components/core/molecules/DivergingBar/index.tsx` | trackless gradient bar |
| `src/components/core/molecules/BalanceChip/index.tsx` | always render, `Đã cân bằng` when zero |
| `src/components/core/molecules/CurrencyChips/index.tsx` *(new)* | the design's two-chip currency control |
| `src/components/core/templates/GroupList/*` | card shape, archived row, join block |
| `src/components/core/templates/ExpenseList/ExpenseCard.tsx` | chip copy, sub-line, scale |
| `src/components/core/templates/ExpenseForm/*` | currency block, share pills, footer, submit |
| `src/components/core/templates/BalanceList/*` | bar, signs, settlement row |
| `src/components/core/templates/GroupStats/*` | totals, column chart, member bars, recurring |
| `src/components/core/templates/ActivityLog/index.tsx` | tag pills, day labels, no aside |
| `src/components/core/templates/GroupInfo/index.tsx` | title, `Sửa`, meta footer, width |
| `src/components/core/templates/GroupForm/*` | information field, currency chips, member rows |
| `src/components/core/templates/Settings/index.tsx` | back button, width |
| `src/components/core/templates/AppShell/Sidebar.tsx` | active item treatment |
| `messages/{vi,en-US}/*.json` | corrected copy, deleted helper keys |

---

## Task 1: Type scale and colour tiers

**Files:**
- Modify: `src/styles/globals.css`

**Interfaces:**
- Produces: the utility names below, unchanged in spelling, changed in value.
  Every later task assumes these numbers.

The design's scale, mobile → desktop, transcribed from the mockup's inline
styles:

| Utility | Mobile | Desktop | Weight |
| ------- | ------ | ------- | ------ |
| `text-display-currency` | 34 px / ls −0.03em | 44 px | 800 |
| `text-headline-lg` | — | 28 px / ls −0.02em | 800 |
| `text-headline-md` | 22 px | 26 px / ls −0.02em | 800 |
| `text-headline-sm` | 14 px | 15 px | 700 |
| `text-body-lg` | 14.5 px | 15 px | 400 |
| `text-body-md` | 13.5 px | 14 px | 400 |
| `text-body-sm` | 11.5 px | 12 px | 400 |
| `text-numeric-table-lg` | 14.5 px / ls −0.01em | 15 px | 800 |
| `text-numeric-table-md` | 13 px | 14 px | 700 |
| `text-label-md` | 12 px | 12.5 px | 700 |
| `text-label-sm` | 10.5 px / ls 0.04em | 11 px | 700 |

- [ ] **Step 1: Rewrite the `--text-*` block**

```css
  --text-display-currency: 2.125rem;
  --text-display-currency--line-height: 2.5rem;
  --text-display-currency--letter-spacing: -0.03em;
  --text-display-currency--font-weight: 800;
  --text-headline-lg: 1.75rem;
  --text-headline-lg--line-height: 2.125rem;
  --text-headline-lg--letter-spacing: -0.02em;
  --text-headline-lg--font-weight: 800;
  --text-headline-md: 1.375rem;
  --text-headline-md--line-height: 1.75rem;
  --text-headline-md--letter-spacing: -0.02em;
  --text-headline-md--font-weight: 800;
  --text-headline-sm: 0.875rem;
  --text-headline-sm--line-height: 1.125rem;
  --text-headline-sm--font-weight: 700;
  --text-body-lg: 0.90625rem;
  --text-body-lg--line-height: 1.375rem;
  --text-body-md: 0.84375rem;
  --text-body-md--line-height: 1.25rem;
  --text-body-sm: 0.71875rem;
  --text-body-sm--line-height: 1.0625rem;
  --text-numeric-table-lg: 0.90625rem;
  --text-numeric-table-lg--line-height: 1.1875rem;
  --text-numeric-table-lg--letter-spacing: -0.01em;
  --text-numeric-table-lg--font-weight: 800;
  --text-numeric-table-md: 0.8125rem;
  --text-numeric-table-md--line-height: 1.125rem;
  --text-numeric-table-md--font-weight: 700;
  --text-label-md: 0.75rem;
  --text-label-md--line-height: 1rem;
  --text-label-md--font-weight: 700;
  --text-label-sm: 0.65625rem;
  --text-label-sm--line-height: 0.875rem;
  --text-label-sm--letter-spacing: 0.04em;
  --text-label-sm--font-weight: 700;
```

- [ ] **Step 2: Add the desktop step-ups**

The design's desktop values are one notch up, not a separate scale. Add one
media block rather than `lg:` variants in forty components:

```css
@media (min-width: 64rem) {
  :root {
    --text-display-currency: 2.75rem;
    --text-headline-md: 1.625rem;
    --text-headline-sm: 0.9375rem;
    --text-body-lg: 0.9375rem;
    --text-body-md: 0.875rem;
    --text-body-sm: 0.75rem;
    --text-numeric-table-lg: 0.9375rem;
    --text-numeric-table-md: 0.875rem;
    --text-label-md: 0.78125rem;
    --text-label-sm: 0.6875rem;
  }
}
```

- [ ] **Step 3: Split the muted tier**

`#64748B` is the mockup's body-muted; `#94A3B8` is its faintest tier (dates,
`Kéo xuống để tải thêm…`, activity timestamps, the archived pill).

```css
  --muted-foreground: 215 19% 47%;
  --muted-foreground-subtle: 215 20% 65%;
```

Register `--color-muted-foreground-subtle` in the `@theme inline` block beside
`--color-muted-foreground`.

- [ ] **Step 4: Measure the contrast of the new tiers**

Run the pixel-sampling audit that shipped with pass 1. Expected: `#64748B` on
the raised glass tint clears 4.5:1; `#94A3B8` is only ever used at ≥ 18.66 px
or for decorative meta — record any target that lands below 4.5:1 and move it
back to `--muted-foreground`.

- [ ] **Step 5: Verify**

Run: `npm run check-types` then `npm run lint`
Expected: both clean.

- [ ] **Step 6: Commit**

```bash
git add src/styles/globals.css
git commit -m "update(tokens): match the design's type scale and muted tiers"
```

---

## Task 2: Avatar initials and participant hues

**Files:**
- Create: `src/lib/avatar.ts`, `src/lib/avatar.test.ts`
- Modify: `src/components/core/atoms/Avatar/index.tsx`, `src/styles/globals.css`

**Interfaces:**
- Produces: `avatarInitials(name: string, others: readonly string[]): string`

The mockup uses one letter and reaches for two only when two members share it
(`Tuấn` → `T`, `Thảo` → `Th`). That is the rule, not a hand-made list.

- [ ] **Step 1: Write the failing test**

```ts
import { avatarInitials } from '@/lib/avatar'

describe('avatarInitials', () => {
  it('takes the first letter', () => {
    expect(avatarInitials('Minh', ['Minh', 'Lan'])).toBe('M')
  })

  it('adds a second letter only to break a tie', () => {
    const group = ['Tuấn', 'Thảo']
    expect(avatarInitials('Tuấn', group)).toBe('T')
    expect(avatarInitials('Thảo', group)).toBe('Th')
  })

  it('keeps the tie-break stable regardless of argument order', () => {
    const group = ['Thảo', 'Tuấn']
    expect(avatarInitials('Thảo', group)).toBe('T')
    expect(avatarInitials('Tuấn', group)).toBe('Tu')
  })

  it('ignores case and leading space when comparing', () => {
    expect(avatarInitials(' minh', ['  minh', 'Lan'])).toBe('M')
  })

  it('falls back to a placeholder for an empty name', () => {
    expect(avatarInitials('', [''])).toBe('?')
  })
})
```

- [ ] **Step 2: Run it and watch it fail**

Run: `npx jest src/lib/avatar.test.ts`
Expected: FAIL, `Cannot find module '@/lib/avatar'`.

- [ ] **Step 3: Implement**

```ts
const PLACEHOLDER = '?'

function head(name: string, length: number): string {
  return [...name.trim()].slice(0, length).join('').toUpperCase()
}

/**
 * One letter, and a second only when another member in the same group would
 * otherwise collide. The first name in `others` keeps the short form so the
 * result does not shuffle when the list is re-sorted.
 */
export function avatarInitials(
  name: string,
  others: readonly string[],
): string {
  const first = head(name, 1)
  if (!first) return PLACEHOLDER
  const sharing = others.filter((other) => head(other, 1) === first)
  if (sharing.length < 2) return first
  return head(sharing[0], 1) === first && sharing[0].trim() === name.trim()
    ? first
    : head(name, 2)
}
```

- [ ] **Step 4: Run the test**

Run: `npx jest src/lib/avatar.test.ts`
Expected: PASS.

- [ ] **Step 5: Consume it in `Avatar`**

`Avatar` takes an optional `peers?: readonly string[]`. With no peers it falls
back to `avatarInitials(name, [name])`, which yields one letter.

- [ ] **Step 6: Add the two missing hues**

The mockup carries ten participant colours. Add `--participant-9: 84 62% 30%`
and `--participant-10: 190 80% 28%`, register both in `@theme inline`, and
widen the modulo in whichever hook assigns them. Lightness stays in the app's
darkened range so white initials keep 4.5:1 — the mockup's own lightness does
not clear it, and this is a contrast floor, not a style choice.

- [ ] **Step 7: Verify**

Run: `npm test`
Expected: all green, including the new file.

- [ ] **Step 8: Commit**

```bash
git add src/lib/avatar.ts src/lib/avatar.test.ts \
        src/components/core/atoms/Avatar/index.tsx src/styles/globals.css
git commit -m "update(avatar): single-letter initials and ten participant hues"
```

---

## Task 3: Groups list

**Files:**
- Modify: `src/components/core/templates/GroupList/index.tsx`,
  `GroupCard.tsx`, `GlobalBalanceCard.tsx`, `AddGroupByUrl.tsx`,
  `GroupSection.tsx`, `src/components/core/molecules/BalanceChip/index.tsx`
- Delete: `src/components/core/templates/GroupList/GroupCardMenu.tsx`
- Create: `src/components/core/templates/GroupList/ArchivedGroupRow.tsx`
- Modify: `messages/vi/groups.json`, `messages/en-US/groups.json`
- Modify: `e2e/groups.spec.ts` and any spec that opens the card menu

Addresses B1–B13, A6.

- [ ] **Step 1: Copy**

| Key | New Vietnamese |
| --- | -------------- |
| `Groups.myGroups` | `Nhóm của bạn` |
| `Groups.starred` | `Gắn sao` |
| `Groups.recent` | `Gần đây` |
| `Groups.archived` | `Đã lưu trữ` |
| `Groups.settled` | `Đã cân bằng` |
| `Groups.settledShort` *(new)* | `đã tất toán` |
| `Groups.Balance.title` | `Tổng số dư của bạn` |
| `Groups.Balance.titleWide` *(new)* | `Tổng số dư của bạn · mọi nhóm` |
| `Groups.Balance.credit` | `Được nhận` |
| `Groups.Balance.debit` | `Đang nợ` |
| `Groups.Balance.groupCount` *(new)* | `{count} nhóm` |
| `Groups.AddByURL.title` | `Tham gia nhóm có sẵn` |
| `Groups.AddByURL.description` | `Dán link được chia sẻ, hoặc quét mã QR từ điện thoại.` |
| `Groups.AddByURL.placeholder` *(new)* | `Dán link nhóm để tham gia…` |

Mirror every one of these in `messages/en-US/groups.json`.

- [ ] **Step 2: `BalanceChip` always renders**

Zero becomes the `Đã cân bằng` pill on `bg-muted text-muted-foreground`, not
`null`. Where `group.balance` is `null` — nobody has said who they are in that
group yet — render nothing, as today.

- [ ] **Step 3: Rebuild `GroupCard`**

Mobile order is emoji tile (38 px, `rounded-control`, tinted) → name
(`text-headline-sm`) → meta (`text-body-sm`) → chip, the chip last. Desktop puts
emoji and chip on one row above the name, tile 40 px. The whole card is a single
`Link`; drop the wrapper `Card` interactive ring in favour of the link's own
focus ring.

- [ ] **Step 4: Delete `GroupCardMenu`**

Star, archive and forget move to the group's own overflow menu
(`AppShell/GroupOverflowMenu.tsx`), which already exists and is where the
design keeps every group-level action. Update the e2e helper `openCardMenu`
accordingly — coverage stays constant.

- [ ] **Step 5: `ArchivedGroupRow`**

A single muted row: 17 px emoji at `opacity-70`, name at `text-body-md`
`font-semibold`, then the `đã tất toán` pill. `GroupList` renders archived
groups through this instead of `GroupCard`.

- [ ] **Step 6: `GlobalBalanceCard`**

Two tiles, `flex-1`. Label `text-label-sm`, amount `text-headline-md` on mobile
and `text-display-currency` at `lg`, sub-line `text-body-sm` carrying the group
count, plus the foreign-currency remainder when one exists.

- [ ] **Step 7: `AddGroupByUrl`**

Drop the tab strip. One dashed card: title, description, then a row of input +
44 px icon button that opens the existing `QrScanner` in a dialog. On mobile the
card collapses to input + icon button with no title, and moves to
`order-none` so it lands between `Gần đây` and `Đã lưu trữ`.

- [ ] **Step 8: Desktop grid**

`grid-template-columns: repeat(auto-fill, minmax(230px, 1fr))` at `lg`; the
balance card and join card share one `repeat(auto-fit, minmax(min(100%,300px), 1fr))`
row above the sections.

- [ ] **Step 9: Verify**

Run: `npm test` then `npm run check-types` then `npm run lint`
Expected: all clean.

- [ ] **Step 10: Commit**

```bash
git add src/components/core/templates/GroupList src/components/core/molecules/BalanceChip \
        messages e2e
git commit -m "update(groups): rebuild the group list to the design"
```

---

## Task 4: Expense list and expense form

**Files:**
- Modify: `src/components/core/templates/ExpenseList/ExpenseCard.tsx`,
  `ExpenseList/index.tsx`
- Modify: `src/components/core/templates/ExpenseForm/index.tsx`,
  `ExpenseAmountField.tsx`, `ExpenseCurrencyBlock.tsx`,
  `ExpenseMetaFields.tsx`, `ExpenseRecurrenceField.tsx`,
  `ExpenseFormFooter.tsx`, `PaidForList.tsx`, `PaidForRow.tsx`
- Create: `src/components/core/molecules/CurrencyChips/index.tsx`
- Delete: `src/components/core/molecules/CurrencySelect/`
- Modify: `src/lib/currency.ts` (narrow to VND and USD), `src/lib/expense-defaults.ts`
  (default category), and both tests
- Modify: `messages/{vi,en-US}/expenses.json`, `messages/{vi,en-US}/common.json`
- Modify: `e2e/expenses.spec.ts`, `e2e/app.ts`

Addresses C1–C8, D1–D12, and decisions 1 and 2.

- [ ] **Step 1: Copy**

| Key | New Vietnamese |
| --- | -------------- |
| `Expenses.create` | `Thêm khoản chi` |
| `Expenses.search` | `Tìm khoản chi…` |
| `Expenses.loadMore` *(new)* | `Kéo xuống để tải thêm…` / `Cuộn xuống để tải thêm…` |
| `ExpenseCard.credit` *(new)* | `Bạn nhận +{amount}` |
| `ExpenseCard.debit` *(new)* | `Bạn nợ −{amount}` |
| `ExpenseCard.notInvolved` | `Không liên quan` |
| `ExpenseCard.paidBySummary` | `{paidBy} trả · {count} người` |
| `ExpenseCard.paidBySummaryWide` *(new)* | `{paidBy} trả · chia {count} người` |
| `ExpenseCard.reimbursement` | `Trả nợ` |
| `ExpenseForm.createTitle` | `Khoản chi mới` |
| `ExpenseForm.date` | `Ngày` |
| `ExpenseForm.recurrence` | `Định kỳ` |
| `ExpenseForm.recurrenceNone` | `Không lặp lại` |
| `ExpenseForm.paidBy` | `Người trả` |
| `ExpenseForm.deselectAll` | `Bỏ chọn tất cả` |
| `ExpenseForm.submit` | `Thêm khoản chi` |
| `ExpenseForm.splitHint.*` *(new)* | `Chia đều cho {count} người` / `Tổng {count} phần` / `Tổng phải đủ 100%` / `Tổng phải khớp số tiền` |

Delete every `description` key under `ExpenseForm` that no longer renders, in
both locales.

- [ ] **Step 2: Expense chip**

Replace the `sr-only` label with the design's full copy, chosen by sign, in a
pill: `bg-credit-subtle text-credit` / `bg-debit-subtle text-debit` /
`bg-muted text-muted-foreground`, `text-label-sm`, `rounded-full px-2 py-0.5`.

- [ ] **Step 3: Row sub-line**

Format the date with `dateStyle: 'medium'` minus the year when the expense falls
in the current year — the mockup shows `6 thg 9`, never `6 thg 9, 2026`. Use the
wide summary string at `lg`.

- [ ] **Step 4: Remove row dividers**

`glass-contain` currently paints a divider between rows. Drop it; the design
separates rows by padding alone.

- [ ] **Step 5: `CurrencyChips`**

```tsx
type CurrencyChipsProps = {
  value: CurrencyCode
  options: readonly CurrencyCode[]
  onChange: (code: CurrencyCode) => void
  label: string   // accessible name for the group
  variant?: 'inset' | 'outline'
}
```

A Radix RadioGroup. The `inset` variant is the expense form's track — a bordered
4 px pad, selected chip filled `bg-primary text-primary-foreground`. The
`outline` variant is the group form's — full-width chips using the `--chip`
tokens. It sits inline to the right of the amount input inside
`ExpenseAmountField`; `ExpenseCurrencyBlock` loses its standalone field and
keeps only the conversion notice.

Then delete `CurrencySelect/`, narrow `SUPPORTED_CURRENCIES` in
`src/lib/currency.ts` to `VND` and `USD`, and delete the `Currencies.*` keys in
both locales. Drop `currency-data.json` only if nothing else imports it.

- [ ] **Step 6: Per-person share and split footer**

`PaidForRow` gains a right-hand pill showing the participant's share, formatted
per split mode: money, `1 phần`, `n %`, money. Unchecked rows show `—` in
`text-muted-foreground-subtle` and their avatar desaturates. `PaidForList`
gains the footer: hint on the left, total on the right in
`text-credit font-extrabold`.

- [ ] **Step 7: Footer**

One full-width gradient submit; when editing, a `Xoá` button takes `flex-1`
beside it at `flex-2`. Remove the `Huỷ` link — the back button in the header is
the design's way out. Remove the `Đây là khoản hoàn trả` checkbox and its keys;
selecting the `Trả nợ` category sets `isReimbursement`.

- [ ] **Step 8: Default category**

`expense-defaults.ts` returns `CATEGORY_FOOD` instead of `CATEGORY_OTHER`.
Update `expense-defaults.test.ts` in the same commit.

- [ ] **Step 9: Verify**

Run: `npm test`, then `npm run check-types`, then `npm run lint`, then
`npm run build`, then `npm run e2e`
Expected: unit green, types clean, lint clean, build succeeds, e2e green.

- [ ] **Step 10: Commit**

```bash
git add src/components/core/templates/ExpenseList src/components/core/templates/ExpenseForm \
        src/components/core/molecules/CurrencyChips src/lib/expense-defaults.ts \
        src/lib/expense-defaults.test.ts messages e2e
git commit -m "update(expenses): match the design's list rows and expense form"
```

---

## Task 5: Balances

**Files:**
- Modify: `src/components/core/molecules/DivergingBar/index.tsx`,
  `src/components/core/atoms/Money/index.tsx`,
  `src/components/core/templates/BalanceList/BalanceRow.tsx`,
  `ReimbursementRow.tsx`, `index.tsx`,
  `src/components/core/templates/GroupScreen/GroupSummaryAside.tsx`
- Modify: `messages/{vi,en-US}/balances.json`

Addresses E1–E7, C8.

- [ ] **Step 1: Copy**

| Key | New Vietnamese |
| --- | -------------- |
| `Balances.Reimbursements.title` | `Gợi ý quyết toán · {count} lượt chuyển` |
| `Balances.Reimbursements.row` | `{from} trả cho {to}` |
| `Balances.Reimbursements.markAsPaid` | `Đánh dấu đã trả` |
| `Balances.Reimbursements.markedAsPaid` *(new)* | `✓ Đã trả` |
| `Balances.Reimbursements.markAsPaidShort` | `Đã trả` |
| `Balances.you` *(new)* | `{name} (bạn)` |

Delete `Balances.description` and `Balances.Reimbursements.description` from
both locales — no component renders them after this task.

- [ ] **Step 2: `DivergingBar`**

Remove the track. Two flex halves meeting at a 2 px `bg-border` tick, each
holding a gradient fill sized by `Math.abs(total) / scale`. Debit fill
`linear-gradient(90deg, hsl(0 84% 66%), hsl(0 84% 58%))` expressed through
`--debit` stops; credit fill through `--credit`. Heights 12 px, 14 px at `lg`;
the `sm` variant used by the aside stays 8 px / 10 px.

- [ ] **Step 3: `Money` sign**

Add `sign?: 'auto' | 'always'`. `always` prefixes `+` for positive amounts and
keeps the existing `−`. Balance rows pass `always`.

- [ ] **Step 4: Reimbursement row**

One line: from-avatar, `→` in `text-muted-foreground-subtle`, to-avatar, then a
column with `{from} trả cho {to}` above the amount in
`text-credit font-extrabold`, then the button. When the pair has been settled in
this session the row drops to `opacity-55` and the button becomes
`✓ Đã trả` on `bg-credit-subtle`.

- [ ] **Step 5: Verify**

Run: `npm test` then `npm run check-types` then `npm run lint`
Expected: all clean.

- [ ] **Step 6: Commit**

```bash
git add src/components/core/molecules/DivergingBar src/components/core/atoms/Money \
        src/components/core/templates/BalanceList \
        src/components/core/templates/GroupScreen/GroupSummaryAside.tsx messages
git commit -m "update(balances): trackless diverging bars and one-line settlements"
```

---

## Task 6: Stats

**Files:**
- Modify: `src/components/core/templates/GroupStats/index.tsx`,
  `TotalsCard.tsx`, `StatsRangeSelector.tsx`, `StatBar.tsx`
- Create: `src/components/core/templates/GroupStats/TimeColumnChart.tsx`,
  `MemberBars.tsx`, `RecurringCard.tsx`
- Delete: `src/components/core/templates/GroupStats/ParticipantTable.tsx`
- Modify: `src/lib/stats-range.ts` and its test (`last30` → `last3Months`)
- Create: `src/lib/recurring-estimate.ts` and its test
- Modify: `messages/{vi,en-US}/stats.json`

Addresses F1–F7, with decision 3 keeping `custom` as a fifth tab.

- [ ] **Step 1: Ranges**

`STATS_PERIODS` becomes `['thisMonth', 'last3Months', 'thisYear', 'all', 'custom']`.
Labels: `Tháng này`, `3 tháng`, `Năm nay`, `Tất cả`, `Tùy chọn`. Range captions
used by the totals card: `Tháng này`, `3 tháng qua`, `Năm {year}`, `Tất cả`.

- [ ] **Step 2: Totals card**

Label `Tổng chi tiêu · {range}` in `text-label-md text-muted-foreground`, number
in `text-display-currency`, then three inline metrics — `Bạn đã trả`,
`Phần của bạn`, `Chênh lệch` — each a muted label followed by a bold value, the
difference tinted `text-credit` or `text-debit` by sign. Drop the description.

- [ ] **Step 3: `TimeColumnChart`**

```tsx
type TimeColumn = {
  key: string        // e.g. '2026-09'
  label: string      // 'T9'
  amount: number
  heightPercent: number
  current: boolean
}
```

A row of `flex-1` buttons, each: value label above (`text-label-sm`, desktop
only), a `rounded-t-lg` column, then the month label. The current month gets the
gradient fill, the rest `bg-primary/20`. Height 78 px mobile, 120 px at `lg`.
Clicking a column keeps today's drill-down behaviour.

- [ ] **Step 4: `MemberBars`**

Replaces `ParticipantTable`. Each row: avatar, then a column holding
name + amount on one line, an 8 px progress bar tinted with the participant's
hue, and `{count} khoản · phần phải chịu {share}` beneath. Two columns at `lg`.

- [ ] **Step 5: `RecurringCard`**

`recurring-estimate.ts` turns a recurrence rule and an amount into a per-year
figure (`WEEKLY` × 52, `MONTHLY` × 12, `YEARLY` × 1). The card lists each
recurring expense with its emoji, title, `{amount}/{period} · {count} người`,
and the estimate; it renders nothing when the group has no recurring expense.

- [ ] **Step 6: Remove the summary card**

Delete the `Tóm tắt` block and every `Stats.Summary.*` key in both locales.

- [ ] **Step 7: Bento layout**

`grid-template-columns: repeat(3, minmax(0, 1fr))` once the content box is at
least 760 px, one column below. Totals spans two, recurring one; the time chart
spans three; member bars two; categories one.

- [ ] **Step 8: Verify**

Run: `npm test`, then `npm run check-types`, then `npm run lint`, then
`npm run build`, then `npm run e2e`
Expected: all green. The stats specs reference `ParticipantTable` rows — move
them onto the member-bar rows in the same commit, coverage unchanged.

- [ ] **Step 9: Commit**

```bash
git add src/components/core/templates/GroupStats src/lib/stats-range.ts \
        src/lib/stats-range.test.ts src/lib/recurring-estimate.ts \
        src/lib/recurring-estimate.test.ts messages e2e
git commit -m "update(stats): rebuild the stats bento to the design"
```

---

## Task 7: Activity, group info, group form, settings, sidebar

**Files:**
- Modify: `src/components/core/templates/ActivityLog/index.tsx`,
  `GroupInfo/index.tsx`, `Settings/index.tsx`,
  `GroupForm/GroupDetailsFields.tsx`, `GroupForm/ParticipantList.tsx`,
  `GroupForm/ParticipantRow.tsx`, `GroupForm/GroupFormFooter.tsx`,
  `AppShell/Sidebar.tsx`, `AppShell/index.tsx`
- Modify: `src/lib/activity-groups.ts` (day label carries the date)
- Modify: `messages/{vi,en-US}/*.json`

Addresses G1–G13, A5, A7.

- [ ] **Step 1: Copy**

`App.name` in `messages/vi/common.json` becomes `ChiaTiền`; `messages/en-US`
keeps `ChiaTien`. `GroupInfo.title` becomes `Thông tin nhóm`, its action `Sửa`.
`Nav.createGroupTitle` stays `Tạo nhóm mới`. Settings keeps `Cài đặt`.

- [ ] **Step 2: Activity**

Cap the column at 760 px and stop rendering `GroupSummaryAside` on this route.
Day headings become `{label} · {date}`. Tags become pills:
`Tạo` on `bg-credit-subtle text-credit`, `Sửa` on a new
`--info-subtle` / `--info` pair, `Xoá` on `bg-debit-subtle text-debit`.

- [ ] **Step 3: Group info**

Title `Thông tin nhóm`, a ghost `Sửa` button on the right, card capped at
760 px, and a meta footer reading `Tạo bởi … · {created} · cập nhật {updated}`
in `text-body-sm text-muted-foreground-subtle`. Delete the helper paragraph and
its key.

- [ ] **Step 4: Group form**

Add the `Thông tin nhóm` textarea to the create form — the field exists on the
edit form and is simply absent on create. Currency becomes `CurrencyChips` in its
`outline` variant with two options, `₫ VND` and `$ USD` (decision 2). Participant rows
become avatar + name + `✕`, with one `Tên thành viên mới…` input and a
`+ Thêm` button beneath; a row switches to an input only when it is clicked.
Footer: one right-aligned gradient button, no `Hủy bỏ`.

- [ ] **Step 5: Settings**

Back button beside the title, content capped at 640 px, and the about note in
the design's low-tint dashed-free card.

- [ ] **Step 6: Sidebar active item**

Active becomes `bg-card/85 border-white/95 shadow-segment` with
`text-primary-ink font-extrabold`, replacing the tinted green fill. Inactive
stays transparent with `text-muted-foreground`.

- [ ] **Step 7: Strip the remaining helper paragraphs**

Sweep `GroupForm`, `Settings` and `GroupInfo` for `description` renders, delete
them, and delete the keys in both locales. Run
`npx tsx scripts/check-message-keys.ts` if that script exists; otherwise grep
each removed key to prove nothing renders it.

- [ ] **Step 8: Verify**

Run: `npm test`, then `npm run check-types`, then `npm run lint`
Expected: all clean.

- [ ] **Step 9: Commit**

```bash
git add src/components/core/templates src/lib/activity-groups.ts messages
git commit -m "update(screens): activity, info, group form, settings and sidebar"
```

---

## Task 8: Re-audit and screenshots

**Files:**
- Modify: `docs/screenshots/*`

- [ ] **Step 1: Rebuild**

Run: `npm run build`
Expected: succeeds.

- [ ] **Step 2: Re-run the side-by-side capture**

Regenerate the design references and the app captures on the same nine routes at
390 px and 1440 px, composite them, and read every pair. Every finding in this
document must be closed or explicitly recorded as a deviation.

- [ ] **Step 3: Overflow and console sweep**

Ten screens × 390 / 768 / 1280 / 1440. Expected: no horizontal overflow, no
console errors, no console warnings.

- [ ] **Step 4: Contrast sweep**

Pixel-sample every rendered text target. Expected: everything at or above its
threshold except the two known primary-gradient measurements the owner has
already accepted.

- [ ] **Step 5: Regenerate `docs/screenshots`**

Run: `npx playwright test --config playwright.screenshots.config.ts`

- [ ] **Step 6: Commit**

```bash
git add docs/screenshots
git commit -m "docs(screenshots): regenerate after the parity pass"
```

---

## Task 9: Fold the findings back into the spec

**Files:**
- Modify: `docs/superpowers/specs/2026-09-06-design-parity-rebuild-design.md`
- Modify: `design-system/chiatien/MASTER.md`

- [ ] **Step 1: Record the corrected scale**

Replace the spec's type-scale table with Task 1's numbers so the next reader
does not re-derive them from the mockup.

- [ ] **Step 2: Record the three decisions**

Record the narrowing of `SUPPORTED_CURRENCIES` to VND and USD as a deliberate
change to ported code, and delete the pass-1 deviation that kept the currency
select searchable — it no longer applies.

- [ ] **Step 3: Commit**

```bash
git add docs/superpowers/specs design-system
git commit -m "docs(spec): record the pass-2 corrections and deviations"
```

---

## Merge

All of these must hold before merging: `npm test` green, `npm run check-types`
green, `npm run lint` green, `npm run e2e` green, no `any`/`as`, no hardcoded
colours or display strings, no orphaned message keys.

```bash
git checkout main
git merge --no-ff update/design-parity-pass-2
```
