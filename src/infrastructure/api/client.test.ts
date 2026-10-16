import { http, HttpResponse } from 'msw'

import { server } from '../mocks/server'
import { rota } from '../mocks/rota'
import { ApiError } from './api-error'
import { registrarAutenticacao } from './autenticacao'
import { api, dados } from './client'

describe('cliente da API', () => {
  const aoExpirarSessao = vi.fn()
  let token: string | null = null

  beforeEach(() => {
    token = null
    aoExpirarSessao.mockReset()
    registrarAutenticacao({ obterToken: () => token, aoExpirarSessao })
  })

  it('envia o JWT no Authorization quando há sessão', async () => {
    token = 'jwt-de-teste'
    let recebido: string | null = null
    server.use(
      http.get(rota('/me'), ({ request }) => {
        recebido = request.headers.get('Authorization')
        return HttpResponse.json({})
      }),
    )

    await api.GET('/me')

    expect(recebido).toBe('Bearer jwt-de-teste')
  })

  it('não envia o JWT para /auth/*', async () => {
    token = 'jwt-antigo'
    let recebido: string | null = 'nao-chamado'
    server.use(
      http.post(rota('/auth/login'), ({ request }) => {
        recebido = request.headers.get('Authorization')
        return HttpResponse.json({}, { status: 401 })
      }),
    )

    await api.POST('/auth/login', { body: { email: 'a@b.c', senha: '12345678' } })

    expect(recebido).toBeNull()
    expect(aoExpirarSessao).not.toHaveBeenCalled()
  })

  it('401 numa chamada autenticada expira a sessão (regra 13)', async () => {
    token = 'jwt-expirado'
    server.use(http.get(rota('/me'), () => new HttpResponse(null, { status: 401 })))

    await expect(api.GET('/me').then(dados)).rejects.toMatchObject({ status: 401 })
    expect(aoExpirarSessao).toHaveBeenCalledOnce()
  })

  it('converte ProblemDetails em ApiError com type e errors', async () => {
    server.use(
      http.post(rota('/auth/cadastro'), () =>
        HttpResponse.json(
          {
            type: 'email-ja-cadastrado',
            title: 'Já existe uma conta com este e-mail.',
            status: 409,
            errors: { email: ['E-mail em uso.'] },
          },
          { status: 409, headers: { 'Content-Type': 'application/problem+json' } },
        ),
      ),
    )

    const erro = await api
      .POST('/auth/cadastro', {
        body: { nome: 'Ana', email: 'ana@x.com', senha: '12345678', aceitouTermos: true },
      })
      .then(dados)
      .catch((e: unknown) => e)

    expect(erro).toBeInstanceOf(ApiError)
    expect(erro).toMatchObject({
      status: 409,
      type: 'email-ja-cadastrado',
      title: 'Já existe uma conta com este e-mail.',
    })
    expect((erro as ApiError).erroDoCampo('email')).toBe('E-mail em uso.')
  })
})
