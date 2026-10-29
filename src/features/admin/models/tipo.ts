import type { TipoGrupo } from '@/features/categorias'

export const rotuloDoTipo: Record<TipoGrupo, string> = {
  problema: 'Estado',
  incidente: 'Evento',
}

export const ajudaDoTipo: Record<TipoGrupo, string> = {
  problema: 'Continua lá até alguém confirmar que foi resolvido. Vira ponto no mapa.',
  incidente: 'Aconteceu e passou. Entra de forma anônima no mapa de calor.',
}

export const opcoesDeTipo: { valor: TipoGrupo; rotulo: string }[] = [
  { valor: 'problema', rotulo: rotuloDoTipo.problema },
  { valor: 'incidente', rotulo: rotuloDoTipo.incidente },
]

export const classeDoTipo: Record<TipoGrupo, string> = {
  problema: 'bg-primario-suave text-primario',
  incidente: 'bg-cat-roxo-claro text-cat-roxo',
}
