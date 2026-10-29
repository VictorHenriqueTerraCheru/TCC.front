import { ApiError } from '@/infrastructure/api'

import { mensagemErroRegistro } from './errors'

describe('mensagemErroRegistro', () => {
  it('mapeia os códigos de regra', () => {
    expect(mensagemErroRegistro(new ApiError(422, { type: 'time-outside-window' }))).toBe(
      'O horário precisa estar dentro das últimas 24 horas. Ajuste e envie de novo.',
    )
    expect(mensagemErroRegistro(new ApiError(429, { type: 'daily-incident-limit' }))).toContain(
      'limite de relatos de incidente',
    )
    expect(mensagemErroRegistro(new ApiError(403, { type: 'category-not-issue' }))).toContain(
      'categoria é de incidente',
    )
  })

  it('sem código conhecido, usa a primeira mensagem de validação, depois o título', () => {
    expect(
      mensagemErroRegistro(
        new ApiError(400, { type: 'desconhecido', errors: { description: ['Muito longa.'] } }),
      ),
    ).toBe('Muito longa.')
    expect(mensagemErroRegistro(new ApiError(400, { title: 'Requisição inválida' }))).toBe(
      'Requisição inválida',
    )
  })

  it('erro de rede cai na mensagem padrão (a tela 26 trata à parte)', () => {
    expect(mensagemErroRegistro(new TypeError('Failed to fetch'))).toBe(
      'Não foi possível enviar. Tente de novo.',
    )
  })
})
