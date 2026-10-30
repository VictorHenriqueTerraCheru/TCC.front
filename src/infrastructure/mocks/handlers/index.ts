import { authHandlers } from './auth'
import { categoryHandlers } from './categories'
import { geocodingHandlers } from './geocoding'
import { incidentHandlers } from './incidents'
import { issueHandlers } from './issues'
import { adminHandlers, userHandlers } from './users'

export const handlers = [
  ...authHandlers,
  ...categoryHandlers,
  ...issueHandlers,
  ...incidentHandlers,
  ...geocodingHandlers,
  ...userHandlers,
  ...adminHandlers,
]
