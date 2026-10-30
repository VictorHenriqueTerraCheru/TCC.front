import { QueryClientProvider } from '@tanstack/react-query'
import { useEffect, useState, type ReactNode } from 'react'

import { MotionProvider } from '@/common/components/provedor-movimento'
import { categoriesQuery, groupsQuery } from '@/features/categorias'
import { createQueryClient } from '@/infrastructure/query/query-client'

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(createQueryClient)
  useEffect(() => {
    void queryClient.prefetchQuery(groupsQuery)
    void queryClient.prefetchQuery(categoriesQuery)
  }, [queryClient])
  return (
    <QueryClientProvider client={queryClient}>
      <MotionProvider>{children}</MotionProvider>
    </QueryClientProvider>
  )
}
