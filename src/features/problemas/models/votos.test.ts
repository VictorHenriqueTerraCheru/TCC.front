import type { DetalheProblema } from './problema'
import { aplicarVoto } from './votos'

const base = {
  votos: { sim: 15, nao: 1, naoUltimas24h: 1 },
  meuVoto: null,
} as DetalheProblema

describe('votos otimistas', () => {
  it('primeiro voto entra no balde escolhido', () => {
    const d = aplicarVoto(base, 'sim')
    expect(d.votos).toEqual({ sim: 16, nao: 1, naoUltimas24h: 1 })
    expect(d.meuVoto).toBe('sim')
  })

  it('trocar o voto tira do balde anterior', () => {
    const d = aplicarVoto(aplicarVoto(base, 'sim'), 'nao')
    expect(d.votos).toEqual({ sim: 15, nao: 2, naoUltimas24h: 2 })
    expect(d.meuVoto).toBe('nao')
  })

  it('repetir o mesmo voto não muda nada', () => {
    const uma = aplicarVoto(base, 'nao')
    expect(aplicarVoto(uma, 'nao')).toBe(uma)
  })
})
