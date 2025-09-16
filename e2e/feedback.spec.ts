import {
  addExpense,
  createGroup,
  EXPENSES_URL,
  openExpense,
  selectPayer,
  uniqueSuffix,
} from './app'
import { expect, test } from './fixtures'
import { fillStable } from './ui'

test('confirms an expense was saved', async ({ page }) => {
  const groupId = await createGroup(page, {
    name: `E2E Toast ${uniqueSuffix()}`,
    participants: ['Alice', 'Bob'],
  })

  await addExpense(page, groupId, {
    title: 'Coffee',
    amount: '12',
    paidBy: 'Alice',
  })

  await expect(
    page.getByRole('status').getByText('Expense created'),
  ).toBeVisible()
})

test('says so when a save fails and stays on the form', async ({ page }) => {
  const groupId = await createGroup(page, {
    name: `E2E Toast Fail ${uniqueSuffix()}`,
    participants: ['Alice', 'Bob'],
  })

  await page.route('**/api/trpc/**', (route) =>
    route.request().url().includes('expenses.create')
      ? route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: '{}',
        })
      : route.continue(),
  )

  await page.goto(`/groups/${groupId}/expenses/create`)
  const submit = page.getByRole('button', { name: 'Add expense', exact: true })
  await expect(submit).toBeVisible({ timeout: 30_000 })
  await fillStable(page.locator('input[name="title"]'), 'Doomed')
  await fillStable(page.locator('input[name="amount"]'), '5')
  await selectPayer(page, 'Alice')
  await submit.click()

  // Radix gives every toast role="status" and separates urgency with
  // aria-live, so the failure is identified by its text.
  await expect(page.getByText(/could not be saved/)).toBeVisible()
  await expect(page).toHaveURL(/\/expenses\/create$/)
})

test('shows a skeleton while a screen is still loading', async ({ page }) => {
  const groupId = await createGroup(page, {
    name: `E2E Skeleton ${uniqueSuffix()}`,
    participants: ['Alice', 'Bob'],
  })

  // The group query, not the expense one: reading expenses also materialises
  // recurring ones, and holding that request open races the backfill that
  // e2e/recurrence.spec.ts depends on.
  await page.route('**/api/trpc/**', async (route) => {
    if (!route.request().url().includes('groups.get')) return route.continue()
    await new Promise((resolve) => setTimeout(resolve, 2_000))
    await route.continue()
  })

  await page.goto(`/groups/${groupId}/settings`)
  await expect(page.getByRole('status').getByText('Loading…')).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible()
})

test('back never returns to a form that was already submitted', async ({
  page,
}) => {
  const groupId = await createGroup(page, {
    name: `E2E History ${uniqueSuffix()}`,
    participants: ['Alice', 'Bob'],
  })

  // Navigated the way a person does — by following links, not by loading each
  // URL — because that is what the reported history loop was made of.
  await page.goto('/groups')
  await page.getByRole('link', { name: new RegExp(`E2E History`) }).click()
  await page.waitForURL(EXPENSES_URL)

  for (const title of ['Lunch', 'Taxi', 'Museum']) {
    await page
      .getByRole('link', { name: 'Add expense', exact: true })
      .first()
      .click()
    await page.waitForURL(/\/expenses\/create$/)
    const submit = page.getByRole('button', {
      name: 'Add expense',
      exact: true,
    })
    await expect(submit).toBeVisible({ timeout: 30_000 })
    await fillStable(page.locator('input[name="title"]'), title)
    await fillStable(page.locator('input[name="amount"]'), '20')
    await selectPayer(page, 'Alice')
    await submit.click()
    await page.waitForURL(EXPENSES_URL)

    await openExpense(page, title)
    await page
      .getByRole('button', { name: 'Save changes', exact: true })
      .click()
    await page.waitForURL(EXPENSES_URL)
  }

  const visited: string[] = []
  for (let step = 0; step < 10; step += 1) {
    await page.goBack()
    const url = new URL(page.url()).pathname
    visited.push(url)
    if (url === '/groups') break
  }

  // One step off the list and onto the group index: no form, and no run of
  // duplicate list entries to walk through.
  expect(visited).toEqual(['/groups'])
})
