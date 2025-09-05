import { Page } from '@playwright/test'
import { addExpense, createGroup, uniqueSuffix } from './app'
import { expect, test } from './fixtures'

/**
 * The worker registers only in a production build (see
 * service-worker-registration.tsx), which is what scripts/e2e.sh serves. It
 * would never register against `next dev`.
 *
 * Each test gets its own browser context, so each installs the worker from
 * scratch and none can see another's caches.
 */

/** Resolves once the worker is active *and* has claimed this page. */
async function waitForServiceWorker(page: Page): Promise<void> {
  await page.waitForFunction(
    () => !!navigator.serviceWorker?.controller,
    null,
    {
      timeout: 30_000,
    },
  )
}

/** Every URL held in every cache, as pathnames. */
async function cachedPaths(page: Page): Promise<string[]> {
  return page.evaluate(async () => {
    const paths: string[] = []
    for (const name of await caches.keys()) {
      const cache = await caches.open(name)
      for (const request of await cache.keys()) {
        paths.push(new URL(request.url).pathname)
      }
    }
    return paths
  })
}

test('registers a service worker that takes control of the page', async ({
  page,
}) => {
  await page.goto('/')
  await waitForServiceWorker(page)

  const scriptURL = await page.evaluate(
    () => navigator.serviceWorker.controller?.scriptURL ?? '',
  )
  expect(new URL(scriptURL).pathname).toBe('/sw.js')
})

test('serves the offline page when a navigation cannot reach the network', async ({
  page,
  context,
}) => {
  await page.goto('/')
  await waitForServiceWorker(page)

  await context.setOffline(true)
  try {
    // A group id this context has never visited, so the runtime cache cannot
    // satisfy it and the worker has to fall through to /offline.html.
    await page.goto(`/groups/${uniqueSuffix()}/expenses`)
    await expect(
      page.getByRole('heading', { name: "You're offline" }),
    ).toBeVisible()
  } finally {
    await context.setOffline(false)
  }
})

test('caches static assets but never API responses', async ({ page }) => {
  const groupId = await createGroup(page, {
    name: `E2E PWA ${uniqueSuffix()}`,
    participants: ['Alice', 'Bob'],
  })
  // Real tRPC traffic, so there is something the worker could wrongly cache.
  await addExpense(page, groupId, {
    title: 'Coffee',
    amount: '10',
    paidBy: 'Alice',
  })

  await page.goto(`/groups/${groupId}/expenses`)
  await waitForServiceWorker(page)
  // The worker claims the page mid-load, so assets requested before it took
  // control land in the cache only on a second pass.
  await page.reload()

  const paths = await cachedPaths(page)

  // Non-vacuous: the assertion below is only meaningful if caching happened.
  expect(paths.some((path) => path.startsWith('/_next/static/'))).toBe(true)
  expect(paths.filter((path) => path.startsWith('/api/'))).toEqual([])
})

test('titles every page with the app name', async ({ page }) => {
  await page.goto('/groups')
  await expect(page).toHaveTitle('My groups · ChiaTien')

  await page.goto('/settings')
  await expect(page).toHaveTitle('Settings · ChiaTien')
})

test('describes the app in the web manifest', async ({ page }) => {
  const response = await page.request.get('/manifest.webmanifest')
  expect(response.ok()).toBe(true)
  const manifest: unknown = await response.json()
  expect(manifest).toMatchObject({
    name: 'ChiaTien',
    start_url: '/groups',
    display: 'standalone',
  })
})

test('serves the offline page in the browser language', async ({ browser }) => {
  const context = await browser.newContext({
    locale: 'vi-VN',
    baseURL: 'http://localhost:3000',
  })
  const page = await context.newPage()
  try {
    await page.goto('/offline.html')
    await expect(
      page.getByRole('heading', { name: 'Bạn đang ngoại tuyến' }),
    ).toBeVisible()
    await expect(
      page.getByRole('heading', { name: "You're offline" }),
    ).toBeHidden()
  } finally {
    await context.close()
  }
})
