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
  http.patch<never, Schema<'UpdateMeRequest'>>(rota('/me'), async ({ request }) => {
    const semToken = exigirToken(request)
    if (semToken) return semToken
    const nome = (await request.json()).name.trim()
    if (nome.length < 1 || nome.length > 120) {
      return HttpResponse.json(
        {
          title: 'Erro de validação.',
          status: 400,
          errors: { name: ['Informe um nome de 1 a 120 caracteres.'] },
        },
        { status: 400 },
      )
    }
    banco.renomear(banco.usuarioDoToken(request).id, nome)
    return HttpResponse.json(banco.me(request))
  }),
  http.get(rota('/me/history'), ({ request }) => {
    const semToken = exigirToken(request)
    if (semToken) return semToken
    const url = new URL(request.url)
    return HttpResponse.json(paginar(banco.historico(url.searchParams.get('filter') ?? 'all'), url))
  }),
  http.post<never, Schema<'RequestVerificationRequest'>>(
    rota('/verifications'),
    async ({ request }) => {
      const semToken = exigirToken(request)
      if (semToken) return semToken
      const { affiliationType: tipoVinculo, justification: justificativa } = await request.json()
      const texto = justificativa.trim()
      if (texto.length < 30 || texto.length > 500) {
        return HttpResponse.json(
          {
            title: 'Erro de validação.',
            status: 400,
            errors: { justification: ['Use de 30 a 500 caracteres.'] },
          },
          { status: 400 },
        )
      }
      const resultado = banco.solicitarVerificacao(request, tipoVinculo, texto)
      if (resultado === 'already-verified')
        return erroDeRegra(422, resultado, 'Usuário já verificado.')
      if (resultado === 'verification-already-pending') {
        return erroDeRegra(409, resultado, 'Já existe uma solicitação pendente.')
      }
      const { id, status, createdAt: criadaEm } = resultado
      return HttpResponse.json(
        { id, affiliationType: tipoVinculo, justification: texto, status, createdAt: criadaEm },
        { status: 201 },
      )
    },
  ),
]

export function exigirAdmin(request: Request) {
  const semToken = exigirToken(request)
  if (semToken) return semToken
  return banco.usuarioDoToken(request).role === 'administrator'
    ? null
    : new HttpResponse(null, { status: 403 })
}

export const adminHandlers = [
  http.get(rota('/admin/verifications'), ({ request }) => {
    const negado = exigirAdmin(request)
    if (negado) return negado
    const url = new URL(request.url)
    return HttpResponse.json(paginar(banco.verificacoes(url.searchParams.get('status')), url))
  }),
  http.post<{ id: string }>(rota('/admin/verifications/:id/approve'), ({ request, params }) => {
    const negado = exigirAdmin(request)
    if (negado) return negado
    return respostaAnalise(banco.analisarVerificacao(params.id, 'approved', null))
  }),
  http.post<{ id: string }, Schema<'RejectVerificationRequest'>>(
    rota('/admin/verifications/:id/reject'),
    async ({ request, params }) => {
      const negado = exigirAdmin(request)
      if (negado) return negado
      const { reason: motivo } = await request.json()
      return respostaAnalise(banco.analisarVerificacao(params.id, 'rejected', motivo))
    },
  ),
]

adminHandlers.push(
  http.get(rota('/admin/users'), ({ request }) => {
    const negado = exigirAdmin(request)
    if (negado) return negado
    const url = new URL(request.url)
    const perfil = url.searchParams.get('role')
    if (
      perfil &&
      !['citizen', 'cidadaoverificado', 'administrator'].includes(perfil.toLowerCase())
    ) {
      return new HttpResponse(null, { status: 400 })
    }
    return HttpResponse.json(
      paginar(banco.usuariosAdmin(url.searchParams.get('search'), perfil), url),
    )
  }),
  http.patch<{ id: string }, Schema<'ChangeRoleRequest'>>(
    rota('/admin/users/:id/role'),
    async ({ request, params }) => {
      const negado = exigirAdmin(request)
      if (negado) return negado
      const { role: perfil } = await request.json()
      const resultado = banco.alterarPerfilUsuario(
        banco.usuarioDoToken(request).id,
        params.id,
        perfil,
      )
      if (resultado === 'nao-encontrado') return new HttpResponse(null, { status: 404 })
      if (resultado === 'own-role') {
        return erroDeRegra(422, resultado, 'Você não pode alterar o seu próprio perfil.')
      }
      return new HttpResponse(null, { status: 204 })
    },
  ),
)

function respostaAnalise(resultado: 'ok' | 'nao-encontrada' | 'verification-already-reviewed') {
  if (resultado === 'nao-encontrada') return new HttpResponse(null, { status: 404 })
  if (resultado === 'verification-already-reviewed') {
    return erroDeRegra(409, resultado, 'A solicitação já foi analisada.')
  }
  return new HttpResponse(null, { status: 204 })
}
