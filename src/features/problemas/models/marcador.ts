import type { FaixaConfianca, StatusProblema } from './problema'

interface Variante {
  diametro: number
  opacidade: number
}

// Regra 6 no balão estilo Waze: Alta = maior e opaco (e pulsa); Média = intermediário;
// Baixa = menor e translúcido. Nova ainda não tem confiança: pequeno, com selo "Nova".
const variantes: Record<FaixaConfianca, Variante> = {
  alta: { diametro: 38, opacidade: 1 },
  media: { diametro: 31, opacidade: 1 },
  baixa: { diametro: 25, opacidade: 0.55 },
}
const varianteNova: Variante = { diametro: 28, opacidade: 0.9 }

/** Altura da ponta do balão, que marca o ponto exato. */
export const PONTA = 7

export function varianteDo(status: StatusProblema, faixa: FaixaConfianca | null): Variante {
  return status === 'nova' ? varianteNova : variantes[faixa ?? 'baixa']
}

export function dimensoesMarcador(status: StatusProblema, faixa: FaixaConfianca | null) {
  const { diametro } = varianteDo(status, faixa)
  return { largura: diametro, altura: diametro + PONTA }
}
