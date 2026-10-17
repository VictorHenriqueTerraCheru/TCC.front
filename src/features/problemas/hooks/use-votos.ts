import { useIsMutating } from '@tanstack/react-query'
import { useEffect } from 'react'

import {
  useAutenticado,
  useConsumirAcaoPendente,
  useExigirConta,
  type AcaoPendente,
} from '@/features/auth'
import { isApiError } from '@/infrastructure/api'

import { chaveVotos, useVotarExistencia, useVotarPersistencia } from '../api/use-votar'
import type { DetalheProblema, ValorExistencia, ValorPersistencia } from '../models/problema'

/**
 * Votos do detalhe passando pela guarda (regra 1): visitante → folha "Entre para votar" com o
 * voto guardado; depois do login, este hook retoma o voto ao voltar para o detalhe. Um 401
 * (token expirado, regra 13) desfaz o voto otimista e cai na mesma guarda.
 */
export function useVotos(problema: DetalheProblema) {
  const exigirConta = useExigirConta()
  const consumirAcao = useConsumirAcaoPendente()
  const autenticado = useAutenticado()
  const existencia = useVotarExistencia(problema.id)
  const persistencia = useVotarPersistencia(problema.id)
  const votosEmAndamento = useIsMutating({ mutationKey: chaveVotos(problema.id) })

  function comGuarda(
    pendente: AcaoPendente,
    votar: (opcoes: { onError(erro: unknown): void }) => void,
  ) {
    const reabrirGuardaSeExpirou = (erro: unknown) => {
      if (isApiError(erro) && erro.status === 401) exigirConta('votar', () => {}, { pendente })
    }
    exigirConta('votar', () => votar({ onError: reabrirGuardaSeExpirou }), { pendente })
  }

  const mutarExistencia = existencia.mutate
  const mutarPersistencia = persistencia.mutate
  useEffect(() => {
    if (!autenticado) return
    const acao = consumirAcao((a) => 'problemaId' in a && a.problemaId === problema.id)
    if (acao?.tipo === 'votarExistencia') mutarExistencia(acao.valor)
    if (acao?.tipo === 'votarPersistencia') mutarPersistencia(acao.valor)
  }, [autenticado, consumirAcao, problema.id, mutarExistencia, mutarPersistencia])

  return {
    existencia,
    persistencia,
    // Um voto por vez: cada resposta substitui o detalhe inteiro no cache, e a resposta mais
    // antiga chegando por último apagaria o outro voto da tela. Conta as mutações de todas as
    // instâncias (card rápido e detalhe usam useVotos separados).
    votando: votosEmAndamento > 0,
    meus: problema.meusVotos ?? { existencia: null, persistencia: null },
    votarExistencia: (valor: ValorExistencia) =>
      comGuarda({ tipo: 'votarExistencia', problemaId: problema.id, valor }, (opcoes) =>
        existencia.mutate(valor, opcoes),
      ),
    votarPersistencia: (valor: ValorPersistencia) =>
      comGuarda({ tipo: 'votarPersistencia', problemaId: problema.id, valor }, (opcoes) =>
        persistencia.mutate(valor, opcoes),
      ),
  }
}
