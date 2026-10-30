import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'

import { loginAsAdmin, logout } from '@/test/sessao'

import { useSetCategoryActive } from './use-categorias-admin'

describe('category mutations', () => {
  beforeEach(loginAsAdmin)
  afterEach(logout)

  it('reload everything that embeds the category', async () => {
    const client = new QueryClient()
    const invalidate = vi.spyOn(client, 'invalidateQueries')
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    )
    const { result } = renderHook(() => useSetCategoryActive(), { wrapper })

    result.current.mutate({ id: 1, active: false })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    const roots = invalidate.mock.calls.map(([filter]) => filter?.queryKey)
    expect(roots).toEqual(
      expect.arrayContaining([
        ['admin', 'categories'],
        ['categories'],
        ['issues'],
        ['incidents'],
        ['me', 'history'],
      ]),
    )
  })
})
