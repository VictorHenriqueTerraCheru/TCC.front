import { useMutation, useQueryClient } from '@tanstack/react-query'

import { meQuery } from '@/features/usuarios'
import { api, dados } from '@/infrastructure/api'

import type { TipoVinculo } from '../models/verificacao'

export function useSolicitarVerificacao() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (corpo: { affiliationType: TipoVinculo; justification: string }) =>
      api.POST('/verifications', { body: corpo }).then(dados),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: meQuery.queryKey }),
  })
}
