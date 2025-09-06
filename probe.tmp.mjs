import { chromium } from 'playwright'
const b = await chromium.launch()
const p = await b.newPage({ viewport: { width: 1440, height: 900 }, locale: 'vi' })
await p.addInitScript(() => {
  localStorage.setItem('chiatien.recent-groups', JSON.stringify({ state: { groups: [
    { id: 'TjG-tBIhG5vbqORalgSE_', name: 'Đà Lạt 2026' },
    { id: 'YB3HxPblVh3a2tEL6SNUx', name: 'Ăn trưa công ty' },
    { id: 'MD_S16O94PmWSy6f66fXp', name: 'Cà phê cuối tuần' },
    { id: 'Rg7dmM21TtY4EQyQSbx_D', name: 'Sinh nhật Lan' },
  ], starredIds: [], archivedIds: [] }, version: 0 }))
})
await p.goto('http://localhost:3000/groups', { waitUntil: 'networkidle' })
await p.waitForTimeout(2500)
console.log(await p.evaluate(() => {
  const card = document.querySelector('[data-testid="group-card"]')
  const grid = card?.parentElement
  const cs = grid ? getComputedStyle(grid) : null
  return {
    gridClass: grid?.className,
    cols: cs?.gridTemplateColumns,
    gridWidth: grid?.getBoundingClientRect().width,
    cardWidth: card?.getBoundingClientRect().width,
    sectionWidth: grid?.parentElement?.getBoundingClientRect().width,
  }
}))
await b.close()
