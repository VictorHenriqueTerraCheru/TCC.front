import { setWorkerUrl } from 'maplibre-gl'
import urlWorkerMapa from 'maplibre-gl/dist/maplibre-gl-worker.mjs?url'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { App } from '@/app/app'
import { provedorAutenticacao } from '@/features/auth'
import { registrarAutenticacao } from '@/infrastructure/api'
import { env } from '@/infrastructure/env'

import './index.css'

registrarAutenticacao(provedorAutenticacao)

setWorkerUrl(urlWorkerMapa)

if (import.meta.env.DEV && env.usarMocks) {
  const { iniciarMocks } = await import('@/infrastructure/mocks/browser')
  await iniciarMocks()
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
