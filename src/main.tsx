import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { App } from '@/app/app'
import { provedorAutenticacao } from '@/features/auth'
import { registrarAutenticacao } from '@/infrastructure/api'
import { env } from '@/infrastructure/env'

import './index.css'

// Composição (≈ Program.cs do back): liga a sessão ao cliente HTTP antes da primeira chamada.
registrarAutenticacao(provedorAutenticacao)

if (import.meta.env.DEV && env.usarMocks) {
  const { iniciarMocks } = await import('@/infrastructure/mocks/browser')
  await iniciarMocks()
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
