import type { DetalheProblema } from './problema'
import { aplicarVotoExistencia, aplicarVotoPersistencia } from './votos'

const base = {
  existencia: { confirmacoes: 15, naoVi: 1 },
  persistencia: { continua: 9, resolvido: 1, resolvidoUltimas24h: 1 },
  meusVotos: null,
} as DetalheProblema

describe('votos otimistas', () => {
  it('primeiro voto entra no balde escolhido', () => {
    const d = aplicarVotoExistencia(base, 'confirma')
    expect(d.existencia).toEqual({ confirmacoes: 16, naoVi: 1 })
    expect(d.meusVotos).toEqual({ existencia: 'confirma', persistencia: null })
  })

  it('trocar o voto tira do balde anterior', () => {
    const d = aplicarVotoPersistencia(aplicarVotoPersistencia(base, 'continua'), 'resolvido')
    expect(d.persistencia).toEqual({ continua: 9, resolvido: 2, resolvidoUltimas24h: 2 })
    expect(d.meusVotos?.persistencia).toBe('resolvido')
  })

  it('repetir o mesmo voto não muda nada', () => {
    const uma = aplicarVotoExistencia(base, 'naoVi')
    expect(aplicarVotoExistencia(uma, 'naoVi')).toBe(uma)
  })
})
