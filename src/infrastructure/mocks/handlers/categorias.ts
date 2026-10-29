import { http, HttpResponse } from 'msw'

import type { Schema } from '../../api'
import { banco } from '../banco'
import { rota } from '../rota'
import { erroDeRegra } from './comum'
import { exigirAdmin } from './usuarios'

const mensagens = {
  'duplicate-name': [409, 'Já existe uma categoria com este nome.'],
  'group-type-mismatch': [422, 'O grupo escolhido é de outro tipo (problema ou incidente).'],
  'duplicate-group-label': [409, 'Já existe um grupo com este nome.'],
  'group-in-use': [409, 'O grupo tem categorias e não pode ser apagado.'],
} as const

function erroDe(codigo: keyof typeof mensagens | 'grupo-inexistente' | 'nao-encontrado') {
  if (codigo === 'nao-encontrado') return new HttpResponse(null, { status: 404 })
  if (codigo === 'grupo-inexistente') {
    return HttpResponse.json(
      {
        title: 'Erro de validação.',
        status: 400,
        errors: { group: ['Grupo inexistente.'] },
      },
      { status: 400 },
    )
  }
  const [status, titulo] = mensagens[codigo]
  return erroDeRegra(status, codigo, titulo)
}

export const categoriasHandlers = [
  http.get(rota('/categories'), () => HttpResponse.json(banco.categoriasAtivas())),
  http.get(rota('/groups'), () => HttpResponse.json(banco.grupos())),

  http.get(rota('/admin/categories'), ({ request }) => {
    return exigirAdmin(request) ?? HttpResponse.json(banco.categoriasTodas())
  }),
  http.post<never, Schema<'CreateCategoryRequest'>>(
    rota('/admin/categories'),
    async ({ request }) => {
      const negado = exigirAdmin(request)
      if (negado) return negado
      const resultado = banco.criarCategoria(await request.json())
      return typeof resultado === 'string'
        ? erroDe(resultado)
        : HttpResponse.json(resultado, { status: 201 })
    },
  ),
  http.put<{ id: string }, Schema<'EditCategoryRequest'>>(
    rota('/admin/categories/:id'),
    async ({ request, params }) => {
      const negado = exigirAdmin(request)
      if (negado) return negado
      const resultado = banco.editarCategoria(Number(params.id), await request.json())
      return typeof resultado === 'string' ? erroDe(resultado) : HttpResponse.json(resultado)
    },
  ),
  http.patch<{ id: string }, Schema<'SetCategoryActiveRequest'>>(
    rota('/admin/categories/:id/active'),
    async ({ request, params }) => {
      const negado = exigirAdmin(request)
      if (negado) return negado
      const { active: ativa } = await request.json()
      return banco.alterarAtivaCategoria(Number(params.id), ativa)
        ? new HttpResponse(null, { status: 204 })
        : erroDe('nao-encontrado')
    },
  ),

  http.post<never, Schema<'CreateGroupRequest'>>(rota('/admin/groups'), async ({ request }) => {
    const negado = exigirAdmin(request)
    if (negado) return negado
    const { label: rotulo, type: tipo, color: cor } = await request.json()
    const resultado = banco.criarGrupo(rotulo, tipo, cor)
    return typeof resultado === 'string'
      ? erroDe(resultado)
      : HttpResponse.json(resultado, { status: 201 })
  }),
  http.put<{ key: string }, Schema<'EditGroupRequest'>>(
    rota('/admin/groups/:key'),
    async ({ request, params }) => {
      const negado = exigirAdmin(request)
      if (negado) return negado
      const { label: rotulo, color: cor, sortOrder: ordem } = await request.json()
      const resultado = banco.editarGrupo(params.key, rotulo, cor, ordem)
      return typeof resultado === 'string' ? erroDe(resultado) : HttpResponse.json(resultado)
    },
  ),
  http.delete<{ key: string }>(rota('/admin/groups/:key'), ({ request, params }) => {
    const negado = exigirAdmin(request)
    if (negado) return negado
    const resultado = banco.apagarGrupo(params.key)
    return resultado === 'ok' ? new HttpResponse(null, { status: 204 }) : erroDe(resultado)
  }),
]
