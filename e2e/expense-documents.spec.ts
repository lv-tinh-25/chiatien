import { EXPENSES_URL, createGroup, expenseCard, uniqueSuffix } from './app'
import { expect, test } from './fixtures'
import { fillStable, selectRadixOption } from './ui'

// A real 1x1 PNG: next-s3-upload reads the image dimensions in the browser
// before uploading, so a placeholder buffer would be rejected.
const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFAAH/q842iQAAAABJRU5ErkJggg==',
  'base64',
)

async function attach(page: import('@playwright/test').Page) {
  await page
    .locator('input[type="file"]')
    .setInputFiles({ name: 'receipt.png', mimeType: 'image/png', buffer: PNG })
}

test('attaches a document to an expense and removes it again', async ({
  page,
}) => {
  const groupId = await createGroup(page, {
    name: `E2E Documents ${uniqueSuffix()}`,
    participants: ['Alice', 'Bob'],
  })

  await page.goto(`/groups/${groupId}/expenses/create`)
  await expect(
    page.getByRole('button', { name: 'Add expense', exact: true }),
  ).toBeVisible({ timeout: 30_000 })

  await expect(page.getByText('Attach documents')).toBeVisible()
  await attach(page)

  const remove = page.getByRole('button', { name: 'Remove this document' })
  await expect(remove).toBeVisible({ timeout: 20_000 })

  await fillStable(page.locator('input[name="title"]'), 'Taxi')
  await fillStable(page.locator('input[name="amount"]'), '30')
  await selectRadixOption(page, page.getByTestId('paid-by'), 'Alice')
  await page.getByRole('button', { name: 'Add expense', exact: true }).click()
  await page.waitForURL(EXPENSES_URL, { timeout: 30_000 })

  // The card counts what is attached.
  await expect(expenseCard(page, 'Taxi')).toContainText('1')

  await expenseCard(page, 'Taxi').click()
  await page
    .getByRole('button', { name: 'Remove this document' })
    .click({ timeout: 20_000 })
  await expect(
    page.getByRole('button', { name: 'Remove this document' }),
  ).toBeHidden()
  await page.getByRole('button', { name: 'Save changes', exact: true }).click()
  await page.waitForURL(EXPENSES_URL, { timeout: 30_000 })
})
