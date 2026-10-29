import { useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'

import { useSessaoStore } from '../stores/sessao-store'

const DA_CONTA = [['me'], ['admin']]

export function useSincronizarCacheComSessao() {
  const queryClient = useQueryClient()
  useEffect(
    () =>
      useSessaoStore.subscribe((atual, anterior) => {
        if (atual.sessao?.token === anterior.sessao?.token) return
        DA_CONTA.forEach((queryKey) => queryClient.removeQueries({ queryKey }))
        void queryClient.resetQueries({ queryKey: ['problemas', 'detalhe'] })
        void queryClient.invalidateQueries()
      }),
    [queryClient],
  )
}
