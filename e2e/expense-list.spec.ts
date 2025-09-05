import { createGroup, uniqueSuffix } from './app'
import { expect, test } from './fixtures'

test('a new group shows its name and the empty expense state', async ({
  page,
}) => {
  const name = `E2E Empty ${uniqueSuffix()}`
  await createGroup(page, { name, participants: ['Alice', 'Bob'] })

  await expect(page.getByRole('heading', { name, exact: true })).toBeVisible()
  await expect(page.getByText(/doesn.t contain any expense yet/)).toBeVisible()
})

test('the expense list offers a search box', async ({ page }) => {
  const groupId = await createGroup(page, {
    name: `E2E Search ${uniqueSuffix()}`,
    participants: ['Alice', 'Bob'],
  })

  await page.goto(`/groups/${groupId}/expenses`)
  await expect(page.getByRole('searchbox')).toBeVisible()
})

test('the export routes answer for a group with no expenses', async ({
  page,
}) => {
  const groupId = await createGroup(page, {
    name: `E2E Export Empty ${uniqueSuffix()}`,
    participants: ['Alice', 'Bob'],
  })

  const csv = await page.request.get(`/groups/${groupId}/expenses/export/csv`)
  expect(csv.status()).toBe(200)

  const json = await page.request.get(`/groups/${groupId}/expenses/export/json`)
  expect(json.status()).toBe(200)
})

test('the group header links to settings and information', async ({ page }) => {
  const groupId = await createGroup(page, {
    name: `E2E Header ${uniqueSuffix()}`,
    participants: ['Alice', 'Bob'],
  })

  await page.goto(`/groups/${groupId}/expenses`)
  await page.getByRole('button', { name: 'More' }).click()
  await expect(
    page.getByRole('link', { name: 'Group information' }),
  ).toBeVisible()
})
