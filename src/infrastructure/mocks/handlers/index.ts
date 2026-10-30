import { authHandlers } from './auth'
import { categoryHandlers } from './categorias'
import { geocodingHandlers } from './geocodificacao'
import { incidentHandlers } from './incidentes'
import { issueHandlers } from './problemas'
import { adminHandlers, userHandlers } from './usuarios'

export const handlers = [
  ...authHandlers,
  ...categoryHandlers,
  ...issueHandlers,
  ...incidentHandlers,
  ...geocodingHandlers,
  ...userHandlers,
  ...adminHandlers,
]
