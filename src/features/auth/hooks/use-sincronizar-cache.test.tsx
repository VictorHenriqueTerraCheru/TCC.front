import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'

import { entrarComo, entrarComoAdmin, sair } from '@/test/sessao'

import { useSincronizarCacheComSessao } from './use-sincronizar-cache'

test('na troca de conta, o detalhe em cache (meuVoto, souAutor) não é servido à conta nova', () => {
  entrarComoAdmin()
  const queryClient = new QueryClient()
  queryClient.setQueryData(['problemas', 'detalhe', 'p1'], { myVote: 'yes', isAuthor: true })
  renderHook(useSincronizarCacheComSessao, {
    wrapper: ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  })

  entrarComo('u-cidadao2', 'João Pereira')

  expect(queryClient.getQueryData(['problemas', 'detalhe', 'p1'])).toBeUndefined()
  sair()
})

test('na troca de conta, /me e a fila do admin saem do cache; o resto só fica velho', () => {
  entrarComoAdmin()
  const queryClient = new QueryClient()
  queryClient.setQueryData(['me'], { name: 'Admin TCC' })
  queryClient.setQueryData(['admin', 'verificacoes', 'pending'], { items: [] })
  queryClient.setQueryData(['categorias'], [])
  renderHook(useSincronizarCacheComSessao, {
    wrapper: ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  })

  entrarComo('u-cidadao2', 'João Pereira')

  expect(queryClient.getQueryData(['me'])).toBeUndefined()
  expect(queryClient.getQueryData(['admin', 'verificacoes', 'pending'])).toBeUndefined()
  expect(queryClient.getQueryData(['categorias'])).toEqual([])
  expect(queryClient.getQueryState(['categorias'])?.isInvalidated).toBe(true)
  sair()
})
