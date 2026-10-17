import { gradienteCalorCss } from './calor'

test('a legenda do calor vai do claro (menos) ao vermelho (mais)', () => {
  expect(gradienteCalorCss).toBe(
    'linear-gradient(to right, #fde4b8 20%, #f9bd7c 40%, #f08d52 60%, #e0623b 80%, #c8372d 100%)',
  )
})
