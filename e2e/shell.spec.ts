import { expect } from '@playwright/test'
import { createGroup, uniqueSuffix } from './app'
import { test } from './fixtures'

test('the group list carries no in-group navigation', async ({ page }) => {
  await page.goto('/groups')
  await expect(
    page.getByRole('navigation', { name: 'Group sections' }),
  ).toBeHidden()
})

test('a group shows its destinations in the sidebar', async ({ page }) => {
  await page.goto('/groups/seeded/expenses')
  const nav = page.getByRole('navigation', { name: 'Group sections' })
  await expect(nav).toBeVisible()
  for (const label of [
    'Expenses',
    'Balances',
    'Stats',
    'Activity',
    'Settings',
  ]) {
    await expect(
      nav.getByRole('link', { name: label, exact: true }),
    ).toBeVisible()
  }
})

test('the current destination is marked for assistive technology', async ({
  page,
}) => {
  await page.goto('/groups/seeded/balances')
  const nav = page.getByRole('navigation', { name: 'Group sections' })
  await expect(
    nav.getByRole('link', { name: 'Balances', exact: true }),
  ).toHaveAttribute('aria-current', 'page')
})

test('back goes to the parent screen, not the one visited last', async ({
  page,
}) => {
  // The five destinations are siblings, so history walks sideways between
  // them: arriving at settings by way of stats must not make stats the way
  // back out. The phone header derives this from the path alone, so a group
  // that was never loaded still answers correctly.
  await page.setViewportSize({ width: 390, height: 844 })
  const back = page.getByRole('link', { name: 'Back' })

  await page.goto('/groups/seeded/stats')
  await page.goto('/groups/seeded/settings')
  await expect(back).toHaveAttribute('href', '/groups')

  await page.goto('/groups/seeded/settings/edit')
  await expect(back).toHaveAttribute('href', '/groups/seeded/settings')

  await page.goto('/groups/seeded/expenses/create')
  await expect(back).toHaveAttribute('href', '/groups/seeded/expenses')

  await page.goto('/groups')
  await expect(back).toHaveCount(0)
})

test('a desktop form carries the same way up beside its title', async ({
  page,
}) => {
  const groupId = await createGroup(page, {
    name: `E2E Back ${uniqueSuffix()}`,
    participants: ['Alice', 'Bob'],
  })

  await page.goto(`/groups/${groupId}/settings/edit`)
  await expect(page.getByRole('link', { name: 'Back' })).toHaveAttribute(
    'href',
    `/groups/${groupId}/settings`,
  )
})

test('the group root redirects to expenses', async ({ page }) => {
  await page.goto('/groups/seeded')
  await expect(page).toHaveURL(/\/groups\/seeded\/expenses$/)
})

test('the root redirects to the group list', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveURL(/\/groups$/)
})

test('the bottom bar replaces the sidebar on a phone viewport', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/groups/seeded/expenses')
  const navs = page.getByRole('navigation', { name: 'Group sections' })
  await expect(navs.first()).toBeVisible()
})

test('a tablet runs the phone layout at full width, not a centred phone', async ({
  page,
}) => {
  const name = `E2E Tablet ${uniqueSuffix()}`
  const groupId = await createGroup(page, {
    name,
    participants: ['Alice', 'Bob'],
  })

  await page.setViewportSize({ width: 768, height: 1024 })
  await page.goto('/groups')
  await expect(page.getByRole('link', { name: new RegExp(name) })).toBeVisible()

  const layout = await page.evaluate(() => {
    const grid = document.querySelector('section > div')
    const column = document.querySelector('main > div')
    return {
      viewport: window.innerWidth,
      column:
        column === null ? 0 : Math.round(column.getBoundingClientRect().width),
      cardColumns:
        grid === null
          ? 0
          : getComputedStyle(grid).gridTemplateColumns.split(' ').length,
    }
  })

  // 32px is the shell's own side padding; anything narrower means the 480px
  // phone column came back and stranded the app in the middle of the screen.
  expect(layout.column).toBe(layout.viewport - 32)
  expect(layout.cardColumns).toBeGreaterThan(2)

  await page.goto(`/groups/${groupId}/expenses`)
  const bar = page.getByRole('navigation', { name: 'Group sections' }).last()
  const box = await bar.boundingBox()
  expect(box?.x).toBe(0)
  expect(box?.width).toBe(768)
})

test('the language switcher offers both languages and marks the current one', async ({
  page,
}) => {
  await page.goto('/groups')
  const languages = page.getByRole('radiogroup', { name: 'Language' })
  await expect(languages.getByRole('radio', { name: 'English' })).toBeChecked()
  await expect(
    languages.getByRole('radio', { name: 'Tiếng Việt' }),
  ).not.toBeChecked()
})

test('the language switcher is reachable from inside a group on a phone', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/groups/seeded/expenses')
  // Alongside the group menu, not buried inside it. A phone header has no room
  // to lay both languages out, so there it is one flag and a press.
  await expect(
    page.getByRole('button', { name: 'Switch to Tiếng Việt' }),
  ).toBeVisible()
})
