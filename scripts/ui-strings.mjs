import { readFile, readdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

import ts from 'typescript'

const sourceDirectory = path.resolve('src')
const referencePath = path.resolve('docs/superpowers/plans/2026-10-29-ingles-front/ui-strings.txt')
const shouldCheck = process.argv.includes('--check')
const schemaMapPath = path.resolve(
  'docs/superpowers/plans/2026-10-29-ingles-front/mapa-schemas.tsv',
)
const schemaMap = new Map(
  (await readFile(schemaMapPath, 'utf8'))
    .split('\n')
    .filter(Boolean)
    .map((line) => line.split('\t')),
)

const files = await sourceFiles(sourceDirectory)
const strings = new Set()

for (const filePath of files) {
  const source = await readFile(filePath, 'utf8')
  const sourceFile = ts.createSourceFile(
    filePath,
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  )
  collectStrings(sourceFile, strings)
}

const output =
  [...strings].sort((left, right) => left.localeCompare(right, 'pt-BR')).join('\n') + '\n'

if (!shouldCheck) {
  await writeFile(referencePath, output)
  console.log(`UI strings reference saved to ${path.relative(process.cwd(), referencePath)}.`)
  process.exit(0)
}

let reference
try {
  reference = await readFile(referencePath, 'utf8')
} catch {
  console.error(`Missing reference: ${path.relative(process.cwd(), referencePath)}`)
  process.exit(1)
}

const normalizedReference =
  lines(reference)
    .filter((value) => !schemaMap.has(value) || strings.has(value))
    .join('\n') + '\n'

if (normalizedReference === output) {
  console.log('UI strings identical to the reference.')
  process.exit(0)
}

const expected = new Set(lines(normalizedReference))
const actual = new Set(lines(output))

for (const value of [...actual]
  .filter((value) => !expected.has(value))
  .sort((left, right) => left.localeCompare(right, 'pt-BR'))) {
  console.log(`+ ${value}`)
}

for (const value of [...expected]
  .filter((value) => !actual.has(value))
  .sort((left, right) => left.localeCompare(right, 'pt-BR'))) {
  console.log(`- ${value}`)
}

process.exit(1)

async function sourceFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = []

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name)
    if (entry.isDirectory()) {
      if (
        entryPath !== path.join(sourceDirectory, 'test') &&
        entryPath !== path.join(sourceDirectory, 'infrastructure', 'mocks')
      ) {
        files.push(...(await sourceFiles(entryPath)))
      }
      continue
    }

    if (
      (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx')) &&
      !entry.name.includes('.test.') &&
      entryPath !== path.join(sourceDirectory, 'infrastructure', 'api', 'schema.d.ts')
    ) {
      files.push(entryPath)
    }
  }

  return files
}

function collectStrings(node, strings) {
  if (ts.isJsxText(node)) {
    const value = node.text.trim().replaceAll(/\s+/g, ' ')
    if (value) strings.add(value)
  }

  if (
    ts.isStringLiteral(node) ||
    ts.isNoSubstitutionTemplateLiteral(node) ||
    ts.isTemplateHead(node) ||
    ts.isTemplateMiddle(node) ||
    ts.isTemplateTail(node)
  ) {
    if (isHumanText(node.text) && !isTypeLiteral(node)) strings.add(node.text)
  }

  if (
    ts.isJsxAttribute(node) &&
    ts.isIdentifier(node.name) &&
    isAccessibleAttribute(node.name.text)
  ) {
    const initializer = node.initializer
    if (initializer && ts.isStringLiteral(initializer)) strings.add(initializer.text)
  }

  ts.forEachChild(node, (child) => collectStrings(child, strings))
}

function isHumanText(value) {
  return value.includes(' ') || /[À-ÿ]/.test(value) || /^[A-Z][a-z]/.test(value)
}

function isAccessibleAttribute(name) {
  return name === 'aria-label' || name === 'title' || name === 'placeholder' || name === 'alt'
}

function isTypeLiteral(node) {
  return ts.isLiteralTypeNode(node.parent)
}

function lines(value) {
  return value.split('\n').filter(Boolean)
}
