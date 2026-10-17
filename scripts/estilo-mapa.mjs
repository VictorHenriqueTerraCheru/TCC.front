// Receita do estilo "M2 · Equilíbrio" (docs/superpowers/specs/2026-10-17-redesign-mapa-vetorial-design.md):
// parte do fiord do OpenFreeMap, escurece as cores mantendo o matiz, tira prédios e pontos de
// interesse e engrossa as vias, como no Waze. Funções puras; scripts/gen-estilo-mapa.mjs aplica.

export const RECEITA_M2 = {
  escala: 0.66,
  saturacao: 0.9,
  fatorVias: 1.7,
  semCamadas: /building|poi|housenumber|aeroway/,
  vias: /highway|road|tunnel|bridge|transportation/,
}

const numeros = (texto) => texto.match(/-?[\d.]+/g)?.map(Number) ?? []

function rgbParaHsl(r, g, b) {
  ;[r, g, b] = [r / 255, g / 255, b / 255]
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2
  if (max === min) return [0, 0, l]
  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
  const h =
    max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4
  return [h * 60, s, l]
}

/** Cor CSS → [h (graus), s (0–1), l (0–1), alfa]; null se não for #hex, rgb(a) ou hsl(a). */
function lerCor(cor) {
  const texto = cor.trim().toLowerCase()
  if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/.test(texto)) {
    const hex = texto.length === 4 ? [...texto.slice(1)].map((c) => c + c).join('') : texto.slice(1)
    const [r, g, b] = [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16))
    return [...rgbParaHsl(r, g, b), 1]
  }
  if (/^rgba?\(/.test(texto)) {
    const [r, g, b, a = 1] = numeros(texto)
    return [...rgbParaHsl(r, g, b), a]
  }
  if (/^hsla?\(/.test(texto)) {
    const [h, s, l, a = 1] = numeros(texto)
    return [h, s / 100, l / 100, a]
  }
  return null
}

/** Escurece mantendo o matiz: l × escala, s × saturacao. Outras strings voltam como estão. */
export function escurecerCor(cor, { escala, saturacao }) {
  if (typeof cor !== 'string') return cor
  const hsl = lerCor(cor)
  if (!hsl) return cor
  const [h, s, l, a] = hsl
  const pct = (v) => Math.round(Math.min(1, Math.max(0, v)) * 100)
  return `hsla(${Math.round(h) % 360}, ${pct(s * saturacao)}%, ${pct(l * escala)}%, ${Number(a)})`
}

/** Multiplica larguras: número, { stops }, interpolate (só os valores) e step (só os valores). */
export function escalarLargura(valor, fator) {
  if (typeof valor === 'number') return valor * fator
  if (valor && !Array.isArray(valor) && Array.isArray(valor.stops)) {
    return { ...valor, stops: valor.stops.map(([z, w]) => [z, escalarLargura(w, fator)]) }
  }
  if (Array.isArray(valor) && valor[0] === 'interpolate') {
    return [
      ...valor.slice(0, 3),
      ...valor.slice(3).map((x, i) => (i % 2 ? escalarLargura(x, fator) : x)),
    ]
  }
  if (Array.isArray(valor) && valor[0] === 'step') {
    return valor.map((x, i) => (i >= 2 && i % 2 === 0 ? escalarLargura(x, fator) : x))
  }
  return valor
}

function escurecerTudo(valor, receita) {
  if (Array.isArray(valor)) return valor.map((x) => escurecerTudo(x, receita))
  if (valor && typeof valor === 'object') {
    return Object.fromEntries(Object.entries(valor).map(([k, v]) => [k, escurecerTudo(v, receita)]))
  }
  return escurecerCor(valor, receita)
}

/** Aplica a receita a uma cópia do estilo MapLibre. */
export function aplicarReceita(estilo, receita = RECEITA_M2) {
  const copia = structuredClone(estilo)
  copia.layers = copia.layers
    .filter((camada) => !receita.semCamadas.test(camada.id))
    .map((camada) => {
      if (!camada.paint) return camada
      const paint = { ...camada.paint }
      for (const chave of Object.keys(paint)) {
        if (chave.includes('color')) paint[chave] = escurecerTudo(paint[chave], receita)
      }
      if (
        camada.type === 'line' &&
        receita.vias.test(camada.id) &&
        paint['line-width'] !== undefined
      ) {
        paint['line-width'] = escalarLargura(paint['line-width'], receita.fatorVias)
      }
      return { ...camada, paint }
    })
  return copia
}
