import sharp from 'sharp'
import { mkdirSync, existsSync } from 'node:fs'
const B = '/private/tmp/claude-505/-Users-tinh-le-Documents-personal-projects-chiatien/4d1a635d-ef3f-4861-88bc-1c8c6ef23b7d/scratchpad/shots'
mkdirSync(`${B}/cmp`, { recursive: true })
const names = process.argv.slice(2).length ? process.argv.slice(2) : ['groups','expenses','form','balances','stats','activity','info','groupform','settings']
for (const n of names) {
  for (const k of ['mobile','desktop']) {
    const a = `${B}/design/${n}-${k}.png`, b = `${B}/app/${n}-${k}.png`
    if (!existsSync(a) || !existsSync(b)) { console.log('skip', n, k); continue }
    const targetW = k === 'mobile' ? 390 : 900
    const [ia, ib] = await Promise.all([
      sharp(a).resize({ width: targetW }).toBuffer({ resolveWithObject: true }),
      sharp(b).resize({ width: targetW }).toBuffer({ resolveWithObject: true }),
    ])
    const h = Math.max(ia.info.height, ib.info.height)
    await sharp({ create: { width: targetW * 2 + 24, height: h, channels: 3, background: '#222' } })
      .composite([{ input: ia.data, top: 0, left: 0 }, { input: ib.data, top: 0, left: targetW + 24 }])
      .png().toFile(`${B}/cmp/${n}-${k}.png`)
  }
}
console.log('done')
