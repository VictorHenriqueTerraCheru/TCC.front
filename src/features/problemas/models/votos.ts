import type { DetalheProblema, ValorVoto } from './problema'

// Atualização otimista: aplica o voto nas contagens antes da resposta da API (que traz o valor real).
// Votar de novo substitui o voto anterior (UPSERT na API), então sai de um balde e entra no outro.

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
