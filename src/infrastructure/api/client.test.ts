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

    await api.POST('/auth/login', { body: { email: 'a@b.c', password: '12345678' } })

    expect(recebido).toBeNull()
    expect(aoExpirarSessao).not.toHaveBeenCalled()
  })

  it('401 numa chamada autenticada expira a sessão (regra 13)', async () => {
    token = 'jwt-expirado'
    server.use(http.get(rota('/me'), () => new HttpResponse(null, { status: 401 })))

    await expect(api.GET('/me').then(dados)).rejects.toMatchObject({ status: 401 })
    expect(aoExpirarSessao).toHaveBeenCalledOnce()
  })

  it('401 de uma chamada feita com o token antigo não expira a sessão nova', async () => {
    token = 'jwt-a'
    server.use(
      http.get(rota('/me'), async () => {
        await new Promise((r) => setTimeout(r, 20))
        return new HttpResponse(null, { status: 401 })
      }),
    )

    const pendente = api.GET('/me')
    token = 'jwt-b'
    await pendente

    expect(aoExpirarSessao).not.toHaveBeenCalled()
  })

  it('converte ProblemDetails em ApiError com type e errors', async () => {
    server.use(
      http.post(rota('/auth/register'), () =>
        HttpResponse.json(
          {
            type: 'email-already-registered',
            title: 'Já existe uma conta com este e-mail.',
            status: 409,
            errors: { email: ['E-mail em uso.'] },
          },
          { status: 409, headers: { 'Content-Type': 'application/problem+json' } },
        ),
      ),
    )

    const erro = await api
      .POST('/auth/register', {
        body: { name: 'Ana', email: 'ana@x.com', password: '12345678', acceptedTerms: true },
      })
      .then(dados)
      .catch((e: unknown) => e)

    expect(erro).toBeInstanceOf(ApiError)
    expect(erro).toMatchObject({
      status: 409,
      type: 'email-already-registered',
      title: 'Já existe uma conta com este e-mail.',
    })
    expect((erro as ApiError).erroDoCampo('email')).toBe('E-mail em uso.')
  })
})
