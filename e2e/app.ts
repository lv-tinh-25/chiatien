import { expect, Locator, Page } from '@playwright/test'
import {
  clickUntil,
  escapeRegExp,
  fieldByLabel,
  fillStable,
  money,
  selectRadixOption,
  setChecked,
} from './ui'

export type SplitMode = 'EVENLY' | 'BY_SHARES' | 'BY_PERCENTAGE' | 'BY_AMOUNT'

export type Recurrence = 'Does not repeat' | 'Daily' | 'Weekly' | 'Monthly'

export type GroupTab =
  'Expenses' | 'Balances' | 'Stats' | 'Activity' | 'Settings' | 'EditSettings'

const TAB_PATHS: Record<GroupTab, string> = {
  Expenses: 'expenses',
  Balances: 'balances',
  Stats: 'stats',
  Activity: 'activity',
  Settings: 'settings',
  EditSettings: 'settings/edit',
}

// Regexes, not literals: the labels are "Unevenly – By shares" with an en dash.
const SPLIT_MODE_LABELS: Record<SplitMode, RegExp> = {
  EVENLY: /^Evenly$/,
  BY_SHARES: /By shares/,
  BY_PERCENTAGE: /By percentage/,
  BY_AMOUNT: /By amount/,
}

/** GroupForm ships with three participant rows pre-filled (John / Jane / Jack). */
const PREFILLED_PARTICIPANTS = 3

/**
 * The expenses list URL.
 *
 * Anchored deliberately: an unanchored /groups/<id>/expenses also matches
 * /groups/<id>/expenses/create, so waiting on it would return instantly while
 * still sitting on the form and let assertions run before the write landed.
 */
export const EXPENSES_URL = /\/groups\/[^/]+\/expenses(\?|$)/

/** Short random suffix so group names are unique on the shared database. */
export function uniqueSuffix(): string {
  return Math.random().toString(36).slice(2, 8)
}

export async function createGroup(
  page: Page,
  opts: { name: string; participants: string[] },
): Promise<string> {
  await page.goto('/groups/create')

  // fillStable doubles as the hydration gate: once RHF keeps a value, React is
  // live and later clicks are safe.
  await fillStable(page.locator('input[name="name"]'), opts.name)

  for (let i = PREFILLED_PARTICIPANTS; i < opts.participants.length; i++) {
    await page.getByRole('button', { name: 'Add participant' }).click()
    await expect(
      page.locator(`input[name="participants.${i}.name"]`),
    ).toBeVisible()
  }

  // Drop surplus rows from the end, so the remaining indices never shift.
  for (let i = PREFILLED_PARTICIPANTS - 1; i >= opts.participants.length; i--) {
    const row = page
      .locator('li')
      .filter({ has: page.locator(`input[name="participants.${i}.name"]`) })
    await row.getByRole('button').click()
    await expect(
      page.locator(`input[name="participants.${i}.name"]`),
    ).toHaveCount(0)
  }

  for (let i = 0; i < opts.participants.length; i++) {
    await fillStable(
      page.locator(`input[name="participants.${i}.name"]`),
      opts.participants[i],
    )
  }

  await page.getByRole('button', { name: 'Create group', exact: true }).click()
  await page.waitForURL(EXPENSES_URL, { timeout: 30_000 })

  const groupId = /\/groups\/([^/]+)\/expenses/.exec(page.url())
  if (!groupId) throw new Error(`Could not read group id from ${page.url()}`)
  return groupId[1]
}

