import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'

import { entrarComoAdmin, sair } from '@/test/sessao'

import { useAlterarAtivaCategoria } from './use-categorias-admin'

describe('mutations de categoria', () => {
  beforeEach(entrarComoAdmin)
  afterEach(sair)

  it('recarregam tudo que traz a categoria embutida', async () => {
    const client = new QueryClient()
    const invalidar = vi.spyOn(client, 'invalidateQueries')
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    )
    const { result } = renderHook(() => useAlterarAtivaCategoria(), { wrapper })

    result.current.mutate({ id: 1, active: false })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    const raizes = invalidar.mock.calls.map(([filtro]) => filtro?.queryKey)
    expect(raizes).toEqual(
      expect.arrayContaining([
        ['admin', 'categorias'],
        ['categorias'],
        ['problemas'],
        ['incidentes'],
        ['me', 'historico'],
      ]),
    )
  })
})
