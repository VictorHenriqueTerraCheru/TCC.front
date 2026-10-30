import { ApiError } from '@/infrastructure/api'

import { verificationErrorMessage } from './errors'

describe('verificationErrorMessage', () => {
  it('maps the API codes', () => {
    expect(verificationErrorMessage(new ApiError(409, { type: 'already-verified' }))).toBe(
      'Seu perfil já é verificado.',
    )
    expect(
      verificationErrorMessage(new ApiError(409, { type: 'verification-already-pending' })),
    ).toContain('em análise')
    expect(
      verificationErrorMessage(new ApiError(409, { type: 'verification-already-reviewed' })),
    ).toContain('já foi analisado')
  })

  it('network, validation, title and default', () => {
    expect(verificationErrorMessage(new TypeError('Failed to fetch'))).toBe(
      'Sem conexão. Tente de novo.',
    )
    expect(
      verificationErrorMessage(new ApiError(400, { errors: { justification: ['Curta demais.'] } })),
    ).toBe('Curta demais.')
    expect(verificationErrorMessage(new ApiError(500, { title: 'Falha' }))).toBe('Falha')
    expect(verificationErrorMessage(new ApiError(500))).toBe(
      'Não foi possível concluir. Tente de novo.',
    )
  })
})
