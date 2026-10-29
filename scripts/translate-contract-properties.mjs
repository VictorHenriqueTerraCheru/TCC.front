import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { Node, Project, SyntaxKind } from 'ts-morph'

const root = process.cwd()
const mapFile = path.join(root, 'docs/superpowers/plans/2026-10-29-ingles-front/mapa-campos.tsv')
const mapText = await readFile(mapFile, 'utf8')
const fields = new Map(
  mapText
    .split('\n')
    .filter(Boolean)
    .map((line) => line.split('\t'))
    .filter(([before, after]) => before && after)
    .map(([before, after]) => [before.split('.').at(-1), after.split('.').at(-1)]),
)
fields.delete('data')
const valuesFile = path.join(
  root,
  'docs/superpowers/plans/2026-10-29-ingles-front/mapa-valores.txt',
)
const valuesText = await readFile(valuesFile, 'utf8')
const values = new Map(
  valuesText
    .split('\n')
    .filter(Boolean)
    .map((line) => line.split('='))
    .filter(([before, after]) => before && after),
)

const project = new Project({ tsConfigFilePath: path.join(root, 'tsconfig.app.json') })
const sourceFiles = project.getSourceFiles().filter((sourceFile) => !sourceFile.isDeclarationFile())
const edits = []

function queue(sourceFile, node, text) {
  edits.push({ sourceFile, start: node.getStart(), end: node.getEnd(), text })
}

for (const sourceFile of sourceFiles) {
  for (const access of sourceFile.getDescendantsOfKind(SyntaxKind.PropertyAccessExpression)) {
    const after = fields.get(access.getName()) ?? values.get(access.getName())
    if (after && after !== access.getName()) queue(sourceFile, access.getNameNode(), after)
  }

  for (const property of sourceFile.getDescendantsOfKind(SyntaxKind.PropertyAssignment)) {
    const after = fields.get(property.getName()) ?? values.get(property.getName())
    if (after && after !== property.getName()) queue(sourceFile, property.getNameNode(), after)
  }

  for (const property of sourceFile.getDescendantsOfKind(SyntaxKind.ShorthandPropertyAssignment)) {
    const before = property.getName()
    const after = fields.get(before) ?? values.get(before)
    if (after && after !== before) queue(sourceFile, property, `${after}: ${before}`)
  }

  for (const binding of sourceFile.getDescendantsOfKind(SyntaxKind.BindingElement)) {
    if (!Node.isObjectBindingPattern(binding.getParent())) continue
    if (binding.getParent().getFirstAncestorByKind(SyntaxKind.BindingElement)) continue
    const propertyName = binding.getPropertyNameNode()
    const before = propertyName?.getText() ?? binding.getNameNode().getText()
    const after = fields.get(before) ?? values.get(before)
    if (after && after !== before)
      queue(sourceFile, binding, `${after}: ${binding.getNameNode().getText()}`)
  }

  for (const signature of sourceFile.getDescendantsOfKind(SyntaxKind.PropertySignature)) {
    const after = fields.get(signature.getName()) ?? values.get(signature.getName())
    if (after && after !== signature.getName()) queue(sourceFile, signature.getNameNode(), after)
  }

  for (const attribute of sourceFile.getDescendantsOfKind(SyntaxKind.JsxAttribute)) {
    const after =
      fields.get(attribute.getNameNode().getText()) ?? values.get(attribute.getNameNode().getText())
    if (after && after !== attribute.getNameNode().getText())
      queue(sourceFile, attribute.getNameNode(), after)
  }

  for (const literal of sourceFile.getDescendantsOfKind(SyntaxKind.StringLiteral)) {
    const before = literal.getLiteralText()
    const after = fields.get(before) ?? values.get(before)
    if (after && after !== before) queue(sourceFile, literal, `'${after}'`)
  }
}

for (const [sourceFile, fileEdits] of Map.groupBy(edits, (edit) => edit.sourceFile)) {
  const unique = new Map(fileEdits.map((edit) => [`${edit.start}:${edit.end}`, edit]))
  for (const edit of [...unique.values()].sort((left, right) => right.start - left.start)) {
    sourceFile.replaceText([edit.start, edit.end], edit.text)
  }
}

await project.save()
console.log(`contract properties updated: ${edits.length}`)
