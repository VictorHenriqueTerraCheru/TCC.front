import { http, HttpResponse } from 'msw'

import type { Schema } from '../../api'
import { database } from '../banco'
import { route } from '../rota'
import { ruleError } from './comum'
import { requireAdmin } from './usuarios'

const messages = {
  'duplicate-name': [409, 'Já existe uma categoria com este nome.'],
  'group-type-mismatch': [422, 'O grupo escolhido é de outro tipo (problema ou incidente).'],
  'duplicate-group-label': [409, 'Já existe um grupo com este nome.'],
  'group-in-use': [409, 'O grupo tem categorias e não pode ser apagado.'],
} as const

function errorOf(code: keyof typeof messages | 'missing-group' | 'not-found') {
  if (code === 'not-found') return new HttpResponse(null, { status: 404 })
  if (code === 'missing-group') {
    return HttpResponse.json(
      {
        title: 'Erro de validação.',
        status: 400,
        errors: { group: ['Grupo inexistente.'] },
      },
      { status: 400 },
    )
  }
  const [status, title] = messages[code]
  return ruleError(status, code, title)
}

export const categoryHandlers = [
  http.get(route('/categories'), () => HttpResponse.json(database.activeCategories())),
  http.get(route('/groups'), () => HttpResponse.json(database.groups())),

  http.get(route('/admin/categories'), ({ request }) => {
    return requireAdmin(request) ?? HttpResponse.json(database.allCategories())
  }),
  http.post<never, Schema<'CreateCategoryRequest'>>(
    route('/admin/categories'),
    async ({ request }) => {
      const denied = requireAdmin(request)
      if (denied) return denied
      const result = database.createCategory(await request.json())
      return typeof result === 'string'
        ? errorOf(result)
        : HttpResponse.json(result, { status: 201 })
    },
  ),
  http.put<{ id: string }, Schema<'EditCategoryRequest'>>(
    route('/admin/categories/:id'),
    async ({ request, params }) => {
      const denied = requireAdmin(request)
      if (denied) return denied
      const result = database.editCategory(Number(params.id), await request.json())
      return typeof result === 'string' ? errorOf(result) : HttpResponse.json(result)
    },
  ),
  http.patch<{ id: string }, Schema<'SetCategoryActiveRequest'>>(
    route('/admin/categories/:id/active'),
    async ({ request, params }) => {
      const denied = requireAdmin(request)
      if (denied) return denied
      const { active } = await request.json()
      return database.setCategoryActive(Number(params.id), active)
        ? new HttpResponse(null, { status: 204 })
        : errorOf('not-found')
    },
  ),

  http.post<never, Schema<'CreateGroupRequest'>>(route('/admin/groups'), async ({ request }) => {
    const denied = requireAdmin(request)
    if (denied) return denied
    const { label, type, color } = await request.json()
    const result = database.createGroup(label, type, color)
    return typeof result === 'string' ? errorOf(result) : HttpResponse.json(result, { status: 201 })
  }),
  http.put<{ key: string }, Schema<'EditGroupRequest'>>(
    route('/admin/groups/:key'),
    async ({ request, params }) => {
      const denied = requireAdmin(request)
      if (denied) return denied
      const { label, color, sortOrder: order } = await request.json()
      const result = database.editGroup(params.key, label, color, order)
      return typeof result === 'string' ? errorOf(result) : HttpResponse.json(result)
    },
  ),
  http.delete<{ key: string }>(route('/admin/groups/:key'), ({ request, params }) => {
    const denied = requireAdmin(request)
    if (denied) return denied
    const result = database.deleteGroup(params.key)
    return result === 'ok' ? new HttpResponse(null, { status: 204 }) : errorOf(result)
  }),
]
