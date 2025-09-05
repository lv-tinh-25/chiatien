# ChiaTien Slice 1 — Group list and group form

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the two screens that bracket every other one — the list of groups a browser remembers, and the form that creates or edits a group.

**Architecture:** Client state (which groups this browser has seen, which are starred or archived, who the viewer is in each group) moves out of scattered `localStorage` calls into two persisted zustand stores whose reducers are pure and unit-tested. Both screens follow the house pattern: a thin `page.tsx`, a template that only composes, and one hook per screen holding all state.

**Tech Stack:** Next.js 16 App Router, React 19, zustand + persist, tRPC 11 + TanStack Query, react-hook-form + Zod 4, Tailwind 4, Radix, next-intl.

**Spec:** `docs/superpowers/specs/2026-09-05-chiatien-design.md`

## Global Constraints

Every rule in `CLAUDE.md` applies to every task: never push, English in code and Vietnamese only in `messages/vi/`, comments explain non-obvious *why* only, no `any` / `as` / `@ts-ignore`, semantic colour tokens only, every display string through `next-intl`, logic in hooks and `lib`, branches `<type>/<kebab-scope>`, Conventional Commits, merge with `--no-ff`.

Additional constraints specific to this slice:

- `src/lib` and `src/trpc` are ported code and must not be edited.
- The DOM contract the ported Playwright helper `createGroup` in `e2e/app.ts` depends on: `input[name="name"]`, `input[name="participants.<i>.name"]`, a button named exactly `Add participant`, a submit button named exactly `Create` (create mode) or `Save` (edit mode), each participant row wrapped in an `li` containing exactly one button (its remove control), and a redirect to `/groups/<id>/expenses` after create.
- English strings must keep their spliit wording where a ported spec asserts on them: `Recent groups`, `You have not visited any group recently.`, `Add participant`, `Create`, `Save`.
- Run heavy commands one at a time; RAM is under 1 GB free.

## Scope

**In:** the recent / starred / archived group list, its empty state, the global balance card, adding a group by URL or QR, creating a group, editing a group including the active-user setting and protected participants.

**Out, and why:** `e2e/group-management.spec.ts` and `e2e/global-balance.spec.ts` are *not* gating specs for this slice. Four of the six tests in the first and all of the second call `addExpense`, read balances, or fetch the export routes, none of which exist until slices 3, 4 and 6. They are ported when their dependencies land. This slice writes `e2e/group-list.spec.ts` instead.

---

### Task 1: Client-side group memory as stores

**Files:**
- Create: `src/lib/recent-groups.ts`, `src/lib/recent-groups.test.ts`
- Create: `src/stores/useRecentGroupsStore.ts`, `src/stores/useActiveUserStore.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: `recentGroupsSchema`, `starredGroupsSchema`, `type RecentGroup = { id: string; name: string }`, and the pure reducers `addRecent(list, group)`, `removeRecent(list, groupId)`, `toggleIn(list, id)`, `partitionGroups(groups, starred, archived)` returning `{ starred, recent, archived }`. Stores expose `useRecentGroupsStore()` with `{ groups, starred, archived, visit, forget, toggleStar, toggleArchive }` and `useActiveUserStore()` with `{ activeUsers, setActiveUser, activeUserFor }`.

- [ ] **Step 1: Create the branch**

```bash
cd /Users/tinh.le/Documents/personal-projects/chiatien
export NVM_DIR="$HOME/.nvm"; . "$NVM_DIR/nvm.sh"; nvm use
git checkout main && git checkout -b feat/group-memory-stores
```

- [ ] **Step 2: Write the failing test**

```ts
// src/lib/recent-groups.test.ts
import { addRecent, partitionGroups, removeRecent, toggleIn } from '@/lib/recent-groups'

