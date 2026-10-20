import { QueryClientProvider } from '@tanstack/react-query'
import { useEffect, useState, type ReactNode } from 'react'

import { categoriasQuery, gruposQuery } from '@/features/categorias'
import { criarQueryClient } from '@/infrastructure/query/query-client'

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(criarQueryClient)
  // Cor, rótulo e ícone das categorias dependem destes dois: pedidos já na abertura do app, para
  // o primeiro marcador do mapa não aparecer em cinza.
  useEffect(() => {
    void queryClient.prefetchQuery(gruposQuery)
    void queryClient.prefetchQuery(categoriasQuery)
  }, [queryClient])
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
