import { readFile, readdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

import postcss from 'postcss'
import ts from 'typescript'

const sourceDirectory = path.resolve('src')
const scriptDirectory = path.resolve('scripts')
const sourceFiles = await filesIn(sourceDirectory, new Set(['.ts', '.tsx', '.d.ts']))
const cssFiles = (await filesIn(sourceDirectory, new Set(['.css']))).filter(
  (filePath) => !filePath.startsWith(path.join(sourceDirectory, 'assets') + path.sep),
)
const scriptFiles = await filesIn(scriptDirectory, new Set(['.js', '.mjs', '.ts']))
const codeFiles = [
  ...sourceFiles,
  ...scriptFiles,
  path.resolve('eslint.config.js'),
  path.resolve('vite.config.ts'),
]

for (const filePath of codeFiles) {
  const source = await readFile(filePath, 'utf8')
  await writeFile(filePath, stripCodeComments(filePath, source))
}

for (const filePath of cssFiles) {
  const source = await readFile(filePath, 'utf8')
  const root = postcss.parse(source, { from: filePath })
  root.walkComments((comment) => comment.remove())
  await writeFile(filePath, root.toResult().css)
}

async function filesIn(directory, extensions) {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = []

  for (const entry of entries) {
    const filePath = path.join(directory, entry.name)
    if (entry.isDirectory()) files.push(...(await filesIn(filePath, extensions)))
    else if ([...extensions].some((extension) => entry.name.endsWith(extension)))
      files.push(filePath)
  }

  return files
}

function stripCodeComments(filePath, source) {
  const sourceFile = ts.createSourceFile(
    filePath,
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  )
  const removals = jsxCommentExpressions(sourceFile)
  const literalRanges = literalRangesIn(sourceFile)

  for (const range of commentRanges(source)) {
    const comment = source.slice(range.pos, range.end)
    if (
      isInsideLiteral(range.pos, literalRanges) ||
      isDirective(comment) ||
      isContainedByRemoval(range.pos, range.end, removals)
    )
      continue
    removals.push(commentRemoval(source, range.pos, range.end))
  }

  return applyRemovals(source, removals)
}

function literalRangesIn(sourceFile) {
  const ranges = []
  const visit = (node) => {
    if (
      ts.isStringLiteral(node) ||
      ts.isNoSubstitutionTemplateLiteral(node) ||
      ts.isTemplateHead(node) ||
      ts.isTemplateMiddle(node) ||
      ts.isTemplateTail(node) ||
      ts.isRegularExpressionLiteral(node)
    ) {
      ranges.push({ start: node.getStart(sourceFile), end: node.end })
    }
    ts.forEachChild(node, visit)
  }
  visit(sourceFile)
  return ranges
}

function isInsideLiteral(position, ranges) {
  return ranges.some((range) => range.start <= position && position < range.end)
}

function commentRanges(source) {
  const scanner = ts.createScanner(ts.ScriptTarget.Latest, false, ts.LanguageVariant.JSX, source)
  const ranges = []
  const templateInterpolations = []
  let previousToken

  for (let token = scanner.scan(); token !== ts.SyntaxKind.EndOfFileToken; token = scanner.scan()) {
    if (token === ts.SyntaxKind.SlashToken && canStartRegex(previousToken)) {
      token = scanner.reScanSlashToken()
    }

    if (token === ts.SyntaxKind.OpenBraceToken && templateInterpolations.length) {
      templateInterpolations[templateInterpolations.length - 1]++
    }

    if (token === ts.SyntaxKind.CloseBraceToken && templateInterpolations.length) {
      const index = templateInterpolations.length - 1
      if (templateInterpolations[index] > 0) templateInterpolations[index]--
      else token = scanner.reScanTemplateToken()
    }

    if (
      token === ts.SyntaxKind.SingleLineCommentTrivia ||
      token === ts.SyntaxKind.MultiLineCommentTrivia
    ) {
      ranges.push({ pos: scanner.getTokenPos(), end: scanner.getTextPos() })
      continue
    }

    if (token === ts.SyntaxKind.TemplateHead) {
      templateInterpolations.push(0)
    } else if (token === ts.SyntaxKind.TemplateMiddle && templateInterpolations.length) {
      templateInterpolations[templateInterpolations.length - 1] = 0
    } else if (token === ts.SyntaxKind.TemplateTail && templateInterpolations.length) {
      templateInterpolations.pop()
    }

    if (!ts.isTrivia(token)) previousToken = token
  }

  return ranges
}

function canStartRegex(previousToken) {
  return (
    previousToken === undefined ||
    [
      ts.SyntaxKind.OpenParenToken,
      ts.SyntaxKind.OpenBracketToken,
      ts.SyntaxKind.OpenBraceToken,
      ts.SyntaxKind.CommaToken,
      ts.SyntaxKind.ColonToken,
      ts.SyntaxKind.SemicolonToken,
      ts.SyntaxKind.EqualsToken,
      ts.SyntaxKind.EqualsEqualsToken,
      ts.SyntaxKind.EqualsEqualsEqualsToken,
      ts.SyntaxKind.ExclamationEqualsToken,
      ts.SyntaxKind.ExclamationEqualsEqualsToken,
      ts.SyntaxKind.QuestionToken,
      ts.SyntaxKind.QuestionQuestionToken,
      ts.SyntaxKind.ArrowToken,
      ts.SyntaxKind.ReturnKeyword,
      ts.SyntaxKind.CaseKeyword,
      ts.SyntaxKind.ThrowKeyword,
    ].includes(previousToken)
  )
}

function jsxCommentExpressions(sourceFile) {
  const removals = []
  const visit = (node) => {
    if (ts.isJsxExpression(node) && node.expression?.kind === ts.SyntaxKind.JsxEmptyExpression) {
      removals.push({ start: node.getStart(sourceFile), end: node.end })
    }
    ts.forEachChild(node, visit)
  }
  visit(sourceFile)
  return removals
}

function isDirective(comment) {
  const text = comment.slice(2).trimStart()
  return (
    text.startsWith('eslint-disable') ||
    text.startsWith('@ts-expect-error') ||
    text.startsWith('@ts-ignore') ||
    text.startsWith('/ <reference') ||
    text.startsWith('@vite-ignore')
  )
}

function isContainedByRemoval(start, end, removals) {
  return removals.some((removal) => removal.start <= start && end <= removal.end)
}

function commentRemoval(source, start, end) {
  const lineStart = source.lastIndexOf('\n', start - 1) + 1
  const lineEndIndex = source.indexOf('\n', end)
  const lineEnd = lineEndIndex === -1 ? source.length : lineEndIndex
  const before = source.slice(lineStart, start)
  const after = source.slice(end, lineEnd)

  if (!before.trim() && !after.trim()) {
    return { start: lineStart, end: lineEndIndex === -1 ? lineEnd : lineEnd + 1 }
  }

  let removalStart = start
  while (
    removalStart > lineStart &&
    (source[removalStart - 1] === ' ' || source[removalStart - 1] === '\t')
  )
    removalStart--
  return { start: removalStart, end }
}

function applyRemovals(source, removals) {
  const ordered = [...removals].sort((left, right) => right.start - left.start)
  let output = source
  let previousStart = source.length + 1

  for (const removal of ordered) {
    if (removal.end > previousStart) continue
    output = output.slice(0, removal.start) + output.slice(removal.end)
    previousStart = removal.start
  }

  return output
}
