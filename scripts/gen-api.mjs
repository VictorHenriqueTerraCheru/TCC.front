import { readFile, writeFile } from 'node:fs/promises'
import openapiTS, { astToString } from 'openapi-typescript'

const PREFIXO = '/api/v1'
const DESTINO = 'src/infrastructure/api/schema.d.ts'
const DATAS_ANULAVEIS = new Set(['GetMeResponse.verifiedAt', 'ListUsersItem.verifiedAt'])

const origem = process.argv[2] ?? 'docs/openapi.json'
const texto = /^https?:\/\//.test(origem)
  ? await (await fetch(origem)).text()
  : await readFile(origem, 'utf8')
const doc = JSON.parse(texto)

doc.paths = Object.fromEntries(
  Object.entries(doc.paths).map(([caminho, item]) => [
    caminho.startsWith(PREFIXO) ? caminho.slice(PREFIXO.length) || '/' : caminho,
    item,
  ]),
)

for (const [nomeSchema, schema] of Object.entries(doc.components?.schemas ?? {})) {
  for (const [nomeCampo, campo] of Object.entries(schema.properties ?? {})) {
    if (campo.format !== 'date-time' || campo.type) continue
    campo.type = DATAS_ANULAVEIS.has(`${nomeSchema}.${nomeCampo}`) ? ['string', 'null'] : 'string'
  }
}

const ast = await openapiTS(doc)
const cabecalho = ''
await writeFile(DESTINO, cabecalho + astToString(ast))
console.log(`schema gerado em ${DESTINO}`)
