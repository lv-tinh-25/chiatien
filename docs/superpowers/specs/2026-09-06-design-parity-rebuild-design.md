# Design-parity rebuild

Rebuild every screen of ChiaTien to match the owner's own mockup, on mobile and
desktop, and cut the category taxonomy down to the six the mockup shows.

## Source of truth

`ChiaTien Responsive.dc.html`, the file the owner supplied. Where this document
and the mockup disagree, the mockup wins; where the mockup is silent, this
document decides. The mockup is a static prototype with hardcoded Vietnamese
copy and two rendering bugs that are not design intent and must not be copied:

- a zero balance renders as `−0 ₫` rather than a settled state
- the group-settings textarea renders `[object Object]`

The mockup's breakpoints are the contract: below 1024px the mobile tree, at or
above 1024px the desktop tree, and at or above 1280px the desktop expense screen
gains a second column.

## Non-goals

Feature parity with spliit is unchanged. No screen is added, none removed, no
calculation changes. `src/trpc` keeps its shape. The one deliberate deviation
from "`prisma/` is ported and unchanged" is the category migration below, which
the repository owner authorised explicitly.

## Categories

The database seeds 42 categories from spliit (ids 0-40 plus 43). The mockup
shows six. Six is what ships.

A migration repoints every expense whose `categoryId` is outside the kept set to
`0`, then deletes the other rows. Six existing rows are kept and renamed rather
than inserted fresh, so `Expense.categoryId`'s default of `0` stays valid and no
foreign key is orphaned:

| id | new grouping    | new name        | Vietnamese  | emoji |
| -- | --------------- | --------------- | ----------- | ----- |
| 11 | `Accommodation` | `Accommodation` | Chỗ ở       | 🏨    |
| 7  | `Food`          | `Food`          | Ăn uống     | 🍜    |
| 27 | `Transport`     | `Transport`     | Di chuyển   | 🛵    |
| 2  | `Leisure`       | `Leisure`       | Giải trí    | 🎫    |
| 1  | `Settlement`    | `Settlement`    | Trả nợ      | 💸    |
| 0  | `Other`         | `Other`         | Khác        | 🧩    |

Names stay English in the database; Vietnamese lives in
`messages/vi/expenses.json` under `Categories.<grouping>.<name>`, and the 36
now-dead keys are deleted from both locales. `Other` is the fallback for
anything unrecognised and must stay id `0`.

The emoji is a front-end concern keyed on category id, not a database column. It
lives in one module so switching to WebP art later touches one file.

`src/lib/category-extract.ts`'s prompt and its unit-test fixtures reference ids
that are about to disappear; both are updated. `e2e/screenshots.capture.ts`
hardcodes ids 32 and 34 and is updated too.

## Tokens

`src/styles/globals.css` already carries the glass tiers, the participant hues
and the aurora. The mockup changes these values:

- `--primary` returns to `161 94% 30%` and `--credit` follows it. This is the
  owner's explicit call. White on that measures 3.86:1, below WCAG AA; the
  decision is recorded here so nobody re-derives it as a bug.
- Primary actions become a gradient — `linear-gradient(135deg, hsl(var(--primary)),
  hsl(168 90% 33%))` — over a coloured shadow `0 8px 20px hsl(var(--primary) / .35)`.
  A `--primary-gradient` token carries it so no component writes the stops.
- The aurora gains a fourth and fifth stop and much more presence: three blurred
  radial blobs at .32/.28/.20 alpha with `filter: blur(70px)`, replacing the
  current flat radial gradients at .16/.14/.12. Mobile gets its own smaller
  blob set, clipped to the 480px column.
- Selected-chip surface `hsl(152 81% 94%)` on border `hsl(161 60% 70%)` with
  text `hsl(161 94% 24%)`; unselected `rgb(255 255 255 / .8)` on
  `hsl(var(--border))` with text `hsl(215 25% 35%)`. These become
  `--chip-*` tokens rather than repeated literals.
- Radii: the mockup uses 12px for controls, 16-18px for cards, 20px for hero
  cards, 24px for sheet tops. `--radius-control` becomes `0.75rem`,
  `--radius-card` `1.125rem`, `--radius-hero` `1.25rem`, `--radius-sheet`
  `1.5rem`.

