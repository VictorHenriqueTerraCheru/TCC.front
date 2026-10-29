import { expressaoGradienteCalor, gradienteCalorCss, pesosCalor } from './calor'
import type { CelulaCalor } from './incidente'

test('a legenda do calor vai do roxo (menos) ao amarelo (mais)', () => {
  expect(gradienteCalorCss).toBe(
    'linear-gradient(to right, #5b2bff 20%, #c026d3 45%, #ff3b30 70%, #ffd60a 100%)',
  )
})

test('pesosCalor normaliza pela maior célula com piso 4', () => {
  const celula = (quantidade: number) => ({ lat: 0, lng: 0, count: quantidade }) as CelulaCalor
  expect(
    pesosCalor([celula(2), celula(8)]).features.map(
      (f: { properties: { peso: number } }) => f.properties.peso,
    ),
  ).toEqual([0.25, 1])
  expect(pesosCalor([celula(1)]).features[0]!.properties.peso).toBe(0.25)
  expect(
    pesosCalor([{ lat: -22.9, lng: -43.1, count: 4 } as CelulaCalor]).features[0]!.geometry
      .coordinates,
  ).toEqual([-43.1, -22.9])
})

test('expressaoGradienteCalor começa transparente e segue as paradas em ordem', () => {
  const e = expressaoGradienteCalor()
  expect(e.slice(0, 5)).toEqual([
    'interpolate',
    ['linear'],
    ['heatmap-density'],
    0,
    'rgba(0,0,0,0)',
  ])
  expect(e[5]).toBe(0.2)
  expect(e.at(-2)).toBe(1)
})
