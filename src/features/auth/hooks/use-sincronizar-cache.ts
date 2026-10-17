import { useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'

import { useSessaoStore } from '../stores/sessao-store'

// Dados da conta (perfil, histórico, fila do admin): saem do cache na troca de sessão, senão a
// próxima conta veria os da anterior enquanto a nova busca não volta.
const DA_CONTA = [['me'], ['admin']]

/**
 * Entrou, saiu ou expirou: as respostas em cache podem depender do usuário (meusVotos,
 * souAutor, /me). Os dados da conta são descartados; o resto é marcado como velho e as telas
 * abertas buscam de novo.
 */
export function useSincronizarCacheComSessao() {
  const queryClient = useQueryClient()
  useEffect(
    () =>
      useSessaoStore.subscribe((atual, anterior) => {
        if (atual.sessao?.token === anterior.sessao?.token) return
        DA_CONTA.forEach((queryKey) => queryClient.removeQueries({ queryKey }))
        void queryClient.invalidateQueries()
      }),
    [queryClient],
  )
}
