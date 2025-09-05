import { EXPENSES_URL, createGroup, uniqueSuffix } from './app'
import { expect, test } from './fixtures'

const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFAAH/q842iQAAAABJRU5ErkJggg==',
  'base64',
)

test('scans a receipt and reports a failed extraction', async ({ page }) => {
  const groupId = await createGroup(page, {
    name: `E2E Receipt ${uniqueSuffix()}`,
    participants: ['Alice', 'Bob'],
  })

  await page.goto(`/groups/${groupId}/expenses`)
  await page.getByRole('button', { name: 'Create expense from receipt' }).click()

  const dialog = page.getByRole('dialog')
  await expect(dialog).toContainText('Create from receipt')
  await expect(dialog).toContainText('Select image…')
  await expect(dialog.getByRole('button', { name: 'Continue' })).toBeDisabled()

  await page
    .locator('input[type="file"]')
    .setInputFiles({ name: 'bill.png', mimeType: 'image/png', buffer: PNG })

  // The harness points OPENAI_BASE_URL at the discard port, so the extraction
  // fails and the retry toast is the observable outcome.
  //
  // Located by text, not by role: Radix's Dialog marks everything outside
  // itself aria-hidden, which takes the toast out of the accessibility tree
  // while the dialog is open. It stays visible and clickable. Radix repeats
  // the toast text in its own live region, hence first().
  await expect(
    page.getByText('Error while uploading document', { exact: true }).first(),
  ).toBeVisible({ timeout: 30_000 })
  await expect(page.getByText('Retry', { exact: true }).first()).toBeVisible()
})

test('prefills the create form from a scanned receipt', async ({ page }) => {
  const groupId = await createGroup(page, {
    name: `E2E ReceiptDraft ${uniqueSuffix()}`,
    participants: ['Alice', 'Bob'],
  })

  const draft = new URLSearchParams({
    title: 'Corner shop',
    amount: '12.34',
    categoryId: '0',
    date: '2026-03-15',
    imageUrl: 'https://chiatien-e2e.s3.us-east-1.amazonaws.com/receipt.png',
    imageWidth: '800',
    imageHeight: '600',
  })
  await page.goto(`/groups/${groupId}/expenses/create?${draft.toString()}`)

  await expect(page.locator('input[name="title"]')).toHaveValue('Corner shop')
  await expect(page.locator('input[name="amount"]')).toHaveValue('12.34')
  await expect(page.locator('input[type="date"]')).toHaveValue('2026-03-15')
  await expect(
    page.getByRole('button', { name: 'Remove this document' }),
  ).toBeVisible()

  await page.getByRole('button', { name: 'Create', exact: true }).click()
  await page.waitForURL(EXPENSES_URL, { timeout: 30_000 })
})
