// Writes src/assets/exercises/<id>.svg for every pose and checks that every
// catalog exercise has one. Usage: npm run images [-- id …]
import { readFileSync, writeFileSync } from 'node:fs'
import { poses } from './poses.mjs'
import { render } from './render.mjs'

const root = new URL('../../', import.meta.url)
const catalog = JSON.parse(readFileSync(new URL('src/data/catalog.json', root), 'utf8'))
const missing = catalog.exercises.map((e) => e.id).filter((id) => !poses[id])
if (missing.length) console.warn(`no pose yet for: ${missing.join(', ')}`)

const only = process.argv.slice(2)
const ids = only.length ? only : Object.keys(poses)
for (const id of ids) {
  if (!poses[id]) throw new Error(`no pose for ${id}`)
  writeFileSync(new URL(`src/assets/exercises/${id}.svg`, root), render(poses[id]))
}
console.log(`${ids.length} image(s) written`)
