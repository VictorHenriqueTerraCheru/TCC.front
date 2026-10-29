import { ApiError } from '@/infrastructure/api'

import { mensagemErroVerificacao } from './errors'

describe('mensagemErroVerificacao', () => {
  it('mapeia os códigos da API', () => {
    expect(mensagemErroVerificacao(new ApiError(409, { type: 'already-verified' }))).toBe(
      'Seu perfil já é verificado.',
    )
    expect(
      mensagemErroVerificacao(new ApiError(409, { type: 'verification-already-pending' })),
    ).toContain('em análise')
    expect(
      mensagemErroVerificacao(new ApiError(409, { type: 'verification-already-reviewed' })),
    ).toContain('já foi analisado')
  })

  it('rede, validação, título e padrão', () => {
    expect(mensagemErroVerificacao(new TypeError('Failed to fetch'))).toBe(
      'Sem conexão. Tente de novo.',
    )
    expect(
      mensagemErroVerificacao(new ApiError(400, { errors: { justification: ['Curta demais.'] } })),
    ).toBe('Curta demais.')
    expect(mensagemErroVerificacao(new ApiError(500, { title: 'Falha' }))).toBe('Falha')
    expect(mensagemErroVerificacao(new ApiError(500))).toBe(
      'Não foi possível concluir. Tente de novo.',
    )
  })
})
