import type { FaixaConfianca, StatusProblema } from './problema'

interface Variante {
  diametro: number
  opacidade: number
}

const variantes: Record<FaixaConfianca, Variante> = {
  high: { diametro: 38, opacidade: 1 },
  medium: { diametro: 31, opacidade: 1 },
  low: { diametro: 25, opacidade: 0.55 },
}
const varianteNova: Variante = { diametro: 28, opacidade: 0.9 }

export const PONTA = 7

export function varianteDo(status: StatusProblema, faixa: FaixaConfianca | null): Variante {
  return status === 'new' ? varianteNova : variantes[faixa ?? 'low']
}

export function dimensoesMarcador(status: StatusProblema, faixa: FaixaConfianca | null) {
  const { diametro } = varianteDo(status, faixa)
  return { largura: diametro, altura: diametro + PONTA }
}
