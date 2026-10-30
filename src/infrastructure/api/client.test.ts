import { http, HttpResponse } from 'msw'

import { server } from '../mocks/server'
import { route } from '../mocks/rota'
import { ApiError } from './api-error'
import { registerAuthProvider } from './autenticacao'
import { api, unwrapData } from './client'

describe('API client', () => {
  const onSessionExpired = vi.fn()
  let token: string | null = null

  beforeEach(() => {
    token = null
    onSessionExpired.mockReset()
    registerAuthProvider({ getToken: () => token, onSessionExpired })
  })

  it('sends the JWT in Authorization when there is a session', async () => {
    token = 'test-jwt'
    let received: string | null = null
    server.use(
      http.get(route('/me'), ({ request }) => {
        received = request.headers.get('Authorization')
        return HttpResponse.json({})
      }),
    )

    await api.GET('/me')

    expect(received).toBe('Bearer test-jwt')
  })

  it('does not send the JWT to /auth/*', async () => {
    token = 'jwt-old'
    let received: string | null = 'not-called'
    server.use(
      http.post(route('/auth/login'), ({ request }) => {
        received = request.headers.get('Authorization')
        return HttpResponse.json({}, { status: 401 })
      }),
    )

    await api.POST('/auth/login', { body: { email: 'a@b.c', password: '12345678' } })

    expect(received).toBeNull()
    expect(onSessionExpired).not.toHaveBeenCalled()
  })

  it('401 on an authenticated call expires the session (rule 13)', async () => {
    token = 'jwt-expired'
    server.use(http.get(route('/me'), () => new HttpResponse(null, { status: 401 })))

    await expect(api.GET('/me').then(unwrapData)).rejects.toMatchObject({ status: 401 })
    expect(onSessionExpired).toHaveBeenCalledOnce()
  })

  it('401 from a call made with the old token does not expire the new session', async () => {
    token = 'jwt-a'
    server.use(
      http.get(route('/me'), async () => {
        await new Promise((r) => setTimeout(r, 20))
        return new HttpResponse(null, { status: 401 })
      }),
    )

    const pending = api.GET('/me')
    token = 'jwt-b'
    await pending

    expect(onSessionExpired).not.toHaveBeenCalled()
  })

  it('converts ProblemDetails into ApiError with type and errors', async () => {
    server.use(
      http.post(route('/auth/register'), () =>
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

    const error = await api
      .POST('/auth/register', {
        body: { name: 'Ana', email: 'ana@x.com', password: '12345678', acceptedTerms: true },
      })
      .then(unwrapData)
      .catch((e: unknown) => e)

    expect(error).toBeInstanceOf(ApiError)
    expect(error).toMatchObject({
      status: 409,
      type: 'email-already-registered',
      title: 'Já existe uma conta com este e-mail.',
    })
    expect((error as ApiError).fieldError('email')).toBe('E-mail em uso.')
  })
})