export async function addExpense(
  page: Page,
  groupId: string,
  expense: {
    title: string
    /** As typed, e.g. '90' or '12.34'. */
    amount: string
    /** Participant name. */
    paidBy: string
    /** Participant names. Omit to leave every participant checked. */
    paidFor?: string[]
    splitMode?: SplitMode
    /** Participant name -> share value. Set one for every checked participant. */
    shares?: Record<string, string>
    /** YYYY-MM-DD. Defaults to today. */
    date?: string
    /** Visible category name, e.g. 'Food'. Defaults to Other. */
    category?: string
    /** Visible label, e.g. 'Weekly'. Defaults to 'Does not repeat'. */
    recurrence?: Recurrence
  },
): Promise<void> {
  await page.goto(`/groups/${groupId}/expenses/create`)

  // CreateExpenseForm returns null until its tRPC queries resolve, so the
  // submit button appearing means both hydrated and data-ready.
  const submit = page.getByRole('button', { name: 'Add expense', exact: true })
  await expect(submit).toBeVisible({ timeout: 30_000 })

  await fillStable(page.locator('input[name="title"]'), expense.title)
  // Amount before split mode: BY_AMOUNT re-distributes shares whenever the
  // amount changes, which would wipe values set beforehand.
  await fillStable(page.locator('input[name="amount"]'), expense.amount)
  await selectPayer(page, expense.paidBy)

  if (expense.date) {
    // The date input spreads no RHF field, so it has no name attribute.
    await fillStable(page.locator('input[type="date"]'), expense.date)
  }

  if (expense.category) {
    // Six chips, no popover: the taxonomy was cut to what fits in one row.
    await fieldByLabel(page, 'Category')
      .getByRole('option', { name: expense.category, exact: true })
      .click()
  }

  if (expense.recurrence) {
    await selectRadixOption(
      page,
      fieldByLabel(page, 'Repeats').getByRole('combobox'),
      expense.recurrence,
    )
  }

  if (expense.paidFor) {
    const wanted = expense.paidFor
    const rows = await page.locator('[data-id]').all()
    for (const row of rows) {
      const label = (await row.innerText()).split('\n')[0].trim()
      const name = label.replace(/\s*\(.*\)$/, '')
      await setChecked(row.getByRole('checkbox'), wanted.indexOf(name) !== -1)
    }
  }

  const splitMode = expense.splitMode ?? 'EVENLY'
  if (splitMode !== 'EVENLY') {
    // The split modes are a segmented control that is always on screen; the
    // visible label is abbreviated, so the radio is selected by its aria-label.
    await selectSplitMode(page, splitMode)
  }

  if (expense.shares) {
    // Set every participant's share, not just the ones being changed: under
    // BY_AMOUNT the form auto-distributes to whoever has not been edited yet.
    const shares = expense.shares
    const names = Object.keys(shares)
    for (const name of names) {
      await fillStable(
        paidForRow(page, name).getByRole('textbox'),
        shares[name],
      )
    }
  }

  await submit.click()
  await page.waitForURL(EXPENSES_URL, { timeout: 30_000 })
}

/**
 * Picks who paid.
 *
 * The payer control shows up to four chips and collapses any remainder behind
 * a pill: an option that is already a chip is clicked directly, otherwise the
 * pill is opened first and the option picked from the searchable list.
 */
export async function selectPayer(page: Page, name: string): Promise<void> {
  const field = page.getByTestId('paid-by')
  await expect(async () => {
    const chip = field.getByRole('option', { name, exact: true })
    if (!(await chip.isVisible().catch(() => false))) {
      await field
        .getByRole('button', { name: 'Show all participants' })
        .click({ timeout: 5_000 })
    }
    await page
      .getByRole('option', { name, exact: true })
      .first()
      .click({ timeout: 5_000 })
  }).toPass({ timeout: 20_000 })
}

/** Picks a split mode from the always-visible segmented control. */
export async function selectSplitMode(
  page: Page,
  splitMode: SplitMode,
): Promise<void> {
  await page
    .getByTestId('split-mode')
    .getByRole('radio', { name: SPLIT_MODE_LABELS[splitMode] })
    .click()
}

/**
 * Navigates to a group section.
 *
 * spliit rendered these as a Radix tab list; ChiaTien renders navigation
 * links, so this drives the URL directly. Every behavioural assertion the
 * ported specs make is unchanged — only the way the page is reached differs.
 */
