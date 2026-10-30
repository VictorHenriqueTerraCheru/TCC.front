import { ApiError } from '@/infrastructure/api'

import { reportErrorMessage } from './errors'

describe('reportErrorMessage', () => {
  it('maps the rule codes', () => {
    expect(reportErrorMessage(new ApiError(422, { type: 'time-outside-window' }))).toBe(
      'O horário precisa estar dentro das últimas 24 horas. Ajuste e envie de novo.',
    )
    expect(reportErrorMessage(new ApiError(429, { type: 'daily-incident-limit' }))).toContain(
      'limite de relatos de incidente',
    )
    expect(reportErrorMessage(new ApiError(403, { type: 'category-not-issue' }))).toContain(
      'categoria é de incidente',
    )
  })

  it('without a known code, uses the first validation message, then the title', () => {
    expect(
      reportErrorMessage(
        new ApiError(400, { type: 'unknown', errors: { description: ['Muito longa.'] } }),
      ),
    ).toBe('Muito longa.')
    expect(reportErrorMessage(new ApiError(400, { title: 'Requisição inválida' }))).toBe(
      'Requisição inválida',
    )
  })

  it('network error falls back to the default message (screen 26 handles it separately)', () => {
    expect(reportErrorMessage(new TypeError('Failed to fetch'))).toBe(
      'Não foi possível enviar. Tente de novo.',
    )
  })
})
