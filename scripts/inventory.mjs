import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { Project, SyntaxKind } from 'ts-morph'

const root = process.cwd()
const planDirectory = path.join(root, 'docs/superpowers/plans/2026-10-29-ingles-front')
const dictionary = new Map(
  [
    (await readFile(path.join(planDirectory, 'dicionario-palavras.txt'), 'utf8'))
      .split('\n')
      .filter(Boolean)
      .map((line) => line.split('=')),
    [
      ['abrir', 'open'],
      ['botao', 'button'],
      ['camada', 'layer'],
      ['camadas', 'layers'],
      ['cartao', 'card'],
      ['circulo', 'circle'],
      ['cores', 'colors'],
      ['escolher', 'choose'],
      ['esperar', 'wait'],
      ['estilo', 'style'],
      ['folha', 'sheet'],
      ['gravar', 'save'],
      ['icone', 'icon'],
      ['icones', 'icons'],
      ['limpar', 'clear'],
      ['mostrar', 'show'],
      ['mudar', 'change'],
      ['painel', 'panel'],
      ['periodo', 'period'],
      ['rascunho', 'draft'],
      ['recorte', 'clipping'],
      ['sessao', 'session'],
      ['tela', 'screen'],
      ['tema', 'theme'],
      ['titulo', 'title'],
      ['voltar', 'back'],
      ['fixo', 'fixed'],
    ],
  ].flat(),
)
const project = new Project({ tsConfigFilePath: path.join(root, 'tsconfig.app.json') })
for (const script of await readdir(path.join(root, 'scripts'))) {
  if (script.endsWith('.mjs')) project.addSourceFileAtPath(path.join(root, 'scripts', script))
}

const declarationKinds = new Set([
  SyntaxKind.VariableDeclaration,
  SyntaxKind.FunctionDeclaration,
  SyntaxKind.Parameter,
  SyntaxKind.ClassDeclaration,
  SyntaxKind.InterfaceDeclaration,
  SyntaxKind.TypeAliasDeclaration,
  SyntaxKind.EnumDeclaration,
  SyntaxKind.PropertyDeclaration,
  SyntaxKind.PropertySignature,
  SyntaxKind.PropertyAssignment,
  SyntaxKind.MethodDeclaration,
  SyntaxKind.MethodSignature,
  SyntaxKind.EnumMember,
])
const names = new Set()
for (const sourceFile of project.getSourceFiles()) {
  if (sourceFile.isDeclarationFile()) continue
  for (const node of sourceFile.getDescendants()) {
    if (declarationKinds.has(node.getKind())) {
      const name = node.getFirstChildByKind(SyntaxKind.Identifier)?.getText()
      if (name) names.add(name)
    }

    if (!node.isKind(SyntaxKind.CallExpression)) continue
    const callee = node.getExpression().getText()
    if (!['describe', 'it', 'test'].includes(callee)) continue
    const title = node.getArguments()[0]
    if (
      title?.isKind(SyntaxKind.StringLiteral) ||
      title?.isKind(SyntaxKind.NoSubstitutionTemplateLiteral)
    ) {
      names.add(title.getLiteralText())
    }
  }
}

async function listPaths(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const paths = []
  for (const entry of entries) {
    const absolutePath = path.join(directory, entry.name)
    if (entry.isDirectory()) paths.push(...(await listPaths(absolutePath)))
    else paths.push(path.relative(root, absolutePath))
  }
  return paths
}

function splitIdentifier(value) {
  return value
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .split(/[ _.-]+/)
    .filter(Boolean)
}

function translateIdentifier(value) {
  const prefix = value.startsWith('_') ? '_' : ''
  const content = prefix ? value.slice(1) : value
  const words = splitIdentifier(value)
    .map((word) => dictionary.get(word.toLowerCase()) ?? word)
    .map((word, index) => {
      if (!word) return ''
      return index ? word[0].toUpperCase() + word.slice(1) : word
    })
  if (words.length === 0) return value
  if (content === content.toUpperCase()) return prefix + words.join('_').toUpperCase()
  const result = words.join('')
  const translated =
    content[0] === content[0]?.toUpperCase() ? result[0]?.toUpperCase() + result.slice(1) : result
  return prefix + translated
}

function translateTitle(value) {
  return value.replace(/[A-Za-zÀ-ÿ]+/g, (word) => dictionary.get(word.toLowerCase()) ?? word)
}

function translatePath(value) {
  const extension = path.extname(value)
  const withoutExtension = extension ? value.slice(0, -extension.length) : value
  return (
    withoutExtension
      .split(path.sep)
      .map((segment) =>
        splitIdentifier(segment)
          .map((word) => dictionary.get(word.toLowerCase()) ?? word)
          .join('-'),
      )
      .join(path.sep) + extension
  )
}

const paths = [
  ...(await listPaths(path.join(root, 'src'))),
  ...(await listPaths(path.join(root, 'scripts'))),
]
const rows = [
  ...[...names].map((name) => [
    name,
    name.includes(' ') ? translateTitle(name) : translateIdentifier(name),
  ]),
  ...paths.map((sourcePath) => [sourcePath, translatePath(sourcePath)]),
]

await mkdir(planDirectory, { recursive: true })
await writeFile(
  path.join(planDirectory, 'mapa-identificadores-front.tsv'),
  rows
    .sort(([left], [right]) => left.localeCompare(right, 'pt-BR'))
    .map(([oldName, newName]) => `${oldName}\t${newName}`)
    .join('\n') + '\n',
)
