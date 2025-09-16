import {
  addExpense,
  createGroup,
  expectBalance,
  openTab,
  paidForRow,
  uniqueSuffix,
} from './app'
import { expect, test } from './fixtures'
import { fieldByLabel, fillStable } from './ui'

test('renames a group and adds a participant afterwards', async ({ page }) => {
  const original = `E2E Settings ${uniqueSuffix()}`
  const groupId = await createGroup(page, {
    name: original,
    participants: ['Alice', 'Bob', 'Carol'],
  })

  await addExpense(page, groupId, {
    title: 'Brunch',
    amount: '60',
    paidBy: 'Alice',
  })

  await openTab(page, 'EditSettings')

  const renamed = `${original} renamed`
  await fillStable(page.locator('input[name="name"]'), renamed)

  // A participant already involved in an expense cannot be removed.
  const aliceRow = page
    .locator('li')
    .filter({ has: page.locator('input[name="participants.0.name"]') })
  await expect(aliceRow.getByRole('button')).toBeDisabled()

  await page.getByRole('button', { name: 'Add participant' }).click()
  await fillStable(page.locator('input[name="participants.3.name"]'), 'Dave')

  // EditGroup saves in place rather than navigating. The group name is chrome
  // now — the breadcrumb and the sidebar carry it, not a heading on the form.
  await page.getByRole('button', { name: 'Save group', exact: true }).click()
  await expect(
    page.getByRole('navigation', { name: 'Breadcrumb' }),
  ).toContainText(renamed, { timeout: 30_000 })

  // The new participant must be usable straight away.
  await addExpense(page, groupId, {
    title: 'Drinks',
    amount: '80',
    paidBy: 'Dave',
  })
  await page.goto(`/groups/${groupId}/expenses/create`)
  await expect(paidForRow(page, 'Dave')).toBeVisible()

  await page.goto(`/groups/${groupId}/balances`)
  // Brunch: 60 over 3 (Dave did not exist yet). Drinks: 80 over 4 = 20 each.
  await expectBalance(page, 'Dave', 60)
})

test('lists visited groups under Recent', async ({ page }) => {
  const first = `E2E Recent A ${uniqueSuffix()}`
  const second = `E2E Recent B ${uniqueSuffix()}`

  await createGroup(page, { name: first, participants: ['Alice', 'Bob'] })
  await createGroup(page, { name: second, participants: ['Alice', 'Bob'] })

  await page.goto('/groups')
  await expect(page.getByRole('heading', { name: 'Recent' })).toBeVisible()
  await expect(page.getByRole('link', { name: first })).toBeVisible()
  await expect(page.getByRole('link', { name: second })).toBeVisible()
})

test('shows no recent groups in a fresh browser profile', async ({ page }) => {
  // Recent groups live in localStorage, so a new context must start empty even
  // though other tests have created groups on the same database.
  await page.goto('/groups')
  await expect(
    page.getByText('You have not visited any group recently.'),
  ).toBeVisible()
})

test('records group and expense changes in the activity log', async ({
  page,
}) => {
  const groupId = await createGroup(page, {
    name: `E2E Activity ${uniqueSuffix()}`,
    participants: ['Alice', 'Bob'],
  })

  await addExpense(page, groupId, {
    title: 'Cinema',
    amount: '20',
    paidBy: 'Alice',
  })

  await openTab(page, 'Activity')

  const activity = page.getByText(/Expense .*Cinema.* created by/)
  await expect(activity).toBeVisible()
  // The active user is 'None', so the actor renders as the generic fallback.
  await expect(activity).toContainText('Someone')
})

test('exports the expenses as JSON', async ({ page }) => {
  const groupId = await createGroup(page, {
    name: `E2E ExportJson ${uniqueSuffix()}`,
    participants: ['Alice', 'Bob'],
  })

  await addExpense(page, groupId, {
    title: 'Ferry',
    amount: '18',
    paidBy: 'Bob',
  })

  const response = await page.request.get(
    `/groups/${groupId}/expenses/export/json`,
  )
  expect(response.status()).toBe(200)

  const body = await response.json()
  expect(JSON.stringify(body)).toContain('Ferry')
})

test('exports the expenses as CSV', async ({ page }) => {
  const groupId = await createGroup(page, {
    name: `E2E Export ${uniqueSuffix()}`,
    participants: ['Alice', 'Bob'],
  })

  await addExpense(page, groupId, {
    title: 'Parking',
    amount: '12',
    paidBy: 'Alice',
  })

  const response = await page.request.get(
    `/groups/${groupId}/expenses/export/csv`,
  )
  expect(response.status()).toBe(200)
  expect(await response.text()).toContain('Parking')
})

test('offers the two group currencies as chips', async ({ page }) => {
  await page.goto('/groups/create')
  const currency = fieldByLabel(page, 'Main currency')

  await expect(currency.getByRole('radio')).toHaveCount(2)
  await expect(currency.getByRole('radio', { name: '₫ VND' })).toBeVisible()
  await expect(currency.getByRole('radio', { name: '$ USD' })).toBeVisible()
})

test('renders amounts in the currency the group was created in', async ({
  page,
}) => {
  const name = `E2E Dong ${uniqueSuffix()}`
  await page.goto('/groups/create')

  await fillStable(page.locator('input[name="name"]'), name)
  await fieldByLabel(page, 'Main currency')
    .getByRole('radio', { name: '₫ VND' })
    .click()
  await page.getByRole('button', { name: 'Create group', exact: true }).click()
  await page.waitForURL(/\/groups\/[^/]+\/expenses$/, { timeout: 30_000 })

  await addExpense(page, page.url().split('/')[4], {
    title: 'Node fee',
    amount: '12',
    paidBy: 'John',
  })
  await expect(page.getByTestId('expense-card').first()).toContainText('₫')
})

test('shares a group as a link and as a QR code', async ({ page }) => {
  const groupId = await createGroup(page, {
    name: `E2E Share ${uniqueSuffix()}`,
    participants: ['Alice', 'Bob'],
  })

  await page.goto(`/groups/${groupId}/expenses`)
  // Sharing moved into the group overflow menu with the rest of the
  // group-level actions.
  await page.getByRole('button', { name: 'This group' }).click()
  await page.getByRole('button', { name: 'Share group link' }).click()

  const sheet = page.getByRole('dialog')
  await expect(sheet).toContainText('Share via QR Code')
  await expect(sheet).toContainText(`/groups/${groupId}/expenses`)
  await expect(sheet.locator('canvas')).toBeVisible()

  const download = page.waitForEvent('download')
  await sheet.getByRole('button', { name: 'Download QR Code' }).click()
  expect((await download).suggestedFilename()).toBe(`chiatien-${groupId}.png`)
})
