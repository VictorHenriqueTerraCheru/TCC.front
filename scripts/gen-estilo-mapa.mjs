// Gera os estilos do mapa (escuro M2 a partir do fiord, claro a partir do liberty, ambos do
// OpenFreeMap) e grava no repo. Tiles, glyphs e sprite continuam vindo do OpenFreeMap; o que fica
// versionado é a receita aplicada, para o visual não mudar sozinho se a origem mudar.
//
// Uso: npm run gen:estilo-mapa
import { mkdir, writeFile } from 'node:fs/promises'

import { aplicarReceita, RECEITA_CLARA, RECEITA_M2 } from './estilo-mapa.mjs'

const ESTILOS = [
  { origem: 'fiord', receita: RECEITA_M2, nome: 'ocorrencias-escuro' },
  { origem: 'liberty', receita: RECEITA_CLARA, nome: 'ocorrencias-claro' },
]

await mkdir('src/assets/mapa', { recursive: true })
for (const { origem, receita, nome } of ESTILOS) {
  const url = `https://tiles.openfreemap.org/styles/${origem}`
  const resposta = await fetch(url)
  if (!resposta.ok) throw new Error(`${resposta.status} ao baixar ${url}`)
  // O nome identifica o estilo (o falso do MapLibre nos testes o expõe em data-estilo).
  const estilo = { ...aplicarReceita(await resposta.json(), receita), name: nome }
  const destino = `src/assets/mapa/estilo-${nome.replace('ocorrencias-', '')}.json`
  await writeFile(destino, `${JSON.stringify(estilo, null, 2)}\n`)
  console.log(`${estilo.layers.length} camadas → ${destino}`)
}
