import { http, HttpResponse } from 'msw'

import type { Schema } from '../../api'
import { banco } from '../banco'
import { rota } from '../rota'
import { erroDeRegra } from './comum'

function respostaAuth({ id, name: nome, email, role: perfil }: Schema<'AuthResponseUserSummary'>) {
  return {
    token: `mock-jwt-${id}`,
    expiresAt: new Date(Date.now() + 7 * 86_400_000).toISOString(),
    user: { id, name: nome, email, role: perfil },
  }
}

export const authHandlers = [
  http.post<never, Schema<'LoginRequest'>>(rota('/auth/login'), async ({ request }) => {
    const { email, password: senha } = await request.json()
    const usuario = banco.usuarioPorEmail(email)
    if (!usuario || usuario.password !== senha) {
      return HttpResponse.json(
        { title: 'E-mail ou senha inválidos.', status: 401 },
        { status: 401 },
      )
    }
    return HttpResponse.json(respostaAuth(usuario))
  }),
  http.post<never, Schema<'RegisterRequest'>>(rota('/auth/register'), async ({ request }) => {
    const { name: nome, email, password: senha } = await request.json()
    if (banco.usuarioPorEmail(email)) {
      return erroDeRegra(409, 'email-already-registered', 'Já existe uma conta com este e-mail.')
    }
    return HttpResponse.json(respostaAuth(banco.cadastrar(nome, email, senha)), { status: 201 })
  }),
]
