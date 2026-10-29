import { useIsMutating } from '@tanstack/react-query'
import { useEffect } from 'react'

import { useAutenticado, useConsumirAcaoPendente, useExigirConta } from '@/features/auth'
import { isApiError } from '@/infrastructure/api'

import { chaveVotos, useVotar } from '../api/use-votar'
import type { DetalheProblema, ValorVoto } from '../models/problema'

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
    if (acao?.type === 'votar') mutar(acao.value)
  }, [autenticado, consumirAcao, problema.id, mutar])

  function votar(valor: ValorVoto) {
    const pendente = { type: 'votar', problemaId: problema.id, value: valor } as const
    const reabrirGuardaSeExpirou = (erro: unknown) => {
      if (isApiError(erro) && erro.status === 401)
        exigirConta('votar', () => {}, { pending: pendente })
    }
    exigirConta('votar', () => mutacao.mutate(valor, { onError: reabrirGuardaSeExpirou }), {
      pending: pendente,
    })
  }

  return {
    erro: mutacao.error,
    votando: votosEmAndamento > 0,
    myVote: problema.myVote ?? null,
    podeVotar: !problema.isAuthor && problema.status !== 'resolved',
    votar,
  }
}
