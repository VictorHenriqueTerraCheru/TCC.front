import { readFile } from 'node:fs/promises'

import { iconesUsados } from './icones-usados.mjs'

// A fonte de ícones é um subset (scripts/gen-icones.mjs): ícone fora dele aparece como texto.
test('o subset da fonte tem todos os ícones usados em src/', async () => {
  const noSubset = JSON.parse(await readFile('src/assets/material-symbols/icones.json', 'utf8'))
  const faltando = (await iconesUsados()).filter((nome) => !noSubset.includes(nome))
  expect(faltando, 'rode npm run gen:icones').toEqual([])
})
