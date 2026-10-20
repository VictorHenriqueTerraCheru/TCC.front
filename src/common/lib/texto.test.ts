import { semAcento } from './texto'

describe('semAcento', () => {
  it('tira acento e põe em minúsculas', () => {
    expect(semAcento('Calçada Danificada')).toBe('calcada danificada')
    expect(semAcento('Água e esgoto')).toBe('agua e esgoto')
  })
})
