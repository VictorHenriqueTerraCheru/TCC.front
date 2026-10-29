import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { Node, Project, SyntaxKind } from 'ts-morph'

const root = process.cwd()
const mapsRoot = path.join(root, 'docs/superpowers/plans/2026-10-29-ingles-front')

async function readMap(file, separator) {
  const text = await readFile(path.join(mapsRoot, file), 'utf8')
  return new Map(
    text
      .split('\n')
      .filter(Boolean)
      .map((line) => line.split(separator))
      .filter(([before, after]) => before && after),
  )
}

function replaceRoute(route, routeMap) {
  return route
    .split('/')
    .map((part) => {
      if (part.startsWith('{') && part.endsWith('}')) {
        const name = part.slice(1, -1)
        return `{${routeMap.get(name) ?? name}}`
      }
      return routeMap.get(part) ?? part
    })
    .join('/')
}

function literalText(node) {
  if (Node.isStringLiteral(node) || Node.isNoSubstitutionTemplateLiteral(node))
    return node.getLiteralText()
  return undefined
}

function replaceLiteral(node, next) {
  if (Node.isStringLiteral(node)) node.setLiteralValue(next)
  if (Node.isNoSubstitutionTemplateLiteral(node)) node.setLiteralValue(next)
}

const schemaMap = await readMap('mapa-schemas.tsv', '\t')
const routeMap = await readMap('mapa-url.txt', '=')
const project = new Project({ tsConfigFilePath: path.join(root, 'tsconfig.app.json') })
project.addSourceFilesAtPaths(path.join(root, 'scripts/**/*.mjs'))
const sourceFiles = project
  .getSourceFiles()
  .filter(
    (sourceFile) => !sourceFile.isDeclarationFile() && sourceFile.getFilePath().startsWith(root),
  )

for (const sourceFile of sourceFiles) {
  for (const literalType of sourceFile.getDescendantsOfKind(SyntaxKind.LiteralType)) {
    const literal = literalType.getLiteral()
    if (!Node.isStringLiteral(literal)) continue
    const next = schemaMap.get(literal.getLiteralText())
    if (next) literal.setLiteralValue(next)
  }
}

for (const sourceFile of sourceFiles) {
  for (const call of sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression)) {
    const expression = call.getExpression()
    const args = call.getArguments()
    const first = args[0]

    if (
      Node.isPropertyAccessExpression(expression) &&
      ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'get', 'post', 'put', 'patch', 'delete'].includes(
        expression.getName(),
      ) &&
      first
    ) {
      const text = literalText(first)
      if (text) replaceLiteral(first, replaceRoute(text, routeMap))
    }

    if (Node.isIdentifier(expression) && expression.getText() === 'rota' && first) {
      const text = literalText(first)
      if (text) replaceLiteral(first, replaceRoute(text, routeMap))
    }

    if (
      Node.isPropertyAccessExpression(expression) &&
      expression.getName() === 'get' &&
      expression.getExpression().getText().endsWith('searchParams') &&
      first
    ) {
      const text = literalText(first)
      if (text && routeMap.has(text)) replaceLiteral(first, routeMap.get(text))
    }
  }
}

await project.save()
