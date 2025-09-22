import { test as base, expect } from '@playwright/test'

/**
 * Shared test fixture.
 *
 * Two things every spec needs:
 *
 * 1. The "Who are you?" dialog. It opens on a group's expenses page whenever
 *    neither `newGroup-activeUser` nor `<groupId>-activeUser` is in
 *    localStorage, and it is a modal that blocks pointer events. Creating a
 *    group through the UI happens to set the key, but navigating straight to a
 *    group URL does not -- so seed it on every navigation. 'None' is
 *    deliberate: any other value would pre-fill "Paid by" and make expense
 *    tests depend on hidden state.
 *
 * 2. The locale. Assertions are English literals and amounts are formatted by
 *    Intl, so both the app locale (NEXT_LOCALE cookie, which outranks
 *    Accept-Language in src/lib/locale.ts) and the browser locale are pinned.
 */
type Options = {
  /**
   * Seed `newGroup-activeUser` so the "Who are you?" dialog stays shut.
   * Defaults to true. Set `test.use({ seedActiveUser: false })` in the spec
   * that exercises the dialog itself.
   */
  seedActiveUser: boolean
}

export const test = base.extend<Options>({
  seedActiveUser: [true, { option: true }],

  // The second argument is Playwright's `use` callback, renamed because
  // eslint-plugin-react-hooks would otherwise read `use(...)` as React's hook.
  page: async ({ page, baseURL, seedActiveUser }, runTest) => {
    if (baseURL) {
      await page
        .context()
        .addCookies([{ name: 'NEXT_LOCALE', value: 'en-US', url: baseURL }])
    }

    if (seedActiveUser) {
      // ChiaTien records the answer per group, and the group does not exist
      // yet when this runs, so the prompt is suppressed wholesale instead.
      await page.addInitScript(() => {
        try {
          window.localStorage.setItem(
            'chiatien.active-users',
            JSON.stringify({
              state: { activeUsers: {}, suppressPrompt: true },
              version: 0,
            }),
          )
        } catch {
          // localStorage is unavailable on about:blank; nothing to seed there.
        }
      })
    }

    // Nothing in the app calls the rate service any more -- an amount is always
    // in the group's own currency. The block stays so a reintroduction shows up
    // as a failing spec rather than as a silent third-party dependency.
    await page.route('https://api.fxratesapi.com/**', (route) => route.abort())

    // Currency and category pickers render flag images from a CDN. Nothing is
    // asserted on them and they only add latency, so keep the run hermetic.
    await page.route('https://flagcdn.com/**', (route) => route.abort())

    // The document upload is a browser-side PUT to the presigned URL the app
    // signed with the harness's fake credentials. Accepting it here is what
    // lets the attachment flow run without a bucket.
    await page.route('https://chiatien-e2e.s3.*.amazonaws.com/**', (route) =>
      route.fulfill({ status: 200, body: '' }),
    )

    await runTest(page)
  },
})

export { expect }

/**
 * The origin the server under test is on. Specs that build their own context —
 * and so get no `baseURL` from the config — need it spelled out, and it has to
 * follow `E2E_PORT` or they would address whatever else holds 3000.
 */
export const BASE_URL = `http://localhost:${process.env.E2E_PORT ?? '3000'}`
