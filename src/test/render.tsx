import { QueryClientProvider } from '@tanstack/react-query'
import { render } from '@testing-library/react'
import type { ReactElement } from 'react'
import { createMemoryRouter, type RouteObject } from 'react-router'
import { RouterProvider } from 'react-router/dom'

import { ProvedorMovimento } from '@/common/components/provedor-movimento'
import { criarQueryClient } from '@/infrastructure/query/query-client'

export function definirLargura(largura: number) {
  Object.defineProperty(window, 'innerWidth', { configurable: true, value: largura })
}

function queryClientDeTeste() {
  const client = criarQueryClient()
  client.setDefaultOptions({ queries: { retry: false, staleTime: Infinity } })
  return client
}

export function renderizar(ui: ReactElement) {
  return render(
    <QueryClientProvider client={queryClientDeTeste()}>
      <ProvedorMovimento>{ui}</ProvedorMovimento>
    </QueryClientProvider>,
  )
}

export function renderizarRotas(rotas: RouteObject[], caminho = '/') {
  const router = createMemoryRouter(rotas, { initialEntries: [caminho] })
  return {
    router,
    ...render(
      <QueryClientProvider client={queryClientDeTeste()}>
        <ProvedorMovimento>
          <RouterProvider router={router} />
        </ProvedorMovimento>
      </QueryClientProvider>,
    ),
  }
}
