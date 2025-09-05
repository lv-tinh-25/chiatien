import { addExpense, createGroup, expenseCard, uniqueSuffix } from './app'
import { expect, test } from './fixtures'
import { money } from './ui'

// The rest of the suite suppresses this dialog through the shared fixture.
// Here it is the subject, so the suppression is switched off.
test.use({ seedActiveUser: false })

/**
 * Puts the browser in the state a first-time visitor is in: the group exists,
 * but this device has never been asked who it belongs to.
 */
async function forgetActiveUser(page: import('@playwright/test').Page) {
  await page.evaluate(() => {
    window.localStorage.removeItem('chiatien.active-users')
  })
}

test('asks who you are and personalises the expense list', async ({ page }) => {
  const groupId = await createGroup(page, {
    name: `E2E ActiveUser ${uniqueSuffix()}`,
    participants: ['Alice', 'Bob', 'Carol'],
  })

  await addExpense(page, groupId, {
    title: 'Dinner',
    amount: '90',
    paidBy: 'Alice',
  })

  await forgetActiveUser(page)
  await page.goto(`/groups/${groupId}/expenses`)

  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible()
  await expect(dialog).toContainText('Who are you?')

  await dialog.getByLabel('Bob', { exact: true }).click()
  await dialog.getByRole('button', { name: 'Save changes' }).click()
  await expect(dialog).toBeHidden()

  // Kept from the original suite: the assertions below should hold after a
  // reload as well as before one, and this is where that was proven.
  await page.reload()

  // The dialog does not come back...
  await expect(page.getByRole('dialog')).toBeHidden()
  // ...and Bob now sees his own third of Alice's 90 on the card.
  await expect(expenseCard(page, 'Dinner')).toContainText('Your balance:')
  await expect(expenseCard(page, 'Dinner')).toContainText(money(-30))
})

test('pre-fills "Paid by" with the active user', async ({ page }) => {
  const groupId = await createGroup(page, {
    name: `E2E ActiveUserPaidBy ${uniqueSuffix()}`,
    participants: ['Alice', 'Bob', 'Carol'],
  })

  await forgetActiveUser(page)
  await page.goto(`/groups/${groupId}/expenses`)

  const dialog = page.getByRole('dialog')
  await dialog.getByLabel('Carol', { exact: true }).click()
  await dialog.getByRole('button', { name: 'Save changes' }).click()
  await expect(dialog).toBeHidden()

  await page.goto(`/groups/${groupId}/expenses/create`)
  await expect(page.getByTestId('paid-by')).toContainText('Carol')
})

test('lets you decline to pick anyone', async ({ page }) => {
  const groupId = await createGroup(page, {
    name: `E2E ActiveUserNobody ${uniqueSuffix()}`,
    participants: ['Alice', 'Bob'],
  })

  await addExpense(page, groupId, {
    title: 'Taxi',
    amount: '20',
    paidBy: 'Alice',
  })

  await forgetActiveUser(page)
  await page.goto(`/groups/${groupId}/expenses`)

  const dialog = page.getByRole('dialog')
  // "I don't want to select anyone" -- curly apostrophe in the source string.
  await dialog.getByText(/don.t want to select anyone/).click()
  await dialog.getByRole('button', { name: 'Save changes' }).click()
  await expect(dialog).toBeHidden()

  // With nobody selected there is no personalised balance on the card...
  await expect(expenseCard(page, 'Taxi')).not.toContainText('Your balance:')
  // ...and the dialog does not come back.
  await page.reload()
  await expect(page.getByRole('dialog')).toBeHidden()
})
