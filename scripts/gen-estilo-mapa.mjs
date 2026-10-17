// Gera o estilo do mapa (M2 · Equilíbrio) a partir do fiord do OpenFreeMap e grava no repo.
// Tiles, glyphs e sprite continuam vindo do OpenFreeMap; o que fica versionado é a receita
// aplicada, para o visual não mudar sozinho se o fiord mudar.
//
// Uso: npm run gen:estilo-mapa
import { mkdir, writeFile } from 'node:fs/promises'

import { aplicarReceita } from './estilo-mapa.mjs'

const ORIGEM = 'https://tiles.openfreemap.org/styles/fiord'
const DESTINO = 'src/assets/mapa/estilo.json'

const resposta = await fetch(ORIGEM)
if (!resposta.ok) throw new Error(`${resposta.status} ao baixar ${ORIGEM}`)
const estilo = aplicarReceita(await resposta.json())

await mkdir('src/assets/mapa', { recursive: true })
await writeFile(DESTINO, `${JSON.stringify(estilo, null, 2)}\n`)
console.log(`${estilo.layers.length} camadas → ${DESTINO}`)
