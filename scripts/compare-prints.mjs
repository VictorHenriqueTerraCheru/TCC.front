import { execFileSync } from 'node:child_process'
import { cp, mkdir, readFile, readdir, rm, stat, writeFile } from 'node:fs/promises'
import path from 'node:path'

import pixelmatch from 'pixelmatch'
import { PNG } from 'pngjs'

const printsDirectory = path.resolve('prints')
const baselineDirectory = path.resolve('prints-baseline')
const diffDirectory = path.resolve('prints-diff')
const shouldCreateBaseline = process.argv.includes('--baseline')

runPrints()

if (shouldCreateBaseline) {
  await rm(baselineDirectory, { recursive: true, force: true })
  await cp(printsDirectory, baselineDirectory, { recursive: true })
  console.log(`Prints baseline saved to ${path.relative(process.cwd(), baselineDirectory)}.`)
  process.exit(0)
}

try {
  await stat(baselineDirectory)
} catch {
  console.error('Prints baseline missing. Run node scripts/compare-prints.mjs --baseline first.')
  process.exit(1)
}

await rm(diffDirectory, { recursive: true, force: true })
const baselineFiles = await pngFiles(baselineDirectory)
const currentFiles = await pngFiles(printsDirectory)
const files = [...new Set([...baselineFiles, ...currentFiles])].sort()
const differences = []

for (const relativePath of files) {
  const baselinePath = path.join(baselineDirectory, relativePath)
  const currentPath = path.join(printsDirectory, relativePath)

  if (!baselineFiles.includes(relativePath) || !currentFiles.includes(relativePath)) {
    differences.push(`${relativePath} (missing file)`)
    continue
  }

  const baseline = PNG.sync.read(await readFile(baselinePath))
  const current = PNG.sync.read(await readFile(currentPath))

  if (baseline.width !== current.width || baseline.height !== current.height) {
    differences.push(`${relativePath} (different dimensions)`)
    continue
  }

  const diff = new PNG({ width: baseline.width, height: baseline.height })
  const differentPixels = pixelmatch(
    baseline.data,
    current.data,
    diff.data,
    baseline.width,
    baseline.height,
    { threshold: 0 },
  )

  if (differentPixels > 0) {
    const diffPath = path.join(diffDirectory, relativePath)
    await mkdir(path.dirname(diffPath), { recursive: true })
    await writeFile(diffPath, PNG.sync.write(diff))
    differences.push(`${relativePath} (${differentPixels} different pixels)`)
  }
}

if (differences.length) {
  console.error('Different prints:')
  for (const difference of differences) console.error(`- ${difference}`)
  process.exit(1)
}

console.log('Prints identical to the baseline.')

function runPrints() {
  execFileSync('npm', ['run', 'prints'], { stdio: 'inherit' })
}

async function pngFiles(directory, relativeDirectory = '') {
  const entries = await readdir(path.join(directory, relativeDirectory), { withFileTypes: true })
  const files = []

  for (const entry of entries) {
    const relativePath = path.join(relativeDirectory, entry.name)
    if (entry.isDirectory()) {
      files.push(...(await pngFiles(directory, relativePath)))
    } else if (entry.name.endsWith('.png')) {
      files.push(relativePath)
    }
  }

  return files
}
