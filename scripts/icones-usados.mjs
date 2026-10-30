import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'

const VALORES_DE_CONTRATO = new Set([
  'filter',
  'groups',
  'label',
  'light',
  'pending',
  'pin',
  'report',
  'weight',
])

export async function iconesUsados(raiz = 'src') {
  const tipos = await readFile('node_modules/material-symbols/index.d.ts', 'utf8')
  const validos = new Set([...tipos.matchAll(/^\s*"([a-z0-9_]+)",?$/gm)].map((m) => m[1]))

  const usados = new Set()
  for (const arquivo of await arquivosFonte(raiz)) {
    const codigo = await readFile(arquivo, 'utf8')
    for (const [, nome] of codigo.matchAll(/['"`]([a-z0-9_]+)['"`]/g)) {
      if (validos.has(nome) && !VALORES_DE_CONTRATO.has(nome)) usados.add(nome)
    }
    for (const [, nome] of codigo.matchAll(/name="([a-z0-9_]+)"/g)) {
      if (validos.has(nome)) usados.add(nome)
    }
  }
  return [...usados].sort()
}

async function arquivosFonte(pasta) {
  const entradas = await readdir(pasta, { withFileTypes: true, recursive: true })
  return entradas
    .filter((e) => e.isFile() && /\.(ts|tsx)$/.test(e.name) && !e.name.endsWith('.d.ts'))
    .map((e) => join(e.parentPath, e.name))
}
