import { http, HttpResponse } from 'msw'

import type { Schema } from '../../api'
import { database } from '../banco'
import { route } from '../rota'
import { ruleError, paginate } from './comum'

const requireToken = (request: Request) =>
  request.headers.has('Authorization') ? null : new HttpResponse(null, { status: 401 })

export const userHandlers = [
  http.get(
    route('/me'),
    ({ request }) => requireToken(request) ?? HttpResponse.json(database.me(request)),
  ),
  http.patch<never, Schema<'UpdateMeRequest'>>(route('/me'), async ({ request }) => {
    const noToken = requireToken(request)
    if (noToken) return noToken
    const name = (await request.json()).name.trim()
    if (name.length < 1 || name.length > 120) {
      return HttpResponse.json(
        {
          title: 'Erro de validação.',
          status: 400,
          errors: { name: ['Informe um nome de 1 a 120 caracteres.'] },
        },
        { status: 400 },
      )
    }
    database.rename(database.userFromToken(request).id, name)
    return HttpResponse.json(database.me(request))
  }),
  http.get(route('/me/history'), ({ request }) => {
    const noToken = requireToken(request)
    if (noToken) return noToken
    const url = new URL(request.url)
    return HttpResponse.json(
      paginate(database.history(url.searchParams.get('filter') ?? 'all'), url),
    )
  }),
  http.post<never, Schema<'RequestVerificationRequest'>>(
    route('/verifications'),
    async ({ request }) => {
      const noToken = requireToken(request)
      if (noToken) return noToken
      const { affiliationType, justification } = await request.json()
      const text = justification.trim()
      if (text.length < 30 || text.length > 500) {
        return HttpResponse.json(
          {
            title: 'Erro de validação.',
            status: 400,
            errors: { justification: ['Use de 30 a 500 caracteres.'] },
          },
          { status: 400 },
        )
      }
      const result = database.requestVerification(request, affiliationType, text)
      if (result === 'already-verified') return ruleError(422, result, 'Usuário já verificado.')
      if (result === 'verification-already-pending') {
        return ruleError(409, result, 'Já existe uma solicitação pendente.')
      }
      const { id, status, createdAt } = result
      return HttpResponse.json(
        { id, affiliationType, justification: text, status, createdAt },
        { status: 201 },
      )
    },
  ),
]

export function requireAdmin(request: Request) {
  const noToken = requireToken(request)
  if (noToken) return noToken
  return database.userFromToken(request).role === 'administrator'
    ? null
    : new HttpResponse(null, { status: 403 })
}

export const adminHandlers = [
  http.get(route('/admin/verifications'), ({ request }) => {
    const denied = requireAdmin(request)
    if (denied) return denied
    const url = new URL(request.url)
    return HttpResponse.json(paginate(database.verifications(url.searchParams.get('status')), url))
  }),
  http.post<{ id: string }>(route('/admin/verifications/:id/approve'), ({ request, params }) => {
    const denied = requireAdmin(request)
    if (denied) return denied
    return reviewResponse(database.reviewVerification(params.id, 'approved', null))
  }),
  http.post<{ id: string }, Schema<'RejectVerificationRequest'>>(
    route('/admin/verifications/:id/reject'),
    async ({ request, params }) => {
      const denied = requireAdmin(request)
      if (denied) return denied
      const { reason } = await request.json()
      return reviewResponse(database.reviewVerification(params.id, 'rejected', reason))
    },
  ),
]

adminHandlers.push(
  http.get(route('/admin/users'), ({ request }) => {
    const denied = requireAdmin(request)
    if (denied) return denied
    const url = new URL(request.url)
    const role = url.searchParams.get('role')
    if (role && !['citizen', 'verifiedcitizen', 'administrator'].includes(role.toLowerCase())) {
      return new HttpResponse(null, { status: 400 })
    }
    return HttpResponse.json(
      paginate(database.adminUsers(url.searchParams.get('search'), role), url),
    )
  }),
  http.patch<{ id: string }, Schema<'ChangeRoleRequest'>>(
    route('/admin/users/:id/role'),
    async ({ request, params }) => {
      const denied = requireAdmin(request)
      if (denied) return denied
      const { role } = await request.json()
      const result = database.setUserRole(database.userFromToken(request).id, params.id, role)
      if (result === 'not-found') return new HttpResponse(null, { status: 404 })
      if (result === 'own-role') {
        return ruleError(422, result, 'Você não pode alterar o seu próprio perfil.')
      }
      return new HttpResponse(null, { status: 204 })
    },
  ),
)

function reviewResponse(result: 'ok' | 'not-found' | 'verification-already-reviewed') {
  if (result === 'not-found') return new HttpResponse(null, { status: 404 })
  if (result === 'verification-already-reviewed') {
    return ruleError(409, result, 'A solicitação já foi analisada.')
  }
  return new HttpResponse(null, { status: 204 })
}
