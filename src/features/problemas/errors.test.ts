import { ApiError } from '@/infrastructure/api'

import { mensagemErroVoto } from './errors'

describe('mensagemErroVoto', () => {
  it('mapeia os códigos da API', () => {
    expect(mensagemErroVoto(new ApiError(403, { type: 'autor-nao-vota' }))).toBe(
      'Você registrou este problema; quem registra não vota nele.',
    )
    expect(mensagemErroVoto(new ApiError(409, { type: 'problema-resolvido' }))).toBe(
      'Este problema já foi resolvido.',
    )
  })

  it('401 e 404 sem código têm mensagem própria', () => {
    expect(mensagemErroVoto(new ApiError(401))).toBe(
      'Sua sessão expirou. Entre de novo para votar.',
    )
    expect(mensagemErroVoto(new ApiError(404))).toBe('Este problema não está mais disponível.')
  })

  it('rede e timeout viram "Sem conexão"', () => {
    expect(mensagemErroVoto(new TypeError('Failed to fetch'))).toBe('Sem conexão. Tente de novo.')
    expect(mensagemErroVoto(new DOMException('tempo esgotado', 'TimeoutError'))).toBe(
      'Sem conexão. Tente de novo.',
    )
  })

  it('o código vence o status; título e padrão ficam como último recurso', () => {
    expect(mensagemErroVoto(new ApiError(404, { type: 'problema-resolvido' }))).toBe(
      'Este problema já foi resolvido.',
    )
    expect(mensagemErroVoto(new ApiError(500, { title: 'Falha interna' }))).toBe('Falha interna')
    expect(mensagemErroVoto(new ApiError(500))).toBe('Não foi possível registrar seu voto.')
    expect(mensagemErroVoto('qualquer coisa')).toBe('Não foi possível registrar seu voto.')
  })
})
