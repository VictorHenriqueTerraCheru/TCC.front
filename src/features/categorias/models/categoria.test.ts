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
    expect(aparenciaDe(grupos, { group: 'eletrica' })).toEqual({
      label: 'Elétrica',
      ...aparenciaDaCor.ochre,
    })
  })

  it('grupo ainda não carregado ou removido: cinza neutro, com a chave no rótulo', () => {
    expect(aparenciaDe([], { group: 'clima' })).toEqual({
      label: 'clima',
      ...aparenciaDaCor.gray,
    })
    expect(grupoDe(grupos, { group: 'clima' })).toBeUndefined()
  })

  it('filtra grupos por tipo', () => {
    expect(gruposDoTipo(grupos, 'incident').map((g) => g.key)).toEqual(['seguranca', 'transito'])
  })

  it('todo slot da API tem classes Tailwind literais e o token CSS do mesmo nome', () => {
    for (const cor of coresGrupo) {
      const { forte, claro, corForte } = aparenciaDaCor[cor]
      const token = {
        orange: 'laranja',
        ochre: 'ocre',
        brown: 'marrom',
        red: 'vermelho',
        terracotta: 'terracota',
        blue: 'azul',
        teal: 'verde-agua',
        purple: 'roxo',
        pink: 'rosa',
        gray: 'cinza',
      }[cor]
      expect([forte, claro, corForte]).toEqual([
        `text-cat-${token}`,
        `bg-cat-${token}-claro`,
        `var(--cat-${token})`,
      ])
    }
  })

  it('ícone: chaves do seed antigo viram Material Symbols; o resto já é o nome', () => {
    expect(iconeDe({ icon: 'buraco' })).toBe('edit_road')
    expect(iconeDe({ icon: 'flood' })).toBe('flood')
  })
})
