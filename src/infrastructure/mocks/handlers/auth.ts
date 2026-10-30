import { http, HttpResponse } from 'msw'

import type { Schema } from '../../api'
import { database } from '../database'
import { route } from '../route'
import { ruleError } from './common'

function authResponse({ id, name, email, role }: Schema<'AuthResponseUserSummary'>) {
  return {
    token: `mock-jwt-${id}`,
    expiresAt: new Date(Date.now() + 7 * 86_400_000).toISOString(),
    user: { id, name, email, role },
  }
}

export const authHandlers = [
  http.post<never, Schema<'LoginRequest'>>(route('/auth/login'), async ({ request }) => {
    const { email, password } = await request.json()
    const user = database.userByEmail(email)
    if (!user || user.password !== password) {
      return HttpResponse.json(
        { title: 'E-mail ou senha inválidos.', status: 401 },
        { status: 401 },
      )
    }
    return HttpResponse.json(authResponse(user))
  }),
  http.post<never, Schema<'RegisterRequest'>>(route('/auth/register'), async ({ request }) => {
    const { name, email, password } = await request.json()
    if (database.userByEmail(email)) {
      return ruleError(409, 'email-already-registered', 'Já existe uma conta com este e-mail.')
    }
    return HttpResponse.json(authResponse(database.register(name, email, password)), {
      status: 201,
    })
  }),
]
