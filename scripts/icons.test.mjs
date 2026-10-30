import { readFile } from 'node:fs/promises'

import { usedIcons } from './used-icons.mjs'

test('the font subset has every icon used in src/', async () => {
  const noSubset = JSON.parse(await readFile('src/assets/material-symbols/icons.json', 'utf8'))
  const missing = (await usedIcons()).filter((name) => !noSubset.includes(name))
  expect(missing, 'run npm run gen:icons').toEqual([])
})
