import { useMutation, useQueryClient } from '@tanstack/react-query'

import { meQuery } from '@/features/usuarios'
import { api, dados } from '@/infrastructure/api'

import type { TipoVinculo } from '../models/verificacao'

// POST /verificacoes
export function useSolicitarVerificacao() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (corpo: { tipoVinculo: TipoVinculo; justificativa: string }) =>
      api.POST('/verificacoes', { body: corpo }).then(dados),
    // O perfil passa a mostrar "Pedido em análise".
    onSuccess: () => queryClient.invalidateQueries({ queryKey: meQuery.queryKey }),
  })
}
