import { http, HttpResponse } from 'msw'

import type { Schema } from '../../api'
import { banco } from '../banco'
import { rota } from '../rota'
import { erroDeRegra } from './comum'

function respostaAuth({ id, nome, email, perfil }: Schema<'RespostaAuthUsuarioResumo'>) {
  return {
    token: `mock-jwt-${id}`,
    expiraEm: new Date(Date.now() + 7 * 86_400_000).toISOString(),
    usuario: { id, nome, email, perfil },
  }
}

export const authHandlers = [
  http.post<never, Schema<'EntrarRequest'>>(rota('/auth/login'), async ({ request }) => {
    const { email, senha } = await request.json()
    const usuario = banco.usuarioPorEmail(email)
    if (!usuario || usuario.senha !== senha) {
      return HttpResponse.json(
        { title: 'E-mail ou senha inválidos.', status: 401 },
        { status: 401 },
      )
    }
    return HttpResponse.json(respostaAuth(usuario))
  }),
  http.post<never, Schema<'CadastrarRequest'>>(rota('/auth/cadastro'), async ({ request }) => {
    const { nome, email, senha } = await request.json()
    if (banco.usuarioPorEmail(email)) {
      return erroDeRegra(409, 'email-ja-cadastrado', 'Já existe uma conta com este e-mail.')
    }
    return HttpResponse.json(respostaAuth(banco.cadastrar(nome, email, senha)), { status: 201 })
  }),
]
