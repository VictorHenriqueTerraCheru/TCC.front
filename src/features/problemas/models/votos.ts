import type { DetalheProblema, ValorVoto } from './problema'

export function aplicarVoto(d: DetalheProblema, valor: ValorVoto): DetalheProblema {
  const anterior = d.myVote ?? null
  if (anterior === valor) return d
  const votos = { ...d.votes }
  if (anterior === 'yes') votos.yes--
  if (anterior === 'no') {
    votos.no--
    votos.noLast24h = Math.max(0, votos.noLast24h - 1)
  }
  if (valor === 'yes') votos.yes++
  else {
    votos.no++
    votos.noLast24h++
  }
  return { ...d, votes: votos, myVote: valor }
}
