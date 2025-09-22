import { addExpense, createGroup, expenseCard, uniqueSuffix } from './app'
import { expect, test } from './fixtures'

// Groups default to USD here, so VND is the change every case below attempts.
const PARTICIPANTS = ['Alice', 'Bob']

type Page = import('@playwright/test').Page

function mainCurrency(page: Page) {
  return page.getByRole('radiogroup', { name: 'Main currency' })
}

test('an expense is entered in the group currency and in nothing else', async ({
  page,
}) => {
  const groupId = await createGroup(page, {
    name: `E2E OneCurrency ${uniqueSuffix()}`,
    participants: PARTICIPANTS,
  })

  await page.goto(`/groups/${groupId}/expenses/create`)
  await expect(
    page.getByRole('button', { name: 'Add expense', exact: true }),
  ).toBeVisible({ timeout: 30_000 })

  // One amount, no second field to keep it in step with, and no unit to pick:
  // the number typed here is the number that settles the balance.
  await expect(page.locator('input[name="amount"]')).toHaveCount(1)
  await expect(page.locator('input[name="originalAmount"]')).toHaveCount(0)
  await expect(page.locator('input[name="conversionRate"]')).toHaveCount(0)
  await expect(
    page.getByRole('radiogroup', { name: 'Currency of expense' }),
  ).toHaveCount(0)
  await expect(page.getByText('Obtained rates:')).toHaveCount(0)
})

test('the group currency is free until the group has an expense', async ({
  page,
}) => {
  const groupId = await createGroup(page, {
    name: `E2E CurrencyOpen ${uniqueSuffix()}`,
    participants: PARTICIPANTS,
  })

  await page.goto(`/groups/${groupId}/settings/edit`)
  await expect(
    mainCurrency(page).getByRole('radio', { name: '₫ VND' }),
  ).toBeEnabled()

  await addExpense(page, groupId, {
    title: 'Hotel',
    amount: '100',
    paidBy: 'Alice',
  })

  await page.goto(`/groups/${groupId}/settings/edit`)
  const dong = mainCurrency(page).getByRole('radio', { name: '₫ VND' })
  await expect(dong).toBeDisabled()
  await expect(
    page.getByText(
      'The group already has expenses, so its currency can no longer change.',
    ),
  ).toBeVisible()

  // Disabled in the markup, not merely styled: the click reaches the control
  // and the selection does not move.
  await dong.click({ force: true })
  await expect(
    mainCurrency(page).getByRole('radio', { name: '$ USD' }),
  ).toBeChecked()
})

test('the server refuses a currency change once the group has an expense', async ({
  page,
}) => {
  const toDong = (groupId: string, name: string) =>
    page.request.post('/api/trpc/groups.update', {
      data: {
        json: {
          groupId,
          groupFormValues: {
            name,
            information: '',
            currency: '₫',
            currencyCode: 'VND',
            participants: PARTICIPANTS.map((participant) => ({
              name: participant,
            })),
          },
        },
      },
    })

  // A group with nothing recorded yet takes the same request, so the refusal
  // below is the guard rather than a payload the endpoint cannot read.
  const openName = `E2E CurrencyFree ${uniqueSuffix()}`
  const openId = await createGroup(page, {
    name: openName,
    participants: PARTICIPANTS,
  })
  expect((await toDong(openId, openName)).status()).toBe(200)

  const name = `E2E CurrencyGuard ${uniqueSuffix()}`
  const groupId = await createGroup(page, { name, participants: PARTICIPANTS })
  await addExpense(page, groupId, {
    title: 'Hotel',
    amount: '100',
    paidBy: 'Alice',
  })

  expect((await toDong(groupId, name)).status()).toBe(409)

  // Nothing was written before the refusal: the currency stands, and so does
  // the expense whose participants the same payload would have deleted.
  await page.goto(`/groups/${groupId}/settings/edit`)
  await expect(
    mainCurrency(page).getByRole('radio', { name: '$ USD' }),
  ).toBeChecked()

  await page.goto(`/groups/${groupId}/expenses`)
  await expect(expenseCard(page, 'Hotel')).toBeVisible()
})
