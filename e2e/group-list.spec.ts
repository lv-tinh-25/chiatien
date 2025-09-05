import { createGroup, uniqueSuffix } from './app'
import { expect, test } from './fixtures'
import { fillStable } from './ui'

test('a fresh profile shows the empty state', async ({ page }) => {
  await page.goto('/groups')
  await expect(
    page.getByText('You have not visited any group recently.'),
  ).toBeVisible()
})

test('creating a group lands on its expenses and remembers it', async ({
  page,
}) => {
  const name = `E2E List ${uniqueSuffix()}`
  const groupId = await createGroup(page, {
    name,
    participants: ['Alice', 'Bob', 'Carol'],
  })

  await page.goto('/groups')
  await expect(
    page.getByRole('heading', { name: 'Recent groups' }),
  ).toBeVisible()
  await expect(page.getByRole('link', { name })).toBeVisible()
  expect(groupId).not.toHaveLength(0)
})

test('opening a shared link adds the group to this browser list', async ({
  page,
  context,
}) => {
  const name = `E2E Shared ${uniqueSuffix()}`
  const groupId = await createGroup(page, {
    name,
    participants: ['Alice', 'Bob'],
  })

  // A second profile has never seen the group, so it must arrive purely from
  // visiting the link.
  const fresh = await context.browser()!.newContext()
  await fresh.addCookies([
    { name: 'NEXT_LOCALE', value: 'en-US', url: 'http://localhost:3000' },
  ])
  const other = await fresh.newPage()
  await other.goto('/groups')
  await expect(
    other.getByText('You have not visited any group recently.'),
  ).toBeVisible()

  await other.goto(`/groups/${groupId}/expenses`)
  await other.goto('/groups')
  await expect(other.getByRole('link', { name })).toBeVisible()
  await fresh.close()
})

test('starring moves a group into the starred section and survives a reload', async ({
  page,
}) => {
  const name = `E2E Star ${uniqueSuffix()}`
  await createGroup(page, { name, participants: ['Alice', 'Bob'] })

  await page.goto('/groups')
  const card = page
    .locator('div')
    .filter({ has: page.getByRole('link', { name }) })
    .last()
  await card.getByRole('button', { name: 'Starred groups' }).click()

  await expect(
    page.getByRole('heading', { name: 'Starred groups' }),
  ).toBeVisible()

  await page.reload()
  await expect(
    page.getByRole('heading', { name: 'Starred groups' }),
  ).toBeVisible()
})

test('archiving moves a group into the archived section', async ({ page }) => {
  const name = `E2E Archive ${uniqueSuffix()}`
  await createGroup(page, { name, participants: ['Alice', 'Bob'] })

  await page.goto('/groups')
  const card = page
    .locator('div')
    .filter({ has: page.getByRole('link', { name }) })
    .last()
  await card.getByRole('button', { name: 'Archive group' }).click()

  await expect(
    page.getByRole('heading', { name: 'Archived groups' }),
  ).toBeVisible()
})

test('renaming a group updates the list', async ({ page }) => {
  const original = `E2E Rename ${uniqueSuffix()}`
  const groupId = await createGroup(page, {
    name: original,
    participants: ['Alice', 'Bob'],
  })

  await page.goto(`/groups/${groupId}/edit`)
  const renamed = `${original} renamed`
  await fillStable(page.locator('input[name="name"]'), renamed)

  // The edit form saves in place and shows no confirmation, so navigating on
  // the click alone would abort the request that is still in flight.
  const saved = page.waitForResponse(
    (response) =>
      response.url().includes('/api/trpc/') &&
      response.request().method() === 'POST' &&
      response.status() === 200,
  )
  await page.getByRole('button', { name: 'Save', exact: true }).click()
  await saved

  await page.goto('/groups')
  await expect(page.getByRole('link', { name: renamed })).toBeVisible()
})

test('offers to undo forgetting a group', async ({ page }) => {
  const name = `E2E Undo ${uniqueSuffix()}`
  await createGroup(page, { name, participants: ['Alice', 'Bob'] })

  await page.goto('/groups')
  await expect(page.getByRole('link', { name })).toBeVisible()
  await page
    .getByRole('button', { name: 'Remove from recent groups' })
    .first()
    .click()
  await expect(page.getByRole('link', { name })).toBeHidden()

  await page.getByRole('button', { name: 'Undo' }).click()
  await expect(page.getByRole('link', { name })).toBeVisible()
})

test('offers a QR scanner as a second way to add a group', async ({ page }) => {
  await page.goto('/groups')
  await expect(
    page.getByRole('textbox', { name: 'Add a group by URL' }),
  ).toBeVisible()

  await page.getByRole('tab', { name: 'Scan QR' }).click()
  await expect(
    page.getByRole('textbox', { name: 'Add a group by URL' }),
  ).toBeHidden()
  await expect(page.getByRole('button', { name: 'Start Camera' })).toBeVisible()

  await page.getByRole('tab', { name: 'Enter URL' }).click()
  await expect(
    page.getByRole('textbox', { name: 'Add a group by URL' }),
  ).toBeVisible()
})
