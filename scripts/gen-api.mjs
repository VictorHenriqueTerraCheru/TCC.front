import { readFile, writeFile } from 'node:fs/promises'
import openapiTS, { astToString } from 'openapi-typescript'

const PREFIX = '/api/v1'
const DESTINATION = 'src/infrastructure/api/schema.d.ts'
const NULLABLE_DATES = new Set(['GetMeResponse.verifiedAt', 'ListUsersItem.verifiedAt'])

const origin = process.argv[2] ?? 'docs/openapi.json'
const text = /^https?:\/\//.test(origin)
  ? await (await fetch(origin)).text()
  : await readFile(origin, 'utf8')
const doc = JSON.parse(text)

doc.paths = Object.fromEntries(
  Object.entries(doc.paths).map(([path, item]) => [
    path.startsWith(PREFIX) ? path.slice(PREFIX.length) || '/' : path,
    item,
  ]),
)

for (const [schemaName, schema] of Object.entries(doc.components?.schemas ?? {})) {
  for (const [fieldName, field] of Object.entries(schema.properties ?? {})) {
    if (field.format !== 'date-time' || field.type) continue
    field.type = NULLABLE_DATES.has(`${schemaName}.${fieldName}`) ? ['string', 'null'] : 'string'
  }
}

const ast = await openapiTS(doc)
const header = ''
await writeFile(DESTINATION, header + astToString(ast))
console.log(`schema generated at ${DESTINATION}`)
