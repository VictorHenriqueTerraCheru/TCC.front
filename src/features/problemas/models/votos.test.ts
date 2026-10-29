import type { DetalheProblema } from './problema'
import { aplicarVoto } from './votos'

const base = {
  votes: { yes: 15, no: 1, noLast24h: 1 },
  myVote: null,
} as DetalheProblema

describe('votos otimistas', () => {
  it('primeiro voto entra no balde escolhido', () => {
    const d = aplicarVoto(base, 'yes')
    expect(d.votes).toEqual({ yes: 16, no: 1, noLast24h: 1 })
    expect(d.myVote).toBe('yes')
  })

  it('trocar o voto tira do balde anterior', () => {
    const d = aplicarVoto(aplicarVoto(base, 'yes'), 'no')
    expect(d.votes).toEqual({ yes: 15, no: 2, noLast24h: 2 })
    expect(d.myVote).toBe('no')
  })

  it('repetir o mesmo voto não muda nada', () => {
    const uma = aplicarVoto(base, 'no')
    expect(aplicarVoto(uma, 'no')).toBe(uma)
  })
})
