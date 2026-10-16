/** Gradiente do calor (amostrado nos prints) — também usado na legenda "Como ler o mapa". */
export const gradienteCalor: Record<number, string> = {
  0.2: '#fde4b8',
  0.4: '#f9bd7c',
  0.6: '#f08d52',
  0.8: '#e0623b',
  1: '#c8372d',
}

export const gradienteCalorCss = `linear-gradient(to right, ${Object.values(gradienteCalor).join(', ')})`
