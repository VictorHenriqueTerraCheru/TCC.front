import { QueryClientProvider } from '@tanstack/react-query'
import { useEffect, useState, type ReactNode } from 'react'

import { ProvedorMovimento } from '@/common/components/provedor-movimento'
import { categoriasQuery, gruposQuery } from '@/features/categorias'
import { criarQueryClient } from '@/infrastructure/query/query-client'

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(criarQueryClient)
  useEffect(() => {
    void queryClient.prefetchQuery(gruposQuery)
    void queryClient.prefetchQuery(categoriasQuery)
  }, [queryClient])
  return (
    <QueryClientProvider client={queryClient}>
      <ProvedorMovimento>{children}</ProvedorMovimento>
    </QueryClientProvider>
  )
}
