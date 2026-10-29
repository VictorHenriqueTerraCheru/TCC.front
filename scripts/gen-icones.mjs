import { mkdir, writeFile } from 'node:fs/promises'

import { iconesUsados } from './icones-usados.mjs'

const DESTINO = 'src/assets/material-symbols'
const EIXOS = 'opsz,wght,FILL,GRAD@24,400,0..1,0'
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
