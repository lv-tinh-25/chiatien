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
      page.getByRole('heading', { name: 'Nhóm của tôi' }),
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
    await expect(page.getByRole('heading', { name: 'My groups' })).toBeVisible()
  } finally {
    await context.close()
  }
})

test('remembers the language picked in settings', async ({ page }) => {
  await page.goto('/settings')
  await page.getByRole('radio', { name: 'Tiếng Việt' }).click()

  await expect(page.getByRole('heading', { name: 'Cài đặt' })).toBeVisible()
  await page.goto('/groups')
  await expect(
    page.getByRole('heading', { name: 'Nhóm của tôi' }),
  ).toBeVisible()
})