describe('addRecent', () => {
  it('puts a newly visited group first', () => {
    expect(addRecent([{ id: 'a', name: 'A' }], { id: 'b', name: 'B' })).toEqual([
      { id: 'b', name: 'B' },
      { id: 'a', name: 'A' },
    ])
  })

  it('moves an already known group to the front instead of duplicating it', () => {
    const list = [{ id: 'a', name: 'A' }, { id: 'b', name: 'B' }]
    expect(addRecent(list, { id: 'b', name: 'B' })).toEqual([
      { id: 'b', name: 'B' },
      { id: 'a', name: 'A' },
    ])
  })

  it('refreshes a renamed group', () => {
    expect(addRecent([{ id: 'a', name: 'Old' }], { id: 'a', name: 'New' })).toEqual([
      { id: 'a', name: 'New' },
    ])
  })
})

describe('removeRecent', () => {
  it('drops the named group and leaves the rest in order', () => {
    const list = [{ id: 'a', name: 'A' }, { id: 'b', name: 'B' }]
    expect(removeRecent(list, 'a')).toEqual([{ id: 'b', name: 'B' }])
  })
})

describe('toggleIn', () => {
  it('adds an id that is absent', () => {
    expect(toggleIn([], 'a')).toEqual(['a'])
  })

  it('removes an id that is present', () => {
    expect(toggleIn(['a', 'b'], 'a')).toEqual(['b'])
  })
})

describe('partitionGroups', () => {
  const groups = [
    { id: 'a', name: 'A' },
    { id: 'b', name: 'B' },
    { id: 'c', name: 'C' },
  ]

  it('splits into starred, recent and archived, preserving order', () => {
    expect(partitionGroups(groups, ['b'], ['c'])).toEqual({
      starred: [{ id: 'b', name: 'B' }],
      recent: [{ id: 'a', name: 'A' }],
      archived: [{ id: 'c', name: 'C' }],
    })
  })

  it('treats starring as stronger than archiving', () => {
    const result = partitionGroups(groups, ['c'], ['c'])
    expect(result.starred.map((g) => g.id)).toEqual(['c'])
    expect(result.archived).toEqual([])
  })

  it('returns three empty lists for an empty input', () => {
    expect(partitionGroups([], [], [])).toEqual({
      starred: [],
      recent: [],
      archived: [],
    })
  })
})
```

- [ ] **Step 3: Run it to verify it fails**

Run: `npm test -- recent-groups`
Expected: FAIL, module not found.

- [ ] **Step 4: Implement `src/lib/recent-groups.ts`**

Pure functions plus the Zod schemas used to validate whatever is already in this browser's storage. Starring beats archiving so a group can never appear twice.

- [ ] **Step 5: Run it to verify it passes**

Run: `npm test -- recent-groups`
Expected: 9 passing.

- [ ] **Step 6: Write the two stores**

`useRecentGroupsStore` persists under `chiatien.recent-groups`, `useActiveUserStore` under `chiatien.active-users`. Both use zustand's `persist` middleware with `skipHydration` left off, and each action delegates to the reducers from Step 4 so nothing but wiring lives in the store. `activeUserFor(groupId)` returns `string | null`.

Note the storage keys deliberately differ from spliit's (`recentGroups`, `<groupId>-activeUser`): this is a different application on a different origin, and the ported e2e fixture seeds only `newGroup-activeUser`, which no longer participates.

- [ ] **Step 7: Verify types, lint and the whole suite**

```bash
npm run check-types
```
```bash
npm run lint
```
```bash
npm test
```

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat(stores): persist recent groups and the active user"
```

---

### Task 2: Form molecules

**Files:**
- Create: `src/components/core/molecules/FormField/index.tsx`
- Create: `src/components/core/molecules/FormInput/index.tsx`
- Create: `src/components/core/molecules/FormTextarea/index.tsx`
- Create: `src/components/core/molecules/Select/index.tsx`
- Create: `src/components/core/molecules/CurrencySelect/index.tsx`
- Create: `src/components/core/molecules/EmptyState/index.tsx`
- Create: a `.stories.tsx` beside each
- Create: `src/components/core/molecules/molecules.test.ts`

**Interfaces:**
- Consumes: the atoms from Phase 0.
- Produces: `<FormField name label description>`, `<FormInput name label placeholder>`, `<FormTextarea name label>`, `<Select value onValueChange options>` where `options` is `{ value: string; label: string }[]`, `<CurrencySelect value onValueChange locale>`, `<EmptyState title description action>`.

