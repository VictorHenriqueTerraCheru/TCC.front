import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { Node, Project, SyntaxKind } from 'ts-morph'

const root = process.cwd()
const mapsRoot = path.join(root, 'docs/superpowers/plans/2026-10-29-ingles-front')
const schemaPath = path.join(root, 'src/infrastructure/api/schema.d.ts')

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

function isContractDeclaration(declaration) {
  return declaration.getSourceFile().getFilePath() === schemaPath
}

function isContractType(type) {
  const symbols = [type.getSymbol(), type.getAliasSymbol()].filter(Boolean)
  if (symbols.some((symbol) => symbol.getDeclarations().some(isContractDeclaration))) return true
  return type
    .getProperties()
    .some((property) => property.getDeclarations().some(isContractDeclaration))
}

function hasProperty(type, name) {
  return type.getProperties().some((property) => property.getName() === name)
}

function queue(edits, sourceFile, node, text) {
  edits.push({ sourceFile, start: node.getStart(), end: node.getEnd(), text })
}

const rawFields = await readMap('mapa-campos.tsv', '\t')
const fieldMap = new Map(
  [...rawFields].map(([before, after]) => [before.split('.').at(-1), after.split('.').at(-1)]),
)
const valueMap = await readMap('mapa-valores.txt', '=')
const routeMap = await readMap('mapa-url.txt', '=')
const project = new Project({ tsConfigFilePath: path.join(root, 'tsconfig.app.json') })
const checker = project.getTypeChecker()
const sourceFiles = project.getSourceFiles().filter((sourceFile) => !sourceFile.isDeclarationFile())
const edits = []

for (const sourceFile of sourceFiles) {
  for (const access of sourceFile.getDescendantsOfKind(SyntaxKind.PropertyAccessExpression)) {
    const before = access.getName()
    const after = fieldMap.get(before)
    if (!after || after === before) continue
    const objectType = checker.getTypeAtLocation(access.getExpression())
    if (
      isContractType(objectType) &&
      !hasProperty(objectType, before) &&
      hasProperty(objectType, after)
    ) {
      queue(edits, sourceFile, access.getNameNode(), after)
    }
  }

  for (const binding of sourceFile.getDescendantsOfKind(SyntaxKind.BindingElement)) {
    if (!Node.isObjectBindingPattern(binding.getParent())) continue
    const propertyName = binding.getPropertyNameNode()
    const before = propertyName?.getText() ?? binding.getNameNode().getText()
    const after = fieldMap.get(before)
    if (!after || after === before) continue
    const declaration = binding.getFirstAncestorByKind(SyntaxKind.VariableDeclaration)
    const initializer = declaration?.getInitializer()
    const objectType = initializer ? checker.getTypeAtLocation(initializer) : undefined
    if (
      objectType &&
      isContractType(objectType) &&
      !hasProperty(objectType, before) &&
      hasProperty(objectType, after)
    ) {
      queue(edits, sourceFile, binding, `${after}: ${binding.getNameNode().getText()}`)
    }
  }

  for (const objectLiteral of sourceFile.getDescendantsOfKind(SyntaxKind.ObjectLiteralExpression)) {
    const contextual = checker.getContextualType(objectLiteral)
    if (!contextual || !isContractType(contextual)) continue
    for (const property of objectLiteral.getProperties()) {
      if (!Node.isPropertyAssignment(property) && !Node.isShorthandPropertyAssignment(property))
        continue
      const before = property.getName()
      const after = fieldMap.get(before)
      const route = routeMap.get(before)
      const value = valueMap.get(before)
      const next = after ?? route ?? value
      const usesContractField = after && isContractType(contextual)
      if (
        !next ||
        next === before ||
        hasProperty(contextual, before) ||
        !hasProperty(contextual, next)
      )
        continue
      if (!usesContractField && !value && !route) continue
      if (Node.isPropertyAssignment(property))
        queue(edits, sourceFile, property.getNameNode(), next)
      else queue(edits, sourceFile, property, `${next}: ${before}`)
    }
  }
}

for (const [sourceFile, fileEdits] of Map.groupBy(edits, (edit) => edit.sourceFile)) {
  for (const edit of fileEdits.sort((left, right) => right.start - left.start)) {
    sourceFile.replaceText([edit.start, edit.end], edit.text)
  }
}

await project.save()
console.log(`contract fields updated: ${edits.length}`)
