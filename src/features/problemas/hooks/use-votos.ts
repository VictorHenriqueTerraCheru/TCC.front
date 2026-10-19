import { useIsMutating } from '@tanstack/react-query'
import { useEffect } from 'react'

import { useAutenticado, useConsumirAcaoPendente, useExigirConta } from '@/features/auth'
import { isApiError } from '@/infrastructure/api'

import { chaveVotos, useVotar } from '../api/use-votar'
import type { DetalheProblema, ValorVoto } from '../models/problema'

/**
 * Voto "Ainda está lá?" passando pela guarda (regra 1): visitante → folha "Entre para votar" com o
 * voto guardado; depois do login, este hook retoma o voto ao voltar para o detalhe. Um 401
 * (token expirado, regra 13) desfaz o voto otimista e cai na mesma guarda.
 */
export function useVotos(problema: DetalheProblema) {
  const exigirConta = useExigirConta()
  const consumirAcao = useConsumirAcaoPendente()
  const autenticado = useAutenticado()
  const mutacao = useVotar(problema.id)
  const votosEmAndamento = useIsMutating({ mutationKey: chaveVotos(problema.id) })

  const mutar = mutacao.mutate
  useEffect(() => {
    if (!autenticado) return
    const acao = consumirAcao((a) => 'problemaId' in a && a.problemaId === problema.id)
    if (acao?.tipo === 'votar') mutar(acao.valor)
  }, [autenticado, consumirAcao, problema.id, mutar])

  function votar(valor: ValorVoto) {
    const pendente = { tipo: 'votar', problemaId: problema.id, valor } as const
    const reabrirGuardaSeExpirou = (erro: unknown) => {
      if (isApiError(erro) && erro.status === 401) exigirConta('votar', () => {}, { pendente })
    }
    exigirConta('votar', () => mutacao.mutate(valor, { onError: reabrirGuardaSeExpirou }), {
      pendente,
    })
  }

  return {
    erro: mutacao.error,
    // Um voto por vez: cada resposta substitui o detalhe inteiro no cache, e a resposta mais
    // antiga chegando por último apagaria o outro voto da tela. Conta as mutações de todas as
    // instâncias (card rápido e detalhe usam useVotos separados).
    votando: votosEmAndamento > 0,
    meuVoto: problema.meuVoto ?? null,
    // O autor não vota no próprio problema (422 autor-nao-vota).
    podeVotar: !problema.souAutor && problema.status !== 'resolvida',
    votar,
  }
}
