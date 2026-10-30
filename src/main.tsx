import { setWorkerUrl } from 'maplibre-gl'
import mapWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?url'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { App } from '@/app/app'
import { authProvider } from '@/features/auth'
import { registerAuthProvider } from '@/infrastructure/api'
import { env } from '@/infrastructure/env'

import './index.css'

registerAuthProvider(authProvider)

setWorkerUrl(mapWorkerUrl)

if (import.meta.env.DEV && env.mocksEnabled) {
  const { startMocks } = await import('@/infrastructure/mocks/browser')
  await startMocks()
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
