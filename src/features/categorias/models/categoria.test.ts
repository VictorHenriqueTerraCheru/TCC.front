import { grupos } from '@/infrastructure/mocks/fixtures/grupos'

import {
  aparenciaDaCor,
  aparenciaDe,
  coresGrupo,
  grupoDe,
  gruposDoTipo,
  iconeDe,
} from './categoria'

describe('modelo de categoria', () => {
  it('cor e rótulo vêm do grupo cadastrado', () => {
    expect(aparenciaDe(grupos, { grupo: 'eletrica' })).toEqual({
      rotulo: 'Elétrica',
      ...aparenciaDaCor.ocre,
    })
  })

  it('grupo ainda não carregado ou removido: cinza neutro, com a chave no rótulo', () => {
    expect(aparenciaDe([], { grupo: 'clima' })).toEqual({
      rotulo: 'clima',
      ...aparenciaDaCor.cinza,
    })
    expect(grupoDe(grupos, { grupo: 'clima' })).toBeUndefined()
  })

  it('filtra grupos por tipo', () => {
    expect(gruposDoTipo(grupos, 'incidente').map((g) => g.chave)).toEqual(['seguranca', 'transito'])
  })

  it('todo slot da API tem classes Tailwind literais e o token CSS do mesmo nome', () => {
    for (const cor of coresGrupo) {
      const { forte, claro, corForte } = aparenciaDaCor[cor]
      const token = cor.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`)
      expect([forte, claro, corForte]).toEqual([
        `text-cat-${token}`,
        `bg-cat-${token}-claro`,
        `var(--cat-${token})`,
      ])
    }
  })

  it('ícone: chaves do seed antigo viram Material Symbols; o resto já é o nome', () => {
    expect(iconeDe({ icone: 'buraco' })).toBe('edit_road')
    expect(iconeDe({ icone: 'flood' })).toBe('flood')
  })
})
