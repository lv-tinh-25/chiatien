import type { Page } from '@playwright/test'
import { createGroup, uniqueSuffix } from './app'
import { expect, test } from './fixtures'
import { fillStable } from './ui'

/**
 * Opens the group's own overflow menu. The design draws no controls on the
 * group cards, so star, archive and forget are reached from inside the group.
 */
async function openGroupMenu(page: Page, groupId: string): Promise<void> {
  await page.goto(`/groups/${groupId}/expenses`)
  await page.getByRole('button', { name: 'This group' }).click()
}

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
  await expect(page.getByRole('heading', { name: 'Recent' })).toBeVisible()
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
  const groupId = await createGroup(page, {
    name,
    participants: ['Alice', 'Bob'],
  })

  await openGroupMenu(page, groupId)
  await page.getByRole('button', { name: 'Star', exact: true }).click()

  await page.goto('/groups')
  await expect(page.getByRole('heading', { name: 'Starred' })).toBeVisible()

  await page.reload()
  await expect(page.getByRole('heading', { name: 'Starred' })).toBeVisible()
})

test('archiving moves a group into the archived section', async ({ page }) => {
  const name = `E2E Archive ${uniqueSuffix()}`
  const groupId = await createGroup(page, {
    name,
    participants: ['Alice', 'Bob'],
  })

  await openGroupMenu(page, groupId)
  await page.getByRole('button', { name: 'Archive group' }).click()

  await page.goto('/groups')
  await expect(page.getByRole('heading', { name: 'Archived' })).toBeVisible()
})

test('renaming a group updates the list', async ({ page }) => {
  const original = `E2E Rename ${uniqueSuffix()}`
  const groupId = await createGroup(page, {
    name: original,
    participants: ['Alice', 'Bob'],
  })

  await page.goto(`/groups/${groupId}/settings/edit`)
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
  await page.getByRole('button', { name: 'Save group', exact: true }).click()
  await saved

  await page.goto('/groups')
  await expect(page.getByRole('link', { name: renamed })).toBeVisible()
})

test('offers to undo forgetting a group', async ({ page }) => {
  const name = `E2E Undo ${uniqueSuffix()}`
  const groupId = await createGroup(page, {
    name,
    participants: ['Alice', 'Bob'],
  })

  await page.goto('/groups')
  await expect(page.getByRole('link', { name })).toBeVisible()

  await openGroupMenu(page, groupId)
  await page.getByRole('button', { name: 'Remove from recent groups' }).click()
  await page.getByRole('button', { name: 'Undo' }).click()
  await page.goto('/groups')
  await expect(page.getByRole('link', { name })).toBeVisible()

  await openGroupMenu(page, groupId)
  await page.getByRole('button', { name: 'Remove from recent groups' }).click()
  await page.goto('/groups')
  await expect(page.getByRole('link', { name })).toBeHidden()
})

test('a pasted link opens the group and says so', async ({ page, context }) => {
  const name = `E2E Join ${uniqueSuffix()}`
  const groupId = await createGroup(page, {
    name,
    participants: ['Alice', 'Bob'],
  })

  // A second profile has never seen the group, so the only way in is the link.
  const fresh = await context.browser()!.newContext()
  await fresh.addCookies([
    { name: 'NEXT_LOCALE', value: 'en-US', url: 'http://localhost:3000' },
  ])
  const other = await fresh.newPage()
  await other.goto('/groups')

  const field = other.getByRole('textbox', { name: 'Add a group by URL' })
  await fillStable(field, `http://localhost:3000/groups/${groupId}/expenses`)
  await other.getByRole('button', { name: 'Open this group' }).click()

  // Landing on the list would leave a newcomer hunting for the card that just
  // appeared, so the link opens the group itself.
  await other.waitForURL(new RegExp(`/groups/${groupId}/expenses`), {
    timeout: 30_000,
  })
  await expect(other.getByText(`Joined ${name}`)).toBeVisible()

  // Pasting the same link again is not an error, and must not read as one.
  await other.goto('/groups')
  await fillStable(
    other.getByRole('textbox', { name: 'Add a group by URL' }),
    `/groups/${groupId}`,
  )
  await other.getByRole('button', { name: 'Open this group' }).click()
  await expect(other.getByText(`You are already in ${name}`)).toBeVisible()

  await fresh.close()
})

test('says when a pasted link is not a group link', async ({ page }) => {
  await page.goto('/groups')
  await fillStable(
    page.getByRole('textbox', { name: 'Add a group by URL' }),
    'https://example.com/',
  )
  await page.getByRole('button', { name: 'Open this group' }).click()
  await expect(
    page.getByText('That does not look like a group link.'),
  ).toBeVisible()
})

test('offers a QR scanner as a second way to add a group', async ({ page }) => {
  await page.goto('/groups')
  await expect(
    page.getByRole('textbox', { name: 'Add a group by URL' }),
  ).toBeVisible()

  await page.getByRole('button', { name: 'Scan QR code' }).click()
  await expect(page.getByRole('button', { name: 'Start Camera' })).toBeVisible()

  await page.keyboard.press('Escape')
  await expect(page.getByRole('button', { name: 'Start Camera' })).toBeHidden()
})
