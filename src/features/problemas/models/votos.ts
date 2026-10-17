import type { DetalheProblema, ValorExistencia, ValorPersistencia } from './problema'

// Atualização otimista: aplica o voto nas contagens antes da resposta da API (que traz o valor real).
// Votar de novo substitui o voto anterior (UPSERT na API), então sai de um balde e entra no outro.

export function aplicarVotoExistencia(d: DetalheProblema, valor: ValorExistencia): DetalheProblema {
  const anterior = d.meusVotos?.existencia ?? null
  if (anterior === valor) return d
  const existencia = { ...d.existencia }
  if (anterior === 'confirma') existencia.confirmacoes--
  if (anterior === 'naoVi') existencia.naoVi--
  if (valor === 'confirma') existencia.confirmacoes++
  else existencia.naoVi++
  return {
    ...d,
    existencia,
    meusVotos: { persistencia: null, ...d.meusVotos, existencia: valor },
  }
}

export function aplicarVotoPersistencia(
  d: DetalheProblema,
  valor: ValorPersistencia,
): DetalheProblema {
  const anterior = d.meusVotos?.persistencia ?? null
  if (anterior === valor) return d
  const persistencia = { ...d.persistencia }
  if (anterior === 'continua') persistencia.continua--
  if (anterior === 'resolvido') {
    persistencia.resolvido--
    persistencia.resolvidoUltimas24h = Math.max(0, persistencia.resolvidoUltimas24h - 1)
  }
  if (valor === 'continua') persistencia.continua++
  else {
    persistencia.resolvido++
    persistencia.resolvidoUltimas24h++
  }
  return {
    ...d,
    persistencia,
    meusVotos: { existencia: null, ...d.meusVotos, persistencia: valor },
  }
}
