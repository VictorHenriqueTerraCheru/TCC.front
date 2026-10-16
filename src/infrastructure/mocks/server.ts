import { setupServer } from 'msw/node'

import { handlers } from './handlers'

/** API falsa dos testes (Vitest). Cada teste pode sobrescrever com server.use(...). */
export const server = setupServer(...handlers)
