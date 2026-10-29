import { setupWorker } from 'msw/browser'

import { handlers } from './handlers'

export async function iniciarMocks() {
  await setupWorker(...handlers).start({ onUnhandledFrame: 'bypass' })
}
