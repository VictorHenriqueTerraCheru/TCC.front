const NO_LAYERS = /building|poi|housenumber|aeroway/
const ROADS = /highway|road|tunnel|bridge|transportation/

export const M2_RECIPE = {
  scale: 0.66,
  saturation: 0.9,
  roadFactor: 1.7,
  noLayers: NO_LAYERS,
  roads: ROADS,
}

export const LIGHT_RECIPE = {
  scale: 1,
  saturation: 1,
  roadFactor: 1.7,
  noLayers: NO_LAYERS,
  roads: ROADS,
  roadColors: { scale: 1, saturation: 0.7 },
  borderColors: { scale: 1.1, saturation: 0.15 },
}

const numbers = (text) => text.match(/-?[\d.]+/g)?.map(Number) ?? []

function rgbToHsl(r, g, b) {
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

function readColor(color) {
  const text = color.trim().toLowerCase()
  if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/.test(text)) {
    const hex = text.length === 4 ? [...text.slice(1)].map((c) => c + c).join('') : text.slice(1)
    const [r, g, b] = [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16))
    return [...rgbToHsl(r, g, b), 1]
  }
  if (/^rgba?\(/.test(text)) {
    const [r, g, b, a = 1] = numbers(text)
    return [...rgbToHsl(r, g, b), a]
  }
  if (/^hsla?\(/.test(text)) {
    const [h, s, l, a = 1] = numbers(text)
    return [h, s / 100, l / 100, a]
  }
  return null
}

export function adjustColor(color, { scale, saturation }) {
  if (typeof color !== 'string') return color
  const hsl = readColor(color)
  if (!hsl) return color
  const [h, s, l, a] = hsl
  const percent = (v) => Math.round(Math.min(1, Math.max(0, v)) * 100)
  return `hsla(${Math.round(h) % 360}, ${percent(s * saturation)}%, ${percent(l * scale)}%, ${Number(a)})`
}

export function scaleWidth(value, factor) {
  if (typeof value === 'number') return value * factor
  if (value && !Array.isArray(value) && Array.isArray(value.stops)) {
    return { ...value, stops: value.stops.map(([z, w]) => [z, scaleWidth(w, factor)]) }
  }
  if (Array.isArray(value) && value[0] === 'interpolate') {
    return [
      ...value.slice(0, 3),
      ...value.slice(3).map((x, i) => (i % 2 ? scaleWidth(x, factor) : x)),
    ]
  }
  if (Array.isArray(value) && value[0] === 'step') {
    return value.map((x, i) => (i >= 2 && i % 2 === 0 ? scaleWidth(x, factor) : x))
  }
  return value
}

function fitAll(value, adjustment) {
  if (Array.isArray(value)) return value.map((x) => fitAll(x, adjustment))
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, fitAll(v, adjustment)]))
  }
  return adjustColor(value, adjustment)
}

function adjustmentFor(layer, recipe) {
  if (layer.type !== 'line' || !recipe.roads.test(layer.id)) return recipe
  const own = /casing/.test(layer.id) ? recipe.borderColors : recipe.roadColors
  return own ?? recipe
}

export function applyRecipe(style, recipe = M2_RECIPE) {
  const copy = structuredClone(style)
  copy.layers = copy.layers
    .filter((layer) => !recipe.noLayers.test(layer.id))
    .map((layer) => {
      if (!layer.paint) return layer
      const paint = { ...layer.paint }
      const adjustment = adjustmentFor(layer, recipe)
      for (const key of Object.keys(paint)) {
        if (key.includes('color')) paint[key] = fitAll(paint[key], adjustment)
      }
      if (
        layer.type === 'line' &&
        recipe.roads.test(layer.id) &&
        paint['line-width'] !== undefined
      ) {
        paint['line-width'] = scaleWidth(paint['line-width'], recipe.roadFactor)
      }
      return { ...layer, paint }
    })
  return copy
}