### Type scale (corrected 2026-09-06, pass 2)

The first pass left the old scale in place, which is what made every phone
screen read a size too large. The mockup's own values, mobile → desktop:

| Utility | Mobile | Desktop | Weight |
| ------- | ------ | ------- | ------ |
| `text-display-currency` | 34 px | 44 px | 800 |
| `text-numeric-hero` | 22 px | 30 px | 800 |
| `text-headline-lg` | 26 px | 28 px | 800 |
| `text-headline-md` | 18 px | 19 px | 800 |
| `text-headline-sm` | 14 px | 15 px | 700 |
| `text-body-lg` | 14.5 px | 15 px | 400 |
| `text-body-md` | 13.5 px | 14 px | 400 |
| `text-body-sm` | 11.5 px | 12 px | 400 |
| `text-numeric-table-lg` | 14.5 px | 15 px | 800 |
| `text-numeric-table-md` | 13 px | 14 px | 700 |
| `text-label-md` | 12 px | 12.5 px | 700 |
| `text-label-sm` | 10.5 px | 11 px | 700 |

Each size comes through an `--fs-*` variable so one `@media (min-width: 64rem)`
block steps the whole scale up; `@theme inline` copies the value it is given, so
without that indirection every utility would freeze at its mobile size.

Two colour tiers, not one: `--muted-foreground` at `215 19% 45%` — a shade
darker than the mockup's `#64748B`, which measures 4.45:1 over the aurora — and
`--muted-foreground-subtle` at `215 20% 65%`, which clears no threshold and is
therefore used only for glyphs that carry no words.

Glass tiers and motion stay as they are.

## Shell

### Mobile (< 1024px)

The app is a **480px column centred in the viewport**. The aurora layer, the top
bar, the bottom nav, the FAB and every sheet are all clipped to
`min(100%, 480px)` and centred with it. On a 390px phone this is invisible; on a
768px tablet it stops the phone layout stretching into a dead zone.

A fixed 56px top bar carries, left to right: a back button when the screen is
not the group list; the brand mark on the group list only; a title block with an
optional second line; and one trailing action — settings on the group list, the
overflow menu inside a group. Content sits under `padding: 68px 16px 110px`.

A fixed bottom nav appears only inside a group: four items — expenses, balances,
stats, activity — as icon over label. The fifth destination, group information,
lives in the overflow menu, not the bar.

A single FAB appears on the group list and the expense list only, 58px, radius
19px, gradient fill, sitting 24px from the bottom on the group list and 92px
inside a group so it clears the nav.

The overflow menu is a bottom sheet with a grabber: group information, group
settings, share link, export CSV, export JSON.

A toast sits 104px from the bottom, centred, with an undo action.

### Desktop (≥ 1024px)

A fixed 60px top bar spans the viewport: brand mark, then a breadcrumb
`Nhóm / <group name>` when inside a group, then on the right a "this group"
dropdown carrying the same five overflow items, then a settings button.

Inside a group a 248px sidebar is pinned below the bar, flush to the left edge
with a right border rather than floating. It holds the group identity — emoji
tile, name, `<n> thành viên · <currency>` — then the five destinations
including group information, then at the bottom a card naming the active
participant with a link to change them.

Content is `padding: 84px 32px 48px`, left-padded to 280px inside a group, and
capped at 1080px.

## Screens

Every screen keeps its route. The list below states only what the markup must
become.

**Group list.** Desktop: a heading row with a subtitle and a create button, then
a two-up auto-fit row holding the total-balance hero and the join-by-link card,
then starred / recent / archived as `repeat(auto-fill, minmax(230px, 1fr))`
grids. Mobile: hero full width, sections as two-column grids, join card between
recent and archived, create moves to the FAB.

A group card is a single link containing an emoji tile, the group name,
`<n> thành viên · <m> khoản chi`, and a balance chip reading `+…`, `−…` or
settled. Star, archive and forget move off the card face into a per-card
overflow menu so the card is one target.

**Expense list.** A search field, then per-period sections, each a single glass
card with hairline-separated rows. A row is: a 42/44px circular lens tinted from
the category hue holding the emoji; title; `<payer> trả · chia <n> người · <date>`
(or `Trả nợ · <date>` for a reimbursement); then amount over a chip stating the
viewer's stake. Desktop at ≥1280px gains a 340px sticky column holding a compact
balance list with a link to the balances screen, and settlement suggestions with
a mark-as-paid action.

