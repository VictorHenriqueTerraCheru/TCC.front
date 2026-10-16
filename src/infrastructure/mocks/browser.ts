import { setupWorker } from 'msw/browser'

import { handlers } from './handlers'

/** API falsa no navegador (VITE_USE_MOCKS=true). O worker é servido pelo plugin msw/vite. */
export async function iniciarMocks() {
  await setupWorker(...handlers).start({ onUnhandledFrame: 'bypass' })
}
