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
  const estilo = { ...aplicarReceita(await resposta.json(), receita), name: nome }
  const destino = `src/assets/mapa/estilo-${nome.replace('ocorrencias-', '')}.json`
  await writeFile(destino, `${JSON.stringify(estilo, null, 2)}\n`)
  console.log(`${estilo.layers.length} camadas → ${destino}`)
}
