import { ApiError } from '@/infrastructure/api'

import { voteErrorMessage } from './errors'

describe('voteErrorMessage', () => {
  it('maps the API codes', () => {
    expect(voteErrorMessage(new ApiError(403, { type: 'author-cannot-vote' }))).toBe(
      'Você registrou este problema; quem registra não vota nele.',
    )
    expect(voteErrorMessage(new ApiError(409, { type: 'issue-resolved' }))).toBe(
      'Este problema já foi resolvido.',
    )
  })

  it('401 and 404 without code have their own message', () => {
    expect(voteErrorMessage(new ApiError(401))).toBe(
      'Sua sessão expirou. Entre de novo para votar.',
    )
    expect(voteErrorMessage(new ApiError(404))).toBe('Este problema não está mais disponível.')
  })

  it('network and timeout become "Sem conexão"', () => {
    expect(voteErrorMessage(new TypeError('Failed to fetch'))).toBe('Sem conexão. Tente de novo.')
    expect(voteErrorMessage(new DOMException('tempo esgotado', 'TimeoutError'))).toBe(
      'Sem conexão. Tente de novo.',
    )
  })

  it('the code beats the status; title and default are the last resort', () => {
    expect(voteErrorMessage(new ApiError(404, { type: 'issue-resolved' }))).toBe(
      'Este problema já foi resolvido.',
    )
    expect(voteErrorMessage(new ApiError(500, { title: 'Falha interna' }))).toBe('Falha interna')
    expect(voteErrorMessage(new ApiError(500))).toBe('Não foi possível registrar seu voto.')
    expect(voteErrorMessage('qualquer coisa')).toBe('Não foi possível registrar seu voto.')
  })
})
