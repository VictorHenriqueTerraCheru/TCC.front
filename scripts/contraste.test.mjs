import { readFile } from 'node:fs/promises'

// Contraste AA (WCAG 2.x) dos pares de tokens do tema escuro (src/index.css, :root).
// Texto normal ≥ 4,5:1. Tokens com alfa (vidro, suaves) ficam de fora: dependem do fundo.

async function tokens() {
  const css = await readFile('src/index.css', 'utf8')
  const raiz = css.match(/:root\s*{([^}]*)}/)?.[1] ?? ''
  return Object.fromEntries(
    [...raiz.matchAll(/(--[\w-]+):\s*([^;]+);/g)].map(([, nome, valor]) => [nome, valor.trim()]),
  )
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

async function token(nome) {
  const valor = (await tokens())[nome]
  expect(valor, `${nome} precisa ser #rrggbb`).toMatch(/^#[0-9a-f]{6}$/i)
  return valor
}

test.each([
  ['--foreground', '--background'],
  ['--muted-foreground', '--background'],
  ['--muted-foreground', '--card'],
  ['--primary-foreground', '--primary'],
  ['--primario', '--background'],
  ['--primario', '--card'],
  ['--destructive', '--background'],
  ['--foreground', '--superficie-2'],
])('%s sobre %s tem contraste ≥ 4,5', async (texto, fundo) => {
  expect(contraste(await token(texto), await token(fundo))).toBeGreaterThanOrEqual(4.5)
})
