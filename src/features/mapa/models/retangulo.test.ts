import { retanguloDaApi } from './retangulo'

describe('retanguloDaApi', () => {
  it('arredonda para fora em 3 casas', () => {
    expect(
      retanguloDaApi({ sul: -22.95871, oeste: -43.19102, norte: -22.94512, leste: -43.18044 }),
    ).toEqual({ minLat: -22.959, minLng: -43.192, maxLat: -22.945, maxLng: -43.18 })
  })

  it('limita longitude e latitude quando o zoom afasta além do mundo (regra 15)', () => {
    expect(retanguloDaApi({ sul: -95, oeste: -400.5, norte: 91, leste: 250 })).toEqual({
      minLat: -90,
      minLng: -180,
      maxLat: 90,
      maxLng: 180,
    })
  })

  it('devolve null quando não sobra retângulo válido', () => {
    expect(retanguloDaApi({ sul: 10, oeste: 190, norte: 20, leste: 200 })).toBeNull()
  })
})
