import { ApiError } from '@/infrastructure/api'

import { mensagemErroVerificacao } from './errors'

describe('mensagemErroVerificacao', () => {
  it('mapeia os códigos da API', () => {
    expect(mensagemErroVerificacao(new ApiError(409, { type: 'ja-verificado' }))).toBe(
      'Seu perfil já é verificado.',
    )
    expect(
      mensagemErroVerificacao(new ApiError(409, { type: 'verificacao-pendente-existente' })),
    ).toContain('em análise')
    expect(
      mensagemErroVerificacao(new ApiError(409, { type: 'verificacao-ja-analisada' })),
    ).toContain('já foi analisado')
  })

  it('rede, validação, título e padrão', () => {
    expect(mensagemErroVerificacao(new TypeError('Failed to fetch'))).toBe(
      'Sem conexão. Tente de novo.',
    )
    expect(
      mensagemErroVerificacao(new ApiError(400, { errors: { justificativa: ['Curta demais.'] } })),
    ).toBe('Curta demais.')
    expect(mensagemErroVerificacao(new ApiError(500, { title: 'Falha' }))).toBe('Falha')
    expect(mensagemErroVerificacao(new ApiError(500))).toBe(
      'Não foi possível concluir. Tente de novo.',
    )
  })
})
