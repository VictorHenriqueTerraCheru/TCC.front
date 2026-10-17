// Gera um subset da fonte Material Symbols Rounded só com os ícones usados no app.
// A fonte completa do pacote tem ~5 MB; o subset fica com algumas dezenas de KB.
//
// Ícones usados = todo literal de string em src/ que é nome de ícone do pacote
// (superconjunto seguro: pega também nomes guardados em constantes, como os das categorias).
// O Google Fonts monta o subset com o parâmetro icon_names; o arquivo baixado fica no repo,
// então o app não depende do Google em tempo de execução.
//
// Uso: npm run gen:icones (rode de novo ao usar um ícone novo; scripts/icones.test.mjs avisa).
import { mkdir, writeFile } from 'node:fs/promises'

import { iconesUsados } from './icones-usados.mjs'

const DESTINO = 'src/assets/material-symbols'
// FILL 0..1 porque <Icone preenchido> varia o eixo; peso, grade e tamanho óticos fixos.
const EIXOS = 'opsz,wght,FILL,GRAD@24,400,0..1,0'
// Sem um user agent de navegador moderno o Google devolve TTF em vez de WOFF2.
const USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36'

const nomes = await iconesUsados()
const url = new URL('https://fonts.googleapis.com/css2')
url.searchParams.set('family', `Material Symbols Rounded:${EIXOS}`)
url.searchParams.set('icon_names', nomes.join(','))
url.searchParams.set('display', 'block')

const css = await baixar(url, 'text')
const fonte = css.match(/src:\s*url\(([^)]+)\)\s*format\('woff2'\)/)?.[1]
if (!fonte) throw new Error(`Resposta inesperada do Google Fonts:\n${css}`)

const woff2 = Buffer.from(await baixar(fonte, 'arrayBuffer'))
await mkdir(DESTINO, { recursive: true })
await writeFile(`${DESTINO}/rounded-subset.woff2`, woff2)
await writeFile(`${DESTINO}/icones.json`, `${JSON.stringify(nomes, null, 2)}\n`)
console.log(`${nomes.length} ícones, ${(woff2.length / 1024).toFixed(1)} KB → ${DESTINO}`)

async function baixar(endereco, formato) {
  const resposta = await fetch(endereco, { headers: { 'User-Agent': USER_AGENT } })
  if (!resposta.ok) throw new Error(`${resposta.status} ao baixar ${endereco}`)
  return resposta[formato]()
}
