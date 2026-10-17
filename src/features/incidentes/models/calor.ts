/** Gradiente do calor (amostrado nos prints) — também usado na legenda "Como ler o mapa". */
export const gradienteCalor: Record<number, string> = {
  0.2: '#fde4b8',
  0.4: '#f9bd7c',
  0.6: '#f08d52',
  0.8: '#e0623b',
  1: '#c8372d',
}

// Ordena pelas paradas: em objetos, a chave inteira "1" vem antes de "0.2", "0.4"…
const paradas = Object.entries(gradienteCalor).sort(([a], [b]) => Number(a) - Number(b))

export const gradienteCalorCss = `linear-gradient(to right, ${paradas
  .map(([parada, cor]) => `${cor} ${Number(parada) * 100}%`)
  .join(', ')})`
