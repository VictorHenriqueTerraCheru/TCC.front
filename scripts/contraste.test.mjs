import { readFile } from 'node:fs/promises'

async function tokens(tema) {
  const css = await readFile('src/index.css', 'utf8')
  const bloco = (seletor) => {
    const corpo = css.match(new RegExp(`${seletor}\\s*{([^}]*)}`))?.[1] ?? ''
    return Object.fromEntries(
      [...corpo.matchAll(/(--[\w-]+):\s*([^;]+);/g)].map(([, nome, valor]) => [nome, valor.trim()]),
    )
  }
  const claro = bloco(':root')
  return tema === 'claro' ? claro : { ...claro, ...bloco(":root\\[data-theme='dark'\\]") }
}

function luminancia(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
  const linear = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
  return 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b)
}

function contraste(a, b) {
  const [maior, menor] = [luminancia(a), luminancia(b)].sort((x, y) => y - x)
  return (maior + 0.05) / (menor + 0.05)
}

async function token(tema, nome) {
  const valor = (await tokens(tema))[nome]
  expect(valor, `${nome} (${tema}) precisa ser #rrggbb`).toMatch(/^#[0-9a-f]{6}$/i)
  return valor
}

const PARES = [
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

describe.each(['claro', 'escuro'])('tema %s', (tema) => {
  test.each(PARES)('%s sobre %s tem contraste ≥ 4,5', async (texto, fundo) => {
    expect(contraste(await token(tema, texto), await token(tema, fundo))).toBeGreaterThanOrEqual(
      4.5,
    )
  })
})
