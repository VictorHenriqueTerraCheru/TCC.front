import type { FaixaConfianca, StatusProblema } from './problema'

interface Variante {
  largura: number
  opacidade: number
  sombra: string
}

// Regra 6: Alta = cheio, opaco, com sombra; Média = intermediário; Baixa = menor e translúcido.
const variantes: Record<FaixaConfianca, Variante> = {
  alta: { largura: 44, opacidade: 1, sombra: 'drop-shadow(0 3px 3px rgb(0 0 0 / 0.35))' },
  media: { largura: 36, opacidade: 0.85, sombra: 'drop-shadow(0 2px 2px rgb(0 0 0 / 0.2))' },
  baixa: { largura: 28, opacidade: 0.55, sombra: 'none' },
}
// Nova ainda não tem confiança: pino pequeno e translúcido + selo "Nova".
const varianteNova: Variante = { largura: 28, opacidade: 0.7, sombra: 'none' }

const PROPORCAO = 1.25
export const PINO =
  'M20 49c-1.3 0-2.4-.7-3.1-1.8C11 39 2 29.4 2 19.6 2 9.3 10.1 1 20 1s18 8.3 18 18.6c0 9.8-9 19.4-14.9 27.6-.7 1.1-1.8 1.8-3.1 1.8z'

export function varianteDo(status: StatusProblema, faixa: FaixaConfianca | null): Variante {
  return status === 'nova' ? varianteNova : variantes[faixa ?? 'baixa']
}

export function dimensoesMarcador(status: StatusProblema, faixa: FaixaConfianca | null) {
  const { largura } = varianteDo(status, faixa)
  return { largura, altura: Math.round(largura * PROPORCAO) }
}
