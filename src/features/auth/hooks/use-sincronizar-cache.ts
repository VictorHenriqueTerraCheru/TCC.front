import { useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'

import { useSessaoStore } from '../stores/sessao-store'

/**
 * Entrou, saiu ou expirou: as respostas em cache podem depender do usuário (meusVotos,
 * souAutor, /me). Tudo é marcado como velho e as telas abertas buscam de novo.
 */
export function useSincronizarCacheComSessao() {
  const queryClient = useQueryClient()
  useEffect(
    () =>
      useSessaoStore.subscribe((atual, anterior) => {
        if (atual.sessao?.token !== anterior.sessao?.token) void queryClient.invalidateQueries()
      }),
    [queryClient],
  )
}
