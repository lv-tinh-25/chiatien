import { expect, test } from './fixtures'

/**
 * The shared fixture pins NEXT_LOCALE to en-US for every other spec, so these
 * two build their own contexts to exercise language negotiation itself.
 */
const BASE_URL = 'http://localhost:3000'

test('shows Vietnamese to a browser whose languages it cannot honour', async ({
  browser,
}) => {
  const context = await browser.newContext({
    locale: 'fr-FR',
    baseURL: BASE_URL,
  })
  const page = await context.newPage()
  try {
    await page.goto('/groups')
    await expect(
      page.getByRole('heading', { name: 'Nhóm của bạn' }),
    ).toBeVisible()
  } finally {
    await context.close()
  }
})

test('honours an English browser', async ({ browser }) => {
  const context = await browser.newContext({
    locale: 'en-US',
    baseURL: BASE_URL,
  })
  const page = await context.newPage()
  try {
    await page.goto('/groups')
    await expect(
      page.getByRole('heading', { name: 'Your groups' }),
    ).toBeVisible()
  } finally {
    await context.close()
  }
})

test('remembers the language picked in the header', async ({ page }) => {
  await page.goto('/groups')
  await page.getByRole('radio', { name: 'Tiếng Việt' }).click()

  // The page it is on answers in the new language, and so does the next one.
  await expect(
    page.getByRole('heading', { name: 'Nhóm của bạn' }),
  ).toBeVisible()
  await expect(page.getByRole('radio', { name: 'Tiếng Việt' })).toBeChecked()

  await page.goto('/groups/seeded/expenses')
  await expect(page.getByRole('link', { name: 'Số dư' })).toBeVisible()
})
