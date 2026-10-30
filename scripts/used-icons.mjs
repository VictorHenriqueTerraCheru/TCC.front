import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'

const CONTRACT_VALUES = new Set([
  'filter',
  'groups',
  'label',
  'light',
  'pending',
  'pin',
  'report',
  'weight',
])

export async function usedIcons(root = 'src') {
  const types = await readFile('node_modules/material-symbols/index.d.ts', 'utf8')
  const validNames = new Set([...types.matchAll(/^\s*"([a-z0-9_]+)",?$/gm)].map((m) => m[1]))

  const used = new Set()
  for (const file of await sourceFiles(root)) {
    const code = await readFile(file, 'utf8')
    for (const [, name] of code.matchAll(/['"`]([a-z0-9_]+)['"`]/g)) {
      if (validNames.has(name) && !CONTRACT_VALUES.has(name)) used.add(name)
    }
    for (const [, name] of code.matchAll(/name="([a-z0-9_]+)"/g)) {
      if (validNames.has(name)) used.add(name)
    }
  }
  return [...used].sort()
}

async function sourceFiles(folder) {
  const entries = await readdir(folder, { withFileTypes: true, recursive: true })
  return entries
    .filter((e) => e.isFile() && /\.(ts|tsx)$/.test(e.name) && !e.name.endsWith('.d.ts'))
    .map((e) => join(e.parentPath, e.name))
}