export async function openTab(page: Page, tab: GroupTab): Promise<void> {
  const match = /\/groups\/([^/]+)/.exec(page.url())
  if (!match) throw new Error(`Not on a group page: ${page.url()}`)
  await page.goto(`/groups/${match[1]}/${TAB_PATHS[tab]}`)
  await page.waitForURL(new RegExp(`/groups/[^/]+/${TAB_PATHS[tab]}(\\?|$)`), {
    timeout: 30_000,
  })
}

export async function openExpense(page: Page, title: string): Promise<void> {
  await clickUntil(
    () =>
      page
        .getByTestId('expense-card')
        .filter({ hasText: title })
        .first()
        .click(),
    () => page.waitForURL(/\/expenses\/[^/]+\/edit/, { timeout: 5_000 }),
  )
}

/**
 * A "Paid for" row on the expense form. Scoped by the checkbox's accessible
 * name because the share inputs inside these rows share a duplicated id and
 * carry no name attribute -- the row is the only way to tell them apart.
 */
export function paidForRow(page: Page, participant: string): Locator {
  return page.locator('[data-id]').filter({
    has: page.getByRole('checkbox', {
      name: new RegExp(`^${escapeRegExp(participant)}\\b`),
    }),
  })
}

/**
 * Makes `name` the active user for this group.
 *
 * The participant id is resolved through the app's own API and then written
 * into the zustand persist envelope, because the store reads the id and the
 * spec only knows the name.
 */
export async function setActiveUser(
  page: Page,
  groupId: string,
  name: string,
): Promise<void> {
  const input = encodeURIComponent(JSON.stringify({ json: { groupId } }))
  const response = await page.request.get(`/api/trpc/groups.get?input=${input}`)
  const body = await response.json()
  const participants: { id: string; name: string }[] =
    body?.result?.data?.json?.group?.participants ?? []
  const participant = participants.find((candidate) => candidate.name === name)
  if (!participant) {
    throw new Error(`No participant named ${name} in group ${groupId}`)
  }

  await page.addInitScript(
    ([id, participantId]) => {
      const key = 'chiatien.active-users'
      const raw = window.localStorage.getItem(key)
      // ts-reset types JSON.parse as unknown, so the envelope is narrowed
      // rather than asserted. Merging matters: a spec can identify the viewer
      // in more than one group, and each call adds its own init script.
      const parsed: unknown = raw === null ? null : JSON.parse(raw)
      const activeUsers: Record<string, string> = {}
      if (parsed !== null && typeof parsed === 'object' && 'state' in parsed) {
        const state = parsed.state
        if (
          state !== null &&
          typeof state === 'object' &&
          'activeUsers' in state
        ) {
          const stored = state.activeUsers
          if (stored !== null && typeof stored === 'object') {
            for (const [key, value] of Object.entries(stored)) {
              if (typeof value === 'string') activeUsers[key] = value
            }
          }
        }
      }
      activeUsers[id] = participantId
      window.localStorage.setItem(
        key,
        JSON.stringify({ state: { activeUsers }, version: 0 }),
      )
    },
    [groupId, participant.id],
  )

  await page.goto(`/groups/${groupId}/expenses`)
}

/** An expense row in the list. */
export function expenseCard(page: Page, title: string): Locator {
  return page.getByTestId('expense-card').filter({ hasText: title })
}

/** YYYY-MM-DD, n days before today. The suite pins the timezone to UTC. */
export function daysAgo(n: number): string {
  const date = new Date()
  date.setUTCDate(date.getUTCDate() - n)
  return date.toISOString().slice(0, 10)
}

export function balanceRow(page: Page, participant: string): Locator {
  return page.locator(
    `[data-testid="balance-row"][data-participant="${participant}"]`,
  )
}

export async function expectBalance(
  page: Page,
  participant: string,
  amount: number,
): Promise<void> {
  await expect(balanceRow(page, participant)).toContainText(money(amount))
}

export function reimbursementRow(
  page: Page,
  from: string,
  to: string,
): Locator {
  return page.locator(
    `[data-testid="reimbursement-row"][data-from="${from}"][data-to="${to}"]`,
  )
}