- [ ] **Step 1: Create the branch**

```bash
git checkout main && git checkout -b feat/form-molecules
```

- [ ] **Step 2: Write the failing test**

The rule worth enforcing mechanically is the same one the atoms have, plus the label association the ported `fieldByLabel` helper depends on.

```ts
// src/components/core/molecules/molecules.test.ts
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const dir = join(process.cwd(), 'src/components/core/molecules')

const files = readdirSync(dir, { recursive: true, encoding: 'utf8' })
  .filter((file) => file.endsWith('index.tsx'))
  .map((file) => join(dir, file))

describe('molecule styling', () => {
  it('finds every molecule', () => {
    expect(files).toHaveLength(6)
  })

  it.each(files)('%s uses no hardcoded colour', (file) => {
    const source = readFileSync(file, 'utf8')
    expect(source).not.toMatch(/#[0-9a-fA-F]{3,8}\b/)
    expect(source).not.toMatch(/\brgba?\(/)
    expect(source).not.toMatch(
      /\b(bg|text|border|ring)-(red|green|blue|slate|gray|zinc|emerald|sky|amber|neutral|stone)-\d{2,3}\b/,
    )
  })

  it.each(files)('%s hardcodes no display string', (file) => {
    const source = readFileSync(file, 'utf8')
    // Any literal sentence in JSX would bypass next-intl.
    expect(source).not.toMatch(/>[A-Z][a-z]+ [a-z]+/)
  })
})
```

- [ ] **Step 3: Run it to verify it fails**

Run: `npm test -- molecules`
Expected: FAIL on the count assertion, zero files found.

- [ ] **Step 4: Implement the six molecules**

`FormField` wraps a react-hook-form `Controller`, renders a `<label htmlFor>` bound to the control's id, the control, an optional description and the field error resolved through `useTranslations('SchemaErrors')` — the Zod schemas return message *keys*, not sentences. `Select` and `CurrencySelect` wrap the Radix primitives already in the dependency list; `CurrencySelect` reads its options from `defaultCurrencyList(locale)`. `EmptyState` takes a title, a description and an optional action node.

- [ ] **Step 5: Run it to verify it passes**

Run: `npm test -- molecules`
Expected: 13 passing.

- [ ] **Step 6: Verify and commit**

```bash
npm run check-types
```
```bash
npm run lint
```
```bash
git add -A
git commit -m "feat(molecules): add form field, select and empty state"
```

---

### Task 3: The group form

**Files:**
- Create: `src/hooks/groups/useGroupForm.ts`
- Create: `src/components/core/templates/GroupForm/{index.tsx,GroupDetailsFields.tsx,ParticipantList.tsx,ParticipantRow.tsx,GroupSettingsFields.tsx,GroupFormFooter.tsx}`
- Modify: `src/app/groups/create/page.tsx`, `src/app/groups/[groupId]/edit/page.tsx`
- Create: `src/app/groups/create/page.client.tsx`, `src/app/groups/[groupId]/edit/page.client.tsx`

**Interfaces:**
- Consumes: `groupFormSchema`, `GroupFormValues` from `@/lib/schemas`; `trpc.groups.create`, `trpc.groups.update`, `trpc.groups.getDetails`; the stores from Task 1; the molecules from Task 2.
- Produces: `useGroupForm({ mode, group, protectedParticipantIds })` returning `{ form, fields, addParticipant, removeParticipant, isProtected, submit, isSubmitting }`.

- [ ] **Step 1: Create the branch**

```bash
git checkout main && git checkout -b feat/group-form
```

- [ ] **Step 2: Build the hook**

All state lives here: `useForm` with `zodResolver(groupFormSchema)`, the `useFieldArray` for participants, the create and update mutations, cache invalidation, and — on create — recording the new group in `useRecentGroupsStore` before navigating to `/groups/<id>/expenses`. `isProtected(index)` reports whether a participant already appears in an expense and therefore cannot be removed.

- [ ] **Step 3: Build the template**

