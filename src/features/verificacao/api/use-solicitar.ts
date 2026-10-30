import { useMutation, useQueryClient } from '@tanstack/react-query'

import { meQuery } from '@/features/usuarios'
import { api, unwrapData } from '@/infrastructure/api'

import type { AffiliationType } from '../models/verificacao'

export function useRequestVerification() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: { affiliationType: AffiliationType; justification: string }) =>
      api.POST('/verifications', { body }).then(unwrapData),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: meQuery.queryKey }),
  })
}
