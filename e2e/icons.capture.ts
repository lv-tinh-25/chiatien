import { expect, test } from '@playwright/test'
import { join } from 'node:path'

/**
 * Draws the app's own mark — the first letter of its name on the brand
 * gradient — at every size a browser or an installed app asks for.
 *
 * Captured from the running app rather than drawn by hand: the glyph is then
 * the real Plus Jakarta Sans and the gradient whatever the tokens currently
 * say, so the icon cannot drift away from the `BrandMark` people see inside.
 */

const ICONS = [
  // Next.js serves these two by convention: the browser tab, and the tile iOS
  // puts on a home screen.
  { path: join('src', 'app', 'icon.png'), size: 256 },
  { path: join('src', 'app', 'apple-icon.png'), size: 180 },
  // Referenced by name from src/app/manifest.ts.
  { path: join('public', 'android-chrome-192x192.png'), size: 192 },
  { path: join('public', 'android-chrome-512x512.png'), size: 512 },
]

test('captures the app icon', async ({ page }) => {
  await page.goto('/groups')

  const mark = page.locator('header .action-gradient').first()
  await expect(mark).toBeVisible({ timeout: 30_000 })
  const letter = (await mark.innerText()).trim()
  expect(letter).toHaveLength(1)

  // Nothing else may be on the page: the capture keeps the rounded corners
  // transparent, and anything painted behind them would show through.
  await page.evaluate(() => {
    document.documentElement.style.background = 'transparent'
    document.body.style.background = 'transparent'
    document.body.innerHTML = ''
  })

  const tile = page.locator('#icon')
  for (const { path, size } of ICONS) {
    await page.evaluate(
      ({ size, letter }) => {
        const el =
          document.querySelector('#icon') ?? document.createElement('div')
        el.id = 'icon'
        el.className = 'action-gradient'
        el.setAttribute(
          'style',
          [
            'position:fixed;left:0;top:0;display:flex',
            'align-items:center;justify-content:center',
            `width:${size}px;height:${size}px`,
            `border-radius:${Math.round(size * 0.22)}px`,
            `font-size:${Math.round(size * 0.56)}px`,
            'font-weight:800;line-height:1;letter-spacing:-0.02em',
            'color:hsl(var(--primary-foreground))',
          ].join(';'),
        )
        el.textContent = letter
        document.body.append(el)
      },
      { size, letter },
    )
    await tile.screenshot({ path, omitBackground: true })
  }
})
