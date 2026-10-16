import { useState } from 'react'
import { RouterProvider } from 'react-router/dom'

import { Providers } from './providers'
import { criarRouter } from './router'

export function App() {
  const [router] = useState(criarRouter)
  return (
    <Providers>
      <RouterProvider router={router} />
    </Providers>
  )
}
