import { withoutAccents } from './texto'

describe('withoutAccents', () => {
  it('removes accents and lowercases', () => {
    expect(withoutAccents('Calçada Danificada')).toBe('calcada danificada')
    expect(withoutAccents('Água e esgoto')).toBe('agua e esgoto')
  })
})
