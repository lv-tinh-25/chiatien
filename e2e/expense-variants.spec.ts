import {
  addExpense,
  createGroup,
  expectBalance,
  expenseCard,
  openExpense,
  openTab,
  uniqueSuffix,
} from './app'
import { expect, test } from './fixtures'
import { fieldByLabel, fillStable, money } from './ui'

const PARTICIPANTS = ['Alice', 'Bob', 'Carol']

test('records a negative amount as an income', async ({ page }) => {
  const groupId = await createGroup(page, {
    name: `E2E Income ${uniqueSuffix()}`,
    participants: PARTICIPANTS,
  })

  await page.goto(`/groups/${groupId}/expenses/create`)
  await expect(
    page.getByRole('button', { name: 'Add expense', exact: true }),
  ).toBeVisible({ timeout: 30_000 })

  await fillStable(page.locator('input[name="title"]'), 'Deposit refund')
  await fillStable(page.locator('input[name="amount"]'), '-90')

  // A negative amount re-labels the whole form: the heading and the payer
  // field switch from expense wording to income wording.
  await expect(page.getByRole('heading', { name: 'New income' })).toBeVisible()
  await expect(page.getByText('Received by')).toBeVisible()

  await page.getByTestId('paid-by').click()
  await page.getByRole('option', { name: 'Alice' }).click()
  await page.getByRole('button', { name: 'Add expense', exact: true }).click()
  await page.waitForURL(/\/groups\/[^/]+\/expenses(\?|$)/, { timeout: 30_000 })

  await expect(expenseCard(page, 'Deposit refund')).toContainText(money(-90))
  await expect(expenseCard(page, 'Deposit refund')).toContainText(
    'Alice received',
  )

  // Income inverts the balances: Alice took the money in, so she owes it.
  await openTab(page, 'Balances')
  await expectBalance(page, 'Alice', -60)
  await expectBalance(page, 'Bob', 30)
  await expectBalance(page, 'Carol', 30)
})

test('assigns a category to an expense', async ({ page }) => {
  const groupId = await createGroup(page, {
    name: `E2E Category ${uniqueSuffix()}`,
    participants: PARTICIPANTS,
  })

  await addExpense(page, groupId, {
    title: 'Weekly shop',
    amount: '60',
    paidBy: 'Alice',
    category: 'Food',
  })

  await openExpense(page, 'Weekly shop')
  await expect(
    fieldByLabel(page, 'Category').getByRole('option', { name: 'Food' }),
  ).toHaveAttribute('aria-selected', 'true')
})

test('filters the expense list with the search bar', async ({ page }) => {
  const groupId = await createGroup(page, {
    name: `E2E Search ${uniqueSuffix()}`,
    participants: PARTICIPANTS,
  })

  await addExpense(page, groupId, {
    title: 'Cinema tickets',
    amount: '30',
    paidBy: 'Alice',
  })
  await addExpense(page, groupId, {
    title: 'Train fare',
    amount: '40',
    paidBy: 'Bob',
  })

  await expect(expenseCard(page, 'Cinema tickets')).toBeVisible()
  await expect(expenseCard(page, 'Train fare')).toBeVisible()

  // Placeholder contains a U+2026 ellipsis, so match on a prefix.
  await page.getByPlaceholder(/Search for an expense/).fill('Cinema')

  await expect(expenseCard(page, 'Cinema tickets')).toBeVisible()
  await expect(expenseCard(page, 'Train fare')).toHaveCount(0)
})

test('searches the payer list in a group too large to show as chips', async ({
  page,
}) => {
  // Five participants: four fit as chips, so Erin is only reachable through
  // the picker the fifth collapses into.
  const groupId = await createGroup(page, {
    name: `E2E PayerSearch ${uniqueSuffix()}`,
    participants: ['Alice', 'Bob', 'Carol', 'Dave', 'Erin'],
  })

  await page.goto(`/groups/${groupId}/expenses/create`)
  await expect(
    page.getByRole('button', { name: 'Add expense', exact: true }),
  ).toBeVisible({ timeout: 30_000 })

  const field = page.getByTestId('paid-by')
  await expect(field.getByRole('option', { name: 'Erin' })).toHaveCount(0)

  await field.getByRole('button', { name: 'Show all participants' }).click()
  const picker = page.getByTestId('payer-picker')
  await page.getByPlaceholder('Search by name…').fill('eri')
  await expect(picker.getByRole('option', { name: 'Erin' })).toBeVisible()
  await expect(picker.getByRole('option', { name: 'Alice' })).toHaveCount(0)

  await page.getByPlaceholder('Search by name…').fill('qqqq')
  await expect(page.getByText('No participant found')).toBeVisible()

  await page.getByPlaceholder('Search by name…').fill('eri')
  await picker.getByRole('option', { name: 'Erin' }).click()
  await expect(field.getByRole('option', { name: 'Erin' })).toHaveAttribute(
    'aria-selected',
    'true',
  )
})
