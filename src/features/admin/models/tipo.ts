import type { TipoGrupo } from '@/features/categorias'

export const rotuloDoTipo: Record<TipoGrupo, string> = {
  issue: 'Estado',
  incident: 'Evento',
}

export const ajudaDoTipo: Record<TipoGrupo, string> = {
  issue: 'Continua lá até alguém confirmar que foi resolvido. Vira ponto no mapa.',
  incident: 'Aconteceu e passou. Entra de forma anônima no mapa de calor.',
}

export const opcoesDeTipo: { value: TipoGrupo; label: string }[] = [
  { value: 'issue', label: rotuloDoTipo.issue },
  { value: 'incident', label: rotuloDoTipo.incident },
]

export const classeDoTipo: Record<TipoGrupo, string> = {
  issue: 'bg-primario-suave text-primario',
  incident: 'bg-cat-roxo-claro text-cat-roxo',
}
