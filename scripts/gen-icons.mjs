import { mkdir, writeFile } from 'node:fs/promises'

import { usedIcons } from './used-icons.mjs'

const DESTINATION = 'src/assets/material-symbols'
const AXES = 'opsz,wght,FILL,GRAD@24,400,0..1,0'
const USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36'

const names = await usedIcons()
const url = new URL('https://fonts.googleapis.com/css2')
url.searchParams.set('family', `Material Symbols Rounded:${AXES}`)
url.searchParams.set('icon_names', names.join(','))
url.searchParams.set('display', 'block')

const css = await download(url, 'text')
const fontUrl = css.match(/src:\s*url\(([^)]+)\)\s*format\('woff2'\)/)?.[1]
if (!fontUrl) throw new Error(`Unexpected response from Google Fonts:\n${css}`)

const woff2 = Buffer.from(await download(fontUrl, 'arrayBuffer'))
await mkdir(DESTINATION, { recursive: true })
await writeFile(`${DESTINATION}/rounded-subset.woff2`, woff2)
await writeFile(`${DESTINATION}/icons.json`, `${JSON.stringify(names, null, 2)}\n`)
console.log(`${names.length} icons, ${(woff2.length / 1024).toFixed(1)} KB → ${DESTINATION}`)

async function download(address, responseType) {
  const response = await fetch(address, { headers: { 'User-Agent': USER_AGENT } })
  if (!response.ok) throw new Error(`${response.status} while downloading ${address}`)
  return response[responseType]()
}
