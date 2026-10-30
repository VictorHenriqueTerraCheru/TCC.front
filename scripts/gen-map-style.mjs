import { mkdir, writeFile } from 'node:fs/promises'

import { applyRecipe, LIGHT_RECIPE, M2_RECIPE } from './map-style.mjs'

const STYLES = [
  { origin: 'fiord', recipe: M2_RECIPE, name: 'urban-reports-dark' },
  { origin: 'liberty', recipe: LIGHT_RECIPE, name: 'urban-reports-light' },
]

await mkdir('src/assets/map', { recursive: true })
for (const { origin, recipe, name } of STYLES) {
  const url = `https://tiles.openfreemap.org/styles/${origin}`
  const response = await fetch(url)
  if (!response.ok) throw new Error(`${response.status} while downloading ${url}`)
  const style = { ...applyRecipe(await response.json(), recipe), name: name }
  const destination = `src/assets/map/${name.replace('urban-reports-', '')}-style.json`
  await writeFile(destination, `${JSON.stringify(style, null, 2)}\n`)
  console.log(`${style.layers.length} layers → ${destination}`)
}