**Expense form.** Desktop is two auto-fit columns: the field card on the left,
and on the right the "paid for" card above the submit row. Mobile stacks them.

Fields, in order: title; amount with a currency toggle and, when the currency
differs from the group's, a conversion line; date and recurrence side by side;
category as a six-chip row; payer as chips; notes; receipt attachment.

The payer control shows at most four chips with the selected participant first,
each truncated at 72px with the full name on `title`. Any remainder collapses
into a pill showing three stacked avatars and `+n`, which opens a picker — an
anchored popover on desktop, a bottom sheet on mobile — with a name filter, a
scrolling list capped at 260px, and an empty state.

The "paid for" card carries the split-mode segmented control in its header,
**always visible — the collapsible is gone**, then a row reading `<k>/<n> người`
with a select-all toggle, then the participant list in a 264px scroll area, then
a pinned hint and total.

**Balances.** A card of diverging bars around a centre axis — debt left, credit
right — then settlement suggestions as cards with a mark-as-paid button.
Desktop places the two side by side as auto-fit columns.

**Stats.** A range segmented control, then a bento grid: totals spanning two
columns, recurring expenses beside it, the time series spanning three, per
member spanning two as a two-column list, per category alongside. Mobile
collapses to one column. Bars stay clickable and open the same drill-downs.

**Activity.** Day sections, each a single card of hairline-separated rows:
avatar, `<who> đã <action> <target>`, time, and a coloured tag.

**Group information.** A single prose card with an authorship footer, and an
edit affordance — a button beside the heading on desktop, a full-width button
below on mobile.

**Group form.** A details card — name, information, currency as a chip row —
then a members card listing participants with a remove action and an inline
add field, then save.

**Settings.** A language card of two option rows with a radio dot, and a version
card.

## Components

New: `AppTopBar`, `GroupIdentity`, `ActiveUserCard`, `CategoryEmoji`,
`Chip`, `ChipRow`, `SegmentedControl`, `PayerPicker`, `OverflowMenu`,
`BalanceMiniList`, `GroupCardMenu`.

Reworked: `AppShell`, `Sidebar`, `BottomNav`, `GroupHeader`, `GroupCard`,
`GlobalBalanceCard`, `ExpenseCard`, `ExpenseList`, `ExpenseForm` and its field
components, `PaidForList`, `PaidForRow`, `BalanceList`, `BalanceRow`,
`ReimbursementRow`, `GroupStats` and its cards, `ActivityLog`, `GroupInfo`,
`GroupForm`, `Settings`, `CategorySelect`.

Deleted: `AdvancedSplitCollapsible` (the segmented control replaces it),
`CategoryIcon`'s lucide switch (the emoji map replaces it).

Logic stays in hooks. Templates compose. No `useState` or data shaping in a
template's `index.tsx`.

## Data

`getGroups` in `src/lib/api.ts` already counts participants; it gains
`expenses: true` in the same `_count` so a group card can state its expense
count. This is the only change to ported data access.

## Testing contract

The redesign changes interaction mechanisms, so the Playwright harness changes
with it in the same commit. Coverage does not shrink.

- `e2e/app.ts` picks the category from a chip, the payer from a chip or the
  picker, and the split mode from the always-visible segmented control; it stops
  opening a collapsible first. The participant row's accessible text must still
  start with the participant name, so the row puts the name first in the DOM and
  positions the avatar with `order`, and the checkbox stays a Radix Checkbox
  rendering an SVG rather than a text glyph.
- `expense-variants.spec.ts`'s category-search test loses its subject and is
  replaced by a test of the payer picker's name filter.
- `data-testid` values `expense-card`, `paid-by`, `split-mode`, `balance-row`
  and `reimbursement-row` survive on their new hosts.
- Routes and English strings are otherwise unchanged.

## Verification

Unit tests, `check-types`, `lint` and the full e2e suite green; a production
build succeeding; every screen inspected in Chrome at 390, 768, 1280 and 1440
with no horizontal overflow and no console output; measured text contrast
recorded per screen, with the known primary-on-white failure named rather than
silently passed; `docs/screenshots` regenerated.
