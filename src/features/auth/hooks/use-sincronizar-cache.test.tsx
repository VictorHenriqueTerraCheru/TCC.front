import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'

import { loginAs, loginAsAdmin, logout } from '@/test/sessao'

import { useSyncCacheWithSession } from './use-sincronizar-cache'

test('when switching accounts, the cached detail (myVote, isAuthor) is not served to the new account', () => {
  loginAsAdmin()
  const queryClient = new QueryClient()
  queryClient.setQueryData(['issues', 'detail', 'p1'], { myVote: 'yes', isAuthor: true })
  renderHook(useSyncCacheWithSession, {
    wrapper: ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  })

  loginAs('u-citizen2', 'João Pereira')

  expect(queryClient.getQueryData(['issues', 'detail', 'p1'])).toBeUndefined()
  logout()
})

test('when switching accounts, /me and the admin queue leave the cache; the rest only becomes stale', () => {
  loginAsAdmin()
  const queryClient = new QueryClient()
  queryClient.setQueryData(['me'], { name: 'Admin TCC' })
  queryClient.setQueryData(['admin', 'verifications', 'pending'], { items: [] })
  queryClient.setQueryData(['categories'], [])
  renderHook(useSyncCacheWithSession, {
    wrapper: ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  })

  loginAs('u-citizen2', 'João Pereira')

  expect(queryClient.getQueryData(['me'])).toBeUndefined()
  expect(queryClient.getQueryData(['admin', 'verifications', 'pending'])).toBeUndefined()
  expect(queryClient.getQueryData(['categories'])).toEqual([])
  expect(queryClient.getQueryState(['categories'])?.isInvalidated).toBe(true)
  logout()
})
