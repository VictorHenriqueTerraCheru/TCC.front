import { readFile } from 'node:fs/promises'

async function tokens(theme) {
  const css = await readFile('src/index.css', 'utf8')
  const block = (picker) => {
    const body = css.match(new RegExp(`${picker}\\s*{([^}]*)}`))?.[1] ?? ''
    return Object.fromEntries(
      [...body.matchAll(/(--[\w-]+):\s*([^;]+);/g)].map(([, name, value]) => [name, value.trim()]),
    )
  }
  const light = block(':root')
  return theme === 'light' ? light : { ...light, ...block(":root\\[data-theme='dark'\\]") }
}

function luminance(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
  const linear = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
  return 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b)
}

function contrast(a, b) {
  const [larger, smaller] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (larger + 0.05) / (smaller + 0.05)
}

async function token(theme, name) {
  const value = (await tokens(theme))[name]
  expect(value, `${name} (${theme}) must be #rrggbb`).toMatch(/^#[0-9a-f]{6}$/i)
  return value
}

const PAIRS = [
  ['--foreground', '--background'],
  ['--muted-foreground', '--background'],
  ['--muted-foreground', '--card'],
  ['--primary-foreground', '--primary'],
  ['--brand', '--background'],
  ['--brand', '--card'],
  ['--destructive', '--background'],
  ['--foreground', '--surface-2'],
  ['--group-orange', '--card'],
  ['--group-ochre', '--card'],
  ['--group-brown', '--card'],
  ['--group-red', '--card'],
  ['--group-terracotta', '--card'],
  ['--group-blue', '--card'],
  ['--group-teal', '--card'],
  ['--group-purple', '--card'],
  ['--group-pink', '--card'],
  ['--group-gray', '--card'],
]

describe.each(['light', 'dark'])('theme %s', (theme) => {
  test.each(PAIRS)('%s on %s has contrast ≥ 4.5', async (text, background) => {
    expect(
      contrast(await token(theme, text), await token(theme, background)),
    ).toBeGreaterThanOrEqual(4.5)
  })
})
