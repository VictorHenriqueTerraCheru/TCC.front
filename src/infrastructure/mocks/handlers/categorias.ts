import { http, HttpResponse } from 'msw'

import type { Schema } from '../../api'
import { banco } from '../banco'
import { rota } from '../rota'
import { erroDeRegra } from './comum'
import { exigirAdmin } from './usuarios'

const mensagens = {
  'nome-duplicado': [409, 'Já existe uma categoria com este nome.'],
  'grupo-tipo-incompativel': [422, 'O grupo escolhido é de outro tipo (problema ou incidente).'],
  'grupo-rotulo-duplicado': [409, 'Já existe um grupo com este nome.'],
  'grupo-em-uso': [409, 'O grupo tem categorias e não pode ser apagado.'],
} as const

function erroDe(codigo: keyof typeof mensagens | 'grupo-inexistente' | 'nao-encontrado') {
  if (codigo === 'nao-encontrado') return new HttpResponse(null, { status: 404 })
  if (codigo === 'grupo-inexistente') {
    return HttpResponse.json(
      {
        title: 'Erro de validação.',
        status: 400,
        errors: { grupo: ['Grupo inexistente.'] },
      },
      { status: 400 },
    )
  }
  const [status, titulo] = mensagens[codigo]
  return erroDeRegra(status, codigo, titulo)
}

export const categoriasHandlers = [
  http.get(rota('/categorias'), () => HttpResponse.json(banco.categoriasAtivas())),
  http.get(rota('/grupos'), () => HttpResponse.json(banco.grupos())),

  http.get(rota('/admin/categorias'), ({ request }) => {
    return exigirAdmin(request) ?? HttpResponse.json(banco.categoriasTodas())
  }),
  http.post<never, Schema<'CriarCategoriaRequest'>>(
    rota('/admin/categorias'),
    async ({ request }) => {
      const negado = exigirAdmin(request)
      if (negado) return negado
      const resultado = banco.criarCategoria(await request.json())
      return typeof resultado === 'string'
        ? erroDe(resultado)
        : HttpResponse.json(resultado, { status: 201 })
    },
  ),
  http.put<{ id: string }, Schema<'EditarCategoriaRequest'>>(
    rota('/admin/categorias/:id'),
    async ({ request, params }) => {
      const negado = exigirAdmin(request)
      if (negado) return negado
      const resultado = banco.editarCategoria(Number(params.id), await request.json())
      return typeof resultado === 'string' ? erroDe(resultado) : HttpResponse.json(resultado)
    },
  ),
  http.patch<{ id: string }, Schema<'AlterarAtivaCategoriaRequest'>>(
    rota('/admin/categorias/:id/ativa'),
    async ({ request, params }) => {
      const negado = exigirAdmin(request)
      if (negado) return negado
      const { ativa } = await request.json()
      return banco.alterarAtivaCategoria(Number(params.id), ativa)
        ? new HttpResponse(null, { status: 204 })
        : erroDe('nao-encontrado')
    },
  ),

  http.post<never, Schema<'CriarGrupoRequest'>>(rota('/admin/grupos'), async ({ request }) => {
    const negado = exigirAdmin(request)
    if (negado) return negado
    const { rotulo, tipo, cor } = await request.json()
    const resultado = banco.criarGrupo(rotulo, tipo, cor)
    return typeof resultado === 'string'
      ? erroDe(resultado)
      : HttpResponse.json(resultado, { status: 201 })
  }),
  http.put<{ chave: string }, Schema<'EditarGrupoRequest'>>(
    rota('/admin/grupos/:chave'),
    async ({ request, params }) => {
      const negado = exigirAdmin(request)
      if (negado) return negado
      const { rotulo, cor, ordem } = await request.json()
      const resultado = banco.editarGrupo(params.chave, rotulo, cor, ordem)
      return typeof resultado === 'string' ? erroDe(resultado) : HttpResponse.json(resultado)
    },
  ),
  http.delete<{ chave: string }>(rota('/admin/grupos/:chave'), ({ request, params }) => {
    const negado = exigirAdmin(request)
    if (negado) return negado
    const resultado = banco.apagarGrupo(params.chave)
    return resultado === 'ok' ? new HttpResponse(null, { status: 204 }) : erroDe(resultado)
  }),
]
