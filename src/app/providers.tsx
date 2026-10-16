import { QueryClientProvider } from '@tanstack/react-query'
import { useState, type ReactNode } from 'react'

import { criarQueryClient } from '@/infrastructure/query/query-client'

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(criarQueryClient)
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
