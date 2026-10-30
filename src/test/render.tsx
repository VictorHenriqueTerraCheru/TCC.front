import { QueryClientProvider } from '@tanstack/react-query'
import { render } from '@testing-library/react'
import type { ReactElement } from 'react'
import { createMemoryRouter, type RouteObject } from 'react-router'
import { RouterProvider } from 'react-router/dom'

import { MotionProvider } from '@/common/components/provedor-movimento'
import { createQueryClient } from '@/infrastructure/query/query-client'

export function setWidth(width: number) {
  Object.defineProperty(window, 'innerWidth', { configurable: true, value: width })
}

function testQueryClient() {
  const client = createQueryClient()
  client.setDefaultOptions({ queries: { retry: false, staleTime: Infinity } })
  return client
}

export function renderWithProviders(ui: ReactElement) {
  return render(
    <QueryClientProvider client={testQueryClient()}>
      <MotionProvider>{ui}</MotionProvider>
    </QueryClientProvider>,
  )
}

export function renderRoutes(routes: RouteObject[], path = '/') {
  const router = createMemoryRouter(routes, { initialEntries: [path] })
  return {
    router,
    ...render(
      <QueryClientProvider client={testQueryClient()}>
        <MotionProvider>
          <RouterProvider router={router} />
        </MotionProvider>
      </QueryClientProvider>,
    ),
  }
}
