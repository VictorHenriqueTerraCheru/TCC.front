// Gera src/infrastructure/api/schema.d.ts a partir do OpenAPI da API.
// Uso: node scripts/gen-api.mjs [arquivo-ou-url]   (padrão: docs/openapi.json)
//
// Ajustes antes de gerar (o contrato não muda, só a descrição de máquina):
// 1. Tira o prefixo /api/v1 dos paths: ele já está em VITE_API_URL, e as chamadas ficam
//    iguais às do docs/API.md (client.GET('/categorias')).
// 2. Datas: o conversor de DateTimeOffset da API faz o OpenAPI do .NET emitir só
//    { format: 'date-time' }, sem type e sem nulidade. Viram string; as anuláveis
//    (DateTimeOffset? no back) estão listadas em DATAS_ANULAVEIS.
import { readFile, writeFile } from 'node:fs/promises'
import openapiTS, { astToString } from 'openapi-typescript'

const PREFIXO = '/api/v1'
const DESTINO = 'src/infrastructure/api/schema.d.ts'
const DATAS_ANULAVEIS = new Set(['ObterMeResponse.verificadoEm'])

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
const cabecalho = `// Gerado por scripts/gen-api.mjs a partir de ${origem}. Não edite à mão: rode npm run gen:api.\n\n`
await writeFile(DESTINO, cabecalho + astToString(ast))
console.log(`schema gerado em ${DESTINO}`)