`index.tsx` composes only. `ParticipantRow` renders an `li` with one `FormInput` named `participants.<index>.name` and exactly one remove button, disabled when protected — the ported `createGroup` helper locates the remove control as "the button in the li", so a second button in that row would break it. The submit button is named `Create` in create mode and `Save` in edit mode, matching the English strings the ported specs assert on.

- [ ] **Step 4: Wire the routes**

Each `page.tsx` stays metadata plus one client component; the client component renders the template.

- [ ] **Step 5: Verify manually**

```bash
npm run dev
```

Create a group with three participants. Confirm the redirect lands on the expenses route, and that the group is listed on `/groups` afterwards. Stop the server.

- [ ] **Step 6: Verify and commit**

```bash
npm run check-types
```
```bash
npm run lint
```
```bash
npm test
```
```bash
git add -A
git commit -m "feat(groups): add the group create and edit form"
```

---

### Task 4: The group list

**Files:**
- Create: `src/hooks/groups/useGroupList.ts`
- Create: `src/components/core/templates/GroupList/{index.tsx,GroupCard.tsx,GroupSection.tsx,GlobalBalanceCard.tsx,AddGroupByUrl.tsx}`
- Modify: `src/app/groups/page.tsx`
- Create: `src/app/groups/page.client.tsx`

**Interfaces:**
- Consumes: `trpc.groups.list`, `trpc.groups.balances.forUser`, the stores from Task 1, the molecules from Task 2.
- Produces: `useGroupList()` returning `{ status, starred, recent, archived, balances, toggleStar, toggleArchive, forget }`.

- [ ] **Step 1: Create the branch**

```bash
git checkout main && git checkout -b feat/group-list
```

- [ ] **Step 2: Build the hook**

Read the remembered ids from the store, fetch their details with `trpc.groups.list`, fetch cross-group balances with `trpc.groups.balances.forUser` for the groups this browser has an active user in, and partition with `partitionGroups`. Storage is empty on the server, so the hook reports a `pending` status until it has hydrated rather than rendering an empty state that immediately changes.

- [ ] **Step 3: Build the template**

Three sections, each hidden when empty. The empty state uses the exact English string `You have not visited any group recently.` and the heading is exactly `Recent groups`; both are asserted by ported specs. `GlobalBalanceCard` shows total owed and total owing, using `text-credit` and `text-debit`. `AddGroupByUrl` accepts a pasted group URL and records it in the store.

- [ ] **Step 4: Verify and commit**

```bash
npm run check-types
```
```bash
npm run lint
```
```bash
git add -A
git commit -m "feat(groups): add the group list with starring and archiving"
```

---

### Task 5: End-to-end coverage and screenshots

**Files:**
- Create: `e2e/group-list.spec.ts`
- Create: `docs/screenshots/group-list-*.png`, `docs/screenshots/group-form-*.png`

- [ ] **Step 1: Create the branch**

```bash
git checkout main && git checkout -b test/group-list-e2e
```

- [ ] **Step 2: Write the spec**

Cover: a fresh profile shows the empty state; creating a group redirects to its expenses route; the created group then appears under Recent groups; starring moves it into the starred section and survives a reload; archiving moves it into the archived section; renaming through the edit form is reflected on the list. Use the ported `createGroup` helper from `./app` so this slice proves the DOM contract later slices depend on.

- [ ] **Step 3: Build, then run the spec**

```bash
npm run build
```
```bash
npx playwright test group-list
```

Expected: every test passes. A failure in `createGroup` itself means the form broke the DOM contract, not the test.

- [ ] **Step 4: Capture screenshots**

Both locales at 390, 768 and 1440, for `/groups` with content and for `/groups/create`. Review them against the design reference: emerald primary, hairline cards on the slate ground, credit green and debit red used only for balances, no clipped diacritics.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "test(e2e): cover the group list and form"
```

## Slice exit criteria

- `npm test` green, including `recent-groups` and `molecules`.
- `npm run check-types` and `npm run lint` clean.
- `npm run build` succeeds.
- `npx playwright test` green, both the shell specs and the new group-list spec.
- A group can be created, renamed, starred, archived and forgotten through the UI.
- Screenshots reviewed at three widths in both locales.
