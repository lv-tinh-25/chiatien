import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'
const GID = 'TjG-tBIhG5vbqORalgSE_'
const GROUPS = [
  { id: GID, name: 'Đà Lạt 2026' },
  { id: 'oVhUQsKkX8h5URyq2nB3f', name: 'Nhà 23 Lò Đúc' },
  { id: 'YB3HxPblVh3a2tEL6SNUx', name: 'Ăn trưa công ty' },
  { id: 'MD_S16O94PmWSy6f66fXp', name: 'Cà phê cuối tuần' },
  { id: 'Rg7dmM21TtY4EQyQSbx_D', name: 'Sinh nhật Lan' },
  { id: 'B0C8AUXaBxHrXda4_MrAJ', name: 'Sapa 2025' },
]
const OUT = '/private/tmp/claude-505/-Users-tinh-le-Documents-personal-projects-chiatien/4d1a635d-ef3f-4861-88bc-1c8c6ef23b7d/scratchpad/shots/app'
mkdirSync(OUT, { recursive: true })
const only = process.argv.slice(2)
const browser = await chromium.launch()
const errs = []
const res = await fetch(`http://localhost:3000/api/trpc/groups.get?batch=1&input=${encodeURIComponent(JSON.stringify({ '0': { json: { groupId: GID } } }))}`)
const minh = (await res.json())[0].result.data.json.group.participants.find((p) => p.name === 'Minh').id

const ROUTES = {
  groups: '/groups',
  expenses: `/groups/${GID}/expenses`,
  form: `/groups/${GID}/expenses/create`,
  balances: `/groups/${GID}/balances`,
  stats: `/groups/${GID}/stats`,
  activity: `/groups/${GID}/activity`,
  info: `/groups/${GID}/information`,
  groupform: '/groups/create',
  settings: '/settings',
}

for (const [name, route] of Object.entries(ROUTES)) {
  if (only.length && !only.includes(name)) continue
  for (const [k, width] of [['mobile', 390], ['desktop', 1440]]) {
    const ctx = await browser.newContext({ viewport: { width, height: 900 }, deviceScaleFactor: 2, locale: 'vi' })
    await ctx.addInitScript(({ groups, gid, minh }) => {
      localStorage.setItem('chiatien.recent-groups', JSON.stringify({ state: { groups, starredIds: [groups[0].id, groups[1].id], archivedIds: [groups[5].id] }, version: 0 }))
      localStorage.setItem('chiatien.active-users', JSON.stringify({ state: { activeUsers: { [gid]: minh }, suppressPrompt: true }, version: 0 }))
    }, { groups: GROUPS, gid: GID, minh })
    const page = await ctx.newPage()
    page.on('console', (m) => { if (m.type() === 'error') errs.push(`${name}-${k}: ${m.text().slice(0, 200)}`) })
    await page.goto(`http://localhost:3000${route}`, { waitUntil: 'networkidle' })
    await page.waitForTimeout(2500)
    await page.screenshot({ path: `${OUT}/${name}-${k}.png`, fullPage: true })
    await ctx.close()
  }
}
await browser.close()
console.log(errs.length ? errs.slice(0, 20).join('\n') : 'no console errors')
