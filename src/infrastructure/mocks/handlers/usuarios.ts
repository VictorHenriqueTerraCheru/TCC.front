import { http, HttpResponse } from 'msw'

import type { Schema } from '../../api'
import { banco } from '../banco'
import { rota } from '../rota'
import { erroDeRegra, paginar } from './comum'

const exigirToken = (request: Request) =>
  request.headers.has('Authorization') ? null : new HttpResponse(null, { status: 401 })

export const usuariosHandlers = [
  http.get(
    rota('/me'),
    ({ request }) => exigirToken(request) ?? HttpResponse.json(banco.me(request)),
  ),
  http.patch<never, Schema<'AtualizarMeRequest'>>(rota('/me'), async ({ request }) => {
    const semToken = exigirToken(request)
    if (semToken) return semToken
    const nome = (await request.json()).nome.trim()
    if (nome.length < 1 || nome.length > 120) {
      return HttpResponse.json(
        {
          title: 'Erro de validação.',
          status: 400,
          errors: { nome: ['Informe um nome de 1 a 120 caracteres.'] },
        },
        { status: 400 },
      )
    }
    banco.renomear(banco.usuarioDoToken(request).id, nome)
    return HttpResponse.json(banco.me(request))
  }),
  http.get(rota('/me/historico'), ({ request }) => {
    const semToken = exigirToken(request)
    if (semToken) return semToken
    const url = new URL(request.url)
    return HttpResponse.json(
      paginar(banco.historico(url.searchParams.get('filtro') ?? 'tudo'), url),
    )
  }),
  http.post<never, Schema<'SolicitarVerificacaoRequest'>>(
    rota('/verificacoes'),
    async ({ request }) => {
      const semToken = exigirToken(request)
      if (semToken) return semToken
      const { tipoVinculo, justificativa } = await request.json()
      const texto = justificativa.trim()
      if (texto.length < 30 || texto.length > 500) {
        return HttpResponse.json(
          {
            title: 'Erro de validação.',
            status: 400,
            errors: { justificativa: ['Use de 30 a 500 caracteres.'] },
          },
          { status: 400 },
        )
      }
      const resultado = banco.solicitarVerificacao(request, tipoVinculo, texto)
      if (resultado === 'ja-verificado')
        return erroDeRegra(422, resultado, 'Usuário já verificado.')
      if (resultado === 'verificacao-pendente-existente') {
        return erroDeRegra(409, resultado, 'Já existe uma solicitação pendente.')
      }
      const { id, status, criadaEm } = resultado
      return HttpResponse.json(
        { id, tipoVinculo, justificativa: texto, status, criadaEm },
        { status: 201 },
      )
    },
  ),
]

export function exigirAdmin(request: Request) {
  const semToken = exigirToken(request)
  if (semToken) return semToken
  return banco.usuarioDoToken(request).perfil === 'administrador'
    ? null
    : new HttpResponse(null, { status: 403 })
}

export const adminHandlers = [
  http.get(rota('/admin/verificacoes'), ({ request }) => {
    const negado = exigirAdmin(request)
    if (negado) return negado
    const url = new URL(request.url)
    return HttpResponse.json(paginar(banco.verificacoes(url.searchParams.get('status')), url))
  }),
  http.post<{ id: string }>(rota('/admin/verificacoes/:id/aprovar'), ({ request, params }) => {
    const negado = exigirAdmin(request)
    if (negado) return negado
    return respostaAnalise(banco.analisarVerificacao(params.id, 'aprovada', null))
  }),
  http.post<{ id: string }, Schema<'RecusarVerificacaoRequest'>>(
    rota('/admin/verificacoes/:id/recusar'),
    async ({ request, params }) => {
      const negado = exigirAdmin(request)
      if (negado) return negado
      const { motivo } = await request.json()
      return respostaAnalise(banco.analisarVerificacao(params.id, 'recusada', motivo))
    },
  ),
]

adminHandlers.push(
  http.get(rota('/admin/usuarios'), ({ request }) => {
    const negado = exigirAdmin(request)
    if (negado) return negado
    const url = new URL(request.url)
    const perfil = url.searchParams.get('perfil')
    if (
      perfil &&
      !['cidadao', 'cidadaoverificado', 'administrador'].includes(perfil.toLowerCase())
    ) {
      return new HttpResponse(null, { status: 400 })
    }
    return HttpResponse.json(
      paginar(banco.usuariosAdmin(url.searchParams.get('busca'), perfil), url),
    )
  }),
  http.patch<{ id: string }, Schema<'AlterarPerfilRequest'>>(
    rota('/admin/usuarios/:id/perfil'),
    async ({ request, params }) => {
      const negado = exigirAdmin(request)
      if (negado) return negado
      const { perfil } = await request.json()
      const resultado = banco.alterarPerfilUsuario(
        banco.usuarioDoToken(request).id,
        params.id,
        perfil,
      )
      if (resultado === 'nao-encontrado') return new HttpResponse(null, { status: 404 })
      if (resultado === 'proprio-perfil') {
        return erroDeRegra(422, resultado, 'Você não pode alterar o seu próprio perfil.')
      }
      return new HttpResponse(null, { status: 204 })
    },
  ),
)

function respostaAnalise(resultado: 'ok' | 'nao-encontrada' | 'verificacao-ja-analisada') {
  if (resultado === 'nao-encontrada') return new HttpResponse(null, { status: 404 })
  if (resultado === 'verificacao-ja-analisada') {
    return erroDeRegra(409, resultado, 'A solicitação já foi analisada.')
  }
  return new HttpResponse(null, { status: 204 })
}
