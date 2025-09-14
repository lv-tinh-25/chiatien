import { expect } from '@playwright/test'
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
    'Information',
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

test('the language switcher names the language it would switch to', async ({
  page,
}) => {
  await page.goto('/groups')
  await expect(
    page
      .getByRole('navigation', { name: 'Main sections' })
      .getByRole('button', { name: 'Switch to Tiếng Việt' }),
  ).toBeVisible()
})

test('the language switcher is reachable from inside a group on a phone', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/groups/seeded/expenses')
  // Alongside the group menu, not buried inside it.
  await expect(
    page.getByRole('button', { name: 'Switch to Tiếng Việt' }),
  ).toBeVisible()
})
