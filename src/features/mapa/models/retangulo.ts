export interface Retangulo {
  minLat: number
  minLng: number
  maxLat: number
  maxLng: number
}

interface Limites {
  sul: number
  oeste: number
  norte: number
  leste: number
}

const limitar = (valor: number, min: number, max: number) => Math.min(max, Math.max(min, valor))

export function retanguloDaApi({ sul, oeste, norte, leste }: Limites, casas = 3): Retangulo | null {
  const fator = 10 ** casas
  const paraBaixo = (v: number) => Math.floor(v * fator) / fator
  const paraCima = (v: number) => Math.ceil(v * fator) / fator

  const retangulo = {
    minLat: limitar(paraBaixo(sul), -90, 90),
    minLng: limitar(paraBaixo(oeste), -180, 180),
    maxLat: limitar(paraCima(norte), -90, 90),
    maxLng: limitar(paraCima(leste), -180, 180),
  }
  const valido = retangulo.minLat < retangulo.maxLat && retangulo.minLng < retangulo.maxLng
  return valido ? retangulo : null
}
