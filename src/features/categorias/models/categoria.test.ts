import { groups } from '@/infrastructure/mocks/fixtures/grupos'

import {
  colorAppearance,
  appearanceOf,
  groupColors,
  groupOf,
  groupsOfType,
  iconOf,
} from './categoria'

describe('category model', () => {
  it('color and label come from the registered group', () => {
    expect(appearanceOf(groups, { group: 'eletrica' })).toEqual({
      label: 'Elétrica',
      ...colorAppearance.ochre,
    })
  })

  it('group not loaded yet or removed: neutral gray, with the key in the label', () => {
    expect(appearanceOf([], { group: 'clima' })).toEqual({
      label: 'clima',
      ...colorAppearance.gray,
    })
    expect(groupOf(groups, { group: 'clima' })).toBeUndefined()
  })

  it('filters groups by type', () => {
    expect(groupsOfType(groups, 'incident').map((g) => g.key)).toEqual(['seguranca', 'transito'])
  })

  it('every API slot has literal Tailwind classes and the CSS token of the same name', () => {
    for (const color of groupColors) {
      const { strong, light, strongColor } = colorAppearance[color]
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
      }[color]
      expect([strong, light, strongColor]).toEqual([
        `text-cat-${token}`,
        `bg-cat-${token}-claro`,
        `var(--cat-${token})`,
      ])
    }
  })

  it('icon: old seed keys become Material Symbols; the rest is already the name', () => {
    expect(iconOf({ icon: 'buraco' })).toBe('edit_road')
    expect(iconOf({ icon: 'flood' })).toBe('flood')
  })
})
