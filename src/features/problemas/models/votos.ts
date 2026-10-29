import type { DetalheProblema, ValorVoto } from './problema'

export function aplicarVoto(d: DetalheProblema, valor: ValorVoto): DetalheProblema {
  const anterior = d.meuVoto ?? null
  if (anterior === valor) return d
  const votos = { ...d.votos }
  if (anterior === 'sim') votos.sim--
  if (anterior === 'nao') {
    votos.nao--
    votos.naoUltimas24h = Math.max(0, votos.naoUltimas24h - 1)
  }
  if (valor === 'sim') votos.sim++
  else {
    votos.nao++
    votos.naoUltimas24h++
  }
  return { ...d, votos, meuVoto: valor }
}
